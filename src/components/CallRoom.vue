<template>
    <el-dialog v-model="visible" :title="isVideo ? '视频通话' : '语音通话'" :width="isVideo ? '640px' : '320px'"
        :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
        <!-- 语音通话时舞台隐藏但元素保留，远端音频照样播放 -->
        <div class="call_stage" v-show="isVideo">
            <video class="call_video" ref="remoteVideoRef" autoplay playsinline></video>
            <video class="call_video_local" ref="localVideoRef" muted autoplay playsinline></video>
        </div>
        <div class="call-body" :class="ring ? 'call_ring' : ''">
            <div class="call_name">{{ peerName }}</div>
            <div class="call_state">{{ stateText }}</div>
        </div>
        <template #footer>
            <span v-if="state === 'active'" class="call_timer">{{ fmt(seconds) }}</span>
            <el-button v-if="state === 'incoming'" type="danger" @click="reject">拒绝</el-button>
            <el-button v-if="state === 'incoming'" type="success" @click="accept">接听</el-button>
            <el-button v-if="state === 'calling'" type="danger" @click="cancel">取消</el-button>
            <el-button v-if="state === 'active'" circle :type="muted ? 'warning' : 'info'" :icon="Microphone"
                @click="toggleMute" />
            <el-button v-if="state === 'active' && isVideo" circle :type="camOff ? 'warning' : 'info'"
                :icon="VideoCamera" @click="toggleCam" />
            <el-button v-if="state === 'active'" circle type="danger" :icon="PhoneFilled" @click="hangup" />
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Microphone, PhoneFilled, VideoCamera } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import emitter from '@/util/emitter'
import { addMsgEventType, etAudioStatus, etCallSignal, etCallStart } from '@/constants/emitter_type'
import { useUserStoreHook } from '@/store/modules/user'
import { ChatRecordDTO, sendMsgToServer } from '@/api/msg'
import { iceConfigApi } from '@/api/call'
import { isWsOpen, sendWsMsg } from '@/ws/WebSocketServer'
import { ChatRecord, FriendList } from '@/db/model/models'

type CallState = 'idle' | 'calling' | 'incoming' | 'active'
type CallMedia = 'audio' | 'video'
interface CallSignal {
    callId: string, type: string, media?: CallMedia, sdp?: string,
    reason?: string, candidate?: RTCIceCandidateInit
}

const state = ref<CallState>('idle')
const media = ref<CallMedia>('audio')
const peerId = ref(-1)
const callId = ref('')
const seconds = ref(0)
const muted = ref(false)
const camOff = ref(false)
const friends = ref<FriendList[]>([])
const localStream = ref<MediaStream | null>(null)
const remoteStream = ref<MediaStream | null>(null)
const remoteVideoRef = ref<HTMLVideoElement>()
const localVideoRef = ref<HTMLVideoElement>()
let pc: RTCPeerConnection | null = null
let remoteOffer = ''
let iceQueue: RTCIceCandidateInit[] = []
let answerTimer: number | undefined
let secTimer: number | undefined
let iceServers: RTCIceServer[] = []
let iceCacheTime = 0

const meId = () => useUserStoreHook().userId
const isVideo = computed(() => media.value === 'video')
// 空setter：弹窗只能由挂断/拒绝/超时关闭，避免 el-dialog 自行关闭把状态打回 idle
const visible = computed({ get: () => state.value !== 'idle', set: () => { } })
const ring = computed(() => state.value === 'incoming' || state.value === 'calling')
const isCaller = () => callId.value.startsWith(`${meId()}_`)
const peerName = computed(() => {
    const friend = friends.value.find(e => e.friendId === peerId.value)
    return friend ? (friend.friendRemark || friend.friendName) : `${peerId.value}`
})
const stateText = computed(() => {
    const kind = isVideo.value ? '视频' : '语音'
    return ({
        calling: `等待对方接听…`,
        incoming: `邀请你${kind}通话`,
        active: muted.value ? '已静音' : '通话中',
        idle: ''
    } as Record<CallState, string>)[state.value]
})

// 时长 mm:ss，超1小时仍按分钟累计显示
const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
const talkText = () => `${isVideo.value ? '视频' : '语音'}通话 ${fmt(seconds.value)}`

// 被叫回 reject 的原因映射成主叫侧的落库文案
const rejectText = (reason?: string) => ({
    no_answer: '对方无应答',
    no_camera: '对方摄像头不可用',
    no_mic: '对方麦克风不可用'
} as Record<string, string>)[reason ?? ''] ?? '对方已拒绝'

const loadFriends = () => {
    if (meId() > 0 && friends.value.length === 0) {
        window.electronApi.findFriend('', meId()).then(list => { friends.value = list })
    }
}

