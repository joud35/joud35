let path = require('path');
let webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: {
        widget: [
            path.join(__dirname, 'src', 'widget', 'widgetIndex.js')
        ],
        chat: [
            path.join(__dirname, 'src', 'chat', 'chatIndex.js')
        ],
    },
    output: {
        path: path.join(__dirname, 'dist', 'js'),
        filename: '[name].js',
        publicPath: '/static/'
    },
    module: {
        loaders: [
            { test: /\.js$/, loaders: ['babel'], include: path.join(__dirname, 'src') },
            { test: /\.css$/, loader: 'style!css!sass', include: path.join(__dirname, 'css') },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
    ]
};
