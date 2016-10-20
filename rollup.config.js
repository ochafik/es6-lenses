import typescript from 'rollup-plugin-typescript';

export default {
  entry: './src/index.ts',
  sourceMap: true,
  targets: [
    {
      format: 'umd',
      moduleName: 'lenses',
      dest: 'build/index.umd.js',
    },
    {
      format: 'es',
      dest: 'build/index.es2015.js',
    },
  ],
  plugins: [
    typescript({
      // Force usage of same version of typescript as the project:,
      typescript: require('typescript'),
    })
  ]
}
