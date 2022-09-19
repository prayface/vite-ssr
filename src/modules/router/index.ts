import { createRouter, createWebHistory, createMemoryHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        name: "Home",
        path: "/",
        component: () => import("@/views/Home.vue"),
        children: [
            {
                name: "Test",
                path: "test",
                component: () => import("@/views/Test.vue"),
            },
        ],
    },
    {
        name: "Error",
        path: "/:catchAll(.*)*",
        component: () => import("@/views/404.vue"),
    },
];

const router = createRouter({
    routes: routes,
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
});

export default () => router;
