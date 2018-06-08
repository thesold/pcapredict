import RollupPluginBabel from 'rollup-plugin-babel'

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.js',
            format: 'cjs',
        },
        external: [
            'axios',
        ],
        plugins: [
            RollupPluginBabel({
                exclude: 'node_modules/**',
            }),
        ],
    },
    {
        input: 'src/demo.js',
        output: {
            file: 'dist/demo.js',
            format: 'cjs',
        },
        external: [
            'axios',
        ],
        plugins: [
            RollupPluginBabel(),
        ],
    },
]
