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

// 修改指导老师信息
const teachers = [
  {
    name: "李昊骅",
    role: "项目指导",
    description: `管理学博士，毕业于南京大学工程管理学院，主要研究方向为金融机构运营管理、金融风险管理等；担任本硕《固定收益证券》课程负责人，课程入选南京大学"千"层次课程、获教育部产学协同育人项目支持。
    先后主持多项省部级及以上科研项目，包括国家自然科学基金面上项目1项、国家自然科学基金青年项目1项、中国博士后科学基金面上项目1项、江苏省社会科学基金青年项目1项等；参与国家自然科学基金重大中心项目重点课题1项、面上项目多项。在《管理科学学报》、《中国管理科学》、《中国经济问题》等国内外期刊发表或录用论文多篇。
    教学案例入选全国金融硕士教学案例大赛获奖（入库）案例，曾获第一届南京大学教师教学竞赛二等奖、第二届"协鑫-瑞华"师德师风奖等荣誉。`
  },
  {
    name: "匡宏宇",
    role: "项目指导",
    description: `南京大学软件学院助理研究员，软件研发效能实验室成员，CCF软件工程专委会执行委员，研究方向为软件可追踪性、程序理解、情绪分析、文本分析、程序分析等。
    在ICSE、FSE、ASE、TSE、EMSE、JSEP、软件学报、ICSME、SANER、ICPC等软件工程领域国内外一流会议与杂志上发表/录用论文24篇，其中一作/通讯作者论文12篇（CCF-A会议论文4篇，CCF-B期刊论文2篇，CCF-B会议论文4篇），授权国家发明专利7项。
    担任多项国际学术兼职，包括SANER 2024 PC，SoSyM、JSEP、JSS与TJSC等CCF收录期刊的审稿人，EASE 2024 Publicity Lead (China)等。主持并结题国家自然科学青年基金一项，参与多个重点研发计划与华为技术合作。
    负责南京大学软件学院需求课程体系建设与教学工作，担任软件学院与智能软件与工程学院七门本科和研究生课程的授课教师，年课时数超250学时。同时担任本科新生导师、学院研究生事务助理等多项学生管理工作，主导了硕士论文送审系统的开发与维护。与电力信息化、工业互联网、金融科技等领域内知名企业展开了深入合作。`
  }
];

// 团队成员信息 - 按照组别分类
const teamLeader = {
  name: "蔡如意",
  role: "团队负责人",
  description: "南京大学2022级工程管理学院金融工程专业本科生，曾获得人民奖学金、郑钢菁英奖学金、郑钢人文社科奖学金等多项荣誉，曾参与多个课内外项目，获得美赛H奖，MathorCup数学应用挑战赛国家一等奖等，曾于招商证券电子组和兴业证券金工组实习，具有良好的数据分析能力。在本次项目期间主要负责数据的爬取、商业报告的撰写、各组对接等工作。"
};

