<template>
<div class="nav-list">
    <!-- 顶部头像 -->
    <div class="avatar-area" @click="openEditDialog">
        <el-avatar :size="40" :src="userStore.avatar || undefined">
            {{ userStore.realname?.charAt(0) || 'U' }}
        </el-avatar>
    </div>
    <!-- 导航图标 -->
    <el-icon ref="chat" @click="selectNavName('chat')" :class="selectNacClass('chat')" class="margin_lr_5" style="margin-top: 20px;"><ChatRound /></el-icon>
    <el-icon ref="user" @click="selectNavName('user')" :class="selectNacClass('user')" class="margin_lr_5"><User /></el-icon>

    <!-- 个人信息修改弹窗 -->
    <el-dialog v-model="editDialogVisible" title="修改个人信息" width="400px">
        <el-form label-width="80px">
            <el-form-item label="头像">
                <div class="avatar-upload">
                    <el-avatar :size="60" :src="editAvatar || undefined">
                        {{ editName?.charAt(0) || 'U' }}
                    </el-avatar>
                    <input ref="avatarInputRef" type="file" accept="image/*" style="display:none" @change="handleAvatarChange"/>
                    <el-button size="small" @click="avatarInputRef?.click()" :loading="avatarUploading" style="margin-left: 10px">
                        {{ avatarUploading ? '上传中' : '选择头像' }}
                    </el-button>
                </div>
            </el-form-item>
            <el-form-item label="姓名">
                <el-input v-model="editName" placeholder="请输入姓名"/>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveUserInfo" :loading="saving">保存</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { navSelectHook } from '@/store/modules/viewShow';
import { useUserStoreHook } from '@/store/modules/user';
import { updateUserApi } from '@/api/user_info';
import { fileUpload } from '@/api/fileupload';
import { ElNotification } from 'element-plus';

const userStore = useUserStoreHook()

// 导航选择切换
const chat = ref<string>('chat')
const user = ref<string>('user')
const selectEle = ref<string>('');

const selectNavName = (name: string) => {
    selectEle.value = name
    navSelectHook().selectNav(name)
}
const selectNacClass = (val: string) => {
    return navSelectHook().navName === val ? 'nav_select' : '';
}

// ===== 个人信息修改 =====
const editDialogVisible = ref(false)
const editName = ref('')
const editAvatar = ref('')
const avatarInputRef = ref<HTMLInputElement>()
const avatarUploading = ref(false)
const saving = ref(false)

const openEditDialog = () => {
    editName.value = userStore.realname
    editAvatar.value = userStore.avatar
    editDialogVisible.value = true
}

const handleAvatarChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    avatarUploading.value = true
    try {
        const formData = new FormData()
        formData.append('file', file)
        const resp = await fileUpload(formData)
        editAvatar.value = resp.data
    } catch (err) {
        console.log('头像上传失败', err)
        ElNotification({ title: '提示', message: '头像上传失败' })
    } finally {
        avatarUploading.value = false
        target.value = ''
    }
}

const saveUserInfo = async () => {
    saving.value = true
    try {
        const resp = await updateUserApi({ name: editName.value, avatar: editAvatar.value })
        const userInfo = resp.data
        userStore.realname = userInfo.name
        userStore.avatar = userInfo.avatar || ''
        editDialogVisible.value = false
        ElNotification({ title: '提示', message: '修改成功' })
    } catch (err) {
        console.log('修改失败', err)
        ElNotification({ title: '提示', message: '修改失败' })
    } finally {
        saving.value = false
    }
}
</script>

<style>
.nav-list {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.avatar-area {
    margin-top: 10px;
    cursor: pointer;
}
.avatar-area:hover {
    opacity: 0.8;
}
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

.avatar-upload {
    display: flex;
    align-items: center;
}
</style>
