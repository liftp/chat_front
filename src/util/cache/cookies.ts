import CacheKey from '../../constants/cache-key'
import  Cookies  from 'js-cookie'


export const getToken = () => {
    return Cookies.get(CacheKey.TOKEN)
}

export const setToken = (token: string) => {
    Cookies.set(CacheKey.TOKEN, token)
}

export const setCookie = (key: string, val: string) => {
    Cookies.set(key, val)
}

export const getCookie = (key: string) => {
    return Cookies.get(key)
}

export const removeToken = () => {
    Cookies.remove(CacheKey.TOKEN)
}