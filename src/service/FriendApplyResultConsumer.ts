import { injectable } from "inversify"
import { IMsgConsumer } from "./IMsgConsumer"
import { ApplyFriend, FriendRelationship } from "@/db/model/models"
import { useUserStoreHook } from "@/store/modules/user"
import emitter from "@/util/emitter"
import { ApplyResultInfo } from "@/api/types/relation_ship"

/**
 * 好友申请结果确认通知
 */
@injectable()
export class FriendApplyResultMsgConsumer implements IMsgConsumer {
    msgType = 5
    msgConsume = (msg: string) => {
        console.log("获取到了好友申请", msg)
        // const applyStatus = Number(msg)
        const user = useUserStoreHook()
        const applyResult = JSON.parse(msg) as ApplyResultInfo
        const applyUpdate = {proposerId: applyResult.proposerId, proposerRemark: applyResult.proposerRemark,
            applyPass: applyResult.applyStatus, targetUser: applyResult.targetUser, 
            proposerName: user.realname, selfId: user.userId
        } as ApplyFriend
        window.electronApi.applyRecordAdd(applyUpdate)

        // 触发好友申请记录刷新
        // emitter.emit(etFriendApply, applyInsert)

    }
}
