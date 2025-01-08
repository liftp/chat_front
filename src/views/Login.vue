<script setup lang="ts">
import {reactive, ref} from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { type LoginRequestData } from '@/api/types/login';
import { useUserStoreHook } from '@/store/modules/user';
import { useRouter } from 'vue-router';
const router = useRouter()
const ruleFormRef = ref<FormInstance>()
const loginForm: LoginRequestData = reactive({
    username: '',
    password: '',
})

const validateName = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请输入登录名'))
    } else {
        callback()
    }
}

const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else {
        callback()
    }
}

const rules = reactive<FormRules<typeof loginForm>> ({
    // username: [{validator: validateName, trigger: 'blur'}],
    // password: [{validator: validatePass, trigger: 'blur'}]
    username: [{required: true, message: "请输入用户名", trigger: 'blur'}],
    password: [{required: true, message: "请输入密码", trigger: 'blur'}]
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return 
    formEl.validate((valid) => {
        if (valid) {
            useUserStoreHook()
                .login(loginForm)
                .then(() => {
                    router.push({name: "home"})
                })
        } 
    })
}



const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return 
    formEl.resetFields()
}
</script>

<template>
    <el-form
        ref="ruleFormRef"
        style="max-width: 600px"
        :model="loginForm"
        status-icon
        :rules="rules"
        label-width="200px"
        class="demo-ruleForm"
    >
        <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" type="text" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm(ruleFormRef)">
                登录
            </el-button>
            <el-button @click="resetForm(ruleFormRef)">
                重置
            </el-button>
        </el-form-item>
    </el-form>
</template>

