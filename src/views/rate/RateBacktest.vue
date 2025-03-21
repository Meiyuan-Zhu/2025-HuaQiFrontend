<script setup lang="ts">
import { ref, computed } from "vue";
import { ElSelect, ElOption } from "element-plus";
import "element-plus/es/components/select/style/css";
import "element-plus/es/components/option/style/css";
import BacktestKline from "./BacktestKline.vue"; 
import BacktestPredLine from "./BacktestPredLine.vue";
import BacktestNetWorth from "./BacktestNetWorth.vue";
import BacktestProfitCard from "./BacktestProfitCard.vue";


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

</script>
<template>
  <div class="backtest-page">
    <!-- 顶部标题改为更现代的样式 -->
    <header class="navbar">
      <h2>汇率回测分析</h2>
    </header>

    <!-- 第一行控制面板 -->
    <div class="control-panel">
      <!-- 货币对选择卡片 -->
      <div class="card currency-card">
        <div class="card-title">货币对</div>
        <el-select 
          v-model="selectedPair" 
          placeholder="选择货币对" 
          class="select-control">
          <!-- ... existing code ... -->
        </el-select>

        <div class="flag-display" v-if="selectedPairObj">
          <span :class="`fi fi-${selectedPairObj.flagFrom}`" class="big-flag"></span>
          <span class="separator">/</span>
          <span :class="`fi fi-${selectedPairObj.flagTo}`" class="big-flag"></span>
        </div>
      </div>

      <!-- 策略选择卡片 -->
      <div class="card strategy-card">
        <div class="card-title">交易策略</div>
        <el-select
          v-model="selectedStrategy"
          placeholder="请选择策略"
          class="select-control">
          <!-- ... existing code ... -->
        </el-select>

        <div class="strategy-display" v-if="selectedStrategy">
          <p class="selected-str-text">
            当前策略：<strong>{{ selectedStrategy }}</strong>
          </p>
        </div>
      </div>

      <!-- 时间跨度选择卡片 -->
      <div class="card timerange-card">
        <div class="card-title">时间跨度</div>
        <div class="radio-group">
          <label v-for="range in timeRanges" :key="range" class="radio-label">
            <input type="radio" :value="range" v-model="selectedTimeRange" />
            <span class="radio-text">{{ range }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 图表区域使用瀑布流布局 -->
    <div class="charts-container">
      <div class="chart-card">
        <BacktestKline
          :currencyPair="selectedPair"
          :strategy="selectedStrategy"
          :timeRange="selectedTimeRange"
        />
      </div>

      <div class="chart-card">
        <BacktestPredLine
          :currencyPair="selectedPair"
          :strategy="selectedStrategy"
          :timeRange="selectedTimeRange"
        />
      </div>

      <div class="chart-card">
        <BacktestProfitCard
          :currencyPair="selectedPair"
          :strategy="selectedStrategy"
          :timeRange="selectedTimeRange"
        />
      </div>

      <div class="chart-card">
        <BacktestNetWorth
          :currencyPair="selectedPair"
          :strategy="selectedStrategy"
          :timeRange="selectedTimeRange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.backtest-page {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.navbar {
  padding: 20px 0;
  margin-bottom: 30px;
}

.navbar h2 {
  font-size: 24px;
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 15px;
  font-weight: 500;
}

.select-control {
  width: 100%;
}

.flag-display {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.big-flag {
  width: 2.5em;
  height: 2.5em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.separator {
  font-weight: 500;
  color: #909399;
  font-size: 1.2em;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  background: #f5f7fa;
  transition: background 0.2s;
}

.radio-label:hover {
  background: #e4e7ed;
}

.radio-label input[type="radio"] {
  margin-right: 8px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  min-height: 300px;
}

.strategy-display {
  margin-top: 15px;
  text-align: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
}

.selected-str-text {
  margin: 0;
  color: #409EFF;
  font-size: 14px;
}

@media (max-width: 768px) {
  .control-panel {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>