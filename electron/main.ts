// 控制应用生命周期和创建原生浏览器窗口的模组
import { app, BrowserWindow, ipcMain }  from 'electron'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

// 预加载ESM模块
import {readRecord, countRecord, saveRecord} from '../src/db/service/ChatRecordService'
import { findFriend } from '../src/db/service/FriendListService'
import { recordList, updateRecord } from '../src/db/service/ApplyFriendService'
import {saveRecord as saveApplyFriend} from "../src/db/service/ApplyFriendService"
import {saveRecord as saveFriendship} from "../src/db/service/FriendshipService"
import { ApplyFriend, ChatRecord, FriendRelationship } from '../src/db/model/models'
// import('./preload/preload.mjs')
const __filenameNew = fileURLToPath(import.meta.url)

const __dirnameNew = path.dirname(__filenameNew)
console.log(__dirnameNew)


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // 关闭控制台的警告
function createWindow () {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    // frame:false,//可选,设置无边框,但是不能拖动窗口
    // transparent:true,//可选,设置透明窗口
    // show: false,
    backgroundColor:'#00000000',//设置背景色为透明色
    // resizable:false,//关闭可调节窗口大小
    
    webPreferences: {
      // 书写渲染进程中的配置
      nodeIntegration: true, //开启true这一步很重要,目的是为了vue文件中可以引入node和electron相关的API
      // contextIsolation: true, // 可以使用require方法
      preload: path.join(__dirnameNew, '../src/preload/index.mjs'),
      sandbox: false
    //   enableRemoteModule: true, // 可以使用remote方法
    }
  })
  // 加载 index.html
//   mainWindow.loadFile('./index.html') // 新增
mainWindow.loadURL(`http://localhost:${process.env.PORT}`)//根据vue url更改

  // 打开开发工具
  mainWindow.webContents.openDevTools()
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  ipcMain.handle('read-record', async (event, start, end, search) => {
    return await readRecord(start, end, search);
  })
  ipcMain.handle('record-count', async (event, search) => {
    return await countRecord(search);
  })  
  ipcMain.handle('find-friend', async (event, name, selfId) => {
    return await findFriend(name, selfId);
  })
  ipcMain.handle('write-msg', async (event, msg: ChatRecord) => {
    await saveRecord(msg);
  }) 
  ipcMain.handle('apply-record-find', async (event, selfId: number) => {
    return await recordList(selfId);
  })
  ipcMain.handle('apply-record-add', async (event, data: ApplyFriend) => {
    await saveApplyFriend(data);
  })
  ipcMain.handle('apply-record-update', async (event, data: ApplyFriend) => {
    await updateRecord(data);
  })
  ipcMain.handle('friendship-add', async (event, data: FriendRelationship) => {
    await saveFriendship(data);
  })

  createWindow()
  app.on('activate', function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



