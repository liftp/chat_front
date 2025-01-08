import {request} from '@/util/request'
import type * as User from '@/api/types/user_info'

export function getUserInfo() {
    return request<User.UserInfoResponse>({
        url: "user/userInfo",
        method: 'post'
    })
}