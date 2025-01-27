import { Callback } from "element-plus";

let wsObj: WebSocket;
let wsUrl: string | URL;
let lockReconnect: boolean = false;
let wsCreateHandler: NodeJS.Timeout;
let messageCallback: Function;
let errorCallback: Function;
let sendDatas = {};

export const connectWebsocket = (url: string, agentData: {}, successCallback: Callback, errCallback: Callback) => {
    // 上次使用未关闭，创建前关闭下
    // if (wsObj) {
    //     closeWebSocket()
    // }
    wsUrl = url
    console.log("ws url: ", url)
    createWebSocket()
    messageCallback = successCallback
    errCallback = errCallback
    sendDatas = agentData
}

export const closeWebSocket = () => {
    if (wsObj) {
        wsObj.close()

        lockReconnect = true
        wsCreateHandler && clearTimeout(wsCreateHandler)
        heartCheck.stop()
    }
}

export const sendWsMsg = (msg: any) => {
    if (wsObj.readyState === wsObj.OPEN) {
        wsObj.send(JSON.stringify(sendDatas))
    } else {
        console.log("连接异常")
    }
}

const createWebSocket = () => {
    if (typeof (WebSocket) === 'undefined') {
        // writeToScreen("浏览器不支持WebSocket, 无法获取数据")
        return false;
    }

    try {
        wsObj = new WebSocket(wsUrl);
        initWsEventHandle();
        console.log("连接成功")
    } catch (e) {
        console.log("连接异常,正在重试")
        console.log(e)
        reconnect();
    }
}

const initWsEventHandle = () => {
    try {
        wsObj.onopen = (event: Event) => {
            onWsOpen(event)
            heartCheck.start()
        }

        wsObj.onmessage = (event: MessageEvent) => {
            onWsMessage(event)
            heartCheck.start()
        }

        wsObj.onclose = (event: CloseEvent) => {
            console.log("关闭ws")
            onWsClose(event);
        }

        wsObj.onerror = (event: Event) => {
            console.log("ws异常")
            onWsError(event);
        }
    } catch (err) {
        console.log("绑定时间失败")
        // reconnect();
    }
}

const onWsOpen = (event: Event) => {
    if (wsObj.readyState === wsObj.OPEN) {
        wsObj.send(JSON.stringify(sendDatas))
    }

    if (wsObj.readyState === wsObj.CLOSED) {
        reconnect();
        errorCallback(event)
    }
}

const onWsMessage = (event: MessageEvent) => {
    const jsonStr = event.data;
    messageCallback(jsonStr)
}

const onWsClose = (event: CloseEvent) => {
    console.log("close event");
    if (event && event.code !== 1000) {
        console.log("非正常关闭")
        errorCallback(event)
        reconnect();
    }
}

const onWsError = (event: Event) => {
    errorCallback(event);
}

const reconnect = () => {
    if (lockReconnect) {
        return;
    }
    console.log("三秒后重连")
    lockReconnect = true;
    wsCreateHandler && clearTimeout(wsCreateHandler)
    wsCreateHandler = setTimeout(() => {
        createWebSocket();
        lockReconnect = false;
    }, 3000);

}

// const GetQueryString = (name?: string) => {
//     let reg: RegExp | null
//     reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
//     let r = window.location.search.substring(1).match(reg)
//     let context = "";
//     r && (context = r[2])
//     reg = null
//     r = null
//     return context
// }

let heartCheck = {
    timeout: 15000,
    timeoutObj: -1,
    serverTimeoutObj: -1,
    reset() {
        clearTimeout(this.timeoutObj)
        clearTimeout(this.serverTimeoutObj)
        this.start()
    },
    stop() {
        clearTimeout(this.timeoutObj)
        clearTimeout(this.serverTimeoutObj)
    },
    start() {
        this.timeoutObj && clearTimeout(this.timeoutObj)
        this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
        this.timeoutObj = +setTimeout(() => {
            try {
                const datas = {ping : true}
                wsObj.send(JSON.stringify(datas))
            } catch (error) {
                console.log("发送ping异常")
            }
        },3000)
        console.log("内嵌定时器this.serverTimeoutObj:", this.serverTimeoutObj)
        this.serverTimeoutObj = +setTimeout(() => {
            reconnect();
        }, this.timeout)
    }
}
