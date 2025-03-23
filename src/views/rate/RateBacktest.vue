<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { ElSelect, ElOption } from "element-plus";
import "element-plus/es/components/select/style/css";
import "element-plus/es/components/option/style/css";
import BacktestKline from "./BacktestKline.vue"; 
import BacktestPredLine from "./BacktestPredLine.vue";
import BacktestNetWorth from "./BacktestNetWorth.vue";
import BacktestProfitCard from "./BacktestProfitCard.vue";
import axios from "axios";

const currencyPairs = [
  {
    label: "CNY/JPY",
    displayName:"人民币/日元",
    flagFrom: "cn",
    flagTo: "jp",
  },
  {
    label: "CNY/EUR",
    displayName: "人民币/欧元",
    flagFrom: "cn",
    flagTo: "eu"
  },
  {
    label: "CNY/AUD",
    displayName: "人民币/澳大利亚元",
    flagFrom: "cn",
    flagTo: "au"
  },
  {
    label: "CNY/USD",
    displayName: "人民币/美元",
    flagFrom: "cn",
    flagTo: "us"
  }
];

const selectedPair = ref("CNY/USD");

// 根据 selectedPair，找对应的对象，用于显示国旗
const selectedPairObj = computed(() =>
  currencyPairs.find((p) => p.label === selectedPair.value)
);

/* 策略 */
const strategies = [
  "Aberration",
  "DualThrust",
  "MACD",
  "Model",
  "Momentum",
  "Window"
];

const selectedStrategy = ref("Aberration");

/* 时间跨度 */
const timeRanges = ["1W", "1M", "1S", "1Y", "3Y"];
const selectedTimeRange = ref("1M");

// 添加实时汇率数据的状态
const currentRate = ref({
  rate: 0,
  change: 0,
  changePercent: 0
});

const BASE_URL = 'http://118.178.184.189:6020';
const ALL_FOREX_API = `${BASE_URL}/v1/rate/get_all_forex`;

// 添加请求配置
const requestConfig = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  // 如果需要token
    'Content-Type': 'application/json'
  }
};

async function fetchCurrentRate() {
  try {
    const res = await axios.get(ALL_FOREX_API, requestConfig);
    console.log("获取汇率数据成功", res.data);
    if (res.data && res.data.data) {
      // 找到对应的货币对数据
      const rateData = res.data.data.find((item: any) => {
        // 从 selectedPair (如 "CNY/JPY") 中提取目标货币代码
        const targetCurrency = selectedPair.value.split('/')[1];
        return item.currencyCode === targetCurrency;
      });
      
      if (rateData) {
        // 使用中间价作为当前汇率
        const rate = Number(rateData.centralParity);
        const change = Number(rateData.changeRate);
        
        currentRate.value = {
          rate: rate,
          change: change,
          // 计算涨跌百分比
          changePercent: ((change / rate) * 100)
        };
      }
    }
  } catch (error) {
    console.error("获取实时汇率数据失败", error);
    // 设置默认值避免显示 NaN
    currentRate.value = {
      rate: 0,
      change: 0,
      changePercent: 0
    };
  }
}

// 监听货币对变化时重新获取数据
watch(selectedPair, () => {
  fetchCurrentRate();
});

// 添加定时刷新功能
let refreshTimer: number;

// 添加主题状态
const theme = ref('light'); // 默认使用浅色主题

