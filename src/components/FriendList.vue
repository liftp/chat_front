<template>

    <el-aside class="chat-left">
        <!-- 搜索好友 -->
        <div  style="display: flex;">
            <el-input v-model="searchName" placeholder="请输入好友名称" maxlength="15" throttle="" :prefix-icon="Search" @input="remoteSearch({searchType:1, name:searchName})"></el-input>
            <el-dropdown placement="bottom">

                <el-button ref="addChatBtn" 
                    :icon="Plus" 
                    class="add_user"></el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item><span ref="searchUserBtn">添加好友</span></el-dropdown-item>
                        <el-dropdown-item><span ref="addGroupBtn" @click="addGroupWindowShow = true">添加群聊</span></el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
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

        <!-- 选择添加好友、添加群聊弹窗 -->
        
        <!-- <el-popover placement="right"
            :width="200"
            trigger="click"
            :virtual-ref="addChatBtn"
            virtual-triggering
        >
            <el-button ref="searchUserBtn" plain>添加好友</el-button>
            <el-button ref="addGroupBtn" plain>添加群聊</el-button>

        </el-popover> -->
        <el-popover placement="right"
            :width="400"
            trigger="click"
            :virtual-ref="addGroupBtn"
            title="添加群聊"
            :visible="addGroupWindowShow"
            virtual-triggering
        >
            <span>群聊名称</span>
            <el-input v-model="groupInfo.groupName"></el-input>
            <span>群公告</span>
            <el-input v-model="groupInfo.groupRemark"></el-input>
            <el-button type="primary" style="margin-top: 15px;" @click="addGroupChatFunc">添加</el-button>
            <el-button style="margin-top: 15px;" @click="addGroupWindowShow = false">取消</el-button>
        </el-popover>
        
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
                                :visible="applyWindowShow"
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
                                
                                <template v-if="!scope.row.friendRelation" #reference>
                                    <el-button type="primary"
                                        size="small"
                                        @click="applyWindowShow = true"
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
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { applyFriend, friendList } from '@/api/friend_list';
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
import ApplyFirendRecord from './ApplyFriendRecord.vue';
import { addGroupChat } from '@/api/group';
import { GroupInfoDTO, GroupInfoPartial } from '@/api/types/group';
import emitter from '@/util/emitter';
import { etAddFriendship, etFriendApply } from '@/constants/emitter_type';


const searchName = ref<string>('');
const friendsData = ref<FriendRelationship[]>();
const selectFriendId = ref<number>(-1);
// 添加聊天
const addChatBtn = ref<string>();
// 添加群聊
const addGroupBtn = ref<string>();
// 添加好友
const searchUserBtn = ref<string>();
const userList  = ref<UserInfo[]>([]);
const searchUsername = ref<string>('');
const searchPopoverVisible = ref<boolean>(false);
const groupInfo = reactive<GroupInfoPartial>({});
const addGroupWindowShow = ref(false);


// 申请相关信息
const applyDesc = ref<string>(useUserStoreHook().realname);
const applyUsername = ref<string>(useUserStoreHook().loginName);
const friendRemark = ref<string>('');
const applyId = ref<number>(useUserStoreHook().userId);
const applyWindowShow = ref(false);

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

function addGroupChatFunc() {
    addGroupChat(groupInfo)
        .then(resp => {
            // 请求成功后添加本地记录
            const groupInfo = resp.data
            if (groupInfo) {
                const friendship = {id: groupInfo.id, friendId: groupInfo.id, friendName: groupInfo.groupName, friendRemark: groupInfo.groupRemark, selfId: useUserStoreHook().userId, type: 2} as FriendRelationship
                window.electronApi.friendshipAdd(friendship)
                emitter.emit(etAddFriendship, friendship);
            }
            // 刷新
            addGroupWindowShow.value = false
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
    applyWindowShow.value = false;
    applyFriend(applyInfo)
        .then(res => {
            const apply = res.data;
            if (apply) {
                window.electronApi.applyRecordAdd({...apply, selfId: useUserStoreHook().userId, applyPass: 0})
                // 触发‘新的好友’列表更新
                emitter.emit(etFriendApply)
            }
        })

}
onMounted(() => {
    // 从网络加载好友列表
    const query: FriendQuery = {searchType: 1, name: ''}
    remoteSearch(query);
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