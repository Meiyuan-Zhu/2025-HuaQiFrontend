<script setup lang="ts">

import { ref } from 'vue'
import { User, SwitchButton, Search, Message } from "@element-plus/icons-vue"   //图标

//退出登录
// function logout() {
//   ElMessageBox.confirm(
//       '是否要退出登录？',
//       '提示',
//       {
//         customClass: "customDialog",
//         confirmButtonText: '是',
//         cancelButtonText: '否',
//         type: "warning",
//         showClose: false,
//         roundButton: true,
//         center: true
//       }
//   ).then(() => {
//     sessionStorage.setItem('token', '')
//     router.push({path: "/login"})
//   })
// }

const searchText = ref('')

</script>


<template>
  <el-header class="custom-header" height="7%">
    <el-row :gutter="10">

      <el-col :span="3" class="header-icon">
        <router-link to="/dashboard" v-slot="{navigate}" class="no-link">
          <h1 @click="navigate" class="header-text">Forexseek</h1>
          <span class="header-subtitle">智能外汇平台</span>
        </router-link>
      </el-col>

      <el-col :span="16">
      </el-col>

      <el-col :span="2" class="header-icon">
        <el-input v-model="searchText" placeholder="搜索..."  :suffix-icon="Search" />
      </el-col>

      <el-col :span="1" class="header-icon">
        <router-link to="/dashboard" v-slot="{navigate}">
          <el-icon @click="navigate" :size="35" color="rgb(37, 37, 37)" ><User /></el-icon>
        </router-link>
      </el-col>

      <el-col :span="1" class="header-icon">
        <a>
          <el-icon :size="35" color="rgb(37, 37, 37)" ><Message /></el-icon>
        </a>
      </el-col>

      <el-col :span="1" class="header-icon">
        <a>
          <el-icon :size="35" color="rgb(37, 37, 37)" ><SwitchButton /></el-icon>
        </a>
      </el-col>
    </el-row>
  </el-header>
</template>


<style scoped>
.custom-header {
  background-color: white;
  border: 1px solid #4b4a4a35;
  display: flex;
  flex-direction: column;
}

.no-link {
  text-decoration: none;
}

.role-tag {
  margin-top: 20px;
  font-size: 20px;
}

.header-text {
  color: rgb(37, 37, 37);
  font-size: x-large;
  min-width: max-content;
  margin-top: 5px;
  margin-bottom: 0;
}

.header-subtitle {
  color: #666;
  font-size: 14px;
  display: block;
  text-align: center;
  margin-bottom: 5px;
}

.header-icon {
  display: flex;
  flex-direction: column;
  align-items:center;
  justify-content: center;
}

.site-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  margin: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  height: 32px;
  width: auto;
}
</style>
