
// 定义格式化封装函数
export const formatDate = function(timer: Date) {
        const year = timer.getFullYear()
        const month = timer.getMonth() + 1 // 由于月份从0开始，因此需加1
        const day = timer.getDate()
        const hour = timer.getHours()
        const minute = timer.getMinutes()
        const second = timer.getSeconds()
        return `${pad(year, 4)}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`
}

export const formatDateForFile = function(timer: Date) {
    const year = timer.getFullYear()
    const month = timer.getMonth() + 1 // 由于月份从0开始，因此需加1
    const day = timer.getDate()
    const hour = timer.getHours()
    const minute = timer.getMinutes()
    const second = timer.getSeconds()
    const milliSeconds = timer.getMilliseconds();
    return `${pad(year, 4)}${pad(month)}${pad(day)}_${pad(hour)}${pad(minute)}${pad(second)}${pad(milliSeconds, 4)}`
}
// 定义具体处理标准
// timeEl 传递过来具体的数值：年月日时分秒
// total 字符串总长度 默认值为2
// str 补充元素 默认值为"0"
function pad(timeEl: number, total = 2, str = '0') {
    return timeEl.toString().padStart(total, str)
}
