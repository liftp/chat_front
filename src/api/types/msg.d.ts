export interface ChatServerMsgRecord {
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

export type ChatServerMsgResponse = ApiResponseData<ChatServerMsgRecord[]>