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
      // 使用 router.push 进行导航
      router.push(path);
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

// 模块信息
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
  },
  {
    title: "用户中心",
    description: "个性化用户空间，管理账户信息、查看历史记录、设置偏好货币对，提供定制化的使用体验。",
    icon: "el-icon-user",
    path: "/dashboard"
  }
];

// 团队成员信息
const teamMembers = [
  {
    name: "指导老师",
    role: "项目指导",
    photo: "https://via.placeholder.com/150",
    description: "资深金融科技专家，在量化交易和AI应用领域拥有丰富经验，为项目提供专业指导和行业洞见。"
  },
  {
    name: "张三",
    role: "项目负责人",
    photo: "https://via.placeholder.com/150",
    description: "负责项目整体规划和协调，拥有多年金融数据分析经验，专注于AI在金融领域的应用研究。"
  },
  {
    name: "李四",
    role: "算法工程师",
    photo: "https://via.placeholder.com/150",
    description: "负责核心预测算法开发，精通机器学习和深度学习技术，在时间序列预测方面有独到见解。"
  },
  {
    name: "王五",
    role: "前端开发",
    photo: "https://via.placeholder.com/150",
    description: "负责用户界面设计和实现，致力于打造直观、易用的交互体验，让复杂的数据分析变得简单明了。"
  }
];
</script>

<template>
  <!-- 整个页面容器 -->
  <el-main class="home-container">
    <!-- 第一屏：背景图片和标题 -->
    <section class="hero-section">
      <div class="background" :style="{ backgroundImage: `url(${backgroundImage})` }">
        <div class="overlay"></div>
        
        <!-- 页面布局 -->
        <div class="page-layout">
          <!-- Hero 区域：可视区域剩余空间 -->
          <div class="hero-content">
            <div class="hero-text-container">
              <h1 class="hero-title">
                Forexseek
              </h1>
              <h2 class="hero-subtitle">
                Harness AI and big data to analyze forex risks, predict trends, and optimize investment strategies.
              </h2>
            </div>
            
            <!-- 导航按钮 -->
            <div class="nav-buttons">
              <button class="nav-button" @click="scrollToSection('project-intro')">
                项目介绍
              </button>
              <button class="nav-button" @click="scrollToSection('team-intro')">
                团队介绍
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 第二屏：项目介绍 -->
    <section id="project-intro" class="intro-section">
      <div class="section-container">
        <h2 class="section-title">项目介绍</h2>
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
      <div class="section-container">
        <h2 class="section-title">团队介绍</h2>
        <p class="section-description">
          我们的团队由金融、数据科学和软件开发领域的专业人士组成，拥有丰富的行业经验和技术背景。
          团队成员致力于将前沿技术应用于金融分析，为用户创造价值。
        </p>
        
        <div class="team-grid">
          <div v-for="(member, index) in teamMembers" :key="index" class="team-member">
            <div class="member-photo">
              <img :src="member.photo" :alt="member.name">
            </div>
            <div class="member-info">
              <h3 class="member-name">{{ member.name }}</h3>
              <div class="member-role">{{ member.role }}</div>
              <p class="member-description">{{ member.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </el-main>
</template>

<style>
/* 全局样式 */
.home-container {
  width: 100%;
  height: 100vh;
  scroll-snap-type: y mandatory;
}

section {
  height: 100vh;
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
  padding: 0 50px;
}

.hero-text-container {
  max-width: 700px;
  color: #fff;
  animation: fadeInUp 2s ease forwards;
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
  padding: 80px 0;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  padding: 80px 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 40px;
}

.team-member {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.team-member:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.member-photo {
  flex: 0 0 150px;
}

.member-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  padding: 20px;
}

.member-name {
  font-size: 1.3em;
  margin: 0 0 5px;
  color: #333;
}

.member-role {
  color: #0055bb;
  font-weight: 600;
  margin-bottom: 15px;
}

.member-description {
  color: #666;
  line-height: 1.6;
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
@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .team-grid {
    grid-template-columns: 1fr;
  }
  
  .team-member {
    flex-direction: column;
  }
  
  .member-photo {
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
</style>
