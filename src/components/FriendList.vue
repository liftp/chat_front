<template>
    <div class="flex flex-wrap gap-2 " id="friendList" ref="freinds_local" v-for="friend in friendsLocal" :key="friend.friendId">
      <el-card class="friend-info" shadow="hover" @click="choiceFriendChat(friend.friendId)">{{friend.friendRemark}}</el-card>
      <!-- <el-card class="friend-info"  shadow="hover">Hover</el-card>
      <el-card class="friend-info"  shadow="never">Never</el-card> -->
    </div>
</template>
<script setup lang="ts">
import { ChatRecord, FriendList } from '@/db/model/models';
// import { getCookie } from '@/util/cache/cookies';
import { useCurrentChatHook, useUserStoreHook } from '@/store/modules/user';
import { onMounted, onUnmounted, Ref, ref, watchEffect } from 'vue';
import {connectWebsocket, closeWebSocket, sendWsMsg} from '../ws/WebSocketServer'
import emitter from '@/util/emitter';
import { selectNotReadMsg } from '@/api/msg';

var friendsLocal: Ref<FriendList[]> = ref([])
const host = window.location.host;
const sendWsMsgEventType = "sendWsMsg"  

// 先从本地加载好友列表
onMounted(() => {
	// ws连接
	connectWebsocket(
			`ws://${host}${import.meta.env.VITE_WS_PATH}chat?token=${useUserStoreHook().token}`,
			// "ws://localhost:9001/chat",
			{msgType: 1},
			(data: string) => {
				console.log('返回的数据：', data)
				// 写入local db
				const msg: ChatRecord = JSON.parse(data)
				msg.saveType = "1";
				// 服务器的消息的friendId没有处理，是接收人（相对于发送人的好友而言），这里转换为发送人
				msg.friendId = msg.sendUserId;
				msg.selfId = useUserStoreHook().userId;
				window.electronApi.writeMsg(msg)
				emitter.emit('addMsgInLocal', msg)
			},
			(err: string) => {
				console.log('失败回调：', err)
			}
		)
	// emitter on 
	emitter.on(sendWsMsgEventType, (val) => {
		sendWsMsg(val) 
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
const choiceFriendChat = (friendId: number) => {
  console.log("choice friend:", friendId)
  useCurrentChatHook().choiceUserChat(friendId)
}


</script>

<style>
  .friend-info {
    text-align: left;
  }
</style>