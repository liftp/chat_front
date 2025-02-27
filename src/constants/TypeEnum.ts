class ApplyStatus {
    readonly type:number = -1
    readonly desc:string = ''
}

const APPLYING = {type: 0, desc: '未添加'} as ApplyStatus
const APPLY_PASS = {type: 0, desc: '已添加'} as ApplyStatus
const APPLY_REJECT = {type: 0, desc: '拒绝'} as ApplyStatus

const enumType = [APPLYING, APPLY_PASS, APPLY_REJECT]

export const applyStatusShowDesc = (type: number) => {
    const arr = enumType.filter(e => e.type == type)
    if (arr)
        return arr[0].desc
    else 
        return ''
}

export const applyDescShowType = (desc: string) => {
    const arr = enumType.filter(e => e.desc == desc)
    if (arr)
        return arr[0].type
    else 
        return -1
}

export const MainMenu = {
    CHAT: Symbol.for('chat'),
    FRIEND_LIST: Symbol.for('friendList'),
    APPLY_RECORD: Symbol.for('applyRecord'),
}