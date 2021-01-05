const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProd = process.env.NODE_ENV !== undefined && process.env.NODE_ENV.trim() === 'production';
/**
 * Plugins for dev environment
 */
const devPlugins = [
  new CleanWebpackPlugin(),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: isProd ? __dirname + '/build/index.html' : './index.html'
  }),
  new AssetsPlugin({
    prettyPrint: true,
    filename: 'assets.json',
    path: path.resolve(__dirname, 'build')
  }),
  new webpack.DefinePlugin({
    __ENV__: JSON.stringify(process.env.NODE_ENV || 'development')
  })
];
/**
 * Plugins for production environment
 */
const prodPlugins = [
  new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: false
  })
];
/**
 * Merging plugins on the basis of env
 */
const pluginList = isProd ? [...devPlugins, ...prodPlugins] : devPlugins;

module.exports = {
  // May add cheap-module-source-map to devtool to generate source maps to prod builds
  devtool: isProd ? '' : 'inline-source-map',
  entry: {
    // vendor: ['./src/polyfills/polyfill.min.js'],
    app: './src/index.js'
  },
  output: {
    filename: isProd ? '[name].[chunkhash].js' : '[name].bundle.js',
    path: path.resolve(__dirname, './build/UI/'),
    chunkFilename: '[name].[chunkhash].bundle.chunk.js',
    publicPath: isProd ? './UI/' : '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: ['css-loader', 'sass-loader']
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|OTF)$/,
        use: ['file-loader',]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
    ]
  },
  plugins: pluginList,

  optimization: {
    splitChunks: {
      chunks: 'async',
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      automaticNameMaxLength: 30,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        commons: {
          reuseExistingChunk: true
        }
      }
    }
  }
};
