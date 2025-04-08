import 'reflect-metadata';
import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsumer"
import { saveRecord } from '@/db/service/ApplyFriendService';
import { ApplyFriend } from '@/db/model/models';
import { useUserStoreHook } from '@/store/modules/user';
import emitter from '@/util/emitter';
import { etFriendApply } from '@/constants/emitter_type';


@injectable()
export class FriendApplyMsgConsumer implements IMsgConsumer {
    msgType = 4
    msgConsume = (msg: string) => {
        console.log("获取到了好友申请", msg)
        const applyRecord = JSON.parse(msg) as ApplyFriend
        const user = useUserStoreHook()
        const applyInsert = {...applyRecord, selfId: user.userId, applyPass: 0}
        window.electronApi.applyRecordAdd(applyInsert)
        // 触发好友申请记录刷新
        emitter.emit(etFriendApply, applyInsert)

    }
}
