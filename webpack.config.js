const path = require("path");

module.exports = (env) => {
	return {
		entry: "./src/index.ts",
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/
				}
			]
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"]
		},
		output: {
			filename: "bundle.js",
			path: path.resolve(__dirname, "public")
		},
		watch: env.watch,
		stats: "errors-only"
	};
};
