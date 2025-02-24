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

export interface ApplyFriend {

    proposerRemark: string,
    // appliedRemark: string, 
    targetUser: number,
    appliedRemark: string, 
    applyRemark?: string
}

export type FriendListResp = ApiResponseData<FriendRelationship[]>
export type FriendApplyResp = ApiResponseData<number>