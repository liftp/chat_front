import { type RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import routeSettings from "@/config/route";

export const constantRoutes: RouteRecordRaw[] = [
    {
        path: "/404",
        component: () => import("@/views/error-page/404.vue"),
        meta: {
            hidden: true
        },
        alias: "/:pathMatch(.*)*"
    },
    {
        name: "login",
        path: "/login",
        component: () => import("@/views/Login.vue"),
        meta: {
            hidden: true
        }
    },
    {
        name: "home",
        path: "/",
        component: () => import("@/views/Chat.vue"),
        // redirect: "/"
        // meta: {
        //     hidden: true
        // }
    }
]

export const history = 
    import.meta.env.VITE_ROUTER_HISTORY === "hash"
        ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)
        : createWebHistory(import.meta.env.VITE_PUBLIC_PATH)
// export const flatMultiLevelR

const router = createRouter({
    history, 
    routes: constantRoutes
})

export default router