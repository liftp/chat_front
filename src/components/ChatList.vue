<template>
		<el-aside class="chat-left">
			<div class="flex flex-wrap gap-5" id="friendList" ref="freinds_local" 
				v-for="friend in friendsLocal" 
				:key="friend.friendId">
				<el-card class="friend-info" 
					:class="friend.friendId === useCurrentChatHook().chatUserId && friend.type == useCurrentChatHook().chatType ? 'select_bgc' : ''"
					@click="choiceFriendChat(friend.friendId, friend.type)"
					>
					<template v-if="friend.type === 2">
						<el-dropdown trigger="contextmenu" placement="bottom">
							<div ref="groupOperation">
								[群聊]
								{{friend.friendName}}
							</div>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item  @click="addGroupClick(friend.friendId)">
										<span>添加成员</span>
									</el-dropdown-item>
									<el-dropdown-item>
										<span>修改公告</span>
									</el-dropdown-item>
								</el-dropdown-menu>
								
							</template>
						</el-dropdown>
							
					</template>
					<template v-if="friend.type !== 2">
						<div>
							{{friend.friendRemark}}
						</div>
					</template>
				</el-card>

				<div>

					<el-dialog v-model="groupAddUserDialogShow" 
						title="添加用户" 
						width="500">
						<el-checkbox-group v-model="checkFriends">
							<template v-for="friend in friendsData"> 
								<el-checkbox style="display: block; text-align: left; margin-left: 30px;" 
									:label="friend.friendName" 
									:value="friend.friendId"
									:disabled="checkGroupIsContainsMember(friend.friendId)"
									:checked="checkGroupIsContainsMember(friend.friendId)"
									/>
							</template>
						</el-checkbox-group>
						<template #footer>
							<el-button type="primary" @click="groupMembersAdd">添加</el-button>
							<el-button @click="groupAddUserDialogShow = false">取消</el-button>
						</template>
					</el-dialog>
				</div>
			</div>
			

		</el-aside>
		<el-main class="chat-right" style="padding-left: 0px; padding-right: 0px; padding-top: 0px;">
			<MsgShowAndSend :style="showControl(() => useCurrentChatHook().chatUserId != -1)"
				:friend="useCurrentChatHook().chatUserId == -1 ? 
					reactive({friendId: -1, friendName: '', friendRemark: '', selfId: -1, type: 3}) : 
					reactive(friendsLocal.filter(e => e.friendId === useCurrentChatHook().chatUserId && e.type === useCurrentChatHook().chatType)[0])"
			/>
		</el-main>

</template>
<script setup lang="ts">
import { ChatRecord, FriendList, GroupMember } from '@/db/model/models';
// import { getCookie } from '@/util/cache/cookies';
import { useCurrentChatHook, useUserStoreHook } from '@/store/modules/user';
import { onMounted, onUnmounted, reactive, Ref, ref, watchEffect } from 'vue';
import {connectWebsocket, closeWebSocket, sendWsMsg} from '../ws/WebSocketServer'
import emitter from '@/util/emitter';
import { GroupNotReadMsgQuery, selectGroupNotReadMsg, selectNotReadMsg, SingleGroupParam } from '@/api/msg';
import { container } from '@/config/inject_container.config';
import { IMsgConsumer } from '@/service/IMsgConsumer';
import SERVICE_IDENTIFIES from '@/constants/identifiers';
import { showControl } from '@/util/menu_control/menu';

import MsgShowAndSend from '@/components/MsgShowAndSend.vue'
import { chatPanelScrollToBottom, etAddFriendship } from '@/constants/emitter_type';
import { FriendQuery, FriendRelationship } from '@/api/types/friend_list';
import { friendList } from '@/api/friend_list';
import { ElNotification } from 'element-plus';
import {  findGroupMemberById, groupMemebersAddApi } from '@/api/group';
import { GroupMemberVO } from '@/api/types/group';
import { fileDownload } from '@/api/fileupload';

