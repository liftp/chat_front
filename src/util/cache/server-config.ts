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
 * 固定服务器主机地址：改 .env 的 VITE_SERVER_HOST（与 vite.renderer.config.ts 的代理目标同源），
 * dev 下重启 dev server、打包后需重新 package/make 生效。置空该环境变量可回退为「相对路径 + vite 代理」模式。
 */
const SERVER_HOST = import.meta.env.VITE_SERVER_HOST ?? '172.20.242.206'

// 历史版本曾支持在登录页配置服务器地址（写入 localStorage），现已固定为 env 配置，
// 清掉残留值，避免误以为其仍生效
localStorage.removeItem(CacheKey.SERVER_HOST)

/** 固定服务器主机 */
export const getServerHost = (): string => SERVER_HOST

/** HTTP 请求基地址；主机为空时返回空串，由调用方回退到 vite 代理路径 */
export const getHttpBase = (): string => {
    return SERVER_HOST ? `http://${SERVER_HOST}:${SERVER_HTTP_PORT}/` : ''
}

/**
 * WebSocket 握手地址：保留 /api/v1/ws/{userId}/chat 路径段 —— nginx 靠它做用户哈希
 * 负载均衡（无 X-User-Route 头时 lua 回退从 request_uri 解析，见 chat_simple nginx.conf），
 * 后端实例实际收到时已被 nginx 重写为 /chat。
 * 主机为空时回退为 window.location.host，经 vite 代理转发（dev，代理会补 X-User-Route 头）。
 */
export const buildWsUrl = (userId: string | number, token: string): string => {
    const authority = `${SERVER_HOST}:${SERVER_WS_PORT}`
    return `ws://${authority}${import.meta.env.VITE_WS_PATH}${userId}/chat?accessToken=${token}`
}
