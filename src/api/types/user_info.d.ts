export interface UserInfo {
    username: string,
    name: string,
    avatar?: string,
    id: number,
    friendRelation: boolean, // true: 与查询人是好友关系，false，非好友关系
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

export interface UpdateUserForm {
    name: string,
    avatar: string,
}

export type UpdateUserResponse = ApiResponseData<UserInfo>
