import fs from 'fs'
import path from 'node:path'

export const localFileSave = async (fileName: string, arrayBuffer: ArrayBuffer) => {
    const buffer = Buffer.from(arrayBuffer)
    const userPath = path.join("data", formatDate(new Date()));
    if (!fs.existsSync(userPath)) {
        fs.mkdirSync(userPath, {recursive: true})
    }
    // todo 数据存储路径可配置
    const filePath = path.join(userPath, crypto.randomUUID + fileName)
    console.log("file path", filePath)
    return new Promise<string>((resolve, reject) => {
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
               reject(err)
            }
            resolve(fileName)
        })
    })

}


// 定义格式化封装函数
const formatDate = (timer: Date) => {
    const year = timer.getFullYear()
    const month = timer.getMonth() + 1 // 由于月份从0开始，因此需加1
    const day = timer.getDate()
    const hour = timer.getHours()
    const minute = timer.getMinutes()
    const second = timer.getSeconds()
    return `${pad(year, 4)}${pad(month)}${pad(day)}`
}
// 定义具体处理标准
// timeEl 传递过来具体的数值：年月日时分秒
// total 字符串总长度 默认值为2
// str 补充元素 默认值为"0"
export function pad(timeEl: number, total = 2, str = '0') {
    return timeEl.toString().padStart(total, str)
}