const bindStreams = async () => {
    await nextTick()
    if (remoteVideoRef.value && remoteVideoRef.value.srcObject !== remoteStream.value) {
        remoteVideoRef.value.srcObject = remoteStream.value
        remoteVideoRef.value.play().catch(() => { })
    }
    if (localVideoRef.value && localVideoRef.value.srcObject !== localStream.value) {
        localVideoRef.value.srcObject = localStream.value
    }
}
watch([visible, isVideo, localStream, remoteStream], bindStreams)

const sendSignal = (to: number, cid: string, type: string, extra: object = {}) => {
    sendWsMsg({ msgType: 9, receiveUserId: to, content: JSON.stringify({ callId: cid, type, ...extra }) })
}
const signal = (type: string, extra: object = {}) => sendSignal(peerId.value, callId.value, type, extra)

const getIceServers = async () => {
    if (iceCacheTime > Date.now() / 1000) return iceServers
    try {
        const cfg = (await iceConfigApi()).data
        iceServers = cfg && cfg.urls && cfg.urls.length > 0
            ? [{ urls: cfg.urls, username: cfg.username, credential: cfg.credential }] : []
    } catch (err) {
        console.log("ice配置获取失败", err)
        iceServers = []
    }
    // ponytail: 凭证服务端1小时过期，这里固定缓存30分钟
    iceCacheTime = Date.now() / 1000 + 1800
    return iceServers
}

const openMedia = async () => {
    try {
        localStream.value = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: media.value === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } : false
        })
        emitter.emit(etAudioStatus, true)
        return true
    } catch (err) {
        console.log("采集设备打开失败", err)
        ElNotification({ title: '异常提示', message: isVideo.value ? '摄像头不可用' : '麦克风不可用' })
        return false
    }
}

const flushIce = () => {
    iceQueue.forEach(candidate => pc?.addIceCandidate(candidate).catch(() => { }))
    iceQueue = []
}

const createPc = async () => {
    const peer = new RTCPeerConnection({ iceServers: await getIceServers() })
    localStream.value?.getTracks().forEach(track => peer.addTrack(track, localStream.value!))
    peer.onicecandidate = (e) => e.candidate && signal('ice', { candidate: e.candidate.toJSON() })
    peer.ontrack = (e) => { remoteStream.value = e.streams[0] }
    peer.onconnectionstatechange = () => {
        if (peer !== pc) return
        if (peer.connectionState === 'connected') {
            state.value = 'active'
            clearTimeout(answerTimer)
            secTimer = +setInterval(() => seconds.value++, 1000)
        } else if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
            end(seconds.value > 0 ? talkText() : '未接通，网络异常')
        }
    }
    return peer
}

const stopAll = () => {
    clearTimeout(answerTimer); clearInterval(secTimer)
    answerTimer = undefined; secTimer = undefined
    if (pc) {
        pc.onconnectionstatechange = null; pc.onicecandidate = null; pc.ontrack = null
        pc.close(); pc = null
    }
    localStream.value?.getTracks().forEach(track => track.stop())
    localStream.value = null
    remoteStream.value = null
    iceQueue = []
    remoteOffer = ''
    emitter.emit(etAudioStatus, false)
}

const reset = () => {
    state.value = 'idle'; peerId.value = -1; callId.value = ''; seconds.value = 0
    muted.value = false; camOff.value = false; media.value = 'audio'
}

/** 结束通话：只有主叫写通话记录（唯一写入方），被叫靠对端推送同步 */
const end = (text: string, notify?: { type: string, reason?: string }) => {
    const caller = isCaller()
    const peer = peerId.value
    const duration = seconds.value
    if (notify) signal(notify.type, notify.reason ? { reason: notify.reason } : {})
    stopAll()
    reset()
    if (caller && text) saveCallRecord(peer, text, duration)
}

const saveCallRecord = (receiveUserId: number, content: string, contentLen: number) => {
    const msg: ChatRecordDTO = {
        saveType: '1', msgType: 2, contentType: 3, chatType: 1, content, contentLen,
        sendUserId: meId(), receiveUserId, friendId: receiveUserId, groupId: -1
    }
    sendMsgToServer(msg)
        .then(resp => {
            const msgWrap = resp.data
            const chatMsg: ChatRecord = {
                ...msgWrap, dateTime: Number(msgWrap.dateTime), selfId: meId(),
                friendId: receiveUserId, chatType: 1, contentType: 3, contentLen
            }
            window.electronApi.writeMsg(chatMsg)
            emitter.emit(addMsgEventType, chatMsg)
        })
        .catch(err => console.log("通话记录保存失败", err))
}

