const {contextBridge, ipcRenderer } = require('electron');

const readRecord = async (start, end, friendId) => {
	return await ipcRenderer.invoke('read-record', start, end, friendId)
}

const recordCount = async (search) => {
	return await ipcRenderer.invoke('record-count', search)
}
const findFriend = async (name, selfId) => {
	return await ipcRenderer.invoke('find-friend', name, selfId)
}
const writeMsg = async (msg) => {
	await ipcRenderer.invoke('write-msg', msg)
}


contextBridge.exposeInMainWorld('electronApi', {
	readRecord,
	recordCount,
	findFriend,
	writeMsg
})