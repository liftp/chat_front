export interface UserInfo {
    username: string,
    name: string,
    id: number
}

export type UserInfoResponse = ApiResponseData<UserInfo>