import axios, {InternalAxiosRequestConfig, type AxiosInstance, type AxiosRequestConfig} from "axios"
import { useUserStoreHook } from "@/store/modules/user"
import { ElMessage } from "element-plus"
import { get, merge } from "lodash-es"
import { getToken, setToken } from "./cache/cookies"

import router from "@/router"


interface CustomeAxiosConfig extends InternalAxiosRequestConfig {
    retryCount?: number
}


function logout() {
    // store logout、
    router.push({name: "login"})
}

function createService() {
    const service = axios.create()
    service.interceptors.request.use(
        (config: CustomeAxiosConfig) => config,
        error => Promise.reject(error)
    )

    service.interceptors.response.use(
        (response) => {
            console.log("res", response)
            const apiData = response.data
            const responseType = response.request?.responseType
            if (responseType === 'blob' || responseType === 'arraybuffer') return apiData
            const code = apiData.code
            if (code === undefined) {
                ElMessage.error("非本系统接口")
                return Promise.reject(new Error("非本系统接口"))
            }

            // token 换新token，再次请求
            if (code === 507) {
                console.log("again request", response.config)

                const config = response.config as CustomeAxiosConfig;
                if (!config.retryCount || config.retryCount === 0) {
                    config.retryCount = 1
                    
                    console.log("again token", apiData.data)
                    useUserStoreHook().updateToken(apiData.data as string)
                    config.headers['token'] = useUserStoreHook().token
                    return service(config);
                } else {
                    config.retryCount = 0;
                    logout()
                }
                return Promise.reject(new Error("token invalid"))
            }

            return apiData;

            // switch (code) {
            //     case 202:
            //         return apiData
            //     default:
            //         ElMessage.error(apiData.remark || apiData)
            //         return Promise.reject(new Error("Error"))

            // }
        },
        error => {
            // const status = get(error, 'response.status')
            // const data = get(error, 'response.data')
            console.log("again request")
            const status = error.response?.data?.code;
            const data = error.response?.data?.data;
            const config = error.config;
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