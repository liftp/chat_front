import 'reflect-metadata';
import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsumer"
import emitter from '@/util/emitter';
import { etFriendOnlineStatus } from '@/constants/emitter_type';

/**
 * 好友下线通知消费者 (msgType=3, DOWN_LINE)
 * 后端通过 composition topic 推送，格式: {userId, username}
 */
@injectable()
export class OfflineStatusConsumer implements IMsgConsumer {
    msgType = 3
    msgConsume = (msg: string) => {
        const status = JSON.parse(msg) as { userId: number, username: string }
        console.log("好友下线通知", status)
        emitter.emit(etFriendOnlineStatus, { userId: status.userId, online: false })
    }
}
