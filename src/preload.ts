import {contextBridge, ipcRenderer } from 'electron';
import { ApplyFriend, ChatRecord, FriendRelationship, GroupMember } from './db/model/models';

const readRecord = async (start: number, end: number, friendId?: any) => {
	return await ipcRenderer.invoke('read-record', start, end, friendId)
}

const recordCount = async (search: any) => {
	return await ipcRenderer.invoke('record-count', search)
}
const findFriend = async (name: number, selfId: number) => {
	return await ipcRenderer.invoke('find-friend', name, selfId)
}
const writeMsg = async (msg: ChatRecord) => {
	await ipcRenderer.invoke('write-msg', msg)
}
const applyRecordFind = async (selfId: number) => {
	return await ipcRenderer.invoke('apply-record-find', selfId)
}
const applyRecordLastUpdatedAt = async (selfId: number) => {
	return await ipcRenderer.invoke('apply-record-last-updated-at', selfId)
}
const applyRecordAdd = async (data: ApplyFriend) => {
	await ipcRenderer.invoke('apply-record-add', data)
}

const applyRecordUpdate = async (data: ApplyFriend) =>  {
	await ipcRenderer.invoke('apply-record-update', data)
}

const applyRecordDelete = async (selfId: number) =>  {
	await ipcRenderer.invoke('apply-record-delete', selfId)
}


const friendshipAdd = async (data: FriendRelationship) => {
	await ipcRenderer.invoke('friendship-add', data)
}

const delMembersByGroupId = async (groupId: number, selfId: number) => {
	await ipcRenderer.invoke('del-members-by-group-id', groupId, selfId)
}
const saveGroupMembersLocal = async (data: GroupMember[]) => {
	await ipcRenderer.invoke('save-group-members-local', data)
}
const findGroupMembers = async (groupId: number, selfId: number) => {
	return await ipcRenderer.invoke('find-group-members', groupId, selfId)
}
const selectGroupWithMaxMsgId = async (selfId: number) => {
	return await ipcRenderer.invoke('select-group-with-max-msg-id', selfId)
}
const localFileSave = async (path: string, buffer: Buffer) => {
	return await ipcRenderer.invoke('local-file-save', path, buffer)
}
const readLocalFileContent = async (path: string) => {
	return await ipcRenderer.invoke('read-local-file-content', path)
}



contextBridge.exposeInMainWorld('electronApi', {
	readRecord,
	recordCount,
	findFriend,
	writeMsg,
	applyRecordFind,
	applyRecordLastUpdatedAt,
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