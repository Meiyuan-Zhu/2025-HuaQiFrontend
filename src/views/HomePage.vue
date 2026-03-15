<script setup lang="ts">
import backgroundImage from "../assets/background2.webp";
import { useRouter } from 'vue-router';

const router = useRouter();

// 导航到指定路由
const navigateTo = (path: string) => {
  // 添加过渡动画
  const moduleCard = document.querySelector('.module-card') as HTMLElement;
  if (moduleCard) {
    moduleCard.style.transition = 'transform 0.2s ease';
    moduleCard.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      moduleCard.style.transform = 'scale(1)';
      // 使用 router.push 进行导航，添加强制刷新标志
      router.push({
        path: path,
        query: { _t: Date.now().toString() } // 添加时间戳确保页面状态重置
      });
    }, 200);
  } else {
    router.push(path);
  }
};

// 滚动到指定区域
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    // 添加平滑滚动效果
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// 模块信息 - 删除用户中心
const modules = [
  {
    title: "实时汇率",
    description: "提供全球主要货币对的实时汇率数据，支持多种货币对比和历史数据查询，帮助用户随时掌握市场动态。",
    icon: "el-icon-data-line",
    path: "/realtime"
  },
  {
    title: "汇率回测",
    description: "基于历史数据进行汇率策略回测，评估不同交易策略的表现，为投资决策提供数据支持。",
    icon: "el-icon-time",
    path: "/backtest"
  },
  {
    title: "汇率预测",
    description: "运用先进的AI算法对未来汇率走势进行预测，结合多种技术指标和宏观经济因素，提供精准的市场预判。",
    icon: "el-icon-trend-charts",
    path: "/prediction"
  },
  {
    title: "可解释性",
    description: "透明展示AI预测背后的逻辑和依据，通过可视化图表和详细解释，让用户理解预测结果的形成过程。",
    icon: "el-icon-document",
    path: "/interpret"
  }
];

// 为开源版本做脱敏展示：仅保留团队角色与职责，不展示实名与可识别经历
const teachers = [
  {
    name: "指导老师A",
    role: "项目指导",
    description: "长期从事金融工程与风险管理研究，负责项目整体方向把控、研究方法论指导与成果评审。"
  },
  {
    name: "指导老师B",
    role: "项目指导",
    description: "长期从事软件工程与智能系统研究，负责系统架构评审、工程实践规范与算法落地建议。"
  }
];

const teamLeader = {
  name: "团队负责人",
  role: "项目统筹",
  description: "负责跨组协作、进度管理、里程碑推进与对外交付，统筹算法、软件与商业三组的工作节奏。"
};

const algorithmTeam = [
  { name: "算法成员A", role: "算法组组长", description: "负责预测模型设计、特征工程方案制定与训练评估闭环。" },
  { name: "算法成员B", role: "算法组副组长", description: "负责模型优化、实验复现实验平台建设与推理服务对接。" },
  { name: "算法成员C", role: "算法组成员", description: "负责数据清洗、指标构建与实验结果可视化。" },
  { name: "算法成员D", role: "算法组成员", description: "负责回测策略联调、参数搜索与稳定性分析。" },
  { name: "算法成员E", role: "算法组成员", description: "负责特征筛选、时序建模与误差诊断。" },
  { name: "算法成员F", role: "算法组成员", description: "负责数据治理、基线模型维护与结果复核。" },
  { name: "算法成员G", role: "算法组成员", description: "负责模型解释性分析与多模型融合实验。" }
];

const softwareTeam = [
  { name: "软件成员A", role: "软件组组长", description: "负责前后端架构设计、任务拆解与工程质量管理。" },
  { name: "软件成员B", role: "软件组成员", description: "负责 API 集成、数据流联调与接口异常处理。" },
  { name: "软件成员C", role: "软件组成员", description: "负责前端交互实现与组件化开发。" },
  { name: "软件成员D", role: "软件组成员", description: "负责可视化页面开发、性能优化与兼容性修复。" },
  { name: "软件成员E", role: "软件组成员", description: "负责数据采集脚本与数据处理流水线维护。" }
];

