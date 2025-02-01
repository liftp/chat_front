<script setup lang="ts">

    import FriendList from '@/components/FriendList.vue'
    import MsgShowAndSend from '@/components/MsgShowAndSend.vue'

    import { useCurrentChatHook } from '@/store/modules/user';

</script>

<template>
    <div class="common-layout" style="margin: 0px; padding: 0px;">
        <el-container>
            <el-aside class="chat-left">
                <FriendList/>
            </el-aside>
            <el-main class="chat-right">
                <MsgShowAndSend v-if="useCurrentChatHook().chatUserId != -1"/>
            </el-main>
        </el-container>
    </div>
    
</template>

<!-- <style>
.infinite-list {
  height: 300px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}
.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}
</style> -->

<style>
.el-container {
    /* height: 100%; */
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

.el-main {
    padding-left: 10px;
    display: flex;
}


.chat-input {
    /* background-color: #f3f7ff;
    min-height: 100px; */
}
</style>