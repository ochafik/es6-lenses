function formatOperation(name: string, ...args: any[]): string {
  return name + ' ' + args.map(a => {
    try {
      return a.toString();
    } catch (_) {
      return '!';
    }
  }).join(', ');
}
function unsupported(name: string, ...args: any[]): Error {
  return new Error(`Unsupported operation: ${formatOperation(name, ...args)}`);
}
//[...args].map(a => typeof a === 'string' ? a : '?')

const getTargetSym = Symbol();

declare var global: any;
let rootObject = typeof window === 'undefined' ? global : window;

function wrap<T>(object: T, allowedApis: any, path: PropertyKey[]): T {
  if (object == null ||
      object[getTargetSym] != null || // Already wrapped
      typeof object === 'string' ||
      typeof object === 'number' ||
      typeof object === 'boolean' ||
      typeof object === 'symbol') {
    return object;
  }
  // if (object !== rootObject) {
  //   console.log('Wrapping: ', object);
  // }
  console.log(`WRAPPING ${path.join('.')}`);
  if (object instanceof Function) {
    let wrappedFunction = function(...args) {
      return wrap(object.apply(rootObject, args), null, null);
    };
    wrappedFunction[getTargetSym] = object;
    return wrappedFunction as T;
  }
  return new Proxy<Proxied<T>>(new Proxied<T>(object, allowedApis, path), new SandboxProxyHandler<T>()) as T;
}

const getterSym = Symbol();
const setterSym = Symbol();
const writableSym = Symbol();

type Access<T, P> = {
  [writableSym]: boolean,
  [getterSym]: (undefined | ((target: T) => P)),
  [setterSym]: (undefined | ((target: T, value: P) => void)),
};

const targetSym = Symbol();
const allowedApisSym = Symbol();
const pathSym = Symbol();

class Proxied<T> {
  [pathSym]: PropertyKey[];

  constructor(target: T, allowedApis: any, path: PropertyKey[]) {
    this[targetSym] = target;
    this[allowedApisSym] = allowedApis;
    this[pathSym] = path;
  }
}

class SandboxProxyHandler<T> implements ProxyHandler<Proxied<T>> {

  private getAccess(target: Proxied<T>, p: PropertyKey): (Access<T, any> | undefined) {
    return target[allowedApisSym][p] as Access<T, any>;
  }

  log<R>(args: any[], action: () => R): R {
    let invocation = formatOperation.apply(null, args);
    let formattedResult: string;
    try {
      let result = action();
      if ((typeof result === 'object' || typeof result === 'function') && getTargetSym in result) {
        formattedResult = `Proxy(${result[getTargetSym]})`;
      } else {
        formattedResult = `${result}`;
      }
      return result;
    } catch (e) {
      formattedResult = `threw ${e}`;
      throw e;
    } finally {
      console.log(`${invocation} -> ${formattedResult}`);
    }
  }

