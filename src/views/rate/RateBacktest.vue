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
watch(currencyPair, () => {
  selectedCurrency.value = `${currencyPair.from}/${currencyPair.to}`;
});

// 时间跨度选择，默认 "1M"（1月）
const selectedTimeRange = ref("1M");
const timeRanges = ["1W", "1M", "1Q", "1Y", "3Y"];

// 根据时间范围返回对应数据点数量
const getCountFromTimeRange = (timeRange: string) => {
  switch (timeRange) {
    case "1W": return 7;
    case "1M": return 30;
    case "1Q": return 90;
    case "1Y": return 365;
    case "3Y": return 365 * 3;
    default: return 30;
  }
}

// 模拟的预测收益数据（假数据）
const fakeProfit = ref(5.2);

// ECharts K线图
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};
const updateChart = () => {
  if (!chartInstance) return;

  const count = getCountFromTimeRange(selectedTimeRange.value);
  const dates = [];
  const dataReal = [];  
  const dataPred = [];  
  const now = new Date();
  for (let i = 0; i < count; i++) {
  const date = new Date(now.getTime() - (count - i - 1) * 24 * 3600 * 1000);
  // 自定义格式化
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 补零
  const day = String(date.getDate()).padStart(2, '0');        // 补零
  dates.push(`${year}-${month}-${day}`); // e.g. "2025-03-18"

  dataReal.push((Math.random() * 10 + 90).toFixed(2));
  dataPred.push((Math.random() * 10 + 90).toFixed(2));
}

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['真实汇率', '预测汇率'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    dataZoom: [
    {
      type: 'slider',
      show: true,
      xAxisIndex: 0,
      start: 0,
      end: 100
    },
    {
      type: 'inside',     // 内部滚轮缩放
      xAxisIndex: 0, 
      // 也可以设置 start, end
    }
    ],
    series: [
      {
        name: '真实汇率',
        type: 'line',
        data: dataReal,
        smooth: true,
        markPoint: { data: [{ type: 'max', name: 'Buy' }, { type: 'min', name: 'Sell' }] }
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
watch([selectedCurrency, selectedTimeRange], () => {
  nextTick(() => { updateChart(); });
});
onMounted(() => { initChart(); });

// 阶段二：回测收益数据
const strategyList = [
  { name: 'Strategy 1', value: 'A' },
  { name: 'Strategy 2', value: 'B' },
  { name: 'Strategy 3', value: 'C' },
];
const selectedStrategy = ref(strategyList[0].value);
const cumulativeYield = ref('5.20');
const annualYield = ref('4.10');
const maxDrawdown = ref('-2.30');
const yieldChartRef = ref<HTMLElement | null>(null);
let yieldChartInstance: echarts.ECharts | null = null;
const initYieldChart = () => {
  if (yieldChartRef.value) {
    yieldChartInstance = echarts.init(yieldChartRef.value);
    updateYieldChart();
  }
};
const updateYieldChart = () => {
  if (!yieldChartInstance) return;
  const count = getCountFromTimeRange(selectedTimeRange.value);
  const dates = [];
  const yieldData = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - (count - i - 1) * 24 * 3600 * 1000);
    // 与上方图表相同的日期格式, e.g. "2025-03-19"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);

    yieldData.push((Math.random() * 2 + 4).toFixed(2));
  }
  const option = {
    tooltip: { trigger: 'axis' },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100
      },
      {
        type: 'inside', // 滚轮/手势缩放
        xAxisIndex: 0
      }
    ],
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [{
      name: '累计收益率',
      type: 'line',
      data: yieldData,
      smooth: true,
      lineStyle: { width: 2 }
    }]
  };
  yieldChartInstance.setOption(option);
};
watch([selectedStrategy, selectedTimeRange], () => {
  cumulativeYield.value = (Math.random() * 10).toFixed(2);
  annualYield.value = (Math.random() * 10).toFixed(2);
  maxDrawdown.value = (-Math.random() * 5).toFixed(2);
  nextTick(() => { updateYieldChart(); });
});
onMounted(() => { initYieldChart(); });
</script>

<template>
    <el-container>
      <!-- Header 区域 -->
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

      <!-- K线图展示区域 -->
      <el-main class="chart-area">
        <div ref="chartRef" class="kline-chart"></div>
      </el-main>

      <!-- 回测收益数据区域 -->
      <el-footer class="profit-area">
        <!-- 策略选择下拉框 -->
        <el-row :gutter="20" class="strategy-row">
          <el-col :span="12">
            <el-select v-model="selectedStrategy" placeholder="选择策略">
              <el-option
                v-for="(strategy, index) in strategyList"
                :key="index"
                :label="strategy.name"
                :value="strategy.value">
              </el-option>
            </el-select>
          </el-col>
        </el-row>

        <!-- 收益率展示卡片 -->
        <el-card class="profit-card">
          <div class="profit-content">
            <span>累计收益率: </span>
            <span class="profit-value">{{ cumulativeYield }}%</span>
          </div>
          <div class="profit-content">
            <span>年化收益率: </span>
            <span class="profit-value">{{ annualYield }}%</span>
          </div>
          <div class="profit-content">
            <span>最大回撤: </span>
            <span class="profit-value">{{ maxDrawdown }}%</span>
          </div>
        </el-card>

        <!-- 收益率曲线图 -->
        <div ref="yieldChartRef" class="yield-chart"></div>
      </el-footer>
    </el-container>

</template>

<style scoped>
/* 外层统一滚动容器 */
.prediction-board {
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  height: 100vh;          /* 固定高度为视口高度 */
  overflow-y: auto;       /* 仅外层产生滚动条 */
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* 重置 Element Plus 内部容器默认高度 */
.el-container,
.el-header,
.el-main,
.el-footer {
  height: auto !important;
  overflow: visible !important;
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
  margin-top: 50px;
  margin-bottom: 20px;
}
.kline-chart {
  margin-top: 20px;
  width: 100%;
  height: 400px;
  border: 1px solid #eee;
}

/* 收益展示区域 */
.profit-area {
  margin-top: 20px;
}
.strategy-row {
  margin-bottom: 20px;
}
.profit-card {
  padding: 10px;
  text-align: center;
  margin-bottom: 20px;
}
.profit-content {
  font-size: 1.2em;
  margin: 5px 0;
}
.profit-value {
  color: #00a854;
  margin-left: 5px;
}

/* 收益率曲线图 */
.yield-chart {
  width: 100%;
  height: 300px;
  border: 1px solid #eee;
}
</style>
