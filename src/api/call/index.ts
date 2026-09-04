import { request } from "@/util/request"

export interface IceConfig {
    urls?: string[],
    username?: string,
    credential?: string
}

export function iceConfigApi() {
    return request<ApiResponseData<IceConfig>>({
        url: "call/iceConfig",
        method: "get"
    })
}
