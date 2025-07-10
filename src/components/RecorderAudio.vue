<template>
    <el-tooltip
        class="box-item"
        effect="dark"
        content="清空语音内容"
        placement="top-start">

        <el-button :disabled="!sendAudioShow"
            type="danger"
            style="margin-right: 5px"
            @click="audioClear"
            :icon="Delete"
            circle
            bg>
            
        </el-button>
    </el-tooltip>
    <el-button :disabled="voiceShow" 
        v-on="{mousedown: voiceActionStart, mouseup: voiceActionEnd}"
        v-show="!sendAudioShow"
        key="success"
        type="success"
        style="margin-right: 5px"
        text
        bg>
        长按语音
    </el-button>
    <el-button 
        v-show="sendAudioShow"
        key="success"
        type="success"
        style="margin-right: 5px"
        @click="sendAudio"
        text
        bg>
        发送语音
    </el-button>
</template>

<script lang="ts" setup>
import { fileUpload } from "@/api/fileupload";
import { ChatRecordDTO, sendMsgToServer } from "@/api/msg";
import { useCurrentChatHook, useUserStoreHook } from "@/store/modules/user";
import { onMounted, ref } from "vue";
import { Delete } from "@element-plus/icons-vue";
import emitter from "@/util/emitter";
import { addMsgEventType, etAudioStatus } from "@/constants/emitter_type";
import { ChatRecord } from "@/db/model/models";

// v-on="{mousedown: voiceActionStart, mouseup: voiceActionEnd}"
const voiceShow = ref<boolean>(false)
const cancelShow = ref<boolean>(false)
const sendAudioShow = ref<boolean>(false)

// const wavesurfaceRef = ref();
const mediaStream = ref<MediaStream>();
const mediaRecorder = ref<MediaRecorder>();
const recordedChunks = ref<Blob[]>([]);
const audioTrack = ref<MediaStreamTrack>();
const isRecording = ref<boolean>(false)
const bitsPerSeconds = ref<number>(-1);


const voiceActionStart = async () => {

    console.log("开始录制")
    emitter.emit(etAudioStatus, true)
    navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(stream => {
            
            mediaStream.value = stream;
            audioTrack.value = stream.getAudioTracks()[0];
            audioTrack.value.enabled = true
            mediaRecorder.value = new MediaRecorder(stream)
            mediaRecorder.value.start()
            isRecording.value = true
            bitsPerSeconds.value = mediaRecorder.value?.audioBitsPerSecond
            console.log("bitsPerSeconds", bitsPerSeconds.value)
            
            // voiceShow.value = true;
            // 录制监听
            mediaRecorder.value.addEventListener("dataavailable", (e) => {
                if (e.data.size > 0) {
                    console.log("recording...")
                    recordedChunks.value.push(e.data);
                    // console.log("save...", recordedChunks.value)
                    
                }
            });
            // 录制停止回调
            mediaRecorder.value.addEventListener("stop", () => {
                // sendAudio()
                // 展示清空语音按钮
                cancelShow.value = true
                // 展示发送语音，屏蔽长按录制
                sendAudioShow.value = true
                
                console.log("chunks len ", recordedChunks.value.map(e => e.size).reduce((pre, cur) => pre + cur))
                // 这里不能调用emitter，不生效具体原因待查找...
                
            })
            // wavesurfaceRef.value.play()
        })
        .catch((err) => {
            console.log("录制异常", err)
        })

}

const voiceActionEnd = () => {
    
    console.log("停止录制")
    if (isRecording) {
        mediaRecorder.value?.stop()
        mediaStream.value?.getTracks().forEach((track) => track.stop())

        isRecording.value = false
        if (audioTrack.value) {
            audioTrack.value.enabled = false
        }
        
        voiceShow.value = false;
        // 父组件的语音状态控制
        emitter.emit(etAudioStatus, false)
    }
    
}

const sendAudio = async () => {
    if (recordedChunks.value.length > 0) {
        const chatType = useCurrentChatHook().chatType;
        const chatUserId = useCurrentChatHook().chatUserId;
        const currentUserId = useUserStoreHook().userId;
        // 记录时长
        const recordTime = Math.ceil(recordedChunks.value.map(e => e.size).reduce((pre, cur) => pre + cur) * 8 / bitsPerSeconds.value);
        const blob = new Blob(recordedChunks.value, { type: "audio/webm"});
        console.log("save local...")
        const arrayBuffer = await blob.arrayBuffer();
        console.log("buffer", arrayBuffer)

        const fileNameExt = useUserStoreHook().userId + "_audio" + ".WebM";
        // 本地存储
        const fileName = await window.electronApi.localFileSave(fileNameExt, arrayBuffer)
        // 远程上传
        const formData = new FormData()
        formData.append("file", blob, fileName.substring(fileName.lastIndexOf("\\") + 1))
        
        fileUpload(formData)
            .then(fileInfo => {
                // 合成消息信息，提交服务端
                const msg: ChatRecordDTO = {contentType: 2, chatType: chatType, content: fileInfo.data, 
                    saveType: '1', sendUserId: currentUserId, receiveUserId: chatUserId, 
                    friendId: chatUserId, groupId: chatType == 1 ? -1 : chatUserId,
                    msgType: 2, contentLen: recordTime
                }
                

                // 发送消息
                sendMsgToServer(msg)
                    .then(msgResp => {
                        const msgWrap = msgResp.data
                        // save to local db
                        // 本地存储
                        const chatMsg: ChatRecord = {...msgWrap, dateTime: Number(msgWrap.dateTime),
                            localStore: fileName, selfId: currentUserId, 
                            friendId: msg.friendId, chatType, contentType: 2, contentLen: recordTime}
                        window.electronApi.writeMsg(chatMsg)

                        // record to add current chat window
                        emitter.emit(addMsgEventType, chatMsg)
                        sendAudioShow.value = false
                    })
                sendAudioShow.value = false
            })
            .catch(err => {
                console.log("语音消息发送失败", err)
                sendAudioShow.value = false
            })
        
        
    }
    recordedChunks.value = []
}

const audioClear = () => {
    recordedChunks.value = []
    sendAudioShow.value = false
    isRecording.value = false
}
</script>