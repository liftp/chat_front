<script setup lang="ts">

    import ApplyRecord from '@/components/FriendList.vue';
    import ChatList from '@/components/ChatList.vue';
    import NavList from '@/components/NavList.vue';
    
    import { navSelectHook } from '@/store/modules/viewShow';



</script>

<template>
    <div class="common-layout" style="margin: 0px; padding: 0px;">
        <el-container>
            <el-aside style="width: 26px; background-color: rgba(0, 0, 0, 0.08)">
                <NavList />
            </el-aside>
            <template  :style="navSelectHook().navName === 'chat' ? 'display:flex' : 'display:none'" style="width: 100%;">
                <ChatList/>
            </template>
            <template :style="navSelectHook().navName === 'user' ? 'display:flex' : 'display:none'" style="width: 100%;">
                <ApplyRecord/>
            </template>

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