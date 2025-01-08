<template>
    
        <el-container style="height: 78dvh;">
                <el-main>
                    <div id="chatBox" ref="msg_arr" class="chat-msg-box" @scroll="scroll_msg_box">
                            <div id="item" v-for="(line, index) in chatRecords" :key="index" style="margin-top: 10px;">
                                {{line}}
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
                        >
                            发送
                        </el-button>
                    </el-container>
                </el-footer>
        </el-container>
</template>

<script lang="ts" setup>
import {watchEffect, ref, Ref} from 'vue'
import { useCurrentChatHook } from '@/store/modules/user'
const msg_arr = ref([])
const inputText: Ref<string> = ref('')
const chatRecords: Ref<string[]> = ref([])



const host = window.location.host;
let page = 1
const size = 5
const maxLine = 0
watchEffect(() => {
    if (useCurrentChatHook().chatUserId != -1) {
        chatRecords.value = []
        // fileNoExistToCreate(recordPath)
        window.electronApi.recordCount().then((count) => {
            console.log("friendId", useCurrentChatHook().chatUserId)
            window.electronApi.readRecord( 0, count > (page * size) ? page * size : count, useCurrentChatHook().chatUserId)
                .then((records_text) => {
                    records_text.forEach((text, _) => {
                        chatRecords.value.push(text.content)
                        // page = 2;
                        // console.log(chatRecords.value)
                    })
                })
        })
    }
})

function scroll_msg_box() {
    let scrollTop = document.getElementById("chatBox")?.scrollTop;
    if (scrollTop == 0) {
        // 加载数据
        console.log("sdas")
    }
}

</script>

<style>
.chat-msg-box {
    /* height: 100%; */
    width: auto;
    
    overflow: auto;
    
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

#item {
    position: relative;
    width: fit-content;
    min-height: 20px;
    background: white;
    border-radius: 5px;
    line-height: normal;
    margin-left: 10px;
    word-break: break-word;
    color: black;
    padding: 5px;
    line-height: 18px;
}
#item::after {
    content: "";
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-right-color: white;
    top: 13px;
    left: -13px;
}
</style>