<template>
    <div class="flex flex-wrap gap-2 " id="friendList" ref="freinds_local" v-for="friend in friendsLocal" :key="friend.friendId">
      <el-card class="friend-info" shadow="hover" @click="choiceFriendChat(friend.friendId)">{{friend.friendRemark}}</el-card>
      <!-- <el-card class="friend-info"  shadow="hover">Hover</el-card>
      <el-card class="friend-info"  shadow="never">Never</el-card> -->
    </div>
</template>
<script setup lang="ts">
import { FriendList } from '@/db/model/models';
// import { getCookie } from '@/util/cache/cookies';
import { useCurrentChatHook, useUserStoreHook } from '@/store/modules/user';
import { onMounted, onUnmounted, Ref, ref, watchEffect } from 'vue';
import {connectWebsocket, closeWebSocket} from '../ws/WebSocketServer'


var friendsLocal: Ref<FriendList[]> = ref([])
const host = window.location.host;
  

// 先从本地加载好友列表
onMounted(() => {
	// 加载当前好友的
	window.electronApi.findFriend('', useUserStoreHook().userId)
	.then(freindList => {
		freindList.forEach(friend => {
		console.log(friend)
		friendsLocal.value.push(friend)
		})
	})
	// ws连接
	connectWebsocket(
			`ws://${host}${import.meta.env.VITE_WS_PATH}chat?token=${useUserStoreHook().token}`,
			// "ws://localhost:9001/chat",
			{content: 'user1'},
			(data: string) => {
				console.log('返回的数据：', data)
			},
			(err: string) => {
				console.log('失败回调：', err)
			}
		)
})

onUnmounted(() => {
    closeWebSocket()
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