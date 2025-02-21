<template>
<div> 
    <el-icon ref="chat" @click="selectNavName('chat')" :class="selectNacClass('chat')" class="margin_lr_5" style="margin-top: 20px;"><ChatRound /></el-icon>
    <el-icon ref="user" @click="selectNavName('user')" :class="selectNacClass('user')" class="margin_lr_5"><User /></el-icon>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { navSelectHook } from '@/store/modules/viewShow';
// 导航选择切换
const chat = ref<string>('chat')
const user = ref<string>('user')
const selectEle = ref<string>('');

const selectNavName = (name: string) => {
    // console.log(name)
    selectEle.value = name
    // 切换路由
    navSelectHook().selectNav(name)

}
const selectNacClass = (val: string) => {
    return navSelectHook().navName === val ? 'nav_select' : '';
}


</script>

<style>
.margin_lr_5 {
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 20px;
}
.margin_lr_5:hover {
    color: #409efc;
}

.nav_select {
    color: #409efc;
}
</style>