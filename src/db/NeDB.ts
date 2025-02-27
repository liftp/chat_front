import Datastore from 'nedb'
import { ApplyFriend, ChatRecord, FriendList, FriendRelationship } from './model/models'
import {formatDate} from '../script/DateUtil'

export const db: Datastore<ChatRecord> = new Datastore<ChatRecord>({
    filename: './chatDB.db',
    autoload: true,
    // inMemoryOnly: false, // 是否仅存在内存中
    // timestampData: false, // 是属于creaedAt标记所有文档的插入和最后更新时间updatedAt
})

// db.remove({}, {multi: true}, (err, num) => {
//     console.log("delete num:", num)
// });

// db.insert({saveType: "1", msgId: 1, content: "test1", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 1})
// db.insert({saveType: "1", msgId: 2, content: "第一行", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 1})
// db.insert({saveType: "1", msgId: 3, content: "第二行asda", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 1})
// db.insert({saveType: "1", msgId: 4, content: "第三行asda", sendUserId: 2, receiveUserId: 1, createdAt: formaData(new Date()), friendId: 1, selfId: 1})
// db.insert({saveType: "1", msgId: 5, content: "第四行asda", sendUserId: 2, receiveUserId: 1, createdAt: formaData(new Date()), friendId: 1, selfId: 1})
// db.insert({saveType: "1", msgId: 6, content: "第五行asda", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 1})
// db.insert({saveType: "1", msgId: 7, content: "haha", sendUserId: 3, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 8, content: "how are you", sendUserId: 3, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 9, content: "da da da da ", sendUserId: 2, receiveUserId: 3, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 10, content: "okokok", sendUserId: 3, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 11, content: "tiki tiki ", sendUserId: 2, receiveUserId: 3, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 1, content: "test1", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 2})
// db.insert({saveType: "1", msgId: 2, content: "第一行", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 2})
// db.insert({saveType: "1", msgId: 3, content: "第二行asda", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 2})
// db.insert({saveType: "1", msgId: 4, content: "第三行asda", sendUserId: 2, receiveUserId: 1, createdAt: formaData(new Date()), friendId: 1, selfId: 2})
// db.insert({saveType: "1", msgId: 5, content: "第四行asda", sendUserId: 2, receiveUserId: 1, createdAt: formaData(new Date()), friendId: 1, selfId: 2})
// db.insert({saveType: "1", msgId: 6, content: "第五行asda", sendUserId: 1, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 1, selfId: 2})
// db.insert({saveType: "1", msgId: 7, content: "haha", sendUserId: 3, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 3, selfId: 1})
// db.insert({saveType: "1", msgId: 8, content: "how are you", sendUserId: 3, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 9, content: "da da da da ", sendUserId: 2, receiveUserId: 3, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 10, content: "okokok", sendUserId: 3, receiveUserId: 2, createdAt: formaData(new Date()), friendId: 3, selfId: 2})
// db.insert({saveType: "1", msgId: 11, content: "tiki tiki ", sendUserId: 2, receiveUserId: 3, createdAt: formaData(new Date()), friendId: 3, selfId: 2})



export const dbFreinds: Datastore<FriendList> = new Datastore<FriendList>({
    filename: './friendDB.db',
    autoload: true,
    // inMemoryOnly: false, // 是否仅存在内存中
    // timestampData: false, // 是属于creaedAt标记所有文档的插入和最后更新时间updatedAt
})
// dbFreinds.remove({}, {multi: true}, (err, num) => {
//     console.log("delete num:", num)
// });
// dbFreinds.insert({friendId: 2, friendName:"lisi", friendRemark: "李四", selfId: 1, type: 1})
// dbFreinds.insert({friendId: 1, friendName:"zs", friendRemark: "张三", selfId: 2, type: 1})
// dbFreinds.insert({friendId: 3, friendName:"wangwu", friendRemark: "王五", selfId: 2, type: 1})
// dbFreinds.insert({friendId: 4, friendName:"多人群聊", friendRemark: "开放群聊", selfId: 1, type: 2})

export const dbFreindship: Datastore<FriendRelationship> = new Datastore<FriendRelationship>({
    filename: './friendshipDB.db',
    autoload: true,
    // inMemoryOnly: false, // 是否仅存在内存中
    // timestampData: false, // 是属于creaedAt标记所有文档的插入和最后更新时间updatedAt
})

export const dbApplyRecord: Datastore<ApplyFriend> = new Datastore<ApplyFriend>({
    filename: './friendApplyRecordDB.db',
    autoload: true,
    // inMemoryOnly: false, // 是否仅存在内存中
    // timestampData: false, // 是属于creaedAt标记所有文档的插入和最后更新时间updatedAt
})


