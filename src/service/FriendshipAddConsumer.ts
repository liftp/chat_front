import { FriendRelationship } from "@/db/model/models";
import { IMsgConsumer } from "./IMsgConsumer";
import { injectable } from "inversify";
import { emit } from "process";
import emitter from "@/util/emitter";
import { etAddFriendship } from "@/constants/emitter_type";
import { useUserStoreHook } from "@/store/modules/user";

@injectable()
export class FriendshipAddConsumer implements IMsgConsumer {
    msgType= 6;
    msgConsume= (msg: string) => {
        // 作为好友信息
        console.log("好友关系添加")
        const friendship = JSON.parse(msg) as FriendRelationship
        window.electronApi.friendshipAdd({...friendship, selfId: useUserStoreHook().userId})
        // 触发好友列表更新
        emitter.emit(etAddFriendship, {...friendship, type: 1});
    };

}