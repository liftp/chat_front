<template>

    <div style="display: block;width: 100%;">
    
        <el-card style="width: 100%;">
            <template #header>
                <div>
                    <span>好友添加记录</span>
                </div>
            </template>
            <div v-for="apply in applyRecords">
                <span class="apply_records_info">{{ apply.proposerName }}</span>
                <span class="apply_records_info" style="color:cadetblue">申请描述：</span><span >{{ apply.proposerRemark }}</span>
                <span class="apply_records_info" style="color:cadetblue">状态：</span><span>{{ apply.applyPassDesc }}</span>
                <span class="apply_records_info" v-if="apply.applyPass == 0">
                    <el-popover 
                        :width="400"
                        trigger="click"
                        title="好友添加">
                        <div class="apply_win">
                            <span class="width_apply_label">账号:</span> 
                            <span>{{ apply?.proposerName }}</span>
                        </div>
                        <div class="apply_win">
                            <span class="width_apply_label">名称:</span> 
                            <span>{{ apply?.proposerRemark }}</span>
                        </div>
                        <div class="apply_win">
                            <span class="width_apply_label">好友备注:</span> 
                            <el-input v-model="addRemark" class="apply_input"></el-input>
                        </div>
                        <el-button type="primary"
                            style="margin-top: 15px;"
                            @click="receiveConfirm(apply)">
                            确定
                        </el-button>
                        <template v-if="apply.targetUser === useUserStoreHook().userId" #reference>
                            <el-button type="primary" size="small">接受</el-button>
                        </template>
                        
                    </el-popover>
                    <template v-if="apply.targetUser === useUserStoreHook().userId">
                        <el-button type="primary"  size="small" @click="applyReject(apply)">拒绝</el-button>
                    </template>
                    
                </span>
            </div>
        </el-card>

    </div>
    
    <!-- <el-table
        :data="applyRecords"
        style="width: 100%"
    >
        <el-table-column prop="proposerName" label="好友账号" min-width="100" />
        <el-table-column prop="proposerRemark" label="描述" min-width="100" />
        <el-table-column prop="applyPassDesc" label="状态" min-width="60"/>
    </el-table> -->
</template>
<script lang="ts" setup>
import { applyFriendConfirm, applyRecord, friendList } from '@/api/friend_list';
import { FriendQuery } from '@/api/types/friend_list';
import { etFriendApply } from '@/constants/emitter_type';
import { applyStatusShowDesc } from '@/constants/TypeEnum';
import { ApplyFriend } from '@/db/model/models';
import { useUserStoreHook } from '@/store/modules/user';
import emitter from '@/util/emitter';
import { onMounted, onUnmounted, ref } from 'vue';

const applyRecords = ref<ApplyFriend[]>();
const receiveApplyBtn = ref<ApplyFriend>();
// const receiveVisible = ref<boolean>(false);
const addRemark = ref<string>('');

onMounted(() => {
    // 1.拉取远程最新的申请记录，存储到本地，主要是为了接收离线的时候产生的消息
    // 查询本地申请记录的最后更新时间
    window.electronApi.applyRecordLastUpdatedAt(useUserStoreHook().userId)
        .then(res => {
            // 加载申请记录
            console.log("last updatedAt :", res)
            applyRecord(!res ? undefined : res.updateTime)
                .then(records => {
                    // 写入拉取到的数据
                    records.data.forEach(e => {
                        window.electronApi.applyRecordUpdate({...e, selfId:useUserStoreHook().userId})
                    });
                    // 2.本地的数据进行展示
                    friendListFind()
                })
        })
    // 好友申请触发器
    emitter.on(etFriendApply, (val) => {
        friendListFind()
    })
    
})

function friendListFind() {
    window.electronApi.applyRecordFind(useUserStoreHook().userId)
        .then(data => {
            console.log("friend apply records:", data)
            if (data && data.length > 0) {

                data.forEach(ele => {
                    ele.applyPassDesc = applyStatusShowDesc(ele.applyPass)
                })
                applyRecords.value = data
            }
        })
}

onUnmounted(() => {
    emitter.off(etFriendApply)
})

function receiveFriendApply() {
    // receiveVisible.value = true;
}

function receiveConfirm(apply: ApplyFriend) {
    applyFriendConfirm({...apply, appliedRemark: addRemark.value, applyPass: 1})
        .then(res => {
            const confirm = res.data
            if (confirm) {
                addRemark.value = ''
                // 接收确认后，修改这条申请记录的状态为通过
                window.electronApi.applyRecordUpdate({...confirm, selfId: useUserStoreHook().userId, applyPass: 1})
                // 刷新列表
                friendListFind()
            }
        })
    
    
}

function applyReject(apply: ApplyFriend) {
    applyFriendConfirm({...apply, applyPass: 2})
        .then(res => {
            const apply = res.data
            if (apply) {
                // 接收确认后，修改这条申请记录的状态为拒绝
                window.electronApi.applyRecordUpdate({...apply, selfId: useUserStoreHook().userId, applyPass: 2})
                // 刷新列表
                friendListFind()
            }
                
        })
}

</script>
<style scoped>

.apply_records_info {
    margin-left: 30px;
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
</style>