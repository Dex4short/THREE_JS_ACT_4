module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/THREE_JS_ACT_4/', // Replace with your repository name
    },
    module: {
        rules: [
            {
                test: /\.(glsl|vs|fs)$/,
                loader: 'glslify-loader',
            },
        ],
    },
    mode: 'production', // Use production for GitHub Pages
};