const algorithmTeam = [
  {
    name: "黄浚珂",
    role: "算法组组长",
    description: "南京大学工程管理学院2023级金融科技班研究生，曾获美赛F奖、全国大学生金融科技创新大赛江苏省一等奖、阿里天池多模态对话系统意图识别挑战赛全球排名前5%。参与项目组能源经济类课题研究并改进图神经网络模型以提高波动率和价格预测能力。曾在券商金融科技岗担任实习生，多次参与量化私募会议。目前在智谱AI公司担大模型算法岗实习生，参与智能问数项目的研究并推进私有化部署落地。对深度学习算法、大模型算法以及工程实现均有一定经验。本次花旗杯中担任算法组组长，主任要负责统筹规划，设计并实现核心预测模型，解决算法落地过程中的各种难点。"
  },
  {
    name: "李博凡",
    role: "算法组副组长",
    description: "南京大学2023级工程管理学院金融工程硕士生，深耕NLP与大模型算法领域。先后在北京智谱华章（GLM大模型研发机构）和深信服大模型算法岗垂直实习。算法竞赛领域斩获三项核心战绩：阿里天池多模态意图识别挑战赛（前5%）、阿里天池金融风控贷款违约预测（前5%）、招商银行数字金融训练营（前7%），并获工行杯全国大学生金融科技创新大赛省级一等奖。花旗杯比赛中于算法组负责前期任务的规划，以及利用LLM负责新闻情绪指标的构建。"
  },
  {
    name: "薛皓天",
    role: "算法组成员",
    description: "南京大学2022级计算机与金融工程实验班本科生，曾获南京大学卓越奖学金、优秀共青团员、数学建模美赛M奖等，曾于南京证券金融科技部实习，拥有良好的数据分析和代码构建能力，本项目中作为算法组成员进行模型训练和参数调优等工作。"
  },
  {
    name: "徐晟轩",
    role: "算法组成员",
    description: "南京大学2022级计算机学院计算机金融实验班学生，曾获菁英奖学金、人民奖学金，新生学院优秀学生、优秀共青团员等。担任两项大创负责人，其中一项有关在线算法的省级大创已结项优秀，曾获美赛M奖，曾在星环科技大模型小组、南京证券金科部和南京云灿公司软件开发组实习。在本项目中负责算法组策略搭建的工作。"
  },
  {
    name: "赵子函",
    role: "算法组成员",
    description: "南京大学22级计算机金融工程实验班本科生。曾获卓越奖学金、人民奖学金一等奖、校级优秀学生。曾于南京证券等公司实习，参加保险公司不当行为相关科研项目。在花旗杯中主要负责算法组特征工程相关工作。"
  },
  {
    name: "陈震东",
    role: "算法组成员",
    description: "南京大学2022级工程管理学院金融工程专业本科生，曾多次获得人民奖学金一等奖，并获得美国大学生数学建模竞赛H奖、MathorCup数学应用挑战赛全国一等奖等奖项。拥有扎实的金融理论知识，熟练掌握Python、C、R等编程语言，有丰富的小组项目经验。在本次项目中负责整理、聚合以及清洗原始数据，并负责描述性统计等工作。"
  },
  {
    name: "陈佳慧",
    role: "算法组成员",
    description: "南京大学2021级信息管理学院本科生，曾获国家奖学金、杜厦奖学金等，算法组成员，负责特征工程等工作。"
  }
];

const softwareTeam = [
  {
    name: "薛瑞宸",
    role: "软件组组长",
    description: "南京大学软件学院2021级本科生。现任校团委社会实践部实践中心副主任、校青协联络部副部长、校研究生会服务与权益中心骨干成员等职务。曾任开甲书院团学联实践部部长、开甲书院团总支副书记（学生）、flappy轮滑社副社长、2023级新生朋辈导师等职务。曾获第十九届“花旗杯”金融创新应用大赛三等奖、江苏省三好学生、南京大学优秀学生干部（标兵）、南京大学优秀学生、南京大学优秀共青团员、人民奖学金等荣誉。"
  },
  {
    name: "王得而",
    role: "软件组成员",
    description: "南京大学22级计算机学院计算机与金融工程实验班本科生，中共预备党员，曾获人民奖学金二等奖、郑钢菁英奖学金、计金班菁英奖学金，南京大学优秀学生、优秀学生干部、基层学生会优秀个人等荣誉。参与大创项目“ESG对股票流动性的影响”获国家级立项，发表一项二作专利《一种基于业务规则的SQL生成解释方法与系统》，曾在南京证券金融科技部、南京星环科技研究部实习。在本项目中主要负责软件组api接口、Web前后端。"
  },
  {
    name: "彭子期",
    role: "软件组成员",
    description: "南京大学软件学院23级本科生。Web开发经验丰富，熟悉前后端，曾获得南京大学EL开发比赛二等奖。花旗杯期间作为软件组成员，负责Web前端开发。"
  },
  {
    name: "竺梅缘",
    role: "软件组成员",
    description: "南京大学软件学院2023级本科生。曾获国家奖学金、南京大学校级优秀学生干部等荣誉称号。扎根专业学习，学业成绩名列前茅，曾获南京大学EL程序设计大赛交互组一等奖，参与大创研究基于大模型的软件工程情绪分析学术研究总结与识别优化。在本次花旗杯比赛中主要负责前端开发。"
  },
  {
    name: "牟晋录",
    role: "软件组成员",
    description: "南京大学2021级本科生，曾获得人民奖学金，2024年花旗杯比赛三等奖，全国大学生乒乓球比赛三等奖。曾在东吴证券，华福证券实习。在本次花旗杯比赛中负责爬虫相关工作。"
  }
];

const businessTeam = [
  {
    name: "张程烨",
    role: "商业组组长",
    description: "南京大学工程管理学院2022级金融工程专业本科生，曾任工程管理学院学生会主席团成员。曾获校学生干部，优秀共青团干部，优秀基层学生工作者，博世励学金。获得数学建模美赛，花旗杯金融创新挑战赛等奖项。有过私募，券商行业领域实习经验。本次在队中担任商业组组长。"
  },
  {
    name: "闫瑞瑄",
    role: "商业组成员",
    description: "南京大学工程管理学院2022级金融工程专业本科生，曾获得南京大学人民奖学金二等奖、博世励学金、优秀学生、美赛h奖、全国大学生数学竞赛一等奖；曾在民生证券、国泰君安证券和农银理财有限责任公司参与实习，实习岗位涉及行研、信用债研究等多个方面；曾参与多个项目，包括挑战杯、大学生创新创业训练项目等，拥有较为丰富的项目经验。在本项目中主要负责行业调研、商业计划书撰写、数据收集与处理等工作。"
  },
  {
    name: "张彧旸",
    role: "商业组成员",
    description: "南京大学22级计算机金融实验班本科生，曾获得南京大学人民奖学金，数学建模国赛，美赛奖项。曾担任南京大学开甲书院团学联的主席团成员。花旗杯期间为商业组成员，主要参与爬取数据以及商业计划书的撰写。"
  },
  {
    name: "王凌瑶",
    role: "商业组成员",
    description: "南京大学数学学院2022级应用统计学本科生。曾荣获校级优秀学生，新生学院优秀学生，全国大学生英语竞赛C类国家二等奖，全国大学生数学竞赛A类省三，美国大学生数学建模竞赛H奖，人民奖学金。曾任职于校学生会综合联络部门，现为南京大学金融工程协会核心成员。曾在券商量化研究所实习，Worldquant签约正式顾问，参与港中深大数据科研项目，入围毕马威ESG案例分析大赛。本项目中参与了数据爬取与整理，商业计划书的撰写工作。"
  },
  {
    name: "张俊杰",
    role: "商业组成员",
    description: "南京大学商学院金融工程专业22级本科生，成绩排名前列，曾两次获得人民奖学金，一次获得南京大学商学院菲尼克斯奖学金。曾在APMCM亚太数学建模比赛中获得全国二等奖，2023-2024第十九届“花旗杯”金融创新应用大赛中获得三等奖。曾于上海和谐汇一资产管理有限公司、崇文量化（北京）科技有限公司进行数据处理以及量化策略研究方面的实习。在本项目中主要负责汇率数据的获取与整理。"
  },
  {
    name: "高子涵",
    role: "商业组成员",
    description: "南京大学22级外国语学院日语系本科生，曾获南京大学人民一等奖学金；曾在航天科技集团乐凯华光印刷科技有限公司、百融云创科技股份有限公司参与实习，实习岗位涉及财务、咨询等方面；曾参与“安永杯”业案例分析大赛；曾任秉文书院团学联素拓部干事、外国语学院学生会文体部干事、南京大学招生志愿者协会河南省理事长、2022级日语系团支部文体委员，组织并参与校运会、音乐跑、新生见面会、外院戏剧节等多项院校活动，覆盖人数累计上千人。在花旗杯团队中负责商业组数据搜集、商业计划书撰写等方面的工作。"
  },
  {
    name: "章程元",
    role: "商业组成员",
    description: "南京大学2023级工程管理学院金融工程专业本科生，曾获人民奖学金、全国大学生数学竞赛江苏省一等奖等。掌握C++、Python、Matlab等语言。正在券商研究所金融产品组进行固收量化实习，对于量化和Fintech较感兴趣。在本次花旗杯中主要负责数据收集与整理、文献收集与研究、市场分析等工作。"
  }
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
