export interface UserInfo {
    username: string,
    name: string,
    id: number
}

export interface UserQuery {
    username: string
}

export type UserInfoResponse = ApiResponseData<UserInfo>
export type UserInfoListResponse = ApiResponseData<UserInfo[]>