const businessTeam = [
  { name: "商业成员A", role: "商业组组长", description: "负责商业框架设计、需求拆解与整体报告结构。" },
  { name: "商业成员B", role: "商业组成员", description: "负责行业研究、竞品分析与用户场景梳理。" },
  { name: "商业成员C", role: "商业组成员", description: "负责数据调研、市场分析与结论验证。" },
  { name: "商业成员D", role: "商业组成员", description: "负责策略价值阐述、风险说明与展示材料整理。" },
  { name: "商业成员E", role: "商业组成员", description: "负责数据收集、报告排版与交付支持。" },
  { name: "商业成员F", role: "商业组成员", description: "负责案例整理、用户反馈收集与迭代建议。" },
  { name: "商业成员G", role: "商业组成员", description: "负责文献调研、市场信息更新与复盘总结。" }
];
</script>

<template>
  <!-- 整个页面容器 -->
  <div class="home-container">
    <!-- 第一屏：背景图片和标题 -->
    <section class="hero-section">
      <div class="background" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="overlay"></div>
        
        <!-- 添加动态粒子背景 -->
        <div class="particles-container">
          <div v-for="n in 100" :key="n" class="particle"></div>
        </div>
        
        <!-- 添加动态连线效果 -->
        <div class="network-lines"></div>
        
        <!-- 页面布局 -->
        <div class="page-layout">
          <!-- Hero 区域：可视区域剩余空间 -->
          <div class="hero-content">
            <div class="hero-text-container">
              <h1 class="hero-title">
                <span class="tech-text">Forex</span><span class="gradient-text">seek</span>
              </h1>
              <h2 class="hero-subtitle typing-effect">
                Empower your forex trading with AI and big data.
              </h2>
            </div>
            
            <!-- 导航按钮 -->
            <div class="nav-buttons">
              <button class="nav-button glow-effect" @click="scrollToSection('project-intro')">
                项目介绍
                <span class="glow-container">
                  <span class="glow"></span>
                </span>
              </button>
              <button class="nav-button glow-effect" @click="scrollToSection('team-intro')">
                团队介绍
                <span class="glow-container">
                  <span class="glow"></span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 第二屏：项目介绍 -->
    <section id="project-intro" class="intro-section">
      <!-- 添加科技感装饰元素 -->
      <div class="tech-decoration left-decoration"></div>
      <div class="tech-decoration right-decoration"></div>
      
      <div class="section-container">
        <h2 class="section-title">
          <span class="highlight-text">项目介绍</span>
        </h2>
        <p class="section-description">
          Forexseek是一个基于人工智能和大数据的外汇分析平台，旨在为用户提供精准的汇率预测、风险分析和投资策略优化。
          通过整合全球金融数据和先进的机器学习算法，我们致力于帮助投资者做出更明智的决策。
        </p>
        
        <div class="modules-grid">
          <div 
            v-for="(module, index) in modules" 
            :key="index" 
            class="module-card"
            @click="navigateTo(module.path)"
          >
            <div class="module-icon">
              <i :class="module.icon"></i>
            </div>
            <h3 class="module-title">{{ module.title }}</h3>
            <p class="module-description">{{ module.description }}</p>
            <div class="module-link">了解更多 →</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 第三屏：团队介绍 -->
    <section id="team-intro" class="team-section">
      <!-- 添加科技感装饰元素 -->
      <div class="tech-circles"></div>
      
      <!-- 添加动态连接线背景 -->
      <div class="team-network-lines"></div>
      
      <!-- 添加浮动科技元素 -->
      <div class="floating-tech-elements">
        <div class="tech-element" v-for="i in 5" :key="i"></div>
      </div>
      
      <div class="section-container">
        <h2 class="section-title">
          <span class="highlight-text">团队介绍</span>
        </h2>
        <p class="section-description">
          我们是来自南京大学的<b>"南汇风云"</b>团队
          <br>
          团队由来自各个专业的优秀同学组成
          <br>
          我们致力于将专业知识和前沿技术应用于外汇分析等领域，为用户创造价值。
        </p>
        
        <!-- 指导老师部分 -->
        <div class="team-category">
          <h3 class="category-title">指导老师</h3>
          <div class="teachers-grid">
            <div v-for="(teacher, index) in teachers" :key="index" class="teacher-card">
              <div class="teacher-info">
                <h3 class="teacher-name">{{ teacher.name }}</h3>
                <div class="teacher-role">{{ teacher.role }}</div>
                <p class="teacher-description">{{ teacher.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 团队负责人部分 -->
        <div class="team-category">
          <h3 class="category-title">团队负责人</h3>
          <div class="team-leader-container">
            <div class="team-leader-card">
              <div class="leader-name">{{ teamLeader.name }}</div>
              <div class="leader-role">{{ teamLeader.role }}</div>
              <p class="leader-description">{{ teamLeader.description }}</p>
            </div>
          </div>
        </div>
        
        <!-- 算法组成员部分 -->
        <div class="team-category">
          <h3 class="category-title">算法组</h3>
          <div class="members-grid">
            <div v-for="(member, index) in algorithmTeam" :key="index" class="member-card">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-role">{{ member.role }}</div>
              <div class="member-description">{{ member.description }}</div>
            </div>
          </div>
        </div>
        
        <!-- 软件组成员部分 -->
        <div class="team-category">
          <h3 class="category-title">软件组</h3>
          <div class="members-grid">
            <div v-for="(member, index) in softwareTeam" :key="index" class="member-card">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-role">{{ member.role }}</div>
              <div class="member-description">{{ member.description }}</div>
            </div>
          </div>
        </div>
        
        <!-- 商业组成员部分 -->
        <div class="team-category">
          <h3 class="category-title">商业组</h3>
          <div class="members-grid">
            <div v-for="(member, index) in businessTeam" :key="index" class="member-card">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-role">{{ member.role }}</div>
              <div class="member-description">{{ member.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
/* 全局样式 */
.home-container {
  width: 100%;
  height: 100vh;
  scroll-snap-type: y mandatory;
}

section {
  min-height: 100vh;
  scroll-snap-align: start;
  position: relative;
}

/* 第一屏：Hero 区域 */
.hero-section {
  height: 100vh;
  position: relative;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.page-layout {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 50px;
}

.hero-text-container {
  max-width: 700px;
  color: #fff;
  animation: fadeInUp 2s ease forwards;
  text-align: center;
}

.hero-title {
  font-size: 3em;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2em;
  margin: 50px 0 30px;
  line-height: 1.4;
  font-weight: 350;
}

.nav-buttons {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  justify-content: center;
}

.nav-button {
  padding: 12px 24px;
  font-size: 1em;
  font-weight: 600;
  color: #fff;
  background-color: rgba(0, 85, 187, 0.8);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s ease;
}

.nav-button:hover {
  background-color: rgba(0, 63, 138, 1);
  transform: translateY(-2px);
}

.nav-button:hover::after {
  transform: translate(-50%, -50%) scale(2);
}

.nav-button:active {
  transform: translateY(0);
}

/* 第二屏：项目介绍 */
.intro-section {
  background-color: #f8f9fa;
  padding: 60px 0;
  min-height: 90vh;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.section-description {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 50px;
  font-size: 1.1em;
  line-height: 1.6;
  color: #666;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.module-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.module-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.module-card:hover::before {
  opacity: 1;
}

.module-card:active {
  transform: scale(0.95);
}

.module-icon {
  font-size: 2em;
  color: #0055bb;
  margin-bottom: 20px;
}

.module-title {
  font-size: 1.5em;
  margin-bottom: 15px;
  color: #333;
}

.module-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.module-link {
  color: #0055bb;
  font-weight: 600;
}

/* 第三屏：团队介绍 */
.team-section {
  background-color: #fff;
  padding: 80px 0 120px;
  position: relative;
  overflow: hidden;
}

.team-category {
  margin-bottom: 50px;
}

.category-title {
  font-size: 1.8em;
  text-align: center;
  margin: 40px 0 30px;
  color: #333;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}

.category-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #0055bb, rgba(0, 85, 187, 0.2));
  border-radius: 3px;
}

/* 指导老师样式 */
.teachers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-bottom: 60px;
}

.teacher-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  overflow: visible;
}

.teacher-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.teacher-info {
  padding: 0;
}

.teacher-name {
  font-size: 1.5em;
  margin: 0 0 5px;
  color: #333;
}

.teacher-role {
  color: #0055bb;
  font-weight: 600;
  margin-bottom: 15px;
}

.teacher-description {
  color: #666;
  line-height: 1.6;
  white-space: pre-line;
  text-align: justify;
}

/* 团队负责人样式 */
.team-leader-container {
  margin-bottom: 40px;
}

.team-leader-card {
  background-color: #f0f7ff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid #0055bb;
  max-width: 800px;
  margin: 0 auto;
}

.team-leader-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.leader-name {
  font-size: 1.5em;
  margin: 0 0 5px;
  color: #333;
}

.leader-role {
  color: #0055bb;
  font-weight: 600;
  margin-bottom: 15px;
}

.leader-description {
  color: #666;
  line-height: 1.6;
  text-align: justify;
}

/* 团队成员样式 - 网格布局 */
.members-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.member-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  border-top: 3px solid #0055bb;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.member-name {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0 0 8px;
  color: #333;
}

.member-role {
  font-size: 0.9em;
  color: #0055bb;
  margin-bottom: 12px;
}

.member-description {
  font-size: 0.85em;
  color: #666;
  line-height: 1.5;
  text-align: justify;
}

/* 动画效果 */
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .members-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .teachers-grid {
    grid-template-columns: 1fr;
  }
  
  .teacher-card {
    flex-direction: column;
  }
  
  .teacher-photo {
    flex: 0 0 200px;
  }
  
  .hero-content {
    padding: 0 20px;
  }
  
  .hero-title {
    font-size: 2.5em;
  }
  
  .hero-subtitle {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
}

/* 粒子动画效果增强 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: float 15s infinite linear;
}

.particle:nth-child(even) {
  width: 3px;
  height: 3px;
  background-color: rgba(59, 130, 246, 0.6);
}

.particle:nth-child(3n) {
  width: 1px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.3);
  animation-duration: 20s;
}

.particle:nth-child(5n) {
  width: 4px;
  height: 4px;
  background-color: rgba(99, 102, 241, 0.4);
  animation-duration: 25s;
}

.particle:nth-child(7n) {
  width: 2.5px;
  height: 2.5px;
  background-color: rgba(139, 92, 246, 0.5);
  animation-duration: 18s;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(100vw);
    opacity: 0;
  }
}

/* 为更多粒子设置不同的起始位置和动画延迟 */
.particle:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.particle:nth-child(2) { top: 20%; left: 80%; animation-delay: 0.5s; }
.particle:nth-child(3) { top: 30%; left: 45%; animation-delay: 1s; }
.particle:nth-child(4) { top: 40%; left: 10%; animation-delay: 1.5s; }
.particle:nth-child(5) { top: 50%; left: 70%; animation-delay: 2s; }
.particle:nth-child(6) { top: 60%; left: 30%; animation-delay: 2.5s; }
.particle:nth-child(7) { top: 70%; left: 90%; animation-delay: 3s; }
.particle:nth-child(8) { top: 80%; left: 50%; animation-delay: 3.5s; }
.particle:nth-child(9) { top: 90%; left: 15%; animation-delay: 4s; }
.particle:nth-child(10) { top: 95%; left: 85%; animation-delay: 4.5s; }
.particle:nth-child(11) { top: 15%; left: 25%; animation-delay: 10s; }
.particle:nth-child(12) { top: 75%; left: 35%; animation-delay: 10.5s; }
.particle:nth-child(13) { top: 85%; left: 75%; animation-delay: 11s; }
/* 继续为其他粒子设置... */

/* 网络连线效果 */
.network-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
  animation: networkMove 20s infinite linear;
}

@keyframes networkMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}

/* 标题样式增强 */
.tech-text {
  font-family: 'Arial', sans-serif;
  font-weight: 800;
  letter-spacing: 1px;
  position: relative;
  color: #fff;
}

.gradient-text {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  position: relative;
}

/* 打字机效果 */
.typing-effect {
  overflow: hidden;
  border-right: 3px solid #3b82f6;
  white-space: nowrap;
  margin: 50px auto 30px;
  animation: 
    typing 3.5s steps(40, end),
    blink-caret 0.75s step-end infinite;
  max-width: 700px;
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: #3b82f6 }
}

/* 按钮发光效果 */
.glow-effect {
  position: relative;
  overflow: hidden;
}

.glow-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  transform: rotate(45deg);
  animation: glow-rotate 3s infinite linear;
}

