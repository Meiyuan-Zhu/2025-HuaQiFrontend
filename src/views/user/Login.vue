<script setup lang="ts">
import { ElForm, ElFormItem } from "element-plus"
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { router } from '../../router'
import { userLogin } from "../../api/user.ts"

// 输入框值（需要在前端拦截不合法输入：是否为空+额外规则）
const username = ref('')
const password = ref('')

// 用户名是否为空
const hasTelInput = computed(() => username.value != '')
// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')
// 登录按钮可用性
const loginDisabled = computed(() => {
  return !(hasTelInput.value && hasPasswordInput.value)
})

// 确保布局一致性
onMounted(() => {
  // 添加一个小延迟确保样式正确应用
  setTimeout(() => {
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
  }, 100)
})

// 组件卸载时清理
onUnmounted(() => {
  document.body.style.overflow = ''
  document.body.style.height = ''
})

// 登录按钮触发
function handleLogin() {
  // 创建 FormData 对象
  const formData = new FormData();
  formData.append('username', username.value);
  formData.append('password', password.value);

  // 设置请求头为 multipart/form-data
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  userLogin(formData, config).then(res => {
    if (res.data.code === 0) {
      // 保存 token 到 sessionStorage
      if (res.data.data) {
        sessionStorage.setItem('satoken', res.data.data);
      }
      
      ElMessage({
        message: "登录成功",
        type: 'success',
        center: true,
        duration: 2000
      })
      
      // 保存用户信息
      sessionStorage.setItem('user', JSON.stringify({username: username.value, password: password.value}))
      
      // 跳转到首页
      router.push({path: "/"})
    }else{
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      password.value = ''
    }
  })
}
</script>


<template>
  <el-main class="main-frame">
    <el-card class="login-card">
      <div>
        <h1>登入您的账户</h1>
        <el-form>
          <el-form-item>
            <label v-if="!hasTelInput" for="tel">用户名</label>
            <label v-else for="tel">用户名</label>
            <el-input id="tel" type="text" v-model="username"
                      required :class="{'error-warn-input' :(hasTelInput)}"
                      placeholder="请输入用户名"/>
          </el-form-item>

          <el-form-item>
            <label for="password">密码</label>
            <el-input id="password" type="password" v-model="password"
                      required
                      placeholder="••••••••"/>
          </el-form-item>

          <span class="button-group">
              <el-button @click.prevent="handleLogin" :disabled="loginDisabled"
                         type="primary">登入</el-button>
              <router-link to="/register" v-slot="{navigate}">
                <el-button @click="navigate">去注册</el-button>
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
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.login-card {
  width: 400px;
  max-width: 90%;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out; /* 添加淡入动画 */
  margin-bottom: 10vh; /* 向上移动登录卡片 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* 添加响应式调整 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    max-width: 400px;
    padding: 15px;
  }
  
  .button-group {
    gap: 15px;
  }
}
</style>
