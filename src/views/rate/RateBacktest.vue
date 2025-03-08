<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getCurrencyFlag } from "../../utils/index";

// 当前货币对
const currencyPair = reactive({
  from: 'CNY',
  to: 'USD'
})

// 可供选择的货币对
const currencyList = [
  { from: 'CNY', to: 'USD' },
  { from: 'CNY', to: 'EUR' },
  { from: 'CNY', to: 'JPY' },
  { from: 'CNY', to: 'AUD' },
]

// 选中的货币对
const selectedCurrency = ref(`${currencyPair.from}/${currencyPair.to}`);
const selectCurrency = (value: string) => {
  const [from, to] = value.split('/');
  currencyPair.from = from;
  currencyPair.to = to;
  console.log('选中的货币对：', currencyPair);
}

// 监听 currencyPair 的变化，更新 selectedCurrency
watch(currencyPair, () => {
  selectedCurrency.value = `${currencyPair.from}/${currencyPair.to}`;
});

// 时间跨度选择，默认 "1M"（1月）
const selectedTimeRange = ref("1M");
const timeRanges = ["1W", "1M", "1Q", "1Y", "3Y"];

// 模拟的预测收益数据（假数据）
const fakeProfit = ref(5.2);

// ECharts 实例和容器引用
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 初始化图表，并设置假数据
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};

// 模拟生成 K 线图数据（这里只是简单生成假数据）
const updateChart = () => {
  if (!chartInstance) return;

  // 模拟日期
  const dates = [];
  const dataReal = [];  // 真实汇率
  const dataPred = [];  // 预测汇率
  const now = new Date();
  const count = 30;
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - (count - i - 1) * 24 * 3600 * 1000);
    dates.push(`${date.getMonth()+1}-${date.getDate()}`);
    // 随机生成假数据
    dataReal.push((Math.random() * 10 + 90).toFixed(2));
    dataPred.push((Math.random() * 10 + 90).toFixed(2));
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['真实汇率', '预测汇率']
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '真实汇率',
        type: 'line',
        data: dataReal,
        smooth: true,
        // 在需要时可以添加 markPoint 标记买卖点
        markPoint: {
          data: [
            { type: 'max', name: 'Buy' },
            { type: 'min', name: 'Sell' }
          ]
        }
      },
      {
        name: '预测汇率',
        type: 'line',
        data: dataPred,
        smooth: true
      }
    ]
  };

  chartInstance.setOption(option);
};

// 当货币对或时间跨度发生变化时，更新图表（目前仍用假数据）
watch([selectedCurrency, selectedTimeRange], () => {
  nextTick(() => {
    updateChart();
  });
});

// 初始化图表
onMounted(() => {
  initChart();
});
</script>

<template>
  <el-main>
    <el-container class="prediction-board">
      <!-- 主要内容区域 -->
      <el-main class="main-board">
        <el-container>
          <el-header class="header-area">
            <h2 class="page-title">汇率回测</h2>
            <el-row :gutter="20" class="header-row">
              <!-- 货币对选择 -->
              <el-col :span="8">
                <el-select v-model="selectedCurrency" placeholder="选择货币对" @change="selectCurrency">
                  <el-option
                    v-for="(item, index) in currencyList"
                    :key="index"
                    :label="`${item.from}/${item.to}`"
                    :value="`${item.from}/${item.to}`">
                    <template #default="{ label }">
                      <span :class="`fi fi-${getCurrencyFlag(item.from)}`" class="currency-flag"></span>
                      <span class="separator">/</span>
                      <span :class="`fi fi-${getCurrencyFlag(item.to)}`" class="currency-flag"></span>
                      <span style="padding: 2px;"></span>
                      <span>{{ item.from }}</span>
                      <span class="separator">/</span>
                      <span>{{ item.to }}</span>
                    </template>
                  </el-option>
                </el-select>
              </el-col>
              <!-- 时间跨度选择 -->
              <el-col :span="8">
                <el-radio-group v-model="selectedTimeRange">
                  <el-radio-button label="1W">1周</el-radio-button>
                  <el-radio-button label="1M">1月</el-radio-button>
                  <el-radio-button label="1Q">1季</el-radio-button>
                  <el-radio-button label="1Y">1年</el-radio-button>
                  <el-radio-button label="3Y">3年</el-radio-button>
                </el-radio-group>
              </el-col>
            </el-row>
          </el-header>

          <el-main class="chart-area">
            <!-- K线图展示区域 -->
            <div ref="chartRef" class="kline-chart"></div>
          </el-main>

          <el-footer class="profit-area">
            <!-- 预测收益数据展示区 -->
            <el-card class="profit-card">
              <div class="profit-content">
                <span>预测收益率: </span>
                <span class="profit-value">{{ fakeProfit }}%</span>
              </div>
            </el-card>
          </el-footer>
        </el-container>
      </el-main>
    </el-container>
  </el-main>
</template>

<style scoped>
.prediction-board {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 90%;
  margin: 20px auto;
  padding: 20px;
}

/* 页面主要内容区域 */
.main-board {
  width: 100%;
}

/* Header 区域 */
.header-area {
  margin-bottom: 20px;
}
.page-title {
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 20px;
}
.header-row {
  align-items: center;
}

/* 货币对选择样式 */
.currency-flag {
  width: 1.5em;
  height: 1.5em;
  margin-right: 4px;
}
.separator {
  color: #6b7280;
  font-weight: bold;
  margin: 0 4px;
}

/* 图表区域 */
.chart-area {
  margin-bottom: 20px;
}
.kline-chart {
  width: 100%;
  height: 400px;
  border: 1px solid #eee;
}

/* 收益展示区域 */
.profit-area {
  margin-top: 20px;
}
.profit-card {
  padding: 10px;
  text-align: center;
}
.profit-content {
  font-size: 1.2em;
  font-weight: bold;
}
.profit-value {
  color: #00a854;
  margin-left: 5px;
}
</style>
