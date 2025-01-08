import Datastore from 'nedb'
import { ChatRecord, FriendList } from './model/models'
import {formaData} from '../script/DateUtil'

export const db: Datastore<ChatRecord> = new Datastore<ChatRecord>({
    filename: './chatDB.db',
    autoload: true,
    // inMemoryOnly: false, // 是否仅存在内存中
    // timestampData: false, // 是属于creaedAt标记所有文档的插入和最后更新时间updatedAt
})

// db.remove({}, {multi: true}, (err, num) => {
//     console.log("delete num:", num)
// });

// db.insert({saveType: "1", msgId: "1", content: "test1", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 1})
// db.insert({saveType: "1", msgId: "2", content: "第一行", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 1})
// db.insert({saveType: "1", msgId: "3", content: "第二行asda", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 1})
// db.insert({saveType: "1", msgId: "3", content: "第三行asda", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 1})
// db.insert({saveType: "1", msgId: "3", content: "第四行asda", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 1})
// db.insert({saveType: "1", msgId: "3", content: "第五行asda", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 1})
// db.insert({saveType: "1", msgId: "3", content: "haha", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 3})
// db.insert({saveType: "1", msgId: "3", content: "how are you", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 3})
// db.insert({saveType: "1", msgId: "3", content: "da da da da ", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 3})
// db.insert({saveType: "1", msgId: "3", content: "okokok", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 3})
// db.insert({saveType: "1", msgId: "3", content: "tiki tiki ", sendUserId: "1", receiveUserId:"2", createdAt: formaData(new Date()), friendId: 3})



export const dbFreinds: Datastore<FriendList> = new Datastore<FriendList>({
    filename: './friendDB.db',
    autoload: true,
    // inMemoryOnly: false, // 是否仅存在内存中
    // timestampData: false, // 是属于creaedAt标记所有文档的插入和最后更新时间updatedAt
})
// dbFreinds.remove({}, {multi: true}, (err, num) => {
//     console.log("delete num:", num)
// });
// dbFreinds.insert({friendId: 2, friendName:"lisi", friendRemark: "李四", selfId: 1})
// dbFreinds.insert({friendId: 1, friendName:"zs", friendRemark: "张三", selfId: 2})
// dbFreinds.insert({friendId: 3, friendName:"wangwu", friendRemark: "王五", selfId: 2})
