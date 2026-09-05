export interface LoginRequestData {
    username: string,
    password: string
}

export interface TokenPair {
    accessToken: string,
    refreshToken: string
}

export type LoginResponseData = ApiResponseData<TokenPair>
