import { GroupMember } from "../model/models"
import { dbGroupMember } from "../NeDB"

export const findGroupMembersLocal = (groupId: number, selfId: number) => {
    return new Promise<GroupMember[]>((resolve, reject) => {
        dbGroupMember.find<GroupMember>({groupId, selfId})
            .exec((err, docs) => {
                if (err != null) {
                    reject(err)
                }
                resolve(docs)
                console.log("查询群组成员", docs)
            })
    })
}

export const saveGroupMembersLocal = (members: GroupMember[]) => {
    dbGroupMember.insert(members);
    console.log("添加群组成员", members)
    return true;
}

export const delMembersByGroupIdLocal = (groupId: number, selfId: number) => {
    let num = 0
    dbGroupMember.remove({groupId, selfId}, {multi: true},
        (err, docsNum) => {
            if (err != null) {
                throw err;
            }
            num = docsNum
            console.log("删除群组成员数量", docsNum)
        }
    );
    return num;
}