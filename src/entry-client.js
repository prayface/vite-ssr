// 服务端的SSR激活
import { createApp, fetchData } from "./entry";

const { app, pinia, router } = createApp();

router.isReady().then(() => {
    // store初始化
    if (window.__INITIAL_STATE__) {
        pinia.state.value = window.__INITIAL_STATE__;
    }

    app.mount("#app");
});

router.beforeResolve((to, from, next) => {
    return fetchData(router, pinia, to, next);
});
