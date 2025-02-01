import  {type ChatServerMsgResponse, ChatServerMsgRecord}  from "@/api/types/msg";
import { request } from "@/util/request";

export function selectNotReadMsg() {
    return request<ChatServerMsgResponse>({
        url: "chatMsg/selectNotReadMsg",
        method: "post"
    })
}