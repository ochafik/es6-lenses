import typescript from 'rollup-plugin-typescript';

export default {
  entry: './src/lenses.ts',
  sourceMap: true,
  targets: [
    {
      format: 'iife',
      moduleName: 'lenses',
      dest: 'build/index.js',
    },
    {
      format: 'cjs',
      dest: 'build/index.cjs.js',
    },
    {
      format: 'es',
      dest: 'build/index.es.js',
    },
  ],
  plugins: [
    typescript({
      // Force usage of same version of typescript as the project:,
      typescript: require('typescript'),
    })
  ]
}
