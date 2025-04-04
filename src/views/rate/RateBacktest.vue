<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { ElSelect, ElOption, ElTooltip } from "element-plus";
import "element-plus/es/components/select/style/css";
import "element-plus/es/components/option/style/css";
import "element-plus/es/components/tooltip/style/css";
import "element-plus/es/components/loading/style/css";
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
          change: rate - rate / (1 + change),
          // 计算涨跌百分比
          changePercent: change
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

// 修改提示框状态和逻辑
const showTooltip = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipTarget = ref<HTMLElement | null>(null);

// 点击页面其他地方关闭提示框
const handleClickOutside = (event: MouseEvent) => {
  if (showTooltip.value && tooltipTarget.value && !tooltipTarget.value.contains(event.target as Node)) {
    showTooltip.value = false;
  }
};

// 在组件挂载时添加点击事件监听
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

  document.addEventListener('click', handleClickOutside);
});

// 在组件卸载时移除点击事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 修改策略描述的计算属性，使用selectedStrategy而不是hoveredStrategy
const strategyDescription = computed(() => {
  const strategyDescriptions: Record<string, { title: string, content: string }> = {
    "Aberration": {
      title: "Aberration策略",
      content: "利用 35 日移动平均线和标准差设上中下轨，突破上/下轨开多/空，穿中轨平仓以捕捉趋势。"
    },
    "DualThrust": {
      title: "DualThrust策略",
      content: "计算前 N 天价格区间，开盘价加减触发值定上下轨，突破上/下轨买入/卖出。"
    },
    "MACD": {
      title: "MACD策略",
      content: "指数平滑异同移动平均线策略。通过 12 日与 26 日 EMA 差值（DIF）及 9 日 EMA（DEA）交叉，金叉买、死叉卖。"
    },
    "Model": {
      title: "Model策略",
      content: "直接依据 MTGNN 模型预测，未来 5 天 4 天高于今价买入，反之卖出。"
    },
    "Momentum": {
      title: "Momentum策略",
      content: "趋势跟踪策略，根据最近几天连续上涨行的天数来反应趋势，反应灵敏，适合高流动性、短期趋势明确市场，捕捉短期趋势。"
    },
    "Window": {
      title: "Window策略",
      content: "以当前价在过去 5 天及模型预测未来 5 天共 11 天中为极值判断买卖，极值处买卖。"
    }
  };
  
  const enhancedDescriptions: Record<string, { title: string, content: string }> = {
    "Aberration": {
      title: "Aberration Enhanced策略",
      content: "Aberration 策略结合 MTGNN 模型，模型辅助判断，减少盲目及滞后交易。具体以买入为例，有两种情况下会买入，一是Aberration判断要买入时需要模型同时预测未来五天中至少有一天是高于现值的（为了预防盲目交易），二是模型预测未来5天全高于现价时买入（为了针对滞后交易）。卖出时同理。"
    },
    "Momentum": {
      title: "Momentum Enhanced策略",
      content: "Momentum 策略结合 MTGNN 模型，模型过滤信号，降低风险，优化交易条件。即momentum判断要买入时必须模型同时判断有至少3天价格高于今价才可买入 or 模型判断未来5天价格都高于今天的，卖出时同理。"
    },
    "Window": {
      title: "Windows Enhanced策略",
      content: "Windows 法结合 MTGNN 模型，进一步优化基于价格极值的买卖判断。具体而言以过去五天以及模型预测未来五天为基础判断。"
    },
    "DualThrust": {
      title: "Dual Thrust Enhanced策略",
      content: "Dual Thrust 策略结合 MTGNN 模型，模型确认突破趋势后再执行买卖，根据后5天的趋势判断是突破行情还是反弹行情。"
    },
    "MACD": {
      title: "MACD Enhanced策略",
      content: "MACD 策略结合 MTGNN 模型，模型辅助判断，减少最大回撤及波动。有两种情况下会买入，一是MACD判断要买入时需要模型同时预测未来五天中至少有一天是高于现值的（为了预防盲目交易），二是模型预测未来5天全高于现价时买入（为了针对滞后交易）。卖出时同理。"
    }
  };
  
  // 获取基础策略名称（移除可能的 "Enhanced" 后缀）
  const baseStrategy = selectedStrategy.value.replace(" Enhanced", "");
  
  // 获取基础策略描述
  const baseDesc = strategyDescriptions[baseStrategy];
  
  // 构建HTML格式的描述
  let htmlDesc = '';
  
  if (baseDesc) {
    htmlDesc += `<strong>${baseDesc.title}</strong>：${baseDesc.content}`;
  }
  
  // 如果不是Model策略，添加增强版策略描述
  if (baseStrategy !== "Model") {
    const enhancedDesc = enhancedDescriptions[baseStrategy];
    if (enhancedDesc) {
      htmlDesc += `<br><br><strong>${enhancedDesc.title}</strong>：${enhancedDesc.content}`;
    }
  }
  
  return htmlDesc;
});

