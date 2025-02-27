
import 'reflect-metadata';
import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsume";
import { ChatRecord } from "@/db/model/models";
import { useCurrentChatHook, useUserStoreHook } from "@/store/modules/user";
import emitter from "@/util/emitter";

@injectable()
export class ChatMsgConsume implements IMsgConsumer {
    msgType = 2
    msgConsume = (msgStr: string) => {
        // 写入local db
        const msg: ChatRecord = JSON.parse(msgStr)
        msg.saveType = "1";
        msg.selfId = useUserStoreHook().userId;
        window.electronApi.writeMsg(msg)
        // 判断是不是在当前聊天，然后展示
        if (msg.friendId === useCurrentChatHook().chatUserId && msg.chatType === useCurrentChatHook().chatType) {
            emitter.emit('addMsgInLocal', msg)
        }
    }
}