import { ref, computed } from "vue";
import store from '@/store';
import { defineStore } from "pinia";

/**
 * 好友在线状态集中管理 store
 * 单一数据源：FriendList.vue / ChatList.vue 都从此处读取在线状态
 * 初始状态由 friendList API 返回后填充，ws 事件增量更新
 */
const useOnlineStatusStore = defineStore("onlineStatus", () => {
    // userId -> online
    const onlineMap = ref<Record<number, boolean>>({});

    const setStatus = (userId: number, online: boolean) => {
        onlineMap.value[userId] = online;
    };

    const setBatch = (entries: { friendId: number; online?: boolean }[]) => {
        entries.forEach(e => {
            onlineMap.value[e.friendId] = !!e.online;
        });
    };

    const isOnline = (userId: number) => {
        return !!onlineMap.value[userId];
    };

    return { onlineMap, setStatus, setBatch, isOnline };
});

export function useOnlineStatusHook() {
    return useOnlineStatusStore(store);
}
