import { request } from "@/util/request";
import type * as Login from "@/api/types/login"

export function loginApi(data: Login.LoginRequestData) {
    return request<Login.LoginResponseData>({
        url: "user/login",
        method: "post",
        data
    })
}