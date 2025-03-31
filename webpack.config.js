const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Verificar se o arquivo HTML existe na raiz ou em src
const htmlTemplatePath = path.resolve(__dirname, 'index.html');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: path.resolve(__dirname, 'src/index.js'),
        output: {
            filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: isProduction ? '/' : '/'
        },
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            hot: true,
            liveReload: true,
            watchFiles: ['src/**/*', 'index.html'],
            port: 3000,
            compress: true,
            historyApiFallback: true,
            open: true
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'assets/images/[hash][ext][query]'
                    }
                },
                {
                    test: /\.gltf$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/models/3D_smartwatch/[name].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.bin$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'assets/models/3D_smartwatch/[name].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: htmlTemplatePath,
                inject: true,
                minify: isProduction
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'src/assets'),
                        to: 'assets',
                        noErrorOnMissing: true
                    },
                    {
                        from: path.resolve(__dirname, 'src/js/components/3D_*/**/*.{gltf,bin}'),
                        to({ absoluteFilename }) {
                            const folderName = path.basename(path.dirname(absoluteFilename));
                            const fileName = path.basename(absoluteFilename);
                            return `assets/models/${folderName}/${fileName}`;
                        },
                        noErrorOnMissing: true
                    }
                ]
            })
        ],
        optimization: {
            moduleIds: 'deterministic',
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        resolve: {
            extensions: ['.js', '.json']
        }
    };
};
