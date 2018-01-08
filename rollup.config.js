import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import sourcemaps from 'rollup-plugin-sourcemaps';
import resolve from 'rollup-plugin-node-resolve';

const packages = require('./package.json');

const paths = {
    root: '/',
    source: {
        root: './src/',
    },
    dist: {
        root: './dist/',
    },
};

let fileName,
    Configure;

fileName = process.env.NODE_ENV !== 'production' ? 'wp-posts-convert' : 'wp-posts-convert.min';

Configure = {
    input: `${paths.source.root}index.js`,
    sourcemap: true,
    moduleId: packages.moduleName,
    name: packages.moduleName,
    output: [{
        file: `${paths.dist.root}${fileName}.js`,
        format: 'umd',
    }],
    // targets: [{
    //     dest: `${paths.dist.root}${fileName}.js`,
    //     format: 'umd',
    // }],
    plugins: [
        babel(),
        sourcemaps(),
        resolve(),
    ],
    external: [
        'axios',
        'csv-string',
        'csv-string/lib/parser'
    ]
};

if (process.env.NODE_ENV === 'production') {
    Configure.plugins.push(uglify());
} else {
    Configure.output.push({
        file: `${paths.dist.root}${fileName}.es.js`,
        format: 'es',
    });
}

export default Configure;