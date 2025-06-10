export interface UserInfo {
    username: string,
    name: string,
    id: number
}

export interface UserAdd {
    username: string,
    name: string,
    password: string,
    confirmPwd?: string,
}


export interface UserQuery {
    username: string
}

export type UserInfoResponse = ApiResponseData<UserInfo>
export type UserInfoListResponse = ApiResponseData<UserInfo[]>
export type UserAddResponse = ApiResponseData<boolean>
