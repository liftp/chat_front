import { ref } from "vue";
import store from '@/store'
import { defineStore } from "pinia";
import { getToken, removeToken, setToken, setCookie } from "@/util/cache/cookies";
import { type LoginRequestData } from "@/api/types/login";
import { loginApi } from "@/api/login";
import {getUserInfo} from "@/api/user_info"
import type { UserInfo,UserInfoResponse } from "@/api/types/user_info";
// import CacheKey from "@/constants/cache-key";

const useUserStore = defineStore("user", () => {
    const token = ref<string>(getToken() || "")
    const roles = ref<string[]>([])
    const loginName = ref<string>("")
    const userId = ref<number>(-1)
    const realname = ref<string>("")
    const login = async({username, password}: LoginRequestData) => {
        const {data} = await loginApi({username, password})
        // console.log(data)
        setToken(data)
        token.value = data
        // 拉取用户信息，存入cookie
        const userRes: UserInfoResponse = await getUserInfo();
        const userInfo = userRes.data
        userId.value = userInfo.id
        realname.value = userInfo.name
        loginName.value = username

        // setCookie(CacheKey.USER_ID, `${userInfo.id}`)
        // setCookie(CacheKey.USERNAME, userInfo.username)
        // setCookie(CacheKey.REALNAME, userInfo.username)

    }

    const logout = () => {
        removeToken()
        token.value = ""
        userId.value = -1
        loginName.value = ""
        realname.value = ""
        roles.value = []
        // resetRouter()
    }

    const resetToken = () => {
        removeToken()
        token.value = ""
        userId.value = -1
        loginName.value = ""
        realname.value = ""
        roles.value = []
    }


    return {token, roles, loginName, userId, realname, login, logout, resetToken}
})

export function useUserStoreHook() {
    return useUserStore(store)
}

// 当前聊天展示用户
const useCurrentChat = defineStore("currentChat", () => {
    const chatUserId = ref<number>(-1);
    const choiceUserChat = (userId: number) => {
        chatUserId.value = userId
    }
    return {chatUserId, choiceUserChat}
})
export function useCurrentChatHook() {
    return useCurrentChat(store)
}