// 添加加载状态控制
const klineLoading = ref(false);
const predLineLoading = ref(false);
const netWorthLoading = ref(false);
const profitCardLoading = ref(false);

// 添加处理加载状态的方法
const handleKlineLoadingChange = (loading: boolean) => {
  klineLoading.value = loading;
};

const handlePredLineLoadingChange = (loading: boolean) => {
  predLineLoading.value = loading;
};

const handleNetWorthLoadingChange = (loading: boolean) => {
  netWorthLoading.value = loading;
};

const handleProfitCardLoadingChange = (loading: boolean) => {
  profitCardLoading.value = loading;
};
</script>
<template>
  <div class="backtest-page" :data-theme="theme">
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
          <div class="card-title-container">
            <div class="card-title">策略选择</div>
            <el-tooltip
              class="strategy-info-tooltip"
              effect="light"
              placement="top"
              :content="strategyDescription"
              :enterable="false"
              :show-after="300"
              popper-class="strategy-tooltip-popper"
              raw-content
            >
              <div class="info-icon">
                <i class="el-icon-info">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-info">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </i>
              </div>
            </el-tooltip>
          </div>
          <div class="strategy-selector">
            <el-select v-model="selectedStrategy" placeholder="选择策略" class="strategy-select">
              <el-option
                v-for="strategy in strategies"
                :key="strategy"
                :label="strategy"
                :value="strategy"
              />
            </el-select>
          </div>
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

    <!-- 自定义提示框 -->
    <div 
      v-if="showTooltip" 
      class="custom-tooltip"
      :style="{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`
      }"
      v-html="strategyDescription"
    ></div>

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
              @loading-change="handleKlineLoadingChange"
            />
            <div v-if="klineLoading" class="loading-overlay">
              <div class="loading-spinner"></div>
              <div class="loading-text">加载K线数据中...</div>
            </div>
          </div>
          <div class="chart-container main">
            <BacktestPredLine
              :currencyPair="selectedPair"
              :strategy="selectedStrategy"
              :timeRange="selectedTimeRange"
              @loading-change="handlePredLineLoadingChange"
            />
            <div v-if="predLineLoading" class="loading-overlay">
              <div class="loading-spinner"></div>
              <div class="loading-text">加载预测数据中...</div>
            </div>
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
              :klineLoaded="!klineLoading"
              :predLineLoaded="!predLineLoading"
              @loading-change="handleProfitCardLoadingChange"
            />
            <div v-if="profitCardLoading" class="loading-overlay">
              <div class="loading-spinner"></div>
              <div class="loading-text">加载收益数据中...</div>
            </div>
          </div>
          <div class="chart-container sub">
            <BacktestNetWorth
              :currencyPair="selectedPair"
              :strategy="selectedStrategy"
              :timeRange="selectedTimeRange"
              @loading-change="handleNetWorthLoadingChange"
            />
            <div v-if="netWorthLoading" class="loading-overlay">
              <div class="loading-spinner"></div>
              <div class="loading-text">加载净值数据中...</div>
            </div>
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
  overflow-y: auto;
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
  padding: 16px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 修改策略选择器布局为两行三列 */
