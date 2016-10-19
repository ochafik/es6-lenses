import typescript from 'rollup-plugin-typescript';

export default {
  entry: './src/lenses.ts',
  format: 'iife',
  dest: 'build/index.js',
  sourceMap: true,
  moduleName: 'lenses',
  plugins: [
    typescript({
      // Force usage of same version of typescript as the project:,
      typescript: require('typescript'),
    })
  ]
}
