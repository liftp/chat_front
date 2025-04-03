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
                <span class="apply_records_info" v-if="apply.applyPass == 0"><el-button type="primary" :onclick="receiveFriendApply(apply)">接受</el-button></span>
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
import { etFriendApply } from '@/constants/emitter_type';
import { applyStatusShowDesc } from '@/constants/TypeEnum';
import { ApplyFriend } from '@/db/model/models';
import { useUserStoreHook } from '@/store/modules/user';
import emitter from '@/util/emitter';
import { onMounted, onUnmounted, ref } from 'vue';

const applyRecords = ref<ApplyFriend[]>();

onMounted(() => {
    // 1.拉取远程最新的申请记录，存储到本地，主要是为了接收离线的时候产生的消息
    // 加载申请记录
    // applyRecord()
    //     .then(records => {
    //         applyRecords.value = records.data;
    //     })
    // 2.本地的数据进行展示
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
    // 好友申请触发器
    emitter.on(etFriendApply, (val) => {
        applyRecords.value?.push(val as ApplyFriend)
    })
})

onUnmounted(() => {
    emitter.off(etFriendApply)
})

function receiveFriendApply(apply: ApplyFriend) {

}

</script>
<style scoped>

.apply_records_info {
    margin-left: 30px;
}
</style>