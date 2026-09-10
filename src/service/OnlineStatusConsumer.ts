import 'reflect-metadata';
import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsumer"
import emitter from '@/util/emitter';
import { etFriendOnlineStatus } from '@/constants/emitter_type';
import { useOnlineStatusHook } from '@/store/modules/onlineStatus';

/**
 * 好友上线通知消费者 (msgType=1, UP_LINE)
 * 后端通过 composition topic 推送，格式: {userId, username}
 */
@injectable()
export class OnlineStatusConsumer implements IMsgConsumer {
    msgType = 1
    msgConsume = (msg: string) => {
        const status = JSON.parse(msg) as { userId: number, username: string }
        console.log("好友上线通知", status)
        // 集中写 store，两个列表天然同步
        useOnlineStatusHook().setStatus(status.userId, true)
        emitter.emit(etFriendOnlineStatus, { userId: status.userId, online: true })
    }
}
