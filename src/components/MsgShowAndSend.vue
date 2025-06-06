<template>
    
    <div style="width: 100%; height: 10dvh;"> 
        
        <el-container style="height: 78dvh; ">
                <el-header style="margin-left:0px;height: 32px;  width: 100%; ">
                    <div style="display: flex;justify-content: space-between; margin-top: 5px;">
                        <span style="margin-left: 0px;">{{ friend.type === 2 ? friend.friendName : friend.friendRemark }}</span>
                        <span ><el-button icon="MoreFilled" size="small" type="" @click="friend.type === 2 ? groupMembersQuery(friend.friendId) : ''" text></el-button></span>
                    </div>
                    <el-drawer v-model="drawerOpt" direction="rtl" :title="friend.type === 2 ? friend.friendName : friend.friendRemark">
                        <div style="flex: auto;text-align: left;">
                            <div v-for="member in groupMembers" style="float: left;">
                                <span style="text-overflow: ellipsis; width: 40px;display: block;overflow: hidden;">{{ member.memberRemark }}</span>
                            </div> 
                        </div>
                    </el-drawer>
                    <el-divider style="margin-top: 5px;"/>
                </el-header>
                <el-main>
                    <div id="chatBox" ref="msg_arr" class="chat-msg-box" @scroll="scroll_msg_box">
                        <template v-if="delayShow">
                            <el-scrollbar ref="scrollbarRef" height="100%">
                                <div  v-for="(line, index) in chatRecords"  :key="index" style="margin-top: 10px;">
                                    <template v-if="line.sendUserId !== currentUserId">
                                        <template v-if="friend.type === 2">
                                            <div>
                                                <span style="font-size: 12px;">{{ groupMembersLocal?.get(line.sendUserId)?.memberRemark }}</span>
                                            </div>
                                        </template>
                                        <div :class="line.sendUserId === currentUserId ? 'item-right' : 'item-left'">
                                            <div class="bubble-triangle bubble-triangle-right"></div><div class="item item-left-child">{{line.content}}</div>
                                        </div>
                                    </template>
                                    <template v-if="line.sendUserId === currentUserId">
                                        <div class='item-right'>
                                            <div class="item item-right-child">{{line.content}}</div><div class="bubble-triangle bubble-triangle-left"></div>
                                        </div>
                                    </template>
                                </div>
                            </el-scrollbar>
                        </template>
                    </div>
                </el-main>

                <el-footer >
                    <el-divider/>
                    <el-input v-model="inputText" class="chat-input" :disabled="!delayShow" placeholder="请输入内容" type="textarea" resize="none" :autosize="{minRows:4, maxRows: 4}"/>
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
    </div>
</template>

<script lang="ts" setup>
import {watchEffect, ref, Ref, onUnmounted, onMounted, watch, computed} from 'vue'
import { useCurrentChatHook, useUserStoreHook } from '@/store/modules/user'
import emitter from '@/util/emitter'
import { ChatRecord, ChatRecordSearch, FriendList, GroupMember } from '@/db/model/models'
import {formatDate} from '@/script/DateUtil'
import { findAllGroupMemberById, findGroupMemberById } from '@/api/group'
import { GroupMemberVO } from '@/api/types/group'
import { ElNotification, ScrollbarInstance } from 'element-plus'
import { HashMap } from '@/util/common/HashMap'
import { sendMsgToServer } from '@/api/msg'
import { chatPanelScrollToBottom, etGroupInfoUpdate } from '@/constants/emitter_type'
const msg_arr = ref([])
const inputText: Ref<string> = ref('')
const chatRecords: Ref<ChatRecord[]> = ref([])
const currentUserId:number =  useUserStoreHook().userId;
const drawerOpt = ref(false);
// 右侧抽屉的成员信息
const groupMembers = ref<GroupMemberVO[]>()
// 本地存储的成员信息
const groupMembersLocal = ref<HashMap<number, GroupMember>>()
const delayShow = ref(false)

const scrollbarRef = ref<ScrollbarInstance>()


const host = window.location.host;
const size = 20
const maxLine = 0
let startDateTime = -1
watchEffect(() => {
    upglide()
})

const scrollToBottom = () => {
    const wrap = scrollbarRef.value?.wrapRef
    if (wrap) {
        wrap.scrollTop = wrap.scrollHeight;
        console.log("scroll to bottom")
    }
}

const props = withDefaults(defineProps<{friend?: FriendList}>(), {
    friend: () => {
        return {friendId: -1, friendName: '', friendRemark: '', selfId: -1, type: -1}
    }
})

watch(() => props.friend, (newVal, oldVal) =>{
    console.log("watch props")
    if (props.friend.type === 2) {
        delayShow.value = false
        groupMemberInfoPull(props.friend.friendId)
    } else if (props.friend.type === 1) {   
        delayShow.value = true
    }
})

const groupMembersQuery = (groupId: number) => {
    findGroupMemberById(groupId)
        .then(resp => {
            groupMembers.value = resp.data
            drawerOpt.value = true
        })
        .catch(err => {
            ElNotification({
                title: '异常提示',
                message: "获取群组成员失败",
            })
        })
}

/**
 * 上滑滚动条，查询历史聊天记录
 * 基本分页逻辑：根据聊天记录时间戳倒序排，然后根据页面展示的最早一条的开始时间戳作为开始时间，往前查找size数量
 * 对应nedb中{dateTime:{$lt:startDateTime}},这里每次添加数据记录最早一条的时间戳，即startDateTime变量
 */
