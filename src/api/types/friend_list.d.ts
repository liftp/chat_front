export interface FriendRelationship {
    id: number,
    friendId: number,
    friendName: string,
    friendRemark: string,
    selfId: string,
}

export interface FriendQuery {
    // 名称模糊搜索
    name?: string,
    id?: number,
    searchType: number,
}

export type FriendListResp = ApiResponseData<FriendRelationship[]>