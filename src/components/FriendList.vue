<template>

    <el-aside class="chat-left">
        <!-- 搜索好友 -->
        <div  style="display: flex;">
            <el-input v-model="searchName" placeholder="请输入好友名称" maxlength="15" throttle="" :prefix-icon="Search" @input="remoteSearch({searchType:1, name:searchName})"></el-input>
            <el-button ref="searchUserBtn" 
                :icon="Plus" 
                class="add_user"></el-button>
        </div>
        <!-- 固定好友申请列表 -->
        <el-card class="new_friend_tab" @click="navSelectHook().friendApplySelect(true)">
            <el-icon ><UserFilled /></el-icon>
            新的朋友
        </el-card>
        <!-- 搜索用户结果展示 -->
        <div v-for="friend in friendsData" :key="friend.id">
            <el-card class="friend-info" 
                    :class="friend.friendId === selectFriendId ? 'select_bgc' : ''"
                    @click="selectFriend(friend.friendId)">
                {{friend.friendRemark}}--({{friend.friendName}})
            </el-card>
        </div>
        
        <!-- 搜索用户弹窗 -->
        <el-popover placement="right" 
            :width="400" 
            trigger="click"
            :virtual-ref="searchUserBtn"
            title="用户添加"
            virtual-triggering>
            <el-input v-model="searchUsername" placeholder="请输入用户账号" maxlength="15" throttle="" :prefix-icon="Search" 
                @input="searchUserFunc({username: searchUsername})"></el-input>
            
            <el-scrollbar height="100%">
                <el-table :data="userList">
                    <el-table-column width="100" property="id" label="id" />
                    <el-table-column width="100" property="username" label="账号" />
                    <el-table-column width="100" property="name" label="姓名" />
                    <el-table-column width="100" label="操作" >
                        
                        <template #default="scope">
                            <el-popover
                                placement="bottom"
                                trigger="click"
                                title="好友申请"
                                :width="300"
                            >
                                <div class="apply_win">
                                    <span class="width_apply_label">账号:</span> 
                                    <span>{{ scope.row.username }}</span>
                                </div>
                                <div class="apply_win">
                                    <span class="width_apply_label">名称:</span> 
                                    <span>{{ scope.row.name }}</span>
                                </div>
                                <div class="apply_win">
                                    <span class="width_apply_label">好友备注:</span> 
                                    <el-input v-model="friendRemark" class="apply_input"></el-input>
                                </div>
                                <div class="apply_win">
                                    <span class="width_apply_label"> 本人描述: </span>
                                    <el-input v-model="applyDesc" class="apply_input"></el-input>
                                </div>
                                <div class="apply_win">
                                    <span class="width_apply_label"> 本人账号: </span>
                                    <span>{{ applyUsername }}</span>
                                </div>
                                <el-button type="primary"
                                    style="margin-top: 15px;"
                                    size="small"
                                    @click="applyFriendFunc({proposerRemark: applyDesc, targetUser: scope.row.id, appliedRemark: friendRemark})">
                                    发送
                                </el-button>
                                
                                <template #reference>
                                    <el-button type="primary"
                                        size="small"
                                        @click="searchPopoverVisible = true"
                                        >添加</el-button>
                                </template>
                            </el-popover>
                        </template>
                        
                    </el-table-column>
            </el-table>

            
        </el-scrollbar>
        </el-popover>
    </el-aside>

    <el-main class="chat-right">
        <ApplyFirendRecord :style="showControl(() => navSelectHook().friendApply)"/>
    </el-main>


</template>

<script lang="ts" setup>
import { Plus, Search } from '@element-plus/icons-vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { applyFriend, applyRecord, friendList } from '@/api/friend_list';
import { ApplyFriendDTO, FriendQuery, FriendRelationship } from '@/api/types/friend_list';
import { ElNotification, scrollbarProps } from 'element-plus';
import { debounce } from 'lodash-es'
import { UserInfo, UserQuery } from '@/api/types/user_info';
import { searchUser } from '@/api/user_info';
import { useUserStoreHook } from '@/store/modules/user';
import { ElTable, ElTableColumn } from 'element-plus';
import { navSelectHook } from '@/store/modules/viewShow';
import { MainMenu } from '@/constants/TypeEnum';
import { showControl } from '@/util/menu_control/menu';
import ApplyFirendRecord from './ApplyFirendRecord.vue';
import { ApplyFriend } from '@/db/model/models';
import emitter from '@/util/emitter';
import { etFriendApply } from '@/constants/emitter_type';


const searchName = ref<string>('');
const friendsData = ref<FriendRelationship[]>();
const selectFriendId = ref<number>(-1);
const searchUserBtn = ref<string>();
const userList  = ref<UserInfo[]>([]);
const searchUsername = ref<string>('');
const searchPopoverVisible = ref<boolean>(false);


// 申请相关信息
const applyDesc = ref<string>(useUserStoreHook().realname);
const applyUsername = ref<string>(useUserStoreHook().loginName);
const friendRemark = ref<string>('');
const applyId = ref<number>(useUserStoreHook().userId);
const applyRecords = ref<ApplyFriend[]>();

const selectFriend = debounce((friendId: number) => {
    selectFriendId.value = friendId
    navSelectHook().mainWindowSelect(MainMenu.FRIEND_LIST.description || '')
    navSelectHook().friendApplySelect(false)
}, 300)

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

const searchUserFunc = debounce((query: UserQuery) => {
    if (query.username && query.username.length > 0) {
        searchUser(query)
            .then(users => {
                userList.value = users.data
            })
            .catch(err => {
                ElNotification({
                    title: '异常提示',
                    message: "网络异常",
                })
            })
    }
},300)

const applyFriendFunc = (applyInfo: ApplyFriendDTO) => {
    applyFriend(applyInfo)
}
onMounted(() => {
    // 从网络加载好友列表
    const query: FriendQuery = {searchType: 1, name: ''}
    remoteSearch(query);
    // 加载申请记录
    applyRecord()
        .then(records => {
            applyRecords.value = records.data;
        })
    // 好友申请触发器
    emitter.on(etFriendApply, (val) => {
        applyRecords.value?.push(val as ApplyFriend)
    })
})

onUnmounted(() => {
    emitter.off(etFriendApply)
})

</script>

<style scoped>
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
.apply_win {
    display: flex;
    margin-top: 15px;
}
.width_apply_label {
    width: 90px;
}
.apply_input {
    margin-left: 10px;
}
.apply_records_info {
    margin-left: 10px;
}
.new_friend_tab {
    background-color: #fcffd4;
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
    padding: 0px;
}
</style>