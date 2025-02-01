<template>
    
        <el-container style="height: 78dvh;">
                <el-main>
                    <div id="chatBox" ref="msg_arr" class="chat-msg-box" @scroll="scroll_msg_box">
                            <div  v-for="(line, index) in chatRecords" :class="line.sendUserId === currentUserId ? 'item-right' : 'item-left'" :key="index" style="margin-top: 10px;">
                                <template v-if="line.sendUserId !== currentUserId">
                                    <div class="bubble-triangle bubble-triangle-right"></div><div class="item item-left-child">{{line.content}}</div>
                                </template>
                                <template v-if="line.sendUserId === currentUserId">
                                    <div class="item item-right-child">{{line.content}}</div><div class="bubble-triangle bubble-triangle-left"></div>
                                </template>
                            </div>
                    </div>
                </el-main>

                <el-footer >
                    <el-divider/>
                    <el-input v-model="inputText" class="chat-input" placeholder="请输入内容" type="textarea" resize="none" :autosize="{minRows:4, maxRows: 4}"/>
                    <el-container style="justify-content: end;">
                    
                        <el-button
                            key="success"
                            type="success"
                            class="margin-right: 5px"
                            text
                            bg
                            @click="sendMsg"
                        >
                            发送
                        </el-button>
                    </el-container>
                </el-footer>
        </el-container>
</template>

<script lang="ts" setup>
import {watchEffect, ref, Ref, onUnmounted, onMounted} from 'vue'
import { useCurrentChatHook, useUserStoreHook } from '@/store/modules/user'
import emitter from '@/util/emitter'
import { ChatRecord, ChatRecordSearch } from '@/db/model/models'
import {formatDate} from '@/script/DateUtil'
const msg_arr = ref([])
const inputText: Ref<string> = ref('')
const chatRecords: Ref<ChatRecord[]> = ref([])
const currentUserId:number =  useUserStoreHook().userId;


const host = window.location.host;
const size = 20
const maxLine = 0
let startDateTime = -1
watchEffect(() => {
    upglide()
})

/**
 * 上滑滚动条，查询历史聊天记录
 * 基本分页逻辑：根据聊天记录时间戳倒序排，然后根据页面展示的最早一条的开始时间戳作为开始时间，往前查找size数量
 * 对应nedb中{dateTime:{$lt:startDateTime}},这里每次添加数据记录最早一条的时间戳，即startDateTime变量
 */
function upglide() {
    if (useCurrentChatHook().chatUserId != -1) {
        // fileNoExistToCreate(recordPath)
        // 按照好友id, 聊天记录所属当前用户，搜索对应的聊天记录 
        const search:ChatRecordSearch = {friendId: useCurrentChatHook().chatUserId, selfId: currentUserId}
        window.electronApi.recordCount(search).then((count) => {
            console.log("friendId", useCurrentChatHook().chatUserId)
            // 聊天记录的时间戳，往前查询固定条数
            window.electronApi.readRecord(startDateTime, size, search)
                .then((records_text) => {
                    records_text.forEach((text, _) => {
                        if (text.dateTime != undefined) {
                            startDateTime = text.dateTime;
                        }
                        // 每次往数组首位添加
                        chatRecords.value.unshift(text)
                        // page = 2;
                        // console.log(chatRecords.value)
                        // console.log(count)
                    })
                })
        })
    }
}

function scroll_msg_box() {
    let scrollTop = document.getElementById("chatBox")?.scrollTop;
    if (scrollTop == 0) {
        // 加载数据
        upglide()
    }
}

const addMsgEventType = 'addMsgInLocal'
onMounted(() => {
    emitter.on(addMsgEventType, (val) => {
        chatRecords.value.push(val as ChatRecord)
    })
})


onUnmounted(() => {
    emitter.off(addMsgEventType)
})

function sendMsg() {
    // write record in local 
    const receiveUserId = useCurrentChatHook().chatUserId
    const dateTime = new Date()
    const createdAt = formatDate(dateTime)
    const record: ChatRecord = {saveType: "1", sendUserId: currentUserId, receiveUserId: receiveUserId, friendId: receiveUserId, content: inputText.value, dateTime: dateTime.getTime(), createdAt};
    console.log(record)
    window.electronApi.writeMsg({...record, selfId: currentUserId})
    // send msg to server 
    emitter.emit("sendWsMsg", {...record, msgType: 2})
    // record to add current chat window
    chatRecords.value.push(record)
    // clear msg window
    inputText.value = ""
}

</script>

<style>
.chat-msg-box {
    /* height: 100%; */
    width: 100%;
    overflow: auto;
    /* display: flex; */
    /* flex-direction: column; */
    /* align-items: flex-end; */
}
.el-main {
    padding-left: 10px;
    display: flex;
}
.chat-msg-box div {
    text-align: left;
}

.chat-input {
    /* background-color: #f3f7ff;
    min-height: 100px; */
}
.item-left {
    display: flex;
    justify-content: flex-start;
}
.item-right {
    display: flex;
    justify-content: flex-end;
}


.item {
    position: relative;
    width: fit-content;
    min-height: 20px;
    border-radius: 5px;
    line-height: normal;
    word-break: break-word;
    color: black;
    padding: 5px;
    line-height: 18px;
}

.item-left-child {
    background-color: white;
}

.item-right-child {
    background-color: rgb(0, 200, 0);
}


.bubble-triangle {
    content: "";
    display: block;
    position: relative;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    top: 13px;
}

/* 气泡右三角 */
.bubble-triangle-right  {
    border-right-color: white;
    left: 3px;
}


/* 气泡左三角 */
.bubble-triangle-left {
    border-left-color: rgb(0, 200, 0);
    left: -3px;
}



</style>