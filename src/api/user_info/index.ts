import {request} from '@/util/request'
import type * as User from '@/api/types/user_info'

export function getUserInfo() {
    return request<User.UserInfoResponse>({
        url: "user/userInfo",
        method: 'post'
    })
}

export function searchUser(query: User.UserQuery) {
    return request<User.UserInfoListResponse>({
        url: "user/searchUser",
        method: 'post',
        data: query
    })
}

export function addUserApi(data: User.UserAdd) {
    return request<User.UserAddResponse>({
        url: "user/insertUser",
        method: 'post',
        data
    })
}