var friendsLocal: Ref<FriendList[]> = ref([])
const groupOperation = ref<string>();
const host = window.location.host;
const sendWsMsgEventType = "sendWsMsg"
// 好友列表，用于添加到群聊的展示
const friendsData = ref<FriendRelationship[]>();
const checkFriends = ref<number[]>([]);
const groupAddUserDialogShow = ref<boolean>(false);
const groupMembers = ref<GroupMemberVO[]>([]);
const checkGrouId = ref<number>(-1);
const groupMemberLocal = ref<GroupMember[]>([]);
const groupChatRecordShow = ref(false)


// 先从本地加载好友列表
onMounted(() => {
	// ws连接
	connectWebsocket(
			`ws://${host}${import.meta.env.VITE_WS_PATH}${useUserStoreHook().userId}/chat?token=${useUserStoreHook().token}`,
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
		// 更新好友列表，用于群聊添加
		remoteSearch({name:'', searchType:1})
    })
	// 拉取单聊的所有未读消息,应该同步于消息展示之前(加载好友列表之前即可)
	selectNotReadMsg()
		.then((docs) => {
			if (docs != null && docs.data != null) {
				docs.data.forEach(async element => {
					element.selfId = element.receiveUserId
					element.friendId = element.sendUserId
					element.dateTime = Number(element.dateTime)
					// 语音消息，需要先下载内容，再保存消息
					if (element.contentType == 2) {
						const fileKey = element.content.substring(element.content.indexOf("/chat") + "/chat".length)
						const blobData = await fileDownload(fileKey)
						console.log("download buf", blobData)
						const blob = new Blob([blobData], {type: 'audio/webm'})
						
						const fileNameExt = useUserStoreHook().userId + "_audio" + ".WebM";
						const filepath = await window.electronApi.localFileSave(fileNameExt, await blob.arrayBuffer())
						element.localStore = filepath
					}
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
	remoteSearch({name:'', searchType:1})
	// 拉取群聊的所有未读消息
	window.electronApi.selectGroupWithMaxMsgId(useUserStoreHook().userId)
		.then(docs => {
			const groupList: SingleGroupParam[] = []
			const pullGroupChatQuery: GroupNotReadMsgQuery = {groupList}
			console.log("分组查询群组最后聊天内容:{}", docs)
			docs.forEach(doc => {
				if (doc.msgId) {
					groupList.push({groupId: doc.friendId, msgId: doc.msgId})
				}
			})
			selectGroupNotReadMsg(pullGroupChatQuery)
				.then(resp => {
					if (resp && resp.data && resp.data.length > 0) {
						resp.data.forEach(element => {
							if (element.groupId) {
								element.selfId = element.receiveUserId
								element.friendId = element.groupId
								element.dateTime = Number(element.dateTime)
								window.electronApi.writeMsg(element)
							}
						})
					}
				})
		})
	
})

const remoteSearch = (query: FriendQuery) => {
    friendList(query)
        .then(friends => {
            friendsData.value = friends.data;
            console.log(friends.data)
        })
        .catch(err => {
            ElNotification({
                title: '异常提示',
                message: "网络异常",
            })
        })
}

const findGroupMember = (groupId: number) => {
	return findGroupMemberById(groupId)
	
}

const addGroupClick = (groupId: number) => {
	checkGrouId.value = groupId
	findGroupMember(groupId)
		.then(resp => {
			groupMembers.value = resp.data
			// 拿到数据后展示dialog
			groupAddUserDialogShow.value = true;
		})
		.catch(err => {
			ElNotification({
                title: '异常提示',
                message: "获取群组成员失败",
            })
		})
}

const checkGroupIsContainsMember = (memberId: number) => {
	return !(groupMembers.value.filter(e => e.memberId == memberId).length == 0)
}

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
	if (friendId !== chatHook.chatUserId || chatHook.chatType !== chatType) {
		// 清理当前窗口聊天记录
		emitter.emit("cleanMsg")
		
		chatHook.setChatType(chatType)
		chatHook.choiceUserChat(friendId)
		emitter.emit(chatPanelScrollToBottom)
	}

}

const groupMembersAdd = () => {
	groupMemebersAddApi({groupId: checkGrouId.value, userIds: checkFriends.value})
	groupAddUserDialogShow.value = false
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