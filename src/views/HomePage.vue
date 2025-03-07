<script setup lang="ts">
import backgroundImage from "../assets/background2.webp";
</script>

<template>
  <!-- 整个页面背景 -->
  <div class="background" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="overlay"></div>

    <!-- 页面布局 -->
    <div class="page-layout">

      <!-- Hero 区域：可视区域剩余空间 -->
      <div class="hero-section">
        <div class="hero-text-container">
          <h1 class="hero-title">
            Empowering Your Forex Decisions
          </h1>
          <h2 class="hero-subtitle">
            Harness AI and big data to analyze forex risks, predict trends, and optimize investment strategies.
          </h2>
          <!-- <button class="cta-button">Explore Insights</button> -->
        </div>
      </div>

      <!-- 其他内容区，如果需要的话 -->
      <!-- <el-container class="main-container">
        <router-view />
      </el-container> -->
    </div>
  </div>
</template>

<style>
/* 全屏背景容器 */
.background {
  position: fixed;
  top: 6%;
  left: 0;
  width: 100vw;
  height: 94vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 半透明遮罩 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

/* 页面布局：竖直排列，Header在上，Hero占剩余空间 */
.page-layout {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column; 
  z-index: 1; /* 让内容在遮罩上方 */
}

/* 如果你的 Header 组件内部已经是固定高度，可以忽略此处 */
.header {
  /* 如果 Header 不固定高度，就让它自动撑开 */
  /* 如果你想 Header 固定高度，比如 60px，可写: height: 60px; */
  height: 60px;
}

/* Hero 区域：占据剩余空间，垂直居中 */
.hero-section {
  flex: 1; /* 占用除 Header 之外的剩余空间 */
  display: flex;
  align-items: center;       /* 垂直居中 */
  justify-content: flex-start; /* 水平左对齐 */
  padding-left: 50px;       /* 左侧留白 */
}

/* 文字容器：限制最大宽度，避免文字过长 */
.hero-text-container {
  max-width: 700px;
  color: #fff;
}

/* 标题样式 */
.hero-title {
  font-size: 3em;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
}

/* 副标题样式 */
.hero-subtitle {
  font-size: 1.2em;
  margin: 50px 0 30px;
  line-height: 1.4;
  font-weight: 350;
}

/* CTA 按钮（可选） */
.cta-button {
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  color: #fff;
  background-color: #0055bb;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.cta-button:hover {
  background-color: #003f8a;
}

.hero-text-container {
  animation: fadeInUp 2s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>
