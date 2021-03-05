/* eslint-disable @typescript-eslint/no-var-requires */
const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const copyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

rules.push({
	test: /\.css$/,
	use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

plugins.push(
	new copyWebpackPlugin({
		patterns: [{ from: path.resolve(__dirname, "static"), to: "static" }],
	})
);

module.exports = {
	module: {
		rules,
	},
	plugins: plugins,
	resolve: {
		extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
	},
};
