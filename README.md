### 基于Vue 3 + TypeScript + Vite + electron , 简单实现pc端聊天应用的前端部分

#### 1. 框架介绍

1. 基于Vue 3 + TypeScript + Vite + electron + nedb 
2. 安装依赖：npm install ， 开发环境启动(本地多实例)：npm run dev-i1 或者 npm run dev-i2
3. 该框架和web框架的区别在于electron和nedb的使用，主要介绍这两部分

#### 2.electron桥接本地接口nedb的使用

 1. 在使用本地接口，例如文件访问，浏览器对这些本地接口做了隔离，而electron为了实现客户端的功能，做了桥接实现；具体可以参考electron的上下文隔离相关上下文：https://www.electronjs.org/zh/docs/latest/tutorial/context-isolation

    该项目的具体应用：

    1.1 因为集成了nedb作为数据库使用，例如聊天消息数据..., 需要访问本地文件, 所以这里对nedb的接口都做了隔离，首先创建nedb接口，在src/db/NeDB.ts文件里，创建对应数据的库文件；

    然后在src/db/service中添加具体的接口实现，例如每张数据表的读写改查

    ``` typescript
    // src/db/NeDB.ts 定义数据库
    import Datastore from 'nedb'
    import { ChatRecord } from './model/models
    
    export const db: Datastore<ChatRecord> = new Datastore<ChatRecord>({
        filename: './chatDB.db',
        autoload: true,
    })
    // src/db/service 数据库操作
    import { reject } from 'lodash-es'
    import {ChatRecord} from '../model/models'
    import {db} from '../NeDB'
    
    export const saveRecord = (record: ChatRecord) =>  {
        db.insert(record);
        return true;
    };
    ```

    

    1.2 然后在electron/main.ts中添加whenReady事件，每个事件对应一个api

    ```typescript
    import { app, BrowserWindow, ipcMain }  from 'electron'
    import {saveRecord}  from '../src/db/service/ChatRecordService'
    app.whenReady().then(() => {
        // 挂载本地接口api为事件
    	ipcMain.handle('write-msg', async (event, msg: ChatRecord) => {
            await saveRecord(msg);
        })
        // ...
    }
    ```

    

    1.3 在src/preload/index.mjs中利用ipcRenderer.invoke去接入前面定义的事件

    ```typescript
    const {contextBridge, ipcRenderer } = require('electron');
    const writeMsg = async (msg) => {
    	await ipcRenderer.invoke('write-msg', msg)
    }
    // 桥接api到electronApi
    contextBridge.exposeInMainWorld('electronApi', {
    	writeMsg,
    })
    ```

    

    1.4 由于项目中使用的是ts，所以这里需要全局定义下api，才能被引用

    ```typescript
    // ts全局定义api, src/api/types/global.d.ts
    
    import { ChatRecord } from "@/db/model/models";
    export interface ElectronApi {
        writeMsg: (msg: ChatRecord) => Promise<void>;
    }
    
    declare global {
        interface Window {
            electronApi: ElectronApi
        }
    }
    
    // 使用的时候，利用window对象调用
    window.electronApi.writeMsg(element)
    ```



#### 3. vite使用时代理的处理

1. 由于聊天功能使用到了ws作为服务端消息推送，这里需要用拆开http请求和ws代理，http的代理就不再赘述，可以直接接入后端nginx网关，ws有点特殊，使用 proxyReqWs 事件作为requets header设置的回调，由于Websocket对象的创建不支持header的直接设置，所以将用户id放在了url上面，本来想在vite 代理这里解析url放到header上，然后rewrite路径，但是最后发rewrite操作会在proxyReqWs 事件 之前触发，所以rewrite直接放在了nginx网关上去调整路径了，这里就注释了,只是设置了header

   ```js
   // vite.config.ts
   import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"
   export default ({ mode }: ConfigEnv): UserConfigExport => {
       //..
       const viteEnv = loadEnv(mode, process.cwd())
       const { VITE_PUBLIC_PATH } = viteEnv
       return {
           // ... 
           server: {
               // ...
               proxy: {
               	"/api/v1/ws/": {
                       target: "ws://localhost/",
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
                   }
               }
           }
       }
   ```

   



#### 4. 该项目不完善的地方

1. 只是作为一个demo使用，没有完善表单验证，样式及交互问题， 功能上还缺少群聊添加成员后的消息通知处理





