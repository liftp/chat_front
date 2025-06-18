import { ref } from "vue";
import store from '@/store'
import { defineStore } from "pinia";
import { getToken, removeToken, setToken, setCookie } from "@/util/cache/cookies";
import { type LoginRequestData } from "@/api/types/login";
import { loginApi } from "@/api/login";
import {getUserInfo} from "@/api/user_info"
import type { UserInfoResponse } from "@/api/types/user_info";
import { ElMessage } from "element-plus";
// import CacheKey from "@/constants/cache-key";

const useUserStore = defineStore("user", () => {
    const token = ref<string>(getToken() || "")
    const roles = ref<string[]>([])
    const loginName = ref<string>("")
    const userId = ref<number>(-1)
    const realname = ref<string>("")
    const login = async({username, password}: LoginRequestData): Promise<Boolean> => {
        const {data, code} = await loginApi({username, password})
        if (code === 202) {

            // console.log(data)
            setToken(data)
            token.value = data
            // 拉取用户信息，存入cookie
            const userRes: UserInfoResponse = await getUserInfo();
            const userInfo = userRes.data
            userId.value = userInfo.id
            realname.value = userInfo.name
            loginName.value = username
            return true;
        } else if (code === 508) {
            ElMessage.error("用户不存在");
        }
        return false;

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

    const updateToken = (tokenNew: string) => {
        token.value = tokenNew
    }


    return {token: token.value, roles: roles.value, loginName:loginName.value, userId: userId.value, realname: realname.value, login, logout, resetToken, updateToken}
})

export function useUserStoreHook() {
    return useUserStore(store)
}

// 当前聊天展示用户
const useCurrentChat = defineStore("currentChat", () => {
    const chatUserId = ref<number>(-1); // 聊天用户 chatType:1,为好友id, chatType:2,为群聊ID
    const chatType = ref<number>(1) // 1：单聊 2：群聊
    const choiceUserChat = (userId: number) => {
        chatUserId.value = userId
    }
    const setChatType = (type: number) => {
        chatType.value = type
    }
    return {chatUserId: chatUserId.value, chatType: chatType.value, choiceUserChat, setChatType}
})
export function useCurrentChatHook() {
    return useCurrentChat(store)
}