<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { router } from '../../router'
import { UserFilled } from "@element-plus/icons-vue";
import { ElMessage } from 'element-plus';
import { changePassword, User } from '../../api/user';

const user = ref<User>({username: '', password: ''})


const password = ref('')
const confirmPassword = ref('')

const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)
const changeDisabled = computed(() => {
  return !(hasConfirmPasswordInput.value && isPasswordIdentical.value)
})

function getUserInfo() {
  if (sessionStorage.getItem('user') == null) {
    
    ElMessage({
      message: '请先登录',
      type: 'error',
      center: true,
    });
    router.push('/login')
  }else{
    user.value = JSON.parse(sessionStorage.getItem('user') || '{}');
  }
}

onMounted(() => {
  getUserInfo()
})

const updatePassword = () => {
  changePassword(user.value.password, confirmPassword.value)
    .then((res) => {
      if(res.data.code == 200){
        ElMessage({
          message: '修改成功',
          type: 'success',
          center: true,
        })
        user.value.password = confirmPassword.value
        sessionStorage.setItem('user', JSON.stringify(user.value))
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
  <el-main class="main-container">
    <el-card class="aside-card">

      <div class="avatar-area">
        <el-avatar :icon="UserFilled" :size="80">
        </el-avatar>
        <span class="avatar-text"> 欢迎您，{{ user.username }}</span>
      </div>

      <el-divider></el-divider>

    </el-card>


    <el-card class="change-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
          <el-button @click="updatePassword" :disabled="changeDisabled">
            修改
          </el-button>
        </div>
      </template>

      <el-form>
        <el-form-item>
          <label for="password">密码</label>
          <el-input type="password" id="password" v-model="password" placeholder="•••••••••" required/>
        </el-form-item>
        <el-form-item>
          <label v-if="!hasConfirmPasswordInput" for="confirm_password">确认密码</label>
          <label v-else-if="!isPasswordIdentical" for="confirm_password" class="error-warn">密码不一致</label>
          <label v-else for="confirm_password">确认密码</label>

          <el-input type="password" id="confirm_password" v-model="confirmPassword"
                    :class="{'error-warn-input' :(hasConfirmPasswordInput && !isPasswordIdentical)}"
                    placeholder="•••••••••" required/>
        </el-form-item>
      </el-form>

    </el-card>
  </el-main>

</template>


<style scoped>

.error-warn {
  color: red;
}

.error-warn-input {
  --el-input-focus-border-color: red;
}

.main-container {
  display: flex;
  flex-direction: row;
  padding: 15px;
  gap: 5px;
  justify-content: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.change-card {
  width: 66%;
}

.avatar-area {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
}

.avatar-text {
  font-size: x-large;
  font-weight: bolder;
  padding-right: 40px;
}

#create-store-button {
  width: 50%;
  margin-left: 25%;
  font-size: 20px;
  font-weight: bolder;
}

</style>


