const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin")
const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")

module.exports = merge(common, {
    mode: "production",
    performance: {
        hints: false
    }
})
