import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { version, author } from '../package.json';

const currentYear = new Date().getFullYear();
const banner =
  `/*!
 * event-channel v${version}
 * (c) ${currentYear > 2020 ? '2020-' : ''}${currentYear} ${author}
 * Released under the MIT License.
 */
`;

const outputFileList = [
  { name: 'EventChannel', format: 'umd' },
  { name: 'EventChannel', format: 'umd', min: true },
  { format: 'esm' },
  { format: 'esm', min: true },
];

const output = outputFileList.map(({ name, format, min }) => {
  const file = `dist/event-channel.${format}${min ? '.min' : ''}.js`;
  const plugins = min ? [terser()] : [];
  return { name, format, banner, file, sourcemap: false, plugins };
});

export default {
  output,
  plugins: [
    json(),
    resolve(),
  ],
};

