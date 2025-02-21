import { ref } from "vue";
import store from '@/store'
import { defineStore } from "pinia";

const navSelectStore = defineStore("navSelect", () => {
    const navName = ref('chat')
    const selectNav = (name: string) => {
        navName.value = name
        console.log(name)
    }
    return {selectNav, navName}
})

export function navSelectHook() {
    return navSelectStore(store)
}