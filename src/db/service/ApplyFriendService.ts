import { ApplyFriend } from "../model/models";
import { dbApplyRecord } from "../NeDB";

export const recordList = (selfId: number) => {
    return new Promise<ApplyFriend[]>((resolve, reject) => {
        // console.log("find reg:", name);
        dbApplyRecord.find<ApplyFriend>({selfId})
            .exec((err, docs) => {
                if (err != null) {
                    reject(err)
                }
                console.log("find friends:", docs)
                resolve(docs)
            })
    })
}

export const applyRecordLastUpdatedAt = (selfId: number) => {
    return new Promise<ApplyFriend | undefined>((resolve, reject) => {
        dbApplyRecord.find<ApplyFriend>({selfId})
            .exec((err, docs) => {
                if (err) {
                    console.error("查询最后更新时间异常", err)
                    reject(err)
                }

                let updatedAtLast: ApplyFriend | undefined = undefined;
                docs.forEach(e => {
                    if (!updatedAtLast || updatedAtLast.updateTime < e.updateTime) {
                        updatedAtLast = e;
                    }
                })
                resolve(updatedAtLast)
            })
    })
}


export const updateRecord = (record: ApplyFriend) => {
    dbApplyRecord.update(
        {selfId: record.selfId, proposerId: record.proposerId, targetUser: record.targetUser}, 
        {$set: record}, {upsert: true},
        (err: Error | null, numberOfUpdated: number, affectedDocuments: any, upsert: boolean) => {
            if (err) {
                console.log("update apply error：", err)
            }
            console.log("update apply size:", numberOfUpdated)
            console.log("update apply is update ", upsert)
        }
    )
}

export const saveRecord = (record: ApplyFriend) =>  {
    dbApplyRecord.insert(record);
    return true;
};

export const delRecord = (friendId: string, selfId: number) =>  {
    let num = 0;
    dbApplyRecord.remove({friendId, selfId}, (err, docsNum) => {
        if (err != null) {
            throw err;
        }
        num = docsNum;
    });
    return num;
};

export const delRecordBySelf = (selfId: number) =>  {
    let num = 0;
    dbApplyRecord.remove({selfId}, (err, docsNum) => {
        if (err != null) {
            throw err;
        }
        num = docsNum;
    });
    return num;
};