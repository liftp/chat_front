import { request } from "@/util/request"
import { FriendQuery, FriendListResp } from "../types/friend_list"

export function friendList(data: FriendQuery) {
    return request<FriendListResp>({
        url: "friendship/friendList",
        method: 'post',
        data
    })
}