import { reject } from 'lodash-es'
import {ChatRecord} from '../model/models'
import {db} from '../NeDB'
// interface ChatRecordService {
//     readRecord: (start: number, end: number, search?: ChatRecord) => Promise<ChatRecord[]>,
//     saveRecord: (record: ChatRecord) => boolean,
//     delRecord: (msgId: string) => number,
//     count: (search?: ChatRecord) => number
// }

// class ChatRecordServiceImpl implements ChatRecordService {
    export const readRecord = ( start: number, end: number, search?: any) =>  {
        return new Promise<ChatRecord[]>((resolve, reject) => {
            if (start != -1) {
                search.dateTime = {$lt: start}
            }
            db.find<ChatRecord>({...search}).sort({dateTime: -1})
                .skip(0).limit(end).exec((err, docs) => {
                    if (err != null) {
                        reject(err)
                    }
                    // console.log("聊天数据:", docs)
                    resolve(docs);
                });
        })
        
    }
    export const saveRecord = (record: ChatRecord) =>  {
        db.insert(record);
        return true;
    };
    export const delRecord = (msgId: string) =>  {
        let num = 0;
        db.remove({msgId}, (err, docsNum) => {
            if (err != null) {
                throw err;
            }
            num = docsNum;
        });
        return num;
    };
    export const countRecord = (search?: ChatRecord) => {
        return new Promise<number>((resolve, reject) => {
            console.log("count search:", search)
            db.count({saveType:'1', ...search}, (err, docsNum) => {
                if (err != null) {
                    reject(err)
                }
                resolve(docsNum);
            })
        })
    }

    export const selectGroupWithMaxMsgId = (selfId: number) => {
        return new Promise<ChatRecord[]>((resolve, reject) => {
            const arrGroup: number[] = []
            const groupLastRecord: ChatRecord[] = []
            // 查询所有群组聊天，时间倒序，取每个群聊的最后一条记录
            db.find<ChatRecord>({selfId, chatType: 2})
                .sort({dateTime: -1})
                .exec((err, docs) => {
                    if (err != null) {
                        reject(err)
                    }
                    console.log("group all chat msg:", docs)
                    docs.forEach(doc => {
                        
                        if (arrGroup.indexOf(doc.friendId) === -1) {
                            console.log("add one")
                            arrGroup.push(doc.friendId)
                            groupLastRecord.push(doc)
                        }
                    })
                    resolve(groupLastRecord)
                })
        })
    }

// }