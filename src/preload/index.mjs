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
const applyRecordFind = async (selfId) => {
	return await ipcRenderer.invoke('apply-record-find', selfId)
}
const applyRecordAdd = async (data) => {
	await ipcRenderer.invoke('apply-record-add', data)
}

const applyRecordUpdate = async (data) =>  {
	await ipcRenderer.invoke('apply-record-update', data)
}

const applyRecordDelete = async (selfId) =>  {
	await ipcRenderer.invoke('apply-record-delete', selfId)
}


const friendshipAdd = async (data) => {
	await ipcRenderer.invoke('friendship-add', data)
}

const delMembersByGroupId = async (groupId, selfId) => {
	await ipcRenderer.invoke('del-members-by-group-id', groupId, selfId)
}
const saveGroupMembersLocal = async (data) => {
	await ipcRenderer.invoke('save-group-members-local', data)
}
const findGroupMembers = async (groupId, selfId) => {
	return await ipcRenderer.invoke('find-group-members', groupId, selfId)
}
const selectGroupWithMaxMsgId = async (selfId) => {
	return await ipcRenderer.invoke('select-group-with-max-msg-id', selfId)
}
const localFileSave = async (path, buffer) => {
	return await ipcRenderer.invoke('local-file-save', path, buffer)
}
const readLocalFileContent = async (path, buffer) => {
	return await ipcRenderer.invoke('read-local-file-content', path, buffer)
}



contextBridge.exposeInMainWorld('electronApi', {
	readRecord,
	recordCount,
	findFriend,
	writeMsg,
	applyRecordFind,
	applyRecordAdd,
	applyRecordUpdate,
	applyRecordDelete,
	friendshipAdd,
	findGroupMembers,
	saveGroupMembersLocal,
	delMembersByGroupId,
	selectGroupWithMaxMsgId,
	localFileSave,
	readLocalFileContent,
})