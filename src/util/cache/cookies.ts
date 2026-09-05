import CacheKey from '../../constants/cache-key'
import  Cookies  from 'js-cookie'


export const getToken = () => {
    return Cookies.get(CacheKey.ACCESS_TOKEN)
}

export const setToken = (token: string) => {
    Cookies.set(CacheKey.ACCESS_TOKEN, token)
}

export const getRefreshToken = () => {
    return Cookies.get(CacheKey.REFRESH_TOKEN)
}

export const setRefreshToken = (token: string) => {
    Cookies.set(CacheKey.REFRESH_TOKEN, token)
}

export const removeRefreshToken = () => {
    Cookies.remove(CacheKey.REFRESH_TOKEN)
}

export const setCookie = (key: string, val: string) => {
    Cookies.set(key, val)
}

export const getCookie = (key: string) => {
    return Cookies.get(key)
}

export const removeToken = () => {
    Cookies.remove(CacheKey.ACCESS_TOKEN)
}
