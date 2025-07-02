<template>
    <el-button :disabled="voiceShow" v-on="{mousedown: voiceActionStart, mouseup: voiceActionEnd}">
        长按录音
    </el-button>
</template>

<script lang="ts" setup>
import { fileUpload } from "@/api/fileupload";
import { ChatRecordDTO, sendMsgToServer } from "@/api/msg";
import { useCurrentChatHook, useUserStoreHook } from "@/store/modules/user";
import { onMounted, ref } from "vue";

const voiceShow = ref<boolean>(false)

// const wavesurfaceRef = ref();
const mediaStream = ref<MediaStream>();
const mediaRecorder = ref<MediaRecorder>();
const recordedChunks = ref<Blob[]>([]);
const audioTrack = ref<MediaStreamTrack>();
const isRecording = ref<boolean>(false)



const voiceActionStart = async () => {

    console.log("开始录制")
    navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(stream => {
            
            mediaStream.value = stream;
            audioTrack.value = stream.getAudioTracks()[0];
            audioTrack.value.enabled = true
            mediaRecorder.value = new MediaRecorder(stream)
            mediaRecorder.value.start()
            isRecording.value = true
            // voiceShow.value = true;
            mediaRecorder.value.addEventListener("dataavailable", (e) => {
                if (e.data.size > 0) {
                    console.log("recording...")
                    recordedChunks.value.push(e.data);
                    // console.log("save...", recordedChunks.value)
                    
                }
            });
            mediaRecorder.value.addEventListener("stop", () => {
                saveAudio()
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
        
        voiceShow.value = false;
    }
    
}

const saveAudio = async () => {
    if (recordedChunks.value.length > 0) {
        const chatType = useCurrentChatHook().chatType;
        const chatUserId = useCurrentChatHook().chatUserId;
        const currentUserId = useUserStoreHook().userId;
        const blob = new Blob(recordedChunks.value, { type: "audio/webm"});
        console.log("save local...")
        const arrayBuffer = await blob.arrayBuffer();
        console.log("buffer", arrayBuffer)

        const fileNameExt = useUserStoreHook().userId + "_audio" + ".WebM";
        // 本地存储
        const fileName = await window.electronApi.localFileSave(fileNameExt, arrayBuffer)
        // 远程上传
        const formData = new FormData()
        formData.append("file", blob)
        
        fileUpload(formData)
            .then(fileInfo => {
                // 合成消息信息，提交服务端
                const msg: ChatRecordDTO = {contentType: 2, chatType: chatType, content: fileInfo.data.url, 
                    saveType: '1', sendUserId: currentUserId, receiveUserId: chatUserId, 
                    friendId: useCurrentChatHook().chatUserId, groupId: chatType == 1 ? -1 : chatUserId,
                    msgType: 2
                }
                

                // 发送消息
                sendMsgToServer(msg)
                    .then(msgResp => {
                        const msgWrap = msgResp.data
                        // save to local db
                        // 本地存储
                        window.electronApi.writeMsg({...msgWrap, selfId: useCurrentChatHook().chatUserId, friendId: msg.friendId, chatType, contentType: 2})
                        // record to add current chat window
                        // chatRecords.value.push(record)
                        // clear msg window
                        // inputText.value = ""
                        // setTimeout(scrollToBottom, 500);
                    })
            })
            .catch(err => {
                console.log("语音消息发送失败", err)
            })
        
        
    }
    recordedChunks.value = []
}
</script>