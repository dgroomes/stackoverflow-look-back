const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        'chromium-manifest-v2-init': './src/chromium-manifest-v2/init.ts',
        'popup': './src/backend/popup.ts',
        'votes-page-script': './src/web-page/votes-page-script.ts',
        'posts-page-script': './src/web-page/posts-page-script.ts',
        'posts-viewer': './src/web-page/posts-viewer.ts'
    },
    module: {
        rules: [{
            test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/,
        }]
    },
    devtool: 'inline-source-map',
    output: {
        filename: '[name].js', path: path.resolve(__dirname, 'dist'), clean: true,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    }
};
