export interface ChatServerMsgRecord {
    saveType: string, // 1.聊天记录
    msgId?: number, 
    sendUserId: number, 
    receiveUserId: number,
    content: string,
    createdAt?: string,
    friendId: number,
    groupId?: number,
    chatType: number,
    selfId?: number, // 消息所属
    dateTime?: number, // 时间戳用于排序
    contentType: number, // 1: 文本 2：语音
    localStore?: string, // 本地文件地址
    contentLen?: number, // 内容长度 
}

export type ChatServerMsgResponse = ApiResponseData<ChatServerMsgRecord[]>
export type ChatSendMsgResponse = ApiResponseData<ChatServerMsgRecord>