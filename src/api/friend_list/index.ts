import { request } from "@/util/request"
import { FriendQuery, FriendListResp, ApplyFriendDTO, FriendApplyResp, FriendApplyRecordResp } from "../types/friend_list"

export function friendList(data: FriendQuery) {
    return request<FriendListResp>({
        url: "friendship/friendList",
        method: 'post',
        data
    })
}

export function applyFriend(data: ApplyFriendDTO) {
    return request<FriendApplyResp>({
        url: "applyFriend/applyFriend",
        method: 'post',
        data
    })
}

export function applyRecord(data?: number) {
    return request<FriendApplyRecordResp>({
        url: "applyFriend/applyRecord",
        method: 'post',
        data
    })
}