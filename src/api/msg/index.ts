import  {type ChatServerMsgResponse, ChatSendMsgResponse, ChatServerMsgRecord}  from "@/api/types/msg";
import { request } from "@/util/request";

export interface ChatRecordDTO {
    saveType: string, // 1.聊天记录
    msgType: number, 
    msgId?: number, 
    sendUserId: number, 
    receiveUserId: number,
    content: string,
    createdAt?: string,
    friendId: number,
    groupId: number, 
    selfId?: number, // 消息所属
    dateTime?: number, // 时间戳用于排序
    chatType: number, // 1:单聊 2:群聊
    contentType: number, // 1: 文本 2：语音
    localStore?: string, // 本地文件地址
    contentLen?: number, // 内容长度 
}

// 群聊消息查询参数
export interface GroupNotReadMsgQuery {
    groupList: SingleGroupParam[]
}

export interface SingleGroupParam {
    groupId: number, 
    msgId: number,
}

export function selectNotReadMsg() {
    return request<ChatServerMsgResponse>({
        url: "chatMsg/selectNotReadMsg",
        method: "post"
    })
}

export function sendMsgToServer(data: ChatRecordDTO) {
    return request<ChatSendMsgResponse>({
        url: "chatMsg/sendMsg",
        method: "post",
        data
    })
}


export function selectGroupNotReadMsg(data: GroupNotReadMsgQuery) {
    return request<ChatServerMsgResponse>({
        url: "chatMsg/selectGroupChatMsgNotRead",
        method: "post",
        data
    })
}
