<script setup lang="ts">
import { HomeFilled, Histogram, Opportunity, TrendCharts } from "@element-plus/icons-vue"   //图标
</script>


<template>
    <el-menu
        default-active="2"
        class="header-menu"
        mode="horizontal"
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

        <el-menu-item index="4">
          <el-icon><Histogram /></el-icon>
          <span>汇率回测</span>
        </el-menu-item>

        <el-menu-item index="/prediction">
          <el-icon><Opportunity /></el-icon>
          <span>汇率预测</span>
        </el-menu-item>
      </el-menu>
</template>


<style scoped>
.header-menu {
  width: 100%;
  height: 6%;
  text-align: center;
}

.el-menu--horizontal > .el-menu-item:nth-child(1) {
  margin-right: auto;
}
</style>