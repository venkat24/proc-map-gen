const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        main: path.resolve('./src/main.js')
    },

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public/dist'),
        publicPath: '/dist/'
    },

    devServer: {
        contentBase: path.resolve(__dirname, 'public'),
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,  
                use: [{
                    loader: 'url-loader',
                    options: { 
                        limit: 8000, // Convert images < 8kb to base64 strings
                        name: 'images/[hash]-[name].[ext]'
                    } 
                }]
            }
        ]
    }
};
