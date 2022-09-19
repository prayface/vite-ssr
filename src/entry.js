import App from "./App.vue";
import createRouter from "./modules/router";

import { isObject } from "lodash-es";
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { asyncList, cleanAsyncData } from "./composables";

export const createApp = () => {
    const app = createSSRApp(App);
    const pinia = createPinia();
    const router = createRouter();

    app.use(pinia);
    app.use(router);

    return {
        app,
        pinia,
        router,
    };
};

// 缓存异步数据队列
export let asyncDatas = [];

export const fetchData = (router, pinia, route, next) => {
    console.log("路由跳转loading开始...");
    const currentComponents = router.resolve(route).matched.flatMap((record) => {
        return Object.values(record.components);
    });

    // 初始化pinia中的数据
    if (!pinia.state.value?.async) pinia.state.value.async = {};

    // 递归所有组件, 调用一次setup用于获取useAsyncData()
    cleanAsyncData();
    deepSetup(currentComponents);

    // 当前页面asyncData已缓存或无asyncData
    if (!asyncList.length) {
        console.log("loading结束");
        return next();
    }

    // 生成行的Promise队列, 当出现key相同时, 覆盖原队列内容
    asyncDatas.push(...asyncList.filter((v) => !asyncDatas.find((val) => v.key === val.key)));
    asyncDatas = asyncDatas.map((v) => {
        const async = asyncList.find((val) => val.key === v.key);
        if (async) {
            v.data = undefined;
            v.error = undefined;
            v.usePromise = async.usePromise;
        }

        return v;
    });

    // 遍历触发所有新增的Promise, 当Promise结束时, 判断是否存在Promise队列中, 存在则写入pinia中, 反正则console.log提示一下
    asyncList.map((v) => {
        const promise = v.usePromise();

        promise.then((data) => {
            console.log(`asyncData: ${v.key} 加载完成`);

            const async = asyncDatas.find((val) => val.key === v.key);
            if (async && async.usePromise === v.usePromise) {
                pinia.state.value.async[v.key] = data;
                async.data = data;
            }
        });

        promise.catch((error) => {
            console.log(`asyncData: ${v.key} 加载失败`);

            const async = asyncDatas.find((val) => val.key === v.key);
            if (async) {
                async.error = error;
            }
        });

        promise.finally(() => {
            verifyResult(v.key, next);
        });
    });
};

export const deepSetup = (components) => {
    if (isObject(components)) {
        for (let i in components) {
            const component = components[i];
            if (component && component.setup && component.setup?.toString?.()?.indexOf?.("useAsyncData")) {
                component.setup();
            }
        }
    }

    return;
};

export const verifyResult = (key, next) => {
    if (!asyncList.find((v) => v.key === key)) {
        return console.log("其他路由的AsyncData获取成功");
    }

    for (let i = 0, l = asyncList.length; i < l; i++) {
        const asyncItem = asyncList[i];
        const async = asyncDatas.find((v) => v.key === asyncItem.key);
        if (async.error) {
            return console.error("取消路由导航, loading结束, 前往404页面");
        }

        if (!async.data) {
            return console.log("未完成asyncData获取");
        }
    }

    console.log("asyncData获取成功, loading结束");
    next();
};
