<template>

    <el-card style="width: 100%;">
        <template #header>
            <div>
                <span>好友添加记录</span>
            </div>
        </template>
        <div v-for="apply in applyRecords">
            <span class="apply_records_info">{{ apply.proposerName }}</span>
            <span class="apply_records_info">{{ apply.targetUser }}</span>
            <span class="apply_records_info">{{ apply.applyPassDesc }}</span>
        </div>
    </el-card>
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
import { applyStatusShowDesc } from '@/constants/TypeEnum';
import { ApplyFriend } from '@/db/model/models';
import { useUserStoreHook } from '@/store/modules/user';
import { onMounted, ref } from 'vue';

const applyRecords = ref<ApplyFriend[]>();

onMounted(() => {
    // 1.拉取远程最新的申请记录，存储到本地，主要是为了接收离线的时候产生的消息
    // 2.本地的数据进行展示
    window.electronApi.applyRecordFind(useUserStoreHook().userId)
        .then(data => {
            if (data && data.length > 0) {

                data.forEach(ele => {
                    ele.applyPassDesc = applyStatusShowDesc(ele.applyPass)
                })
                applyRecords.value = data
            }
        })
})

</script>
<style scoped>

.apply_records_info {
    margin-left: 10px;
}
</style>