export interface FriendRelationship {
    friendId: string,
    friendName: string,
    friendRemark: string,
    selfId: string,
}

export interface FreindQuery {
    // 名称模糊搜索
    name: string
}