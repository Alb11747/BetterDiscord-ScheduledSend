const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const pkg = require("./package.json");
const pluginConfig = require("./src/config.json");
pluginConfig.version = pkg.version;

const meta = (() => {
    const lines = ["/**"];
    for (const key in pluginConfig) {
        lines.push(` * @${key} ${pluginConfig[key]}`);
    }
    lines.push(" */");
    return lines.join("\n");
})();

const userConfig = (() => {
    if (process.platform === "win32") return process.env.APPDATA;
    if (process.platform === "darwin") return path.join(process.env.HOME, "Library", "Application Support");
    if (process.env.XDG_CONFIG_HOME) return process.env.XDG_CONFIG_HOME;
    return path.join(process.env.HOME, "Library", ".config");
})();
const bdFolder = path.join(userConfig, "BetterDiscord");

module.exports = {
    mode: "development",
    target: "node",
    devtool: false,
    entry: "./src/index.tsx",
    output: {
        filename: "ScheduledSend.plugin.js",
        path: path.join(__dirname, "dist"),
        libraryTarget: "commonjs2",
        libraryExport: "default",
        compareBeforeEmit: false
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
    },
    module: {
        rules: [
            { test: /\.(ts|tsx)$/, use: "ts-loader", exclude: /node_modules/, },
            { test: /\.jsx$/, exclude: /node_modules/, use: "babel-loader" },
            { test: /\.css$/, use: "raw-loader" },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({ raw: true, banner: meta }),
        {
            apply: (compiler) => {
                compiler.hooks.assetEmitted.tap("ScheduledSend", (filename) => {
                    if (filename === "ScheduledSend.plugin.js") {
                        const pluginPath = path.join(bdFolder, "plugins", filename);
                        if (!fs.existsSync(pluginPath)) {
                            fs.mkdirSync(path.dirname(pluginPath), { recursive: true });
                        }
                        fs.copyFileSync(path.join(__dirname, "dist", filename), pluginPath);
                        console.log(`Plugin copied to ${pluginPath}`);
                    }
                });
            }
        }
    ],
};