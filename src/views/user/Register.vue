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
  if( hasPasswordInput && hasConfirmPasswordInput && isPasswordIdentical) {
    return true
  } else {
    return false
  }
})

// 注册按钮触发
function handleRegister() {
  userRegister({
    username: name.value,
    password: password.value,
  }).then(res => {
    if (res.data.code === '200') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
      ElMessage({
        message: "注册成功！请登录账号",
        type: 'success',
        center: true,
      })
      router.push({path: "/login"})
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
  <el-main class="main-frame bgimage">
    <el-card class="login-card">
      <div>
        <h1>创建一个新的账户</h1>

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
}

.bgimage {
  background-image: url("../../assets/shopping-1s-1084px.svg");
}

.login-card {
  width: 60%;
  padding: 10px;
}

.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.button-group {
  padding-top: 10px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: center;
  justify-content: right;
}
</style>
