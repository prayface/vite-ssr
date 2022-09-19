import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";

import VuePlugin from "@vitejs/plugin-vue"; // vue编译插件
import LegacyPlugin from "@vitejs/plugin-legacy"; // 代码兼容性插件, 仅支持ie11以上
import ImageminPlugin from "vite-plugin-imagemin"; // 图片压缩插件

import { createSvgIconsPlugin } from "vite-plugin-svg-icons"; // svg图标注入插件
import { createHtmlPlugin } from "vite-plugin-html"; // html模板编译插件
import { visualizer } from "rollup-plugin-visualizer"; // rollup打包分析插件

const HTMLPluginInit = (mode) => {
    const option = {
        minify: false,
        inject: {
            data: {},
        },
    };

    if (mode === "development") {
        option.inject.data.title = "<title>本地环境开发</title>";
        option.inject.data.script = '<script type="module" src="/src/main.js"></script>';
    } else {
        option.inject.data.title = "<title><!--title--></title>";
        option.inject.data.script = '<script type="module" src="/src/entry-client.js"></script>';
    }

    return option;
};

export default (config) => {
    const env = loadEnv(config.mode === "ssr" ? "development" : config.mode, process.cwd());
    const build = { minify: true };
    const plugins = [
        VuePlugin(),
        LegacyPlugin({ targets: ["ie >= 11"], additionalLegacyPolyfills: ["regenerator-runtime/runtime"] }),
        createHtmlPlugin(HTMLPluginInit(config.mode)),
        createSvgIconsPlugin({
            iconDirs: [resolve(__dirname, "src/assets/icons")],
            symbolId: "icon-[dir]-[name]",
        }),
    ];

    if (config.mode === "production") {
        const Imagemin = ImageminPlugin({
            gifsicle: {
                optimizationLevel: 7,
                interlaced: false,
            },
            optipng: {
                optimizationLevel: 7,
            },
            mozjpeg: {
                quality: 20,
            },
            pngquant: {
                quality: [0.8, 0.9],
                speed: 4,
            },
            svgo: {
                plugins: [{ name: "removeViewBox" }, { name: "removeEmptyAttrs", active: false }],
            },
        });

        plugins.push(Imagemin);
        plugins.push(visualizer());
    }

    return defineConfig({
        base: env.VITE_BASE || "/",
        build: build,
        plugins: plugins,
        resolve: {
            alias: {
                "@": resolve(__dirname, "src"),
            },
        },
        server: {
            strictPort: true,
            port: env.VITE_PORT || "127.0.0.1",
            host: env.VITE_HOST || "8080",
            cors: env.VITE_CORS || false,
            hmr: env.VITE_HMR,
        },
        ssr: {
            format: "cjs",
        },
    });
};
