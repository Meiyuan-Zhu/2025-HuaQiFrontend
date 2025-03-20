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
    <!-- 1. 顶部导航保持不变，这里仅占位 -->
    <header class="navbar-placeholder">
      <h2>汇率回测</h2>
    </header>

    <!-- 2. 第一行：货币对 & 策略 & 时间跨度 -->
    <div class="row">
      <!-- 货币对选择卡片 -->
      <div class="card">
        <el-select 
        v-model="selectedPair" 
        placeholder="选择货币对" 
        style="width: 100%;">
          <el-option
            v-for="(pair, index) in currencyPairs"
            :key="index"
            :label="pair.label"
            :value="pair.label"
          >
          {{ pair.displayName }} / {{ pair.label }}
          </el-option>
        </el-select>

        <!-- 下面这块用来居中显示国旗 -->
        <div
          class="flag-display"
          v-if="selectedPairObj"
        >
          <!-- 国旗From -->
          <span
            :class="`fi fi-${selectedPairObj.flagFrom}`"
            class="big-flag"
          ></span>
          <span class="separator"> / </span>
          <!-- 国旗To -->
          <span
            :class="`fi fi-${selectedPairObj.flagTo}`"
            class="big-flag"
          ></span>
        </div>
      </div>

      <!-- 策略选择卡片 -->
      <div class="card">
        <el-select
          v-model="selectedStrategy"
          placeholder="请选择策略"
          style="width: 100%"
        >
        <el-option
            v-for="str in strategies"
            :key="str"
            :label="str"
            :value="str"
          >
            {{ str }}
          </el-option>
      </el-select>

      <!-- 卡片中间显示选中的策略文字 -->
      <div class="strategy-display" v-if="selectedStrategy">
          <p class="selected-str-text">
            当前策略：<strong>{{ selectedStrategy }}</strong>
          </p>
        </div>
      </div>

      <!-- 时间跨度选择卡片 -->
      <div class="card">
        <h3>时间跨度</h3>
        <div class="radio-group">
          <label v-for="range in timeRanges" :key="range">
            <input type="radio" :value="range" v-model="selectedTimeRange" />
            {{ range }}
          </label>
        </div>
      </div>
    </div>

    <!-- 3. 第二行：回测K线图 & 预测折线图 -->
    <div class="row">
      <div class="card">
        <!-- 这里使用子组件BacktestKline -->
        <BacktestKline
          :currencyPair="selectedPair"
          :strategy="selectedStrategy"
          :timeRange="selectedTimeRange"
        /> 
      </div>

      <div class="card">
        <BacktestPredLine
          :currencyPair="selectedPair"
          :strategy="selectedStrategy"
          :timeRange="selectedTimeRange"
        />
      </div>
    </div>

    <!-- 4. 第三行：回测收益指标（卡片） + 净值曲线图 -->
    <div class="row">
      <!-- 回测收益指标卡片 -->
      <div class="card">
        <BacktestProfitCard
          :currencyPair="selectedPair"
          :strategy="selectedStrategy"
          :timeRange="selectedTimeRange"
        />
      </div>

      <!-- 净值曲线图卡片 -->
      <div class="card">
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
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  background: #fafafa;
}
.navbar-placeholder {
  padding: 10px;
  margin-bottom: 20px;
  background: #ddd;
  text-align: center;
}
.row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.card {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  background: #fff;
}

/* 让国旗居中显示 */
.flag-display {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* 大国旗图标 */
.big-flag {
  width: 2em; /* 你想要多大就改 */
  height: 2em;
}
.separator {
  font-weight: bold;
}

/* 选中策略文字样式，可随意修改 */
.strategy-display {
  margin-top: 20px;
  text-align: center;
}
.selected-str-text {
  font-size: 1.1rem;
  color: #333;
}
</style>