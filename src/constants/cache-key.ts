const SYSTEM_NAME = 'chat'
class CacheKey {
    static readonly TOKEN = `${SYSTEM_NAME}-token-key`
    static readonly ACCESS_TOKEN = `${SYSTEM_NAME}-access-token-key`
    static readonly REFRESH_TOKEN = `${SYSTEM_NAME}-refresh-token-key`
    static readonly USERNAME = `${SYSTEM_NAME}-username`
    static readonly REALNAME = `${SYSTEM_NAME}-realname`
    static readonly USER_ID = `${SYSTEM_NAME}-user-id`
    static readonly SERVER_HOST = `${SYSTEM_NAME}-server-host-key`
}

export default CacheKey