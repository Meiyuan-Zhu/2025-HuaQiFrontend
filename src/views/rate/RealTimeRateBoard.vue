<template>
  <el-main class="rate-container">
    <!-- 顶部：基准货币选择、搜索框 -->
    <el-header class="header">
      <h1 class="page-title">今日汇率</h1>
    </el-header>

    <!-- 卡片列表布局：替换表格 -->
    <div class="card-list">
          <!-- 单个汇率卡片（点击可查看趋势） -->
          <div class="exact-card"
        v-for="item in filteredRates"
        :key="item.id"
        :class="{'trend-up': item.isUp, 'trend-down': !item.isUp}"
        @click="showTrend(item)">
            <div class="card-content">
              <!-- 左边：货币代码、中文货币名、日期 -->
              <div class="left-part">
                <div class="top-line">
                  <span class="big-currency">{{ item.currency }}</span>
                </div>
                <div class="zh-currency">{{ item.currency_name }}</div>
                <span class="date">{{ item.updateTime }}</span>
              </div>

              <!-- 右边：买入价、卖出价、中间价 -->
              <div class="right-part">
                <div class="diff-row">
                  <span class="big-diff">{{ item.diffVal }}</span>
                  <span :class="item.isUp ? 'arrow-up' : 'arrow-down'">
                    {{ item.isUp ? '⬆' : '⬇' }}
                  </span>
                </div>
                
                <div class="price-line">
                  <span class="price-label">买入价</span>
                  <span class="price-value">{{ item.buy }}</span>
                </div>
                <div class="price-line">
                  <span class="price-label">卖出价</span>
                  <span class="price-value">{{ item.sell }}</span>
                </div>
                <div class="price-line">
                  <span class="price-label">中间价</span>
                  <span class="price-value">{{ item.mid }}</span>
                </div>
              </div>
            </div>
          </div>
    </div>

    <!-- 汇率趋势弹窗 -->
    <el-dialog
      v-model="showTrendModal"
      title="汇率变化趋势"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="trend-content">
        <el-row :gutter="20" class="trend-controls">
          <el-col :span="8">
            <div class="currency-pair">
              <el-select 
              v-model="fromCurrency" 
              class="currency-select" 
              @change="updateTrendData">
                <el-option
                  v-for="currency in availableCurrencies"
                  :key="currency"
                  :value="currency"
                >
                  <div style="display: flex;align-items: center;">
                    <span :class="`fi fi-${getCurrencyFlag(currency)}`" class="currency-flag"></span>
                    {{ currency }}
                  </div>
                </el-option>
              </el-select>
              <span class="currency-separator">=></span>
              <el-select v-model="toCurrency" class="currency-select" @change="updateTrendData">
                <el-option
                  v-for="currency in availableCurrencies"
                  :key="currency"
                  :value="currency"
                >
                  <div style="display: flex;align-items: center;">
                    <span :class="`fi fi-${getCurrencyFlag(currency)}`" class="currency-flag"></span>
                    {{ currency }}
                  </div>
                </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="8"></el-col>
          <el-col :span="8">
            <el-select
              v-model="trendPeriod"
              @change="updateTrendData"
              style="width: 35%;left: 65%;"
            >
              <el-option value="week">近一周</el-option>
              <el-option value="month">近一月</el-option>
              <el-option value="year">近一年</el-option>
            </el-select>
          </el-col>
        </el-row>

        <v-chart class="trend-chart" :option="chartOption" autoresize />
      </div>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import backgroundImage from "../../assets/background2.webp";

// ECharts & Vue-ECharts
import * as echarts from "echarts";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { 
  GridComponent, 
  TooltipComponent, 
  TitleComponent, 
  LegendComponent 
} from "echarts/components";
import VChart from "vue-echarts";
use([
  CanvasRenderer, 
  LineChart, 
  GridComponent, 
  TooltipComponent, 
  TitleComponent, 
  LegendComponent
]);

import { getCurrencyFlag } from "../../utils/index";


// ================== 接口定义 ================== //
interface RateItem {
  id: number;
  currency: string; // 对应接口字段 currency_code
  currency_name: string; // 对应接口字段 currency_name
  fromRate: number; 
  toRate: number;   
  updateTime: string; //date
  buy_price: number;
  sell_price: number;
  change_rate: number;
}

interface TrendDataItem {
  date: string;
  rate: number;
}

// ================== 响应式数据 ================== //
const baseCurrency = ref("CNY");   
const searchQuery = ref("");
const selectedTimeRange = ref("1W");

