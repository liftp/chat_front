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
    dbFreinds.insert(record);
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