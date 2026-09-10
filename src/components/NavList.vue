<template>
<div class="nav-list">
    <!-- 顶部头像 -->
    <div class="avatar-area" @click="openEditDialog">
        <el-avatar :size="40" :src="localAvatar || undefined">
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
                    <el-avatar :size="60" :src="editLocalAvatar || undefined">
                        {{ editName?.charAt(0) || 'U' }}
                    </el-avatar>
                    <input ref="avatarInputRef" type="file" accept="image/*" style="display:none" @change="handleAvatarChange"/>
                    <el-button size="small" @click="avatarInputRef?.click()" :loading="avatarUploading" style="margin-left: 10px">
                        {{ avatarUploading ? '处理中' : '选择头像' }}
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

    <!-- 头像裁剪弹窗 -->
    <el-dialog v-model="cropperDialogVisible" title="裁剪头像" width="500px" :close-on-click-modal="false" @open="onCropperOpen">
        <div class="cropper-container">
            <VueCropper
                ref="cropperRef"
                :img="cropperImg"
                :output-size="0.9"
                output-type="jpeg"
                :auto-crop="true"
                :auto-crop-width="200"
                :auto-crop-height="200"
                :fixed="true"
                :fixed-number="[1, 1]"
                :can-scale="true"
                :can-move="true"
                :can-move-box="true"
                :center-box="true"
                :high="true"
                @img-load="onCropperImgLoad"
                style="width: 100%; height: 360px;"
            />
        </div>
        <div class="cropper-toolbar">
            <el-button size="small" @click="rotateLeft">左旋转</el-button>
            <el-button size="small" @click="rotateRight">右旋转</el-button>
            <el-button size="small" @click="zoomIn">放大</el-button>
            <el-button size="small" @click="zoomOut">缩小</el-button>
        </div>
        <template #footer>
            <el-button @click="cropperDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmCrop" :loading="cropperConfirming">确认裁剪</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { navSelectHook } from '@/store/modules/viewShow';
import { useUserStoreHook } from '@/store/modules/user';
import { updateUserApi } from '@/api/user_info';
import { fileUpload, fileDownload } from '@/api/fileupload';
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
// ===== 裁剪相关 =====
const cropperDialogVisible = ref(false)
const cropperRef = ref<any>(null)
const cropperImg = ref('')  // 裁剪的原图(base64)
const cropperConfirming = ref(false)
const pendingAvatarFile = ref<File | null>(null)  // 待裁剪的文件
const localAvatar = ref('')  // 本地缓存的头像路径，用于展示
const editLocalAvatar = ref('')  // 弹窗中本地缓存的头像
const avatarInputRef = ref<HTMLInputElement>()
const avatarUploading = ref(false)
const saving = ref(false)

// 从远程 URL 下载头像到本地，返回本地路径
const downloadAvatarToLocal = async (remoteUrl: string): Promise<string> => {
    if (!remoteUrl) return ''
    try {
        const fileKey = remoteUrl.substring(remoteUrl.indexOf('/chat') + '/chat'.length)
        const blobData = await fileDownload(fileKey)
        const blob = new Blob([blobData])
        const fileName = 'avatar_' + userStore.userId + remoteUrl.substring(remoteUrl.lastIndexOf('.'))
        const localPath = await window.electronApi.localFileSave(fileName, await blob.arrayBuffer())
        return localPath
    } catch (err) {
        console.log('头像下载失败', err)
        return ''
    }
}

// 初始化：加载本地头像（若 store 有远程 URL 但无本地缓存，则下载）
onMounted(async () => {
    if (userStore.avatar) {
        localAvatar.value = await downloadAvatarToLocal(userStore.avatar)
    }
})

const openEditDialog = () => {
    editName.value = userStore.realname
    editAvatar.value = userStore.avatar
    editLocalAvatar.value = localAvatar.value
    editDialogVisible.value = true
}

const handleAvatarChange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    pendingAvatarFile.value = file
    // 读取为 base64 给 cropper
    const reader = new FileReader()
    reader.onload = (ev) => {
        cropperImg.value = ev.target?.result as string
        cropperDialogVisible.value = true
    }
    reader.readAsDataURL(file)
    target.value = ''
}

// 裁剪弹窗打开后触发刷新
const onCropperOpen = () => {
    nextTick(() => {
        cropperRef.value?.refresh()
    })
}

const onCropperImgLoad = (status: boolean) => {
    if (!status) console.log('cropper 图片加载失败')
}

const rotateLeft = () => cropperRef.value?.rotateLeft()
const rotateRight = () => cropperRef.value?.rotateRight()
const zoomIn = () => cropperRef.value?.changeScale(1)
const zoomOut = () => cropperRef.value?.changeScale(-1)

// 确认裁剪：拿到 blob → 上传 MinIO → 下载到本地
const confirmCrop = () => {
    if (!cropperRef.value) return
    cropperConfirming.value = true
    cropperRef.value.getCropBlob((blob: Blob) => {
        // 转为 File
        const fileName = (pendingAvatarFile.value?.name?.split('.')[0] || 'avatar') + '.jpeg'
        const croppedFile = new File([blob], fileName, { type: 'image/jpeg' })
        // 先预览本地
        const localUrl = URL.createObjectURL(blob)
        editLocalAvatar.value = localUrl
        // 上传
        const formData = new FormData()
        formData.append('file', croppedFile)
        fileUpload(formData).then(async (resp) => {
            editAvatar.value = resp.data
            // 下载到本地，替换预览路径
            const localPath = await downloadAvatarToLocal(resp.data)
            if (localPath) editLocalAvatar.value = localPath
            cropperDialogVisible.value = false
        }).catch((err) => {
            console.log('裁剪后上传失败', err)
            ElNotification({ title: '提示', message: '头像上传失败' })
        }).finally(() => {
            cropperConfirming.value = false
        })
    })
}

const saveUserInfo = async () => {
    saving.value = true
    try {
        const resp = await updateUserApi({ name: editName.value, avatar: editAvatar.value })
        const userInfo = resp.data
        userStore.realname = userInfo.name
        userStore.avatar = userInfo.avatar || ''
        // 更新本地头像缓存
        localAvatar.value = editLocalAvatar.value
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

.cropper-container {
    width: 100%;
    height: 360px;
    background: #f5f5f5;
}

.cropper-toolbar {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}
</style>
