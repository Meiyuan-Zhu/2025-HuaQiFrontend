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

// 获取实时汇率数据的函数
const ALL_FOREX_API = "http://127.0.0.1:4523/m1/5986862-5675261-default/get_all_forex?apifoxApiId=273598691";

async function fetchCurrentRate() {
  try {
    const res = await axios.get(ALL_FOREX_API);
    if (res.data && res.data.data) {
      // 找到对应的货币对数据
      const rateData = res.data.data.find((item: any) => {
        // 从 selectedPair (如 "CNY/JPY") 中提取目标货币代码
        const targetCurrency = selectedPair.value.split('/')[1];
        return item.currency_code === targetCurrency;
      });
      
      if (rateData) {
        // 使用中间价作为当前汇率
        const rate = Number(rateData.central_parity);
        const change = Number(rateData.change_rate);
        
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

onMounted(() => {
  fetchCurrentRate();
  // 每60秒刷新一次数据
  refreshTimer = window.setInterval(fetchCurrentRate, 60000);
});

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
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
.backtest-page {
  width: 100%;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  padding: 20px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
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

.spot-rate-card {
  background: linear-gradient(135deg, #1a237e, #0d47a1);
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
}

.pair-label {
  font-size: 15px;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.rate-info {
  text-align: right;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
}

.current-rate {
  font-size: 42px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 1px;
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
}

.control-panel {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.control-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  flex: 1;
  min-width: 250px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.time-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.time-btn {
  padding: 6px 12px;
  border: none;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-btn.active {
  background: #1a237e;
  color: white;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.charts-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-container.main {
  min-height: 400px;
}

.chart-container.sub {
  min-height: 300px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-wrapper {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
  }
  
  .control-card {
    width: 100%;
  }

  .spot-rate-card {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  .rate-info {
    width: 100%;
    text-align: center;
  }

  .rate-change {
    justify-content: center;
  }
  
  .currency-flag {
    width: 56px;
    height: 42px;
  }

  .flags-wrapper {
    padding: 16px;
    gap: 16px;
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

/* 添加深色模式支持 */
@media (prefers-color-scheme: dark) {
  .backtest-page {
    background: #1a1a1a;
  }
  
  .control-card,
  .chart-container {
    background: #242424;
    color: #e0e0e0;
  }
  
  .card-title {
    color: #999;
  }
  
  .section-header h3 {
    color: #e0e0e0;
  }
  
  .time-btn {
    background: #333;
    color: #e0e0e0;
  }
  
  .time-btn.active {
    background: #3949ab;
  }
  
  .page-title {
    color: #e0e0e0;
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