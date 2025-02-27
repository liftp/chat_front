import { navSelectHook } from "@/store/modules/viewShow"

// 用于v-if判断是否展示，返回true/false
export const ifControl = (nav: string, mainMenu: string | undefined, listApply: () => boolean) => {
    const res =  (navSelectHook().navName === nav) && 
        (mainMenu ? navSelectHook().mainSelect === mainMenu : true)
        && (listApply ? listApply() : true)
    console.log("select menu", res)
    return res
}

// 返回style样式类型
export const showControl = (nav: string, mainMenu: string | undefined, listApply: () => boolean) => {
    return ifControl(nav, mainMenu, listApply) ? 'display:flex' : 'display:none'
}