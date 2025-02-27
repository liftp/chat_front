import { navSelectHook } from "@/store/modules/viewShow"

// 返回style样式类型
export const showControl = (listApply: () => boolean) => {
    return listApply() ? 'display:flex' : 'display:none'
}