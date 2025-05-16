import { GroupInfoDTO } from "@/api/types/group";
import { IMsgConsumer } from "./IMsgConsumer";
import { useUserStoreHook } from "@/store/modules/user";
import { FriendRelationship } from "@/api/types/friend_list";
import { etAddFriendship } from "@/constants/emitter_type";
import emitter from "@/util/emitter";
import { injectable } from "inversify";

@injectable()
export class GroupMemberAddConsumer implements IMsgConsumer {

    msgType = 7;

    msgConsume = (msg: string) =>  {
        console.log("群聊成员添加：", msg)
        const groupInfo = JSON.parse(msg) as GroupInfoDTO
        const friendship = {id: groupInfo.id, friendId: groupInfo.id, friendName: groupInfo.groupName, friendRemark: groupInfo.groupRemark, selfId: useUserStoreHook().userId, type: 2} as FriendRelationship
        window.electronApi.friendshipAdd(friendship)
        emitter.emit(etAddFriendship, friendship);
    }

}