import { ApplyFriend } from "@/db/model/models"

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



export type ApplyFriendDTO  = Partial<ApplyFriend>

export type FriendListResp = ApiResponseData<FriendRelationship[]>
export type FriendApplyResp = ApiResponseData<number>
export type FriendApplyRecordResp = ApiResponseData<ApplyFriend[]>