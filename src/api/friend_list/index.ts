import { request } from "@/util/request"
import { FriendQuery, FriendListResp, ApplyFriend, FriendApplyResp } from "../types/friend_list"

export function friendList(data: FriendQuery) {
    return request<FriendListResp>({
        url: "friendship/friendList",
        method: 'post',
        data
    })
}

export function applyFriend(data: ApplyFriend) {
    return request<FriendApplyResp>({
        url: "applyFriend/applyFriend",
        method: 'post',
        data
    })
}