// 控制应用生命周期和创建原生浏览器窗口的模组
import { app, BrowserWindow, ipcMain, session, systemPreferences }  from 'electron'
import path from 'path'
import process from 'process'
import { fileURLToPath } from 'url'

// 预加载ESM模块
import {findGroupMembersLocal, saveGroupMembersLocal, delMembersByGroupIdLocal} from '../src/db/service/GroupMemberService'
import {readRecord, countRecord, saveRecord, selectGroupWithMaxMsgId} from '../src/db/service/ChatRecordService'
import { findFriend, saveRecord as saveFriendship } from '../src/db/service/FriendListService'
import { applyRecordLastUpdatedAt, recordList, updateRecord } from '../src/db/service/ApplyFriendService'
import {saveRecord as saveApplyFriend, delRecordBySelf as deleteApplyFriend} from "../src/db/service/ApplyFriendService"
import { ApplyFriend, ChatRecord, FriendRelationship, GroupMember } from '../src/db/model/models'
import { localFileSave, readLocalFileContent } from '../src/service/file/FileSaveService'
import start from 'electron-squirrel-startup'
// import('./preload/preload.mjs')
const __filenameNew = fileURLToPath(import.meta.url)

const __dirnameNew = path.dirname(__filenameNew)
console.log(__dirnameNew)

if (start) {
  app.quit();
}

async function checkMediaAccess(mediaType: 'microphone' | 'camera'  ) {
  const result = systemPreferences.getMediaAccessStatus(mediaType)
  // console.log("permission: ", result)
  // if (result !== 'granted') {
  //   await systemPreferences.askForMediaAccess(mediaType)
  //     .then(val => {
  //       if (val) {
  //         console.log(mediaType, "权限已获取")
  //       }
  //     })
  //     .catch(err => {
  //       if (!err) {
  //         console.log(mediaType, "权限获取异常", err)
  //       }
  //     })
  // }
}

// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'; // 关闭控制台的警告
function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    // frame:false,//可选,设置无边框,但是不能拖动窗口
    // transparent:true,//可选,设置透明窗口
    // show: false,
    backgroundColor:'#00000000',//设置背景色为透明色
    // resizable:false,//关闭可调节窗口大小
    // windows,及linux title栏配置
    titleBarOverlay: false,
    // mac title栏使用
    // titleBarStyle : false,
    
    webPreferences: {
      // 书写渲染进程中的配置
      nodeIntegration: true, //开启true这一步很重要,目的是为了vue文件中可以引入node和electron相关的API
      contextIsolation: true, // 可以使用require方法
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    //   enableRemoteModule: true, // 可以使用remote方法
    }
  })

  // await checkMediaAccess('microphone')
  // mainWindow.webContents.session.on("")
  // mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
  //   // console.log("detail", details, permission)
  //   if (permission === 'media') {
  //     console.log("media")
  //     return false
  //   }
  //   if (permission === 'notifications') {
  //     console.log("notification")
  //     return false;
  //   }
  //   return true;
  // })

  // mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
  //   // if ((webContents.getURL() === 'some-host') && permission === 'media') {
  //   //   return callback(false)
  //   // }
  //   if (permission === 'media') {
  //     // console.log(permission)
  //     return callback(false)
  //   }
  //   if (permission === 'notifications') {
  //     return callback(false);
  //   }
  //   return callback(true)
  // })


  // 加载 index.html
  //   mainWindow.loadFile('./index.html') // 新增
  // mainWindow.loadURL(`http://localhost:${process.env.PORT}`)//根据vue url更改
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    console.log("....")
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }


  // 打开开发工具
  // mainWindow.webContents.openDevTools()

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
  ipcMain.handle('apply-record-last-updated-at', async (event, selfId: number) => {
    return await applyRecordLastUpdatedAt(selfId);
  })
  ipcMain.handle('apply-record-add', async (event, data: ApplyFriend) => {
    await saveApplyFriend(data);
  })
  ipcMain.handle('apply-record-update', async (event, data: ApplyFriend) => {
    await updateRecord(data);
  })
  ipcMain.handle('apply-record-delete', async (event, selfId: number) => {
    await deleteApplyFriend(selfId);
  })
  ipcMain.handle('friendship-add', async (event, data: FriendRelationship) => {
    await saveFriendship({...data});
  })
  ipcMain.handle('del-members-by-group-id', async (event, groupId: number, selfId: number) => {
    await delMembersByGroupIdLocal(groupId, selfId);
  })
  ipcMain.handle('save-group-members-local', async (event, data: GroupMember[]) => {
    await saveGroupMembersLocal(data);
  })
  ipcMain.handle('find-group-members', async (event, groupId: number, selfId: number) => {
    return await findGroupMembersLocal(groupId, selfId);
  })  
  ipcMain.handle('select-group-with-max-msg-id', async (event, selfId: number) => {
    return await selectGroupWithMaxMsgId(selfId);
  })
  ipcMain.handle('local-file-save', async (event, path: string, buffer: Buffer) => {
    return await localFileSave(path, buffer);
  })
  ipcMain.handle('read-local-file-content', async (event, path: string) => {
    return await readLocalFileContent(path);
  })
  
  createWindow();
  
})

// createWindow()


app.on('activate', function () {
  // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
  // 打开的窗口，那么程序会重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