.strategy-selector {
  width: 100%;
  margin-top: -10px;
}

.strategy-select {
  width: 100%;
}

/* 确保所有el-select组件样式一致 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  height: 40px;  /* 统一高度 */
  padding: 0 12px;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
}

/* 深色模式下的输入框样式 */
@media (prefers-color-scheme: dark) {
  .backtest-page[data-theme="dark"] :deep(.el-input__wrapper) {
    background-color: #1e293b;
    border-color: #334155;
    color: #e2e8f0;
  }
  
  .backtest-page[data-theme="dark"] :deep(.el-input__wrapper:hover) {
    border-color: #475569;
  }
  
  .backtest-page[data-theme="dark"] :deep(.el-input__wrapper.is-focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3) !important;
  }
  
  .backtest-page[data-theme="dark"] :deep(.el-select-dropdown__item) {
    color: #e2e8f0;
  }
  
  .backtest-page[data-theme="dark"] :deep(.el-select-dropdown__item.hover) {
    background-color: #334155;
  }
  
  .backtest-page[data-theme="dark"] :deep(.el-select-dropdown__item.selected) {
    color: #3b82f6;
  }
}

/* 控制卡片内部元素间距 */
.control-card .card-title-container {
  margin-bottom: 12px;
}

/* 确保所有控制卡片内的选择器有一致的间距 */
.control-card .el-select {
  margin-bottom: 0;
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

/* 自定义提示框样式 */
.custom-tooltip {
  position: absolute;
  z-index: 9999;
  max-width: 300px;
  line-height: 1.6;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  white-space: pre-wrap;
  word-break: break-word;
  animation: fadeIn 0.2s ease-in-out;
}

.custom-tooltip :deep(strong) {
  font-weight: 600;
  color: #0055bb;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 深色模式下的提示框样式 */
@media (prefers-color-scheme: dark) {
  .backtest-page[data-theme="dark"] .custom-tooltip {
    background: #2d3748;
    color: #e2e8f0;
    border-color: #4a5568;
  }
  
  .backtest-page[data-theme="dark"] .custom-tooltip :deep(strong) {
    color: #60a5fa;
  }
}

/* 修改策略选择器样式 */
.card-title-container {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0px;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.3s;
  margin-top: -2px;
  position: relative;
  top: -1px;
}

.info-icon:hover {
  color: #3b82f6;
}

.info-icon svg {
  width: 100%;
  height: 100%;
}

/* 自定义tooltip样式 */
:deep(.strategy-tooltip-popper) {
  max-width: 300px !important;
  line-height: 1.6;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.strategy-tooltip-popper strong) {
  font-weight: 600;
  color: #0055bb;
}

/* 深色模式下的tooltip样式 */
@media (prefers-color-scheme: dark) {
  .backtest-page[data-theme="dark"] :deep(.strategy-tooltip-popper) {
    background: #2d3748;
    color: #e2e8f0;
    border-color: #4a5568;
  }
  
  .backtest-page[data-theme="dark"] :deep(.strategy-tooltip-popper strong) {
    color: #60a5fa;
  }
  
  .backtest-page[data-theme="dark"] .info-icon {
    color: #94a3b8;
  }
  
  .backtest-page[data-theme="dark"] .info-icon:hover {
    color: #60a5fa;
  }
}

/* 添加加载动画样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 16px;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 深色模式下的加载动画样式 */
@media (prefers-color-scheme: dark) {
  .backtest-page[data-theme="dark"] .loading-overlay {
    background: rgba(30, 41, 59, 0.8);
  }
  
  .backtest-page[data-theme="dark"] .loading-spinner {
    border-color: #334155;
    border-top-color: #60a5fa;
  }
  
  .backtest-page[data-theme="dark"] .loading-text {
    color: #e2e8f0;
  }
}
</style>