const startCall = async (peer: number, kind: CallMedia) => {
    loadFriends()
    if (state.value !== 'idle' || !peer || peer === meId()) return
    if (!isWsOpen()) {
        ElNotification({ title: '异常提示', message: '网络异常，通话发起失败' })
        return
    }
    peerId.value = peer
    media.value = kind
    callId.value = `${meId()}_${Date.now()}`
    if (!(await openMedia())) { end(''); return }
    try {
        pc = await createPc()
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        signal('offer', { sdp: offer.sdp, media: media.value })
        state.value = 'calling'
        // 30秒无应答
        answerTimer = +setTimeout(() => end('对方无应答', { type: 'cancel' }), 30000)
    } catch (err) {
        console.log("通话发起失败", err)
        ElNotification({ title: '异常提示', message: '通话发起失败' })
        end('')
    }
}

const ringIncoming = (from: number, sig: CallSignal) => {
    if (!sig.sdp) return
    iceQueue = []
    remoteOffer = sig.sdp
    peerId.value = from
    callId.value = sig.callId
    media.value = sig.media === 'video' ? 'video' : 'audio'
    state.value = 'incoming'
    // 30秒未接听，自动回绝对方
    answerTimer = +setTimeout(() => end('', { type: 'reject', reason: 'no_answer' }), 30000)
}

const accept = async () => {
    if (!(await openMedia())) {
        end('', { type: 'reject', reason: isVideo.value ? 'no_camera' : 'no_mic' })
        return
    }
    try {
        pc = await createPc()
        await pc.setRemoteDescription({ type: 'offer', sdp: remoteOffer })
        flushIce()
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        signal('answer', { sdp: answer.sdp })
        state.value = 'active'
    } catch (err) {
        console.log("接听失败", err)
        end('', { type: 'reject', reason: 'no_mic' })
    }
}

const reject = () => end('', { type: 'reject' })
const cancel = () => end('已取消通话', { type: 'cancel' })
const hangup = () => end(talkText(), { type: 'bye' })
const toggleMute = () => {
    muted.value = !muted.value
    localStream.value?.getAudioTracks().forEach(track => track.enabled = !muted.value)
}
const toggleCam = () => {
    camOff.value = !camOff.value
    localStream.value?.getVideoTracks().forEach(track => track.enabled = !camOff.value)
}

const onSignal = async (raw: any) => {
    const event = raw as { from: number, sig: CallSignal }
    const { from, sig } = event
    if (!sig || !sig.callId || !sig.type) return
    loadFriends()

    if (sig.callId !== callId.value) {
        if (sig.type === 'offer' && state.value === 'idle') {
            ringIncoming(from, sig)
        } else if (sig.type === 'offer') {
            // 通话中收到新来电，回忙线
            sendSignal(from, sig.callId, 'busy')
        }
        // 其余为过期/串话信令，丢弃
        return
    }
    switch (sig.type) {
        case 'answer':
            if (pc) {
                await pc.setRemoteDescription({ type: 'answer', sdp: sig.sdp })
                flushIce()
            }
            clearTimeout(answerTimer)
            break
        case 'ice':
            if (!sig.candidate) break
            if (pc && pc.remoteDescription) pc.addIceCandidate(sig.candidate).catch(() => { })
            else iceQueue.push(sig.candidate)
            break
        case 'busy': end('对方忙线中'); break
        case 'reject': end(rejectText(sig.reason)); break
        case 'cancel': end(''); break
        case 'offline': end('未接通，对方不在线'); break
        case 'bye': end(talkText()); break
        default: break
    }
}

onMounted(() => {
    emitter.on(etCallStart, (raw: any) => {
        const event = raw as { peerId: number, media: CallMedia }
        startCall(event.peerId, event.media)
    })
    emitter.on(etCallSignal, onSignal)
    loadFriends()
})

onUnmounted(() => {
    emitter.off(etCallStart)
    emitter.off(etCallSignal)
    stopAll()
})
</script>

<style scoped>
.call_stage {
    position: relative;
}

.call_video {
    width: 100%;
    height: 300px;
    background-color: #000;
    object-fit: cover;
    border-radius: 4px;
}

.call_video_local {
    position: absolute;
    right: 8px;
    top: 8px;
    width: 120px;
    height: 90px;
    background-color: #222;
    object-fit: cover;
    border: 1px solid #fff;
    border-radius: 4px;
}

.call-body {
    text-align: left;
    margin-top: 8px;
}

.call_name {
    font-size: 18px;
    font-weight: 600;
}

.call_state {
    margin-top: 8px;
    color: #666;
}

.call_timer {
    margin-right: 12px;
}

.call_ring {
    animation: call_blink 1s infinite alternate;
}

@keyframes call_blink {
    from { opacity: 1; }
    to { opacity: 0.35; }
}
</style>
