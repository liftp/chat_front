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
    return {selectNav, navName, mainSelect, mainWindowSelect, friendApplySelect, friendApply}
})

export function navSelectHook() {
    return navSelectStore(store)
}