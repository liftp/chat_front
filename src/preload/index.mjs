const {contextBridge, ipcRenderer } = require('electron');

const readRecord = async (start, end, friendId) => {
	return await ipcRenderer.invoke('read-record', start, end, friendId)
}

const recordCount = async () => {
	return await ipcRenderer.invoke('record-count')
}
const findFriend = async (name, selfId) => {
	return await ipcRenderer.invoke('find-friend', name, selfId)
}


contextBridge.exposeInMainWorld('electronApi', {
	readRecord,
	recordCount,
	findFriend
})