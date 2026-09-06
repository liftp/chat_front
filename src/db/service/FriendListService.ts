import { FriendList } from "../model/models";
import { dbFreinds } from "../NeDB";

export const findFriend = (name: string, selfId: number) => {
    return new Promise<FriendList[]>((resolve, reject) => {
        // console.log("find reg:", name);
        dbFreinds.find<FriendList>({friendName: new RegExp(name), selfId})
            .exec((err, docs) => {
                if (err != null) {
                    reject(err)
                }
                // console.log("find friends:", docs)
                resolve(docs)
            })
    })
}

export const saveRecord = (record: FriendList) =>  {
    // 按 friendId+selfId+type upsert：好友列表点击打开聊天等场景会重复同步同一好友，
    // 盲插会产生重复会话记录
    dbFreinds.update({friendId: record.friendId, selfId: record.selfId, type: record.type}, record, {upsert: true});
    return true;
};

export const delRecord = (friendId: string, selfId: string) =>  {
    let num = 0;
    dbFreinds.remove({friendId, selfId}, (err, docsNum) => {
        if (err != null) {
            throw err;
        }
        num = docsNum;
    });
    return num;
};