  getPrototypeOf(target: Proxied<T>): any {
    return this.log(['getPrototypeOf'], () => {
      // throw unsupported('getPrototypeOf');
      // return wrap(Object.getPrototypeOf(target), this[allowedApisSym]);
      return Object.getPrototypeOf(target);
    });
  }
  setPrototypeOf(target: Proxied<T>, v: any): boolean {
    return this.log(['setPrototypeOf', v], () => {
      throw unsupported('setPrototypeOf', v);
    });
  }
  isExtensible(target: Proxied<T>): boolean {
    return this.log(['isExtensible'], () => {
      throw unsupported('isExtensible');
    });
  }
  preventExtensions(target: Proxied<T>): boolean {
    return this.log(['preventExtensions'], () => {
      throw unsupported('preventExtensions');
    });
  }
  getOwnPropertyDescriptor(target: Proxied<T>, p: PropertyKey): PropertyDescriptor {
    return this.log(['getOwnPropertyDescriptor', p], () => {
      // throw unsupported('getOwnPropertyDescriptor', p);
      let access = this.getAccess(target, p);
      if (!access) {
        return undefined as any as PropertyDescriptor;
      }
      return Object.getOwnPropertyDescriptor(target[targetSym], p);
    });
  }
  has(target: Proxied<T>, p: PropertyKey): boolean {
    if (p === getTargetSym) {
      return true;
    }
    return this.log(['has', p], () => {
      // throw unsupported('has', p);
      return p in target[targetSym];
      // THIS IS A BUG: if we return has = false, then get is never called!.
      // let access = this.getAccess(target, p);
      // if (!access) {
      //   return false;
      // }
      // return p in target[targetSym];
    });
  }
  get(target: Proxied<T>, p: PropertyKey, receiver: any): any {
    if (p === getTargetSym) {
      return target[targetSym];
    }
    // if (p === Symbol.unscopables) {
    //   return {
    //     'console': false
    //   };
    // }
    return this.log(['get', p], () => {
      // throw unsupported('get', p);
      let access = this.getAccess(target, p);
      if (!access) {
        return undefined;
      }
      let targetValue = target[targetSym];
      let member: any;
      if (access[getterSym]) {
        member = access[getterSym](targetValue);
      } else {
        member = targetValue[p];
      }

      if (member != null) {
        let {owner, kind} = getRealOwner(targetValue, p);
        console.log(`        owner: ${owner.constructor.name}`);
        console.log(`         kind: ${kind}`);
      }

      if (member instanceof Function) {
        console.log(`         name: ${member.name}`);
        member = member.bind(targetValue);
      }
      let targetPath = target[pathSym];
      return wrap(member, access, [...targetPath, p]);
    });
  }
  set(target: Proxied<T>, p: PropertyKey, value: any, receiver: any): boolean {
    return this.log(['set', value], () => {
      // throw unsupported('set', value);
      let access = this.getAccess(target, p);
      if (!access || !access[writableSym]) {
        return false;
      }
      let targetValue = target[targetSym];
      if (access[setterSym]) {
        access[setterSym](targetValue, value);
      } else {
        targetValue[p] = value;
      }
      return true;
    });
  }
  deleteProperty(target: Proxied<T>, p: PropertyKey): boolean {
    return this.log(['deleteProperty', p], () => {
      // throw unsupported('deleteProperty', p);
      let access = this.getAccess(target, p);
      if (!access || !access[writableSym]) {
        // TODO(ochafik): Add Access.configurable?
        return false;
      }
      return delete target[targetSym][p];
    });
  }
  defineProperty(target: Proxied<T>, p: PropertyKey, attributes: PropertyDescriptor): boolean {
    return this.log(['defineProperty', p], () => {
      throw unsupported('defineProperty', p);
    });
  }
  enumerate(target: Proxied<T>): PropertyKey[] {
    return this.log(['enumerate'], () => {
      throw unsupported('enumerate');
    });
  }
  ownKeys(target: Proxied<T>): PropertyKey[] {
    return this.log(['ownKeys'], () => {
      throw unsupported('ownKeys');
    });
  }
  apply(target: Proxied<T>, thisArg: any, argArray?: any): any {
    return this.log(['apply', ...(argArray || [])], () => {
      throw unsupported('apply', ...(argArray || []));
      // return target[targetSym].apply(thisArg, argArray);
    });
  }
  construct(target: Proxied<T>, thisArg: any, argArray?: any): any {
    return this.log(['construct', ...(argArray || [])], () => {
      return wrap(
          new ((target[targetSym] as any as Function).bind(thisArg))(...argArray),
          target[allowedApisSym],
          [...target[pathSym], 'prototype']);
    });
  }
}

function getRealOwner(target, p: PropertyKey): {owner: any, kind: ('direct' | 'prototype')} {
  let value = target[p];
  let prototype = Object.getPrototypeOf(target.constructor);
  while (prototype != null) {
    let prototypeValue = prototype[p];
    console.log(`Prototype = ${prototype.constructor.name}, p = ${p}, value = ${value}, prototypeValue = ${prototypeValue}`);
    if (value === prototypeValue) {
      return {kind: 'prototype', owner: prototype};
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return {kind: 'direct', owner: target};
}

const root = wrap(rootObject, {
  XmlHttpRequest: {
    open: {},
    onstatuschange: {},
  },
  Date: {
    now: {},
  },
  window: {
    [getterSym]() {
      return root;
    }
  },
  document: {
    write: {},
  },
  console: {
    log: {
      [getterSym]() {
        return function(msg: string) {
          console.log(msg);
        }
      }
    }
  },
  setTimeout: {},
    // getterSym: function(window) {
    //   return function(f, milliseconds, ...args) {
    //     window.setTimeout(function(...args) {
    //       with
    //     }, milliseconds, ...args);
    //   }
    //
    // }
  // }
}, []);

Function(`with(arguments[0]) {
  console.log('NONONO');
  class Baz {
    bam() {
      console.log("BAAAAM");
    }
  }
  new Baz().bam();
  console.log('AUDIO: ' + window.Audio);
  document.write('hey!');
  setTimeout(() => console.log('Foo!!!'), 1000);
  Function('alert()');
}`)(root);
