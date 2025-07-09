
import 'reflect-metadata';
import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsumer";
import { ChatRecord } from "@/db/model/models";
import { useCurrentChatHook, useUserStoreHook } from "@/store/modules/user";
import emitter from "@/util/emitter";

@injectable()
export class ChatMsgConsume implements IMsgConsumer {
    msgType = 2
    msgConsume = (msgStr: string) => {
        // 写入local db
        console.log("接收到消息", msgStr)
        const msg: ChatRecord = JSON.parse(msgStr)
        msg.saveType = "1";
        msg.selfId = useUserStoreHook().userId;
        msg.dateTime = Number(msg.dateTime)
        // msg.friendId = msg.chatType === 2 ? msg.receiveUserId : msg.sendUserId;
        window.electronApi.writeMsg(msg)
        // 判断是不是在当前聊天，然后展示
        if (msg.friendId === useCurrentChatHook().chatUserId && msg.chatType === useCurrentChatHook().chatType) {
            emitter.emit('addMsgInLocal', msg)
        }
    }
}