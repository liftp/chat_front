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
    background-color: #eef0f4;
    border: 1px solid #e4e7ed;
    width: 30%;
    border-radius: 4px;
}
.chat-right {
    width: 70%;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #f3f7ff;
    height: 100vh;

}
.chat-msg-box {
    /* height: 100%; */
    width: auto;
    
    overflow: auto;
    
}
.el-main {
    padding-left: 10px;
    display: flex;
}
.chat-msg-box div {
    text-align: left;
}

.chat-input {
    /* background-color: #f3f7ff;
    min-height: 100px; */
}

#item {
    position: relative;
    width: fit-content;
    min-height: 20px;
    background: white;
    border-radius: 5px;
    line-height: normal;
    margin-left: 10px;
    word-break: break-word;
    color: black;
    padding: 5px;
    line-height: 18px;
}
#item::after {
    content: "";
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-right-color: white;
    top: 13px;
    left: -13px;
}
</style>