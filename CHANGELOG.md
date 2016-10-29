# Development Version

...

# Version 0.4.0 (20161029)

- Lenses and placeholder selectors are now functions:

  ```
  [{x: 1}, {x: 2}].map(_.x)
  // [1, 2]

  lens([_.x, _.y])
    .set({z: 3}, [1, 2])
  // {z: 3, x: 1, y: 2}
  ```
  
# Version 0.3.2 (20161027)

- Simplified untyped syntax: `lens(_.x)` instead of `lens(_ => _.x)`. The `_` object is "placeholder selector" proxy.
 
# Version 0.3.1 (20161026)

- Fixed `.set` (wasn't preserving original properties of objects)
- Added basic support for `Immutable.Map` (uses its `.setIn`, `.updateIn` methods)
 
# Version 0.3.0 (20161026)

- Better naming: `update` becomes `set`, introduced an `update` method that takes an updater function.
 
# Version 0.2.0 (20161023)
  
- Added support for nested structures: `lens(_ => [_.x, {a: _.y, b: _.z}])`

# Version 0.1.9 (20161020)

- First basic usable milestone.