const showTrendModal = ref(false);
const fromCurrency = ref("USD");
const toCurrency = ref("CNY");
const trendPeriod = ref("week");
const trendData = ref<TrendDataItem[]>([]);

// 示例汇率列表
const rateList = ref<RateItem[]>([]);

// 所有可选货币
const availableCurrencies = ["CNY", "USD", "EUR", "GBP", "JPY"];

// ================== 过滤 ================== //
const filteredRates = computed(() => {
  return rateList.value.map((r, index) => {
    const diff = r.change_rate;
    const isUp = diff >= 0;
    return {
      id: r.id || index + 1,
      currency: r.currency,
      currency_name: r.currency_name,
      updateTime: r.updateTime,
      fromRate: r.toRate - r.change_rate,
      toRate: r.toRate,
      diffVal: diff.toFixed(2),
      isUp,
      buy: r.buy_price.toFixed(2),
      sell: r.sell_price.toFixed(2),
      mid: r.toRate.toFixed(2),
    };
  }).filter((item) =>
    item.currency.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// ================== 接口调用 ================== //
// 接口1：获取所有外汇列表
const ALL_FOREX_API = "http://127.0.0.1:4523/m1/5986862-5675261-default/get_all_forex?apifoxApiId=273598691";
// 接口2：获取单个外汇数据（趋势数据）
const SINGLE_FOREX_API = "http://127.0.0.1:4523/m1/5986862-5675261-default/get_forex?apifoxApiId=273598878";

async function fetchAllForexList() {
  try {
    const res = await axios.get(ALL_FOREX_API);
    if (res.data && res.data.data) {
      rateList.value = res.data.data.map((item: any, index: number) => ({
        id: index + 1,
        currency: item.currency_code,
        currency_name: item.currency_name,
        // 假设：fromRate = central_parity - change_rate, toRate = central_parity
        fromRate: item.central_parity - item.change_rate,
        toRate: item.central_parity,
        updateTime: item.date,
        buy_price: item.buy_price,
        sell_price: item.sell_price,
        change_rate: item.change_rate,
      }));
      console.log("获取汇率数据成功", rateList.value);
    } else {
      console.error("接口返回数据格式不符合预期", res.data);
    }
  } catch (error) {
    console.error("获取外汇列表失败", error);
  }
}
onMounted(() => {
  fetchAllForexList();
})

// 点击卡片时，从接口2获取单个外汇趋势数据
const showTrend = async (row: RateItem) => {
  fromCurrency.value = row.currency;
  toCurrency.value = baseCurrency.value;
  showTrendModal.value = true;
  await fetchSingleForexTrend(row.currency);
  updateTrendData(); // 更新图表
};

async function fetchSingleForexTrend(currencyCode:string) {
  try {
    const res = await axios.get(SINGLE_FOREX_API, {
      params: { symbol: currencyCode},
    });
    if (res.data && res.data.data && res.data.data.data) {
      trendData.value = res.data.data.data.map((item: any) => ({
        date: item.date,
        rate: item.central_parity, // 使用 central_parity 作为趋势值
      }));
      console.log("获取趋势数据成功", trendData.value);
    } else {
      console.error("接口返回数据格式不符合预期", res.data);
    }
  } catch (error) {
    console.error("获取趋势数据失败", error);
  }
}

// ================== 图表配置 ================== //
// chartOption: vue-echarts 绑定的配置对象
const chartOption = ref({});

const updateTrendData = () => {
  const dates = trendData.value.map(item => item.date);
  const rates = trendData.value.map(item => item.rate);
  
  chartOption.value = {
    tooltip: { trigger: "axis" },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "inside",
        xAxisIndex: 0,
      },
    ],
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: (value: number) => value.toFixed(4) }
    },
    series: [
      {
        name: "累计收益率",
        type: "line",
        data: rates,
        smooth: true,
        lineStyle: { width: 2 }
      }
    ]
  };


  ElMessage.success("趋势数据已更新");
}

// 辅助函数：根据时间范围返回数据点数量
const getCountFromTimeRange = (timeRange: string) => {
  switch (timeRange) {
    case "1W": return 7;
    case "1M": return 30;
    case "1Q": return 90;
    case "1Y": return 365;
    case "3Y": return 365 * 3;
    default: return 30;
  }
};

