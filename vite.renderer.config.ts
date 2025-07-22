import { ConfigEnv, defineConfig, loadEnv, UserConfigExport } from 'vite';
import vue from '@vitejs/plugin-vue'
import path, { resolve } from "path"

// https://vitejs.dev/config
export default ({ mode }: ConfigEnv): UserConfigExport =>{
    // const viteEnv = loadEnv(mode, process.cwd())
    // const { VITE_PUBLIC_PATH } = viteEnv
    // console.log("public path: ", VITE_PUBLIC_PATH)
    return {
        // base: VITE_PUBLIC_PATH,
        resolve: {
            alias: {
            /** @ 符号指向 src 目录 */
                "@": resolve(__dirname, "./src"),
                // 'element-plus': path.resolve(__dirname, './node_modules/element-plus')
            }
        },
        plugins: [
            vue()
        ],
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
                target: "ws://172.23.5.25:8001/", // nginx的代理路径
                ws: true,
                /** 替换掉代理路径  */
                // rewrite: path => path.replace(/^\/api\/v1\/ws\/\d+\//, '/'),
                /** 是否允许跨域 */
                changeOrigin: true,
                configure: (proxy, options) => {
      
                  // ws 使用 proxyReqWs 事件
                  proxy.on('proxyReqWs', (proxyReqWs, req, res) => {
                    const preLen = "/api/v1/ws/".length
                    const userIdIdx = req.url!.indexOf("/", preLen)
                    const userRoute = req.url?.substring(preLen, userIdIdx) || '';
                    console.log("user route:", userRoute)
                    proxyReqWs.setHeader('X-User-Route', userRoute);
                  });
                }
              },
              "/api/v1/": {
                target: "http://172.23.5.25:9001/",
                ws: false,
                /** 替换掉代理路径  */
                rewrite: path => path.replace(/^\/api\/v1\//, ''),
                /** 打印代理目标路径  */
                bypass(req, res, options) {
                  const proxyURL: string = options.target + options.rewrite!(req.url!)
                  res.setHeader('x-req-proxyURL', proxyURL) 
                },
                /** 是否允许跨域 */
                changeOrigin: true,
                // configure: (proxy, options) => {
                //   proxy.on('proxyReq', (proxyReq, req, res) => {
                //     // console.log("print proxyReq")
                //     proxyReq.setHeader('X-User-Route', 'value');
                //   });
                // }
                
              },
              
            },
            /** 预热常用文件，提高初始页面加载速度 */
            warmup: {
              clientFiles: ["./src/layouts/**/*.vue"]
            }
          },
    }
};
