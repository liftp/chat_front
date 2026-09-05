import CacheKey from '../../constants/cache-key'

/** 后端 HTTP 端口，对应 chat_simple 的 server.port */
const SERVER_HTTP_PORT = 9001
/**
 * WebSocket 入口端口：nginx 的 WS 入口（docker-compose 8001:80）。
 * nginx 依赖路径中的 userId 做哈希负载均衡到后端实例（7891/7892/7893），
 * 而浏览器 WebSocket 无法携带 X-User-Route 请求头，所以 userId 必须保留在路径里、走 nginx 入口。
 */
const SERVER_WS_PORT = 8001

/**
 * 默认服务器主机，与 vite.renderer.config.ts 的代理目标同源（.env 的 VITE_SERVER_HOST）。
 * 置空该环境变量可回退为「相对路径 + vite 代理」模式。
 */
const DEFAULT_SERVER_HOST = import.meta.env.VITE_SERVER_HOST ?? '172.20.242.206'

/**
 * 容错解析用户输入的主机地址：去掉粘贴进来的协议前缀、路径和端口，只留主机。
 * 如 "http://172.23.5.25:9001/" -> "172.23.5.25"
 */
export const normalizeHost = (input: string): string =>
    (input || '').trim()
        .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '')

/** 已配置的服务器主机，未配置（或配置为空）时取默认值 */
export const getServerHost = (): string => {
    const stored = normalizeHost(localStorage.getItem(CacheKey.SERVER_HOST) || '')
    return stored || DEFAULT_SERVER_HOST
}

export const setServerHost = (host: string): void => {
    localStorage.setItem(CacheKey.SERVER_HOST, normalizeHost(host))
}

/** HTTP 请求基地址，直连后端；主机为空时返回空串，由调用方回退到 vite 代理路径 */
export const getHttpBase = (): string => {
    const host = getServerHost()
    return host ? `http://${host}:${SERVER_HTTP_PORT}/` : ''
}

/**
 * WebSocket 握手地址：保留 /api/v1/ws/{userId}/chat 路径段 —— nginx 靠它做用户哈希
 * 负载均衡（无 X-User-Route 头时 lua 回退从 request_uri 解析，见 chat_simple nginx.conf），
 * 后端实例实际收到时已被 nginx 重写为 /chat。
 * 主机为空时回退为 window.location.host，经 vite 代理转发（dev，代理会补 X-User-Route 头）。
 */
export const buildWsUrl = (userId: string | number, token: string): string => {
    const host = getServerHost()
    const authority = host ? `${host}:${SERVER_WS_PORT}` : window.location.host
    return `ws://${authority}${import.meta.env.VITE_WS_PATH}${userId}/chat?accessToken=${token}`
}
