<script setup lang="ts">
import {ref, computed} from 'vue'
import {router} from '../../router'
import {userRegister} from "../../api/user.ts"

// 输入框值（需要在前端拦截不合法输入：是否为空+额外规则）
const name = ref('')
const password = ref('')
const confirmPassword = ref('')

// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')
// 重复密码是否为空
const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
// 重复密码的规则
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)
// 注册按钮可用性
const registerDisabled = computed(() => {
  if (hasPasswordInput.value && hasConfirmPasswordInput.value && isPasswordIdentical.value && name.value !== '') {
    return false;
  } else {
    return true;
  }
})

// 注册按钮触发
function handleRegister() {
  // 创建 FormData 对象
  const formData = new FormData();
  formData.append('username', name.value);
  formData.append('password', password.value);
  userRegister(formData).then(res => {
    if (res.data.code === 0) {  // 修改判断条件为 code === 0
      ElMessage({
        message: "注册成功！3秒后自动跳转到登录页面",
        type: 'success',
        center: true,
        duration: 3000
      })
      
      // 3秒后自动跳转到登录页面
      setTimeout(() => {
        router.push({path: "/login"})
      }, 3000)
    }else{
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
}

</script>


<template>
  <el-main class="main-frame">
    <el-card class="login-card">
      <div>
        <h1>创建新账户</h1>

        <el-form>
          <el-form-item>
            <label for="name">用户名</label>
            <el-input id="name"
                      v-model="name"
                      placeholder="请输入用户名"/>
          </el-form-item>

          <el-form-item>
            <label for="password">密码</label>
            <el-input type="password" id="password"
                      v-model="password"
                      placeholder="••••••••"/>
          </el-form-item>

          <el-form-item>
            <label v-if="!hasConfirmPasswordInput">确认密码</label>
            <label v-else-if="!isPasswordIdentical" class="error-warn">密码不一致</label>
            <label v-else>确认密码</label>

            <el-input type="password" id="confirm-password"
                      v-model="confirmPassword"
                      :class="{'error-warn-input' :(hasConfirmPasswordInput && !isPasswordIdentical)}"
                      placeholder="••••••••"/>
          </el-form-item>

          <span class="button-group">
            <el-button @click.prevent="handleRegister"
                       :disabled="registerDisabled"
                       type="primary">
              创建账户
            </el-button>

            <router-link to="/login" v-slot="{navigate}">
              <el-button @click="navigate">
                去登录
              </el-button>
            </router-link>
          </span>

        </el-form>
      </div>

    </el-card>
  </el-main>

</template>


<style scoped>
.main-frame {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  max-width: 90%;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.button-group {
  padding-top: 20px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
