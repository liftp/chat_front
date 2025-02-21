import { FriendRelationship } from "../model/models";
import { dbFreindship } from "../NeDB";

export const findFriend = (name: string, selfId: number) => {
    return new Promise<FriendRelationship[]>((resolve, reject) => {
        // console.log("find reg:", name);
        dbFreindship.find<FriendRelationship>({friendName: new RegExp(name), selfId})
            .exec((err, docs) => {
                if (err != null) {
                    reject(err)
                }
                // console.log("find friends:", docs)
                resolve(docs)
            })
    })
}

export const saveRecord = (record: FriendRelationship) =>  {
    dbFreindship.insert(record);
    return true;
};

export const delRecord = (friendId: string, selfId: string) =>  {
    let num = 0;
    dbFreindship.remove({friendId, selfId}, (err, docsNum) => {
        if (err != null) {
            throw err;
        }
        num = docsNum;
    });
    return num;
};