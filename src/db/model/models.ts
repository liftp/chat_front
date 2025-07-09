export interface ChatRecord {
    saveType: string, // 1.聊天记录
    msgId?: number, 
    sendUserId: number, 
    receiveUserId: number,
    content: string,
    createdAt?: string,
    friendId: number,
    selfId?: number, // 消息所属
    dateTime?: number, // 时间戳用于排序
    chatType: number, // 1:单聊 2:群聊
    contentType: number, // 1: 文本 2：语音
    localStore?: string, // 本地文件地址
}

export interface ChatRecordSearch {
    saveType?: string, // 1.聊天记录
    msgId?: number, 
    sendUserId?: number, 
    receiveUserId?: number,
    content?: string,
    createdAt?: string,
    friendId?: number,
    selfId?: number, // 消息所属
    chatType: number, // 1:单聊 2:群聊
}

// 聊天数据
export interface FriendList {
    friendId: number,       // type:2,群组id
    friendName: string,     // type:2,群组名称
    friendRemark: string,   // type:2,群组备注
    type: number, // 类型 1:普通好友聊天 2:群聊
    // groupStatus: number, // 群状态： 0:开放 1:成员邀请加入 2:仅所属人拉取 3:密码进入
    selfId: number,
}

// 好友数据
export interface FriendRelationship {
    id: number, // 好友关系id
    friendId: number,
    friendName: string,
    friendRemark: string,
    selfId: number,
    type: number,
}

export interface ApplyFriend {
    proposerId: number,
    proposerRemark: string,
    proposerName: string,
    // appliedRemark: string, 
    targetUser: number,
    appliedRemark?: string, 
    applyRemark?: string
    applyPass: number, // 申请状态： 0:申请中 1:通过 2:拒绝
    applyPassDesc?: string,
    selfId: number,
    updatedAt: number,
}

export interface GroupMember {
        // id
        id: number,

        // 群组id
        groupId: number,
    
        // 好友id
        memberId: number,
    
        // 好友名称
        memberName: string,
    
        // 群内备注
        memberRemark: string,
    
        // 邀请人
        inviteId: number,
        // 所属
        selfId: number,

        // 最后一次拉取成员信息时间，用于控制拉取频率
        lastPullTime: number,
}