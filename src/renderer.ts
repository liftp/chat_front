import { createApp } from 'vue'
import './style.css'
import store from './store'
import router from './router'
import App from './App.vue'
import { getToken } from './util/cache/cookies'
import "reflect-metadata"

import "element-plus/dist/index.css"
import "element-plus/theme-chalk/dark/css-vars.css"

import { loadPlugins } from './plugins'

const app = createApp(App)
loadPlugins(app)
app.use(store).use(router)
router.isReady().then(() => {
    app.mount('#app')
})

// 前置守卫
router.beforeEach((to, from, next) => {
    if (to.path != '/login' && !getToken()) {
        next({path: '/login'})
    } else {
        next();
    }
})