@keyframes glow-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 科技感装饰元素 */
.tech-decoration {
  position: absolute;
  width: 200px;
  height: 400px;
  z-index: 0;
}

.left-decoration {
  left: 0;
  top: 20%;
  background: 
    linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent),
    radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  border-right: 1px solid rgba(59, 130, 246, 0.1);
}

.right-decoration {
  right: 0;
  top: 40%;
  background: 
    linear-gradient(-90deg, rgba(59, 130, 246, 0.1), transparent),
    radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  border-left: 1px solid rgba(59, 130, 246, 0.1);
}

.tech-circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 30%);
  z-index: 0;
}

/* 标题高亮效果 */
.highlight-text {
  position: relative;
  display: inline-block;
  padding: 0 10px;
}

.highlight-text::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 10px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  z-index: -1;
  border-radius: 5px;
}

/* 模块卡片增强 */
.module-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.module-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 20px 20px 0;
  border-color: transparent rgba(59, 130, 246, 0.1) transparent transparent;
  transition: all 0.3s ease;
}

.module-card:hover::after {
  border-width: 0 30px 30px 0;
  border-color: transparent rgba(59, 130, 246, 0.3) transparent transparent;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .typing-effect {
    white-space: normal;
    border-right: none;
    animation: none;
  }
  
  .tech-decoration {
    display: none;
  }
}

