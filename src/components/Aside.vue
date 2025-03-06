<script setup lang="ts">
import { HomeFilled, Histogram, Opportunity, TrendCharts } from "@element-plus/icons-vue"   //图标
</script>


<template>
  <el-aside class="custom-aside" >
    
    <el-menu
        default-active="2"
        class="sidebar-menu"
        :router="true"
      >
        <el-menu-item index="/">
          <template #title>
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </template>
        </el-menu-item>

        <el-menu-item index="/realtime">
          <el-icon><TrendCharts /></el-icon>
          <span>实时汇率</span>
        </el-menu-item>

        <el-menu-item index="/prediction">
          <el-icon><Opportunity /></el-icon>
          <span>汇率预测</span>
        </el-menu-item>

        <el-menu-item index="4">
          <el-icon><Histogram /></el-icon>
          <span>多货币对组合</span>
        </el-menu-item>
      </el-menu>

  </el-aside>

</template>


<style scoped>
.custom-aside {
    width: 10%;
    height: 100%;
    text-align: center
}

.sidebar-menu {
  width: 100%;
  height: 100%;
}
</style>