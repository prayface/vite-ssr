const fs = require("fs");
const express = require("express");

const { JSDOM } = require("jsdom");
const { resolve } = require("path");
const { createServer: createViteServer } = require("vite");

const app = express();

const createProServer = () => {
    // 获取HTML模板、manifest文件与服务端渲染函数
    const renderTemp = fs.readFileSync(resolve(__dirname, "dist/client/index.html"), "utf-8");
    const manifest = require(resolve(__dirname, "dist/client/ssr-manifest.json"));
    const { render } = require(resolve(__dirname, "dist/server/entry-server.js"));

    // node端的window、document、navigator注入处理
    const DOM = new JSDOM(renderTemp);

    global.window = DOM.window;
    global.document = DOM.window.document;
    global.navigator = DOM.window.navigator;

    app.use(express.static(resolve(__dirname, "dist/client"), { index: false }));
    app.get("*", async (req, res) => {
        try {
            // 获取Url
            const url = req.originalUrl;

            // 获取渲染后的HTML与State
            const { context, pinia, links } = await render(url, manifest);

            // 将数据注入HTML模板的占位符中
            const html = document.documentElement.outerHTML.replace("<!--output-->", context).replace("<!--links-->", links).replace(`"<!--pinia-->"`, pinia);

            // 返回页面
            res.status(200).set({ "Content-Type": "text/html" }).send(html);
        } catch (e) {
            console.log(e);
            res.status(500).end(e.message);
        }
    });

    app.listen(2000, () => {
        console.log("http://localhost:2000");
    });
};

const createDevServer = () => {
    createViteServer({ server: { middlewareMode: true }, appType: "custom", mode: "ssr" }).then((vite) => {
        app.use(vite.middlewares);
        app.use("*", async (req, res) => {
            try {
                // TODO 从数据库获取当前url的meta与title信息

                // 获取Url与HTML模板
                const url = req.originalUrl;
                const originalTemp = fs.readFileSync(resolve(__dirname, "index.html"), "utf-8");
                const renderTemp = await vite.transformIndexHtml(url, originalTemp);

                // 获取服务端渲染函数
                const { render } = await vite.ssrLoadModule(resolve(__dirname, "src/entry-server.js"));

                // node端的window、document、navigator注入处理
                const DOM = new JSDOM(renderTemp);

                global.window = DOM.window;
                global.document = DOM.window.document;
                global.navigator = DOM.window.navigator;

                // 获取渲染后的HTML与State
                const { context, pinia } = await render(url);

                // 将数据注入HTML模板的占位符中
                const html = document.documentElement.outerHTML.replace("<!--output-->", context).replace(`"<!--pinia-->"`, pinia);

                // 返回页面
                res.status(200).set({ "Content-Type": "text/html" }).send(html);
            } catch (e) {
                console.error(e);
                vite.ssrFixStacktrace(e);
                res.status(500).end(e.message);
            }
        });

        app.listen(2000, () => {
            console.log("http://localhost:2000");
        });
    });
};

process.env.NODE_ENV === "production" ? createProServer() : createDevServer();
