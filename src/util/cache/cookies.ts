import CacheKey from '../../constants/cache-key'

/**
 * token 缓存：历史实现基于 js-cookie。打包后渲染进程经 loadFile 以 file:// origin
 * 加载，Chromium 对 file:// 页面的 cookie 写入静默失败，导致路由守卫读不到 token、
 * 登录成功后被弹回登录页。
 * 使用 sessionStorage 存储：关闭应用（窗口销毁）时浏览器自动清空，实现「关退出登录」；
 * 应用内刷新（reload）仍保留登录态。服务器地址等持久配置存于 localStorage，不受影响。
 * 对外保持原函数签名不变。
 */
const store = window.sessionStorage

export const getToken = () => {
    return store.getItem(CacheKey.ACCESS_TOKEN) ?? undefined
}

export const setToken = (token: string) => {
    store.setItem(CacheKey.ACCESS_TOKEN, token)
}

export const getRefreshToken = () => {
    return store.getItem(CacheKey.REFRESH_TOKEN) ?? undefined
}

export const setRefreshToken = (token: string) => {
    store.setItem(CacheKey.REFRESH_TOKEN, token)
}

export const removeRefreshToken = () => {
    store.removeItem(CacheKey.REFRESH_TOKEN)
}

export const setCookie = (key: string, val: string) => {
    store.setItem(key, val)
}

export const getCookie = (key: string) => {
    return store.getItem(key) ?? undefined
}

export const removeToken = () => {
    store.removeItem(CacheKey.ACCESS_TOKEN)
}
