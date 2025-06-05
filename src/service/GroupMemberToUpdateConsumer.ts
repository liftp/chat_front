import { GroupInfoDTO } from "@/api/types/group";
import { IMsgConsumer } from "./IMsgConsumer";
import { etGroupInfoUpdate } from "@/constants/emitter_type";
import emitter from "@/util/emitter";
import { injectable } from "inversify";

/**
 * 群聊成员变更通知
 */
@injectable()
export class GroupMemberToUpdateConsumer implements IMsgConsumer {

    msgType = 8;

    msgConsume = (msg: string) =>  {
        console.log("群聊成员更新：", msg)
        const groupInfo = JSON.parse(msg) as GroupInfoDTO
        emitter.emit(etGroupInfoUpdate, groupInfo.id);
    }

}