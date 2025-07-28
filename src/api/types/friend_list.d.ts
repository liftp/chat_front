import { ApplyFriend } from "@/db/model/models"

export interface FriendRelationship {
    id: number,
    friendId: number,
    friendName: string,
    friendRemark: string,
    type: number,
    selfId: number,
}

export interface FriendQuery {
    // 名称模糊搜索
    name?: string,
    id?: number,
    searchType: number,
}



export type ApplyFriendDTO  = Partial<ApplyFriend>

export type FriendListResp = ApiResponseData<FriendRelationship[]>
export type FriendApplyResp = ApiResponseData<ApplyFriend>
export type FriendApplyRecordResp = ApiResponseData<ApplyFriend[]>