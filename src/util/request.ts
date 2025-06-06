import axios, {type AxiosInstance, type AxiosRequestConfig} from "axios"
import { useUserStoreHook } from "@/store/modules/user"
import { ElMessage } from "element-plus"
import { get, merge } from "lodash-es"
import { getToken, setToken } from "./cache/cookies"

import { useRouter } from 'vue-router';
import { config } from "process"



function logout() {
    // store logout
    const router = useRouter()
    router.push({name: "login"})
}

function createService() {
    const service = axios.create()
    service.interceptors.request.use(
        (config) => config,
        error => Promise.reject(error)
    )

    service.interceptors.response.use(
        (response) => {
            const apiData = response.data
            const responseType = response.request?.responseType
            if (responseType === 'blob' || responseType === 'arraybuffer') return apiData
            const code = apiData.code
            if (code === undefined) {
                ElMessage.error("非本系统接口")
                return Promise.reject(new Error("非本系统接口"))
            }

            switch (code) {
                case 202:
                    return apiData
                default:
                    ElMessage.error(apiData.remark || apiData)
                    return Promise.reject(new Error("Error"))

            }
        },
        error => {
            // const status = get(error, 'response.status')
            // const data = get(error, 'response.data')
            const { config, data, status } = error;
            switch (status) {
                case 400:
                    error.message = "请求错误"
                    break
                case 505:
                    logout()
                    error.message = "token无效"
                    break
                case 506:
                    logout()
                    error.message = "token缺失"
                    break;
                case 507:
                    error.message = "token失效"
                    // 返回了新token,重新请求
                    if (data && !config.retryCount) {
                        config.retryCount = 1
                        setToken(data as string)
                        config.headers['token'] = data;
                        service(config);
                    } else {
                        config.retryCount = 0;
                        logout()
                    }
                    break
                case 508:
                    error.message = "用户名不存在"
                    break
                case 509:
                    error.message = "密码错误"
                    break
                default:
                    break
            }
            ElMessage.error(error.message)
            return Promise.reject(error)
        }
    )
    return service
}

function createRequest(service: AxiosInstance) {
    return function <T>(config: AxiosRequestConfig): Promise<T> {
        // const token = getToken()
        const token = useUserStoreHook().token
        // console.log("token:", token)
        const defaultConfig = {
            headers: {
                token: token ? token : undefined,
                'Content-Type': 'application/json'
            },
            timeout: 5000,
            baseURL: import.meta.env.VITE_BASE_API,
            data: {}
        }
        const mergeConfig = merge(defaultConfig, config)
        return service(mergeConfig)
    }
}

const service = createService()
export const request = createRequest(service)