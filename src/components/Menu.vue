<script setup lang="ts">
import { Histogram, Opportunity, TrendCharts, InfoFilled, UserFilled } from "@element-plus/icons-vue"   //图标
</script>


<template>
    <el-menu
        default-active="2"
        class="header-menu"
        mode="horizontal"
        :router="true"
      >
        <el-menu-item index="/homepage">
          <template #title>
            <div class="logo-container">
              <img src="/logo.jpg" alt="ForexSeek Logo" class="logo-image"/>
              <span>首页</span>
            </div>
          </template>
        </el-menu-item>

        <el-menu-item index="/realtime">
          <el-icon><TrendCharts /></el-icon>
          <span>实时汇率</span>
        </el-menu-item>

        <el-menu-item index="/backtest">
          <el-icon><Histogram /></el-icon>
          <span>汇率回测</span>
        </el-menu-item>

        <el-menu-item index="/prediction">
          <el-icon><Opportunity /></el-icon>
          <span>汇率预测</span>
        </el-menu-item>

        <el-menu-item index="/interpret">
          <el-icon><InfoFilled /></el-icon>
          <span>可解释性</span>
        </el-menu-item>

        <el-menu-item index="/dashboard">
          <el-icon><UserFilled /></el-icon>
          <span>个人中心</span>
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

/* Logo 样式 */
.logo-container {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-image {
  width: 20px;
  height: 20px;
  /* 移除圆形边框 */
  border-radius: 0;
  object-fit: contain;
  margin-right: 8px;
}
</style>