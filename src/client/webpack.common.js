const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const CompressionPlugin = require("compression-webpack-plugin")

module.exports = {
    entry: "./src/client/client.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    "raw-loader",
                    "glslify-loader"
                ]
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, "../static") },
                { from: path.resolve(__dirname, "index.html") }
            ]
        }),
        new CompressionPlugin({
            algorithm: "gzip",
        })
    ],
    resolve: {
        alias: {
            three: path.resolve("./node_modules/three")
        },
        extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
        open: true
    }
}