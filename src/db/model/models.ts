export interface ChatRecord {
    saveType: string, // 1.聊天记录
    msgId: string, 
    sendUserId: string, 
    receiveUserId: string,
    content: string,
    createdAt: string,
    friendId: number,
}

export interface ChatRecordSearch {
    saveType: string, // 1.聊天记录
    msgId: string, 
    sendUserId: string, 
    receiveUserId: string,
    content: string,
    createdAt: string,
    friendId: number,
}

export interface FriendList {
    friendId: number,
    friendName: string,
    friendRemark: string,
    selfId: number,
}