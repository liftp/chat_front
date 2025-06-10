<script setup lang="ts">
import {reactive, ref} from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { type LoginRequestData } from '@/api/types/login';
import { useUserStoreHook } from '@/store/modules/user';
import { useRouter } from 'vue-router';
import { UserAdd } from '@/api/types/user_info';
import { addUserApi } from '@/api/user_info';
const router = useRouter()
const ruleFormRef = ref<FormInstance>()
const addUserFormRef = ref<FormInstance>()
const loginForm: LoginRequestData = reactive({
    username: '',
    password: '',
})
const confirmPwd = ref<string>();

const tabChange = ref(true)

const addForm: UserAdd = reactive({
    username: '',
    name: '',
    password: '',
    confirmPwd: '',
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
    formEl.validate((valid:boolean) => {
        if (valid) {
            useUserStoreHook()
                .login(loginForm)
                .then(() => {
                    router.push({name: "home"})
                })
        } 
    })
}

const addUser = (formEl: FormInstance | undefined) => {
    if (!formEl) return 
    formEl.validate((valid:boolean) => {
        if (valid) {
            addUserApi(addForm)
                .then(() => {
                    ElMessage.info("注册成功")
                    // router.push({name: "login"})
                })
            // useUserStoreHook()
            //     .login(loginForm)
            //     .then(() => {
            //         router.push({name: "login"})
            //     })
        } 
    })
}

const addUserRules = reactive<FormRules<typeof addForm>>({
    username: [
        {
            required: true,
            message: "登录名不能为空，必须是英文及数字组合"
        }
    ],
    name: [
        {
            required: true,
            message: '真实姓名不能为空'
        }
    ],
    password: [
        {
            required: true, 
            message: "密码不能为空"
        }
    ],
    confirmPwd: [
        {
            required: true, 
            message: '确认密码错误，请重新输入',
            validator: (rule, value) => {
                return value.trim() != '' && value === addForm.password
            }
            
        }
    ]
})



const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return 
    formEl.resetFields()
}
</script>

<template>
    <div>
        <div style="display: flex; justify-content: center; align-items: center;"  v-show="tabChange">
            <el-form
                ref="ruleFormRef"
                style="max-width: 400px;"
                :model="loginForm"
                status-icon
                :rules="rules"
                label-width="200px"
                class="demo-ruleForm"
            >
                <el-form-item label="用户名" label-width="100px" prop="username">
                    <el-input v-model="loginForm.username" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码"  label-width="100px" prop="password" >
                    <el-input v-model="loginForm.password" type="password" autocomplete="off" />
                </el-form-item>
                    <div style="display: flex; justify-content: center;">
                        <el-button type="primary" @click="submitForm(ruleFormRef)">
                            登录
                        </el-button>
                        <el-button @click="resetForm(ruleFormRef)">
                            重置
                        </el-button>
                    </div>

            </el-form>
        </div>
        <div style="display: flex; justify-content: center; align-items: center;" v-show="!tabChange">
            <el-form
                ref="addUserFormRef"
                style="max-width: 400px;"
                :model="addForm"
                status-icon
                :rules="addUserRules"
                label-width="200px"
                class="demo-ruleForm"
            >
                <el-form-item label="用户名" label-width="100px" prop="username">
                    <el-input v-model="addForm.username" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="真实姓名" label-width="100px" prop="name">
                    <el-input v-model="addForm.name" type="text" autocomplete="off" />
                </el-form-item>
                <el-form-item label="密码"  label-width="100px" prop="password">
                    <el-input v-model="addForm.password" type="password" autocomplete="off" />
                </el-form-item>
                <el-form-item label="确认密码"  label-width="100px" prop="confirmPwd">
                    <el-input v-model="addForm.confirmPwd" type="password" autocomplete="off" />
                </el-form-item>
                    <div style="display: flex; justify-content: center;">
                        <el-button type="primary" @click="addUser(addUserFormRef)">
                            注册
                        </el-button>
                        <el-button @click="resetForm(addUserFormRef)">
                            重置
                        </el-button>
                    </div>

            </el-form>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 40px;">
            <div :class="tabChange ? 'tab_hover':''" v-on:click="tabChange = true">
                <span>登录</span>
            </div>
            <div :class="tabChange ? '':'tab_hover'" v-on:click="tabChange = false" class="tab_common">
                <span>注册</span>
            </div>
        </div>
    </div>
</template>

<style lang="css">
    .tab_hover {
        width: 60px;
        /* height: 80px; */
        /* align-items: center; */
        
        border-bottom: 3px solid;
        color: rgb(77, 164, 251);
    }
    .tab_common {
        margin-left: 10px;
    }
</style>

