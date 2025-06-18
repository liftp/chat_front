import { ref } from "vue";
import store from '@/store'
import { defineStore } from "pinia";

const navSelectStore = defineStore("navSelect", () => {
    const navName = ref('chat')
    const mainSelect = ref('')
    const friendApply = ref(false)
    const selectNav = (name: string) => {
        navName.value = name
        console.log(name)
    }
    const mainWindowSelect = (name: string) => {
        mainSelect.value = name
    }
    const friendApplySelect = (name: boolean) => {
        friendApply.value = name
    }
    return {selectNav, navName: navName.value, mainSelect: mainSelect.value, mainWindowSelect, friendApplySelect, friendApply: friendApply.value}
})

export function navSelectHook() {
    return navSelectStore(store)
}