function upglide() {
    if (useCurrentChatHook().chatUserId != -1) {
        // fileNoExistToCreate(recordPath)
        // 按照好友id(群聊时为分组id), 聊天记录所属当前用户，以及类型(单聊还是群聊)，搜索对应的聊天记录 
        const search:ChatRecordSearch = {friendId: useCurrentChatHook().chatUserId, selfId: currentUserId, chatType: useCurrentChatHook().chatType}
        window.electronApi.recordCount(search).then((count) => {
            console.log("friendId", useCurrentChatHook().chatUserId)
            console.log("count:", count)

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
    let scrollTop = scrollbarRef.value?.wrapRef?.scrollTop;
    if (scrollTop === 0) {
        // 加载数据
        upglide()
    }
}

const addMsgEventType = 'addMsgInLocal'
const cleanMsgEventType = 'cleanMsg'
onMounted(() => {
    emitter.on(addMsgEventType, (val) => {
        chatRecords.value.push(val as ChatRecord)
        setTimeout(scrollToBottom, 500);
    })
    emitter.on(cleanMsgEventType, () => {
        console.log("clean ....")
        chatRecords.value = []
        startDateTime = -1
    })
    emitter.on(chatPanelScrollToBottom, () => {
        setTimeout(scrollToBottom, 500)
    })    
    emitter.on(etGroupInfoUpdate, (val) => {
        groupMemebersToUpdate(val as number, currentUserId)
    })
})


onUnmounted(() => {
    emitter.off(addMsgEventType)
    emitter.off(cleanMsgEventType)
    emitter.off(chatPanelScrollToBottom)
    emitter.off(etGroupInfoUpdate)
})

function sendMsg() {
    // write record in local 
    const receiveUserId = useCurrentChatHook().chatUserId
    const chatType = useCurrentChatHook().chatType
    const dateTime = new Date()
    const createdAt = formatDate(dateTime)
    const record: ChatRecord = { chatType: chatType, saveType: "1", 
        sendUserId: currentUserId, receiveUserId: receiveUserId, 
        friendId: receiveUserId, content: inputText.value, 
        dateTime: dateTime.getTime(), createdAt};
    console.log(record)
    // send msg to server 
    // 这里自己发送的消息，为了在响应的时候拿到该数据的id，所以使用http请求，从返回值拿发送人的那条数据信息
    sendMsgToServer({...record, msgType: 2, groupId: chatType == 2 ? receiveUserId : -1, chatType})
        .then(msgResp => {
            const msgWrap = msgResp.data
            // save to local db
            window.electronApi.writeMsg({...msgWrap, selfId: currentUserId, friendId: receiveUserId, chatType})
            // record to add current chat window
            chatRecords.value.push(record)
            // clear msg window
            inputText.value = ""
            setTimeout(scrollToBottom, 500);
        })
    // emitter.emit("sendWsMsg", {...record, msgType: 2, groupId: chatType == 2 ? receiveUserId : -1, chatType})
}

const groupMemberInfoPull = (groupId: number) => {
	// 查询群组的成员信息，最后拉取时间超过1小时，再去拉取，防止频繁获取
	const thisUser = useUserStoreHook().userId
	window.electronApi.findGroupMembers(groupId, thisUser)
		.then(members => {
                // console.log(members)
				const outOfHour = !members || members.length == 0 || (new Date().getTime() - members[0].lastPullTime) > (3600 * 1000);
                // if (members) {
                //     console.log("上次拉取时间", new Date().getTime() - members[0].lastPullTime)
                // }
				if (outOfHour) {
					findAllGroupMemberById(groupId)
						.then(memNew => {
							// 删掉旧的
							window.electronApi.delMembersByGroupId(groupId, thisUser)
							const currTime = new Date().getTime()
							const memLocal: GroupMember[] = [];
							memNew.data.forEach(mem => {
								const ele = {...mem, lastPullTime: currTime, selfId: thisUser} as GroupMember
								memLocal.push(ele)
							})
							// 添加新的
							window.electronApi.saveGroupMembersLocal(memLocal)
							// 刷新聊天记录
                            const localMap = new HashMap<number, GroupMember>();
                            memLocal.forEach(m => {
                                localMap.set(m.memberId, m)
                            })
                            groupMembersLocal.value = localMap
						})
				} else {
                    console.log("未超过拉取时间")
                    const localMap = new HashMap<number, GroupMember>();
                    members.forEach(m => {
                        localMap.set(m.memberId, m)
                    })
                    groupMembersLocal.value = localMap
                }
                delayShow.value = true
			}
		)
	
}

// 群成员更新了，需要重新保存下数据，因为每次拉取有一小时的时间限制
const groupMemebersToUpdate = (groupId: number, thisUser: number) => {
    findAllGroupMemberById(groupId)
        .then(memNew => {
            console.log("更新群信息")
            // 删掉旧的
            window.electronApi.delMembersByGroupId(groupId, thisUser)
            const currTime = new Date().getTime()
            const memLocal: GroupMember[] = [];
            memNew.data.forEach(mem => {
                const ele = {...mem, lastPullTime: currTime, selfId: thisUser} as GroupMember
                memLocal.push(ele)
            })
            // 添加新的
            window.electronApi.saveGroupMembersLocal(memLocal)
            // 如果是当前会话，更新成员缓存
            // 刷新聊天记录
            if (groupId === useCurrentChatHook().chatUserId && useCurrentChatHook().chatType === 2) {
                const localMap = new HashMap<number, GroupMember>();
                memLocal.forEach(m => {
                    localMap.set(m.memberId, m)
                })
                groupMembersLocal.value = localMap
            }
        })
}

</script>

<style scoped>
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

.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}



</style>