// 上方K线图
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const initChart = () => {
  if (chartRef.value) {
    chartInstance = (chartRef.value as any).getEchartsInstance();
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    dataReal.push((Math.random() * 10 + 90).toFixed(2));
    dataPred.push((Math.random() * 10 + 90).toFixed(2));
  }
  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["真实汇率", "预测汇率"] },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value" },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "inside",
        xAxisIndex: 0,
      },
    ],
    series: [
      {
        name: "真实汇率",
        type: "line",
        data: dataReal,
        smooth: true,
        markPoint: {
          data: [
            { type: "max", name: "Buy" },
            { type: "min", name: "Sell" },
          ],
        },
      },
      {
        name: "预测汇率",
        type: "line",
        data: dataPred,
        smooth: true,
      },
    ],
  };
  chartInstance.setOption(option);
};


watch([baseCurrency, selectedTimeRange], () => {
  nextTick(() => {
    updateChart();
  });
});
onMounted(() => {
  initChart();
});

// 下方收益率图（阶段二）
const strategyList = [
  { name: "Strategy 1", value: "A" },
  { name: "Strategy 2", value: "B" },
  { name: "Strategy 3", value: "C" },
];
const selectedStrategy = ref(strategyList[0].value);
const cumulativeYield = ref("5.20");
const annualYield = ref("4.10");
const maxDrawdown = ref("-2.30");


</script>

<style scoped>
/* 外层容器 - 使用更深邃的背景色 */
.rate-container {
  padding: 20px;
  margin: 0;
  position: absolute;
  top: 6%;
  left: 0;
  right: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #000033 0%, #000056 100%);
  overflow-x: hidden;
}

/* 页面标题样式优化 */
.page-title {
  color: #fff;
  font-size: 2.4rem;
  font-weight: 600;
  text-align: center;
  margin: 20px 0 40px;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
}

/* 卡片列表布局优化 */
.card-list {
  margin: 20px 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  padding-bottom: 100px;
  justify-content: center;
}

/* 卡片样式优化 */
.exact-card {
  width: 14rem;
  color: #fff;
  border-radius: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 上涨和下跌卡片样式优化 */
.trend-up {
  background: linear-gradient(165deg, 
    rgba(56, 189, 248, 0.95) 0%,    /* 天蓝色开始 */
    rgba(59, 130, 246, 0.9) 60%,    /* 渐变到亮蓝色 */
    rgba(239, 68, 68, 0.85) 100%    /* 明亮的红色 */
  );
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.15);
}

.trend-down {
  background: linear-gradient(165deg, 
    rgba(56, 189, 248, 0.95) 0%,    /* 天蓝色开始 */
    rgba(59, 130, 246, 0.9) 60%,    /* 渐变到亮蓝色 */
    rgba(34, 197, 94, 0.85) 100%    /* 明亮的绿色 */
  );
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.15);
}

/* 更新箭头颜色 */
.arrow-up {
  color: rgb(255, 86, 86);    /* 更明亮的红色 */
  font-size: 1.6rem;
  text-shadow: 0 0 15px rgba(255, 86, 86, 0.6);
}

.arrow-down {
  color: rgb(52, 211, 153);    /* 更明亮的绿色 */
  font-size: 1.6rem;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.6);
}

/* 卡片悬浮效果优化 */
.trend-up:hover {
  box-shadow: 0 20px 40px rgba(239, 68, 68, 0.2);
}

.trend-down:hover {
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.2);
}

/* 差值行背景微调 */
.diff-row {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(5px);
  margin-bottom: 12px;
  padding: 4px 8px;
}

/* 货币代码样式优化 */
.big-currency {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
}

/* 中文货币名称样式优化 */
.zh-currency {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0;
}

/* 日期样式优化 */
.date {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

/* 价格行样式优化 */
.price-line {
  margin: 8px 0;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.price-line:last-child {
  border-bottom: none;
}

.price-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.price-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

/* 差值和箭头样式优化 */
.diff-row {
  margin-bottom: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.big-diff {
  font-size: 1.8rem;
  font-weight: 700;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .card-list {
    margin: 20px;
    gap: 30px;
  }
  
  .exact-card {
    width: 100%;
    padding: 20px;
  }
}

/* 趋势弹窗相关 */
.trend-chart {
  height: 400px;
  width: 100%;
  margin-top: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.currency-separator {
  color: #6366f1;
  font-weight: bold;
  margin: 0 12px;
  font-size: 18px;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.currency-flag {
  width: 1.5em;
  height: 1.5em;
  margin-right: 6px;
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 移除分页样式 */
.pagination {
  display: none;
}
</style>