/* 第三屏：团队介绍 - 新增科技感效果 */
.team-section {
  background-color: #fff;
  padding: 80px 0 120px;
  position: relative;
  overflow: hidden;
}

/* 团队介绍动态连接线背景 */
.team-network-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 85, 187, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 85, 187, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 0;
  animation: teamNetworkMove 15s infinite linear;
}

@keyframes teamNetworkMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 30px 30px;
  }
}

/* 浮动科技元素 */
.floating-tech-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.tech-element {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 1px solid rgba(0, 85, 187, 0.1);
  border-radius: 50%;
  animation: floatElement 10s infinite ease-in-out;
}

.tech-element::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  border: 1px dashed rgba(0, 85, 187, 0.15);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.tech-element:nth-child(1) {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
  width: 100px;
  height: 100px;
}

.tech-element:nth-child(2) {
  top: 70%;
  left: 5%;
  animation-delay: 1s;
  width: 60px;
  height: 60px;
}

.tech-element:nth-child(3) {
  top: 25%;
  right: 8%;
  animation-delay: 2s;
  width: 120px;
  height: 120px;
}

.tech-element:nth-child(4) {
  top: 60%;
  right: 12%;
  animation-delay: 3s;
  width: 90px;
  height: 90px;
}

.tech-element:nth-child(5) {
  top: 85%;
  right: 25%;
  animation-delay: 4s;
  width: 70px;
  height: 70px;
}

@keyframes floatElement {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
  100% {
    transform: translateY(0) rotate(360deg);
  }
}

/* 团队成员卡片增强效果 */
.member-card {
  position: relative;
  z-index: 1;
}

.member-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #0055bb, transparent);
  transform: scaleX(0);
  transition: transform 0.5s ease;
}

.member-card:hover::after {
  transform: scaleX(1);
}

/* 教师卡片增强效果 */
.teacher-card {
  position: relative;
  z-index: 1;
  overflow: visible;
}

.teacher-card::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(135deg, rgba(0, 85, 187, 0.2), transparent);
  border-radius: 15px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.teacher-card:hover::before {
  opacity: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .floating-tech-elements {
    display: none;
  }
}
</style>
