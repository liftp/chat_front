import vue from '@vitejs/plugin-vue'
import path, { resolve } from "path"
import electron from 'vite-plugin-electron'
import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"
import { ClientRequest, IncomingMessage } from 'http'

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const viteEnv = loadEnv(mode, process.cwd())
  const { VITE_PUBLIC_PATH } = viteEnv
  console.log("public path: ", VITE_PUBLIC_PATH)
  return {
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        "@": resolve(__dirname, "./src")
      }
    },
    
    
  }
}
