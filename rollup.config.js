import RollupPluginTypescript from '@rollup/plugin-typescript'

export default [
    {
        input: 'src/index.ts',
        output: {
            format: 'es',
            dir: './dist'
        },
        external: [
            'axios',
        ],
        plugins: [
            RollupPluginTypescript({
                exclude: 'node_modules/**',
                declaration: true,
                declarationDir: 'dist/',
                rootDir: 'src/'
            }),
        ],
    },
]
