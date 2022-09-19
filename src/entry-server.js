// 服务端的SSR预渲染
import devalue from "@nuxt/devalue";

import { createApp } from "./entry";
import { asyncList } from "./composables/useAsyncData";
import { renderToString } from "vue/server-renderer";

const renderLinks = (modules = [], manifest = {}) => {
    const result = [];
    modules.forEach((id) => {
        if (!manifest[id]) return;
        else {
            manifest[id].forEach((link) => {
                result.push(obtainLink(link));
            });
        }
    });

    return result.join("\n");
};

const obtainLink = (url) => {
    if (url.endsWith(".js")) {
        return `<link rel="modulepreload" crossorigin href="${url}">`;
    } else if (url.endsWith(".css")) {
        return `<link rel="stylesheet" href="${url}">`;
    } else if (url.endsWith(".woff")) {
        return `<link rel="preload" href="${url}" as="font" type="font/woff" crossorigin>`;
    } else if (url.endsWith(".woff2")) {
        return `<link rel="preload" href="${url}" as="font" type="font/woff2" crossorigin>`;
    } else if (url.endsWith(".gif")) {
        return `<link rel="preload" href="${url}" as="image" type="image/gif">`;
    } else if (url.endsWith(".jpg")) {
        return `<link rel="preload" href="${url}" as="image" type="image/jpeg">`;
    } else if (url.endsWith(".png")) {
        return `<link rel="preload" href="${url}" as="image" type="image/png">`;
    } else {
        return "";
    }
};

export const render = async (url, mainfest) => {
    const { app, pinia, router } = createApp();

    // async数据初始化
    if (!pinia.state.value?.async) pinia.state.value.async = {};

    await router.push(url);
    await router.isReady();
    await Promise.all(
        asyncList.map(async (v) => {
            if (v.key && v.usePromise) {
                pinia.state.value.async[v.key] = await v.usePromise();
            }
        })
    );

    const ssrContext = {};
    const context = await renderToString(app, ssrContext);
    const links = renderLinks(ssrContext.modules, mainfest);

    return { context, links, pinia: devalue(pinia.state.value) };
};
