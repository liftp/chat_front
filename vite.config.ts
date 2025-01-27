import vue from '@vitejs/plugin-vue'
import { resolve } from "path"
import electron from 'vite-plugin-electron'
import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv): UserConfigExport => {
  const viteEnv = loadEnv(mode, process.cwd())
  const { VITE_PUBLIC_PATH } = viteEnv
  return {
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        "@": resolve(__dirname, "./src")
      }
    },
    server: {
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host: true, // host: "0.0.0.0"
      /** 端口号 */
      port: Number(`${process.env.PORT}`),
      /** 是否自动打开浏览器 */
      open: false,
      /** 跨域设置允许 */
      cors: true,
      /** 端口被占用时，是否直接退出 */
      strictPort: false,
      /** 接口代理 */
      proxy: {
        "/api/v1/ws/": {
          target: "ws://localhost:7891/",
          ws: true,
          /** 替换掉代理路径  */
          rewrite: path => path.replace(/^\/api\/v1\/ws\//, '/'),
          /** 是否允许跨域 */
          changeOrigin: true
        },
        "/api/v1/": {
          target: "http://localhost:9001/",
          ws: true,
          /** 替换掉代理路径  */
          rewrite: path => path.replace(/^\/api\/v1\//, ''),
          /** 打印代理目标路径  */
          bypass(req, res, options) {
            const proxyURL: string = options.target + options.rewrite!(req.url!)
            res.setHeader('x-req-proxyURL', proxyURL) 
          },
          /** 是否允许跨域 */
          changeOrigin: true
        },
        
      },
      /** 预热常用文件，提高初始页面加载速度 */
      warmup: {
        clientFiles: ["./src/layouts/**/*.vue"]
      }
    },
    plugins: [
      vue(),
      
      electron({
          entry: './electron/main.ts',
      })
    ],
  }
}
