import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import pkg from '../package.json';

const currentYear = new Date().getFullYear();
const banner =
  `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${currentYear > 2020 ? '2020-' : ''}${currentYear} ${pkg.author}
 * Released under the MIT License.
 */
`;

const outputFileList = [
  { name: 'LightEvent', format: 'umd' },
  { name: 'LightEvent', format: 'umd', min: true },
  { format: 'esm' },
  { format: 'esm', min: true },
];

const output = outputFileList.map(({ name, format, min }) => {
  const file = `dist/${pkg.name}.${format}${min ? '.min' : ''}.js`;
  const plugins = min ? [terser()] : [];
  return { name, format, banner, file, sourcemap: false, plugins };
});

export default {
  output,
  plugins: [
    json({ namedExports: false }),
    resolve(),
  ],
};

