import { request } from "@/util/request"
import { FreindQuery } from "../types/friend_list"

export function friendList(data: FreindQuery) {
    return request<FreindQuery>({
        url: "user/friendList",
        method: 'post',
        data
    })
}