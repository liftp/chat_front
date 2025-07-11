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

export const updateRecord = (record: ApplyFriend) => {
    dbApplyRecord.update(
        {selfId: record.selfId, proposerId: record.proposerId, targetUser: record.targetUser}, 
        {$set: {applyPass: record.applyPass}}, {},
        (err: Error | null, numberOfUpdated: number, affectedDocuments: any, upsert: boolean) => {
            if (err) {
                console.log("更新申请状态异常：", err)
            }
            console.log("更新申请记录数量:", numberOfUpdated)
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