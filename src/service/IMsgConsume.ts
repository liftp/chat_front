import { injectable } from "inversify"

export interface IMsgConsumer {
    msgConsume : (msg: string) => void
    msgType: number
}

@injectable()
export class ChatMsgConsume implements IMsgConsumer {
    msgType = 1
    msgConsume = (msg: string) => {
        console.log("聊天消息")
    }
}

@injectable()
export class FirendApplyMsgConsume implements IMsgConsumer {
    msgType = 2
    msgConsume = (msg: string) => {
        console.log("好友申请")
    }
}
