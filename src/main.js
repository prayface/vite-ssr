// 本地开发环境
import App from "./App.vue";
import createRouter from "./modules/router";

import { createApp } from "vue";
import { fetchData } from "./entry";
import { createPinia } from "pinia";

const app = createApp(App);
const pinia = createPinia();
const router = createRouter();

router.beforeResolve((to, from, next) => {
    return fetchData(router, pinia, to, next);
});

app.use(pinia);
app.use(router);
app.mount("#app");
