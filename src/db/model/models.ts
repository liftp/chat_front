export interface ChatRecord {
    saveType: string, // 1.聊天记录
    msgId?: number, 
    sendUserId: number, 
    receiveUserId: number,
    content: string,
    createdAt?: string,
    friendId: number,
    selfId?: number, // 消息所属
    dateTime?: number, // 时间戳用于排序
}

export interface ChatRecordSearch {
    saveType?: string, // 1.聊天记录
    msgId?: number, 
    sendUserId?: number, 
    receiveUserId?: number,
    content?: string,
    createdAt?: string,
    friendId?: number,
    selfId?: number, // 消息所属
}

export interface FriendList {
    friendId: number,
    friendName: string,
    friendRemark: string,
    selfId: number,
}