onMounted(() => {
  fetchCurrentRate();
  // 每60秒刷新一次数据
  refreshTimer = window.setInterval(fetchCurrentRate, 60000);

  // 如果需要响应系统主题变化，可以添加以下代码
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
    theme.value = e.matches ? 'dark' : 'light';
  };
  
  mediaQuery.addEventListener('change', updateTheme);
  updateTheme(mediaQuery);
  
  onUnmounted(() => {
    // 组件卸载时清除定时器
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    mediaQuery.removeEventListener('change', updateTheme);
  });
});
</script>
<template>
  <div class="backtest-page">
    <!-- 页面标题区 -->
    <div class="page-header">
      <h1 class="page-title">汇率回测</h1>
    </div>

    <!-- 顶部信息区 -->
    <div class="top-section">
      <div class="spot-rate-card">
        <div class="currency-display">
          <div class="flags-wrapper">
            <span :class="`fi fi-${selectedPairObj?.flagFrom}`" class="currency-flag"></span>
            <span class="exchange-arrow">→</span>
            <span :class="`fi fi-${selectedPairObj?.flagTo}`" class="currency-flag"></span>
          </div>
          <div class="pair-info">
            <div class="pair-name">{{ selectedPairObj?.displayName }}</div>
            <div class="pair-label">{{ selectedPair }}</div>
          </div>
        </div>
        <div class="rate-info">
          <div class="current-rate">{{ currentRate.rate.toFixed(4) }}</div>
          <div class="rate-change">
            <span class="change-value" :class="{
              'up': currentRate.change > 0,
              'down': currentRate.change < 0,
              'neutral': currentRate.change === 0
            }">
              {{ currentRate.change > 0 ? '+' : '' }}{{ currentRate.change.toFixed(4) }}
            </span>
            <span class="change-percent" :class="{
              'up': currentRate.change > 0,
              'down': currentRate.change < 0,
              'neutral': currentRate.change === 0
            }">
              {{ currentRate.change > 0 ? '+' : '' }}{{ currentRate.changePercent.toFixed(2) }}%
            </span>
          </div>
        </div>
      </div>
      
      <div class="control-panel">
        <!-- 货币对选择卡片 -->
        <div class="control-card">
          <div class="card-title">货币对</div>
          <el-select 
            v-model="selectedPair" 
            placeholder="选择货币对" 
            class="select-control">
            <el-option
              v-for="(pair, index) in currencyPairs"
              :key="index"
              :label="pair.label"
              :value="pair.label">
              {{ pair.displayName }}
            </el-option>
          </el-select>
        </div>

        <!-- 策略选择卡片 -->
        <div class="control-card">
          <div class="card-title">交易策略</div>
          <el-select
            v-model="selectedStrategy"
            placeholder="请选择策略"
            class="select-control">
            <el-option
              v-for="str in strategies"
              :key="str"
              :label="str"
              :value="str">
            </el-option>
          </el-select>
        </div>

        <!-- 时间跨度选择卡片 -->
        <div class="control-card">
          <div class="card-title">时间跨度</div>
          <div class="time-selector">
            <button 
              v-for="range in timeRanges" 
              :key="range"
              :class="['time-btn', { active: selectedTimeRange === range }]"
              @click="selectedTimeRange = range">
              {{ range }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 图表分析区域 -->
      <div class="analysis-section">
        <div class="section-header">
          <h3>技术分析</h3>
          <div class="section-tools">
            <!-- 这里可以添加一些工具按钮 -->
          </div>
        </div>
        <div class="charts-wrapper">
          <div class="chart-container main">
            <BacktestKline
              :currencyPair="selectedPair"
              :strategy="selectedStrategy"
              :timeRange="selectedTimeRange"
            />
          </div>
          <div class="chart-container main">
            <BacktestPredLine
              :currencyPair="selectedPair"
              :strategy="selectedStrategy"
              :timeRange="selectedTimeRange"
            />
          </div>
        </div>
      </div>

      <!-- 回测结果区域 -->
      <div class="results-section">
        <div class="section-header">
          <h3>回测结果</h3>
        </div>
        <div class="charts-wrapper">
          <div class="chart-container sub">
            <BacktestProfitCard
              :currencyPair="selectedPair"
              :strategy="selectedStrategy"
              :timeRange="selectedTimeRange"
            />
          </div>
          <div class="chart-container sub">
            <BacktestNetWorth
              :currencyPair="selectedPair"
              :strategy="selectedStrategy"
              :timeRange="selectedTimeRange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 - 添加渐变背景 */
.backtest-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffffff, #f8fafc) !important;
  padding: 24px 32px;
}

.page-header {
  margin-bottom: 24px;
  padding: 20px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b !important;
  margin: 0;
  position: relative;
  display: inline-block;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #1a237e, #0d47a1);
  border-radius: 2px;
}

/* 美化顶部卡片 */
.spot-rate-card {
  background: linear-gradient(135deg, #1e40af, #1e3a8a) !important;
  color: #ffffff !important;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(30, 64, 175, 0.15);
  border: none;
  position: relative;
  overflow: hidden;
}

/* 添加背景纹理 */
.spot-rate-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 150%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% -50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

.currency-display {
  display: flex;
  align-items: center;
  gap: 24px;
}

.flags-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.currency-flag {
  width: 64px;
  height: 48px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.exchange-arrow {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28px;
  margin: 0 4px;
}

.pair-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pair-name {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pair-label {
  font-size: 15px;
  opacity: 0.8;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
}

.rate-info {
  text-align: right;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 16px 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.current-rate {
  font-size: 42px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 1px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rate-change {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
  font-size: 15px;
}

.change-value, .change-percent {
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-panel {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* 美化控制卡片 */
.control-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  flex: 1;
  min-width: 250px;
  box-shadow: 0 4px 16px rgba(148, 163, 184, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.control-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(148, 163, 184, 0.15);
}

.card-title {
  font-size: 14px;
  color: #64748b !important;
  margin-bottom: 12px;
}

.time-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 美化时间按钮 */
.time-btn {
  padding: 8px 16px;
  border: none;
  background: #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #64748b;
  font-weight: 500;
}

.time-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.time-btn.active {
  background: linear-gradient(135deg, #1e40af, #1e3a8a);
  color: white;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analysis-section {
  margin-top: 32px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid #3b82f6;
}

.section-tools {
  display: flex;
  gap: 8px;
}

.charts-wrapper {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
}

/* 美化图表容器 */
.chart-container {
  background: #ffffff !important;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(148, 163, 184, 0.08);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  height: fit-content;
}

.chart-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e40af, #3b82f6);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chart-container:hover::before {
  opacity: 1;
}

.chart-container.main {
  min-height: 400px;
}

.chart-container.sub {
  min-height: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-wrapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .chart-container {
    width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .backtest-page {
    padding: 16px;
  }

  .spot-rate-card {
    flex-direction: column;
    align-items: center;  /* 居中对齐 */
    gap: 20px;
    padding: 24px;
  }

  .currency-display {
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .flags-wrapper {
    width: auto;  /* 改为自适应宽度 */
    padding: 16px;
    gap: 16px;
  }

  .currency-flag {
    width: 56px;
    height: 42px;
  }

  .pair-info {
    text-align: center;
  }

  .rate-info {
    width: auto;  /* 改为自适应宽度 */
    min-width: 200px;  /* 设置最小宽度 */
    max-width: 80%;   /* 设置最大宽度为容器的80% */
    text-align: center;
    margin: 0 auto;   /* 居中显示 */
  }

  .rate-change {
    justify-content: center;
    flex-wrap: wrap;  /* 允许在需要时换行 */
    gap: 8px;
  }

  .current-rate {
    font-size: 36px;  /* 稍微减小字体大小 */
  }

  .change-value, .change-percent {
    padding: 4px 10px;
    font-size: 14px;
  }
}

/* 添加平板尺寸的响应式设计 */
@media (min-width: 769px) and (max-width: 1024px) {
  .rate-info {
    width: auto;
    min-width: 250px;
    max-width: 60%;
  }
}

/* 添加一些微妙的动画效果 */
.chart-container {
  transition: transform 0.2s, box-shadow 0.2s;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 修改深色模式的触发条件 */
@media (prefers-color-scheme: dark) {
  .backtest-page[data-theme="dark"] {  /* 添加主题判断 */
    background: #1a1a1a !important;
  }
  
  .backtest-page[data-theme="dark"] .control-card,
  .backtest-page[data-theme="dark"] .chart-container {
    background: #242424 !important;
    color: #e0e0e0 !important;
  }
  
  .backtest-page[data-theme="dark"] .card-title {
    color: #999 !important;
  }
  
  .backtest-page[data-theme="dark"] .section-header h3 {
    color: #e0e0e0 !important;
  }
  
  .backtest-page[data-theme="dark"] .page-title {
    color: #e0e0e0 !important;
  }
}

/* 调整动画效果 */
.currency-flag {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.currency-flag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.exchange-arrow {
  transition: transform 0.3s ease;
}

.flags-wrapper:hover .exchange-arrow {
  transform: translateX(5px);
}

.change-value.up,
.change-percent.up {
  color: #ef4444;  /* 上涨显示红色 */
  background: rgba(239, 68, 68, 0.15);
}

.change-value.down,
.change-percent.down {
  color: #22c55e;  /* 下跌显示绿色 */
  background: rgba(34, 197, 94, 0.15);
}

.change-value.neutral,
.change-percent.neutral {
  color: #ffffff;  /* 持平显示白色 */
  background: rgba(255, 255, 255, 0.15);
}

/* 添加数据加载时的过渡效果 */
.current-rate,
.change-value,
.change-percent {
  transition: all 0.3s ease;
}
</style>