<template>
		<el-aside class="chat-left">
			<div class="flex flex-wrap gap-5" id="friendList" ref="freinds_local" 
				v-for="friend in friendsLocal" 
				:key="friend.friendId">
				<el-card class="friend-info" 
					:class="friend.friendId === useCurrentChatHook().chatUserId && friend.type == useCurrentChatHook().chatType ? 'select_bgc' : ''"
					@click="choiceFriendChat(friend.friendId, friend.type)">
					<template v-if="friend.type === 2">
						[群聊]
					</template>
					{{friend.friendRemark}}
				</el-card>
			<!-- <el-card class="friend-info"  shadow="hover">Hover</el-card>
			<el-card class="friend-info"  shadow="never">Never</el-card> -->
			</div>
		</el-aside>
		<el-main class="chat-right">
			<MsgShowAndSend :style="showControl(() => useCurrentChatHook().chatUserId != -1)"/>
		</el-main>

</template>
<script setup lang="ts">
import { ChatRecord, FriendList } from '@/db/model/models';
// import { getCookie } from '@/util/cache/cookies';
import { useCurrentChatHook, useUserStoreHook } from '@/store/modules/user';
import { onMounted, onUnmounted, Ref, ref, watchEffect } from 'vue';
import {connectWebsocket, closeWebSocket, sendWsMsg} from '../ws/WebSocketServer'
import emitter from '@/util/emitter';
import { selectNotReadMsg } from '@/api/msg';
import { container } from '@/config/inject_container.config';
import { IMsgConsumer } from '@/service/IMsgConsumer';
import SERVICE_IDENTIFIES from '@/constants/identifiers';
import { showControl } from '@/util/menu_control/menu';

import MsgShowAndSend from '@/components/MsgShowAndSend.vue'
import { etAddFriendship } from '@/constants/emitter_type';

var friendsLocal: Ref<FriendList[]> = ref([])
const host = window.location.host;
const sendWsMsgEventType = "sendWsMsg"

// 先从本地加载好友列表
onMounted(() => {
	// ws连接
	connectWebsocket(
			`ws://${host}${import.meta.env.VITE_WS_PATH}chat?token=${useUserStoreHook().token}`,
			{msgType: 1},
			(data: string) => {
				console.log('返回的数据：', data)
				// 按约定： msgType + "," + msgObj,解析数据
				const commaIdx = data.indexOf(",")
				if (commaIdx > -1) {
					const msgTypeStr = data.substring(0, commaIdx)
					// 类型不为空 并且是数字
					if (msgTypeStr != null && /^\d*$/.test(msgTypeStr)) {
						const msgType = Number(msgTypeStr)
						// 去处理相应类型的消息
						const msgConsumers = container.getAll<IMsgConsumer>(SERVICE_IDENTIFIES.IMSG_CONSUMER)
						msgConsumers.filter(e => e.msgType === msgType)
							.forEach(c => c.msgConsume(data.substring(commaIdx + 1)))
					}
				}
			},
			(err: string) => {
				console.log('失败回调：', err)
			}
		)
	// emitter on 
	emitter.on(sendWsMsgEventType, (val) => {
		sendWsMsg(val) 
    })
	emitter.on(etAddFriendship, (val) => {
		friendsLocal.value.push(val as FriendList)
    })
	// 拉取未读消息,应该同步于消息展示之前(加载好友列表之前即可)
	selectNotReadMsg()
		.then((docs) => {
			if (docs != null && docs.data != null) {
				docs.data.forEach(element => {
					element.selfId = element.receiveUserId
					element.friendId = element.sendUserId
					element.dateTime = Number(element.dateTime)
					window.electronApi.writeMsg(element)
				});
			}
			// 加载本地好友列表
			window.electronApi.findFriend('', useUserStoreHook().userId)
				.then(freindList => {
					freindList.forEach(friend => {
						console.log(friend)
						friendsLocal.value.push(friend)
					})
				})
		})
	
})

onUnmounted(() => {
    closeWebSocket()
	// emitter off 
	emitter.off(sendWsMsgEventType)
})


// 更新聊天人id
const choiceFriendChat = (friendId: number, chatType: number) => {
	const chatHook = useCurrentChatHook()
	console.log("choice friend:", friendId, "chatType:", chatType)
	// 当前用户不操作
	if (friendId !== chatHook.chatUserId) {
		// 清理当前窗口聊天记录
		emitter.emit("cleanMsg")
		
	}
	chatHook.choiceUserChat(friendId)
	chatHook.setChatType(chatType)


}


</script>

<style>
  .friend-info {
    text-align: left;
	background-color: #fdfdfd;
  }
  .margin_top {
	margin-top: 5px;
  }
  .select_bgc {
	background-color: #c4c4c4;
  }
  .chat-left {
    /* margin-left: 0px; */
    background-color: #cfcfcf;
    border: 1px solid #e4e7ed;
    width: 30%;
    border-radius: 4px;
  }
  .chat-right {
    width: 70%;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #cfcfcf;
    height: 100vh;
  }
</style>