<template>
<div>
    <div  style="display: flex;">
        <el-input v-model="searchName" placeholder="请输入用户名称" maxlength="15" throttle="" :prefix-icon="Search" @change="remoteSearch({searchType:1, name:searchName})"></el-input>
        <!-- <el-icon class="add_user"><Plus /></el-icon> -->
        <el-button :icon="Plus" class="add_user"></el-button>
    </div>
    <div v-for="friend in friendsData" :key="friend.id">
        <el-card class="friend-info" 
            :class="friend.friendId === selectFriendId ? 'select_bgc' : ''"
            @click="selectFriend(friend.friendId)">
        {{friend.friendRemark}}--({{friend.friendName}})
    </el-card>
</div>

</div>
</template>

<script lang="ts" setup>
import { Plus, Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { friendList } from '@/api/friend_list';
import { FriendQuery, FriendRelationship } from '@/api/types/friend_list';
import { ElNotification } from 'element-plus';
import { debounce } from 'lodash-es'

const searchName = ref<string>('');
const friendsData = ref<FriendRelationship[]>();
const selectFriendId = ref<number>(-1);

const selectFriend = debounce((friendId: number) => {
    selectFriendId.value = friendId
}, 300)

const remoteSearch = (query: FriendQuery) => {
    friendList(query)
        .then(friends => {
            friendsData.value = []
            friendsData.value  = friends.data;
            console.log(friends.data)
        })
        .catch(err => {
            ElNotification({
                title: '异常提示',
                message: "网络异常",
            })
        })
}

onMounted(() => {
    // 从网络加载好友列表
    const query: FriendQuery = {searchType: 1, name: ''}
    remoteSearch(query);
})

</script>

<style>
.add_user {
    width: 10px;
}
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
</style>