<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { router } from '../../router'
import { Message, Lock, SwitchButton } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { changePassword, User, userLogout } from '../../api/user';

const user = ref<User>({username: '', password: ''})

// 获取用户名的第一个字符作为头像
const userInitial = computed(() => {
  if (user.value && user.value.username) {
    return user.value.username.charAt(0).toUpperCase();
  }
  return 'U';
});

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 检查新密码是否为空
const hasNewPasswordInput = computed(() => newPassword.value !== '')
// 检查确认密码是否为空
const hasConfirmPasswordInput = computed(() => confirmPassword.value !== '')
// 检查两次输入的新密码是否一致
const isPasswordIdentical = computed(() => newPassword.value === confirmPassword.value)
// 修改按钮可用性
const changeDisabled = computed(() => {
  return !(
    currentPassword.value !== '' && 
    hasNewPasswordInput.value && 
    hasConfirmPasswordInput.value && 
    isPasswordIdentical.value
  )
})

function getUserInfo() {
  if (sessionStorage.getItem('user') == null) {
    router.push('/login')
  }else{
    user.value = JSON.parse(sessionStorage.getItem('user') || '{}');
  }
}

onMounted(() => {
  getUserInfo()
})

const updatePassword = () => {
  // 获取保存的 token
  const token = sessionStorage.getItem('satoken') || '';
  
  // 创建 FormData 对象
  const formData = new FormData();
  formData.append('oldPassword', currentPassword.value);
  formData.append('newPassword', newPassword.value);

  // 设置请求头，包含 satoken
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'satoken': token
    }
  };

  changePassword(formData, config)
    .then((res) => {
      if(res.data.code == 0){
        ElMessage({
          message: '密码修改成功',
          type: 'success',
          center: true,
        })
        user.value.password = newPassword.value
        sessionStorage.setItem('user', JSON.stringify(user.value))
        
        // 清空输入框
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
      }else{
        ElMessage({
          message: res.data.msg || '密码修改失败，请检查当前密码是否正确',
          type: 'error',
          center: true,
        })
      }
    })
    .catch((error) => {
      console.error('修改密码请求失败:', error);
      ElMessage({
        message: '网络错误，请稍后重试',
        type: 'error',
        center: true,
      })
    });
}

// 发送反馈邮件
const sendFeedback = () => {
  window.location.href = "mailto:support@forexseek.com?subject=用户反馈";
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 获取保存的 token
    const token = sessionStorage.getItem('satoken');
    
    // 设置请求头，包含 satoken
    const config = {
      headers: {
        'satoken': token
      }
    };
    
    userLogout(config).then(() => {
      ElMessage({
        message: '退出登录成功',
        type: 'success',
        center: true,
      });
      
      // 清除用户信息
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('satoken');
      
      // 跳转到登录页并刷新页面
      window.location.href = '/login';
    }).catch(error => {
      console.error('退出登录请求失败:', error);
      ElMessage({
        message: '退出登录失败，请稍后重试',
        type: 'error',
        center: true,
      });
    });
  }).catch(() => {
    // 用户取消退出
  });
};

</script>


<template>
  <el-main class="main-container">
    <!-- 上部分：用户信息卡片 -->
    <el-card class="user-card">
      <div class="user-info">
        <el-avatar :size="100" class="user-avatar">{{ userInitial }}</el-avatar>
        <h2 class="username">{{ user.username }}</h2>
        <p class="user-status">普通用户</p>
        <el-button type="danger" @click="handleLogout" class="logout-button" plain round>
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </el-card>

    <!-- 中部分：修改密码卡片 -->
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <div class="header-with-icon">
            <el-icon><Lock /></el-icon>
            <span>修改密码</span>
          </div>
          <el-button @click="updatePassword" :disabled="changeDisabled" type="primary" round>
            确认修改
          </el-button>
        </div>
      </template>

      <el-form class="password-form">
        <el-form-item>
          <label for="current-password">当前密码</label>
          <el-input type="password" id="current-password" v-model="currentPassword" 
                    placeholder="请输入当前密码" required/>
        </el-form-item>
        
        <el-form-item>
          <label for="new-password">新密码</label>
          <el-input type="password" id="new-password" v-model="newPassword" 
                    placeholder="请输入新密码" required/>
        </el-form-item>
        
        <el-form-item>
          <label v-if="!hasConfirmPasswordInput">确认新密码</label>
          <label v-else-if="!isPasswordIdentical" class="error-warn">两次输入的密码不一致</label>
          <label v-else>确认新密码</label>

          <el-input type="password" id="confirm-password" v-model="confirmPassword"
                    :class="{'error-warn-input': (hasConfirmPasswordInput && !isPasswordIdentical)}"
                    placeholder="请再次输入新密码" required/>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 下部分：联系我们 -->
    <el-card class="contact-card">
      <template #header>
        <div class="card-header">
          <div class="header-with-icon">
            <el-icon><Message /></el-icon>
            <span>联系我们</span>
          </div>
        </div>
      </template>
      
      <div class="contact-content">
        <p>我们非常重视您的反馈和建议，这将帮助我们不断改进产品和服务。</p>
        <p>如有任何问题或建议，请随时与我们联系。</p>
        <el-button type="primary" @click="sendFeedback" class="contact-button" round>
          发送邮件反馈
        </el-button>
      </div>
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
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  align-items: center;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.user-card, .password-card, .contact-card {
  width: 600px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.user-card:hover, .password-card:hover, .contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  text-align: center;
}

.user-avatar {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.username {
  font-size: 24px;
  font-weight: 600;
  margin: 10px 0 5px 0;
  color: #1e293b;
}

.user-status {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  background-color: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
}

.password-form {
  padding: 10px 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
}

.el-form-item {
  margin-bottom: 25px;
}

.contact-content {
  padding: 10px 20px 30px;
  text-align: center;
  color: #475569;
  line-height: 1.6;
}

.contact-button {
  margin-top: 20px;
  width: 180px;
  height: 40px;
}

.logout-button {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .user-card, .password-card, .contact-card {
    width: 90%;
  }
}
</style>


