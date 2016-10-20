function unsupported(name: string, ...args: any[]): Error {
  return new Error(`Unsupported operation: ${name} ${args.map(a => {
    try {
      return a.toString();
    } catch (_) {
      return '!';
    }
  }).join(', ')})}`)
}

export class AbstractProxyHandler<T> implements ProxyHandler<T> {
  getPrototypeOf(target: T): any {
    throw unsupported('getPrototypeOf');
  }
  setPrototypeOf(target: T, v: any): boolean {
    throw unsupported('setPrototypeOf', v);
  }
  isExtensible(target: T): boolean {
    throw unsupported('isExtensible');
  }
  preventExtensions(target: T): boolean {
    throw unsupported('preventExtensions');
  }
  getOwnPropertyDescriptor(target: T, p: PropertyKey): PropertyDescriptor {
    throw unsupported('getOwnPropertyDescriptor', p);
  }
  has(target: T, p: PropertyKey): boolean {
    throw unsupported('has', p);
  }
  get(target: T, p: PropertyKey, receiver: any): any {
    throw unsupported('get', p);
  }
  set(target: T, p: PropertyKey, value: any, receiver: any): boolean {
    throw unsupported('set', value);
  }
  deleteProperty(target: T, p: PropertyKey): boolean {
    throw unsupported('deleteProperty', p);
  }
  defineProperty(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean {
    throw unsupported('defineProperty', p);
  }
  enumerate(target: T): PropertyKey[] {
    throw unsupported('enumerate');
  }
  ownKeys(target: T): PropertyKey[] {
    throw unsupported('ownKeys');
  }
  apply(target: T, thisArg: any, argArray?: any): any {
    throw unsupported('apply', ...(argArray || []));
  }
  construct(target: T, thisArg: any, argArray?: any): any {
    throw unsupported('construct', ...(argArray || []));
  }
}
