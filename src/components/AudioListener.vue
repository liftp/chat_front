<template>
    <div @click="playAudio">
        <template v-if="direct === 'left'">
            <div style="display: flex;justify-content: start;">
                <div class="triangle_audio_left"></div>
                <div class="cricle_half_1_left shape_animation_2"></div>
                <div class="circle_half_2_left shape_animation_3"></div>
                <div style="margin-left: 10px;">{{ contentLen }}''</div>
            </div>
        </template>
        <template v-if="direct === 'right'">
            <div style="display: flex;justify-content: end;">
                <div style="margin-right: 10px;">{{ contentLen }}''</div>
                <div class="circle_half_2 shape_animation_3"></div>
                <div class="cricle_half_1 shape_animation_2"></div>
                <div class="triangle_audio"></div>
            </div>
        </template>

        <audio ref="audioRef" :src="srcUrl" style="display: none;"></audio>
    </div>
</template>
<script lang="ts" setup>
import { onUnmounted, ref } from 'vue';


const props = withDefaults(defineProps<{audioPath?: string, direct: 'left' | 'right', contentLen: number | undefined}>(), {
})
const srcUrl = ref<string>('')
const audioRef = ref<HTMLAudioElement>()

const playAudio = async () => {
    // 从本地生成audio URL
    if (srcUrl.value == '' && props.audioPath) {
        await window.electronApi.readLocalFileContent(props.audioPath)
            .then(buf => {
                const blob = new Blob([buf], { type: "audio/webm"})
                srcUrl.value = URL.createObjectURL(blob);
                
            })
            .catch(err => {
                console.log("语音读取异常", err)
            })
        audioRef.value?.play()
    } else if (srcUrl.value != '' && props.audioPath) {
        // 调用播放
        audioRef.value?.play()
    }
}
onUnmounted(() => {
    if (srcUrl.value != '') {
        srcUrl.value = ''
    }
})
</script>
<style lang="css">


    .triangle_audio {
        border: 3px solid transparent;
        width: 0px;
        height: 0px;
        content: '';
        /* background-color: black; */
        border-left-color: black;
        /* border-right-color: white; */
        margin-left: -7px;
        margin-top: 6px;
    }
    .cricle_half_1 {
        
        border: 2px solid transparent;
        border-left-color: black;
        border-radius: 8px;
        width: 8px;
        height: 8px;
        margin-left: -13px;
        margin-top: 3px;
    }
    .circle_half_2 {
        border: 2px solid transparent;
        border-left-color: black;
        border-radius: 14px;
        width: 14px;
        height: 14px;
    }

    .triangle_audio_left {
        border: 3px solid transparent;
        width: 0px;
        height: 0px;
        content: '';
        /* background-color: black; */
        border-right-color: black;
        /* border-right-color: white; */
        margin-left: -7px;
        margin-top: 6px;
    }
    .cricle_half_1_left {
        
        border: 2px solid transparent;
        border-right-color: black;
        border-radius: 8px;
        width: 8px;
        height: 8px;
        margin-right: -13px;
        margin-left: -7px;
        margin-top: 3px;
    }
    .circle_half_2_left {
        border: 2px solid transparent;
        border-right-color: black;
        border-radius: 14px;
        width: 14px;
        height: 14px;
    }
    .shape_animation_1 {
        animation: fadeIn_1 1s infinite;
    }
    .shape_animation_2 {
        animation: fadeIn_2 1s infinite;
    }
    .shape_animation_3 {
        animation: fadeIn_3 1s infinite;
    }

    @keyframes fadeIn_1 {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 0; }
    }
    @keyframes fadeIn_2 {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    @keyframes fadeIn_3 {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
</style>