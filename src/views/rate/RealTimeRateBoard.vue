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

        <v-chart class="trend-chart" :option="chartOption" autoresize />
      </div>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

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


// ================== 接口定义 ================== //
interface RateItem {
  id: number;
  currency: string; // 对应接口字段 currency_code
  currency_name: string; // 对应接口字段 currency_name
  fromRate: number; 
  toRate: number;   
  updateTime: string; //date
  buy_price?: number;
  sell_price?: number;
  change_rate?: number;
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
const trendData = ref<TrendDataItem[]>([]);

// 示例汇率列表
const rateList = ref<RateItem[]>([]);

// ================== 过滤 ================== //
const filteredRates = computed(() => {
  return rateList.value.map((r, index) => {
    const buy_price = r.buy_price ?? 0;
    const sell_price = r.sell_price ?? 0;
    const change_rate = r.change_rate ?? 0;
    const toRate = r.toRate ?? 0;
    return {
      ...r, // 包括原有的 id, currency, currency_name, updateTime 等
        // 如果原始值可能为 undefined，则补充默认值
      buy_price,
      sell_price,
      change_rate,
      id: r.id || index + 1,
      currency: r.currency,
      currency_name: r.currency_name,
      updateTime: r.updateTime,
      fromRate: r.toRate - change_rate,
      toRate,
      diffVal: change_rate.toFixed(2),
      isUp: change_rate >= 0,
      buy: buy_price.toFixed(2),
      sell: sell_price.toFixed(2),
      mid: toRate.toFixed(2),
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
    backgroundColor: 'transparent',
    tooltip: {
      trigger: "axis",
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: {
        color: '#1a1a1a'
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(59, 130, 246, 0.2)',
          width: 1
        }
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '5%',
      bottom: '10%',
      containLabel: true
    },
    dataZoom: [{
      type: "slider",
      show: true,
      xAxisIndex: 0,
      start: 0,
      end: 100,
      backgroundColor: '#f8fafc',
      dataBackground: {
        lineStyle: {
          color: '#e2e8f0'
        },
        areaStyle: {
          color: '#f1f5f9'
        }
      },
      fillerColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#e2e8f0',
      handleStyle: {
        color: '#3b82f6'
      }
    }, {
      type: "inside",
      xAxisIndex: 0
    }],
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        rotate: 45,
        color: '#64748b',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f1f5f9'
        }
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => value.toFixed(4),
        color: '#64748b',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9'
        }
      }
    },
    series: [{
      name: "汇率趋势",
      type: "line",
      data: rates,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 3,
        color: '#3b82f6'
      },
      itemStyle: {
        color: '#3b82f6',
        borderWidth: 2,
        borderColor: '#ffffff'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(59, 130, 246, 0.2)'
          },
          {
            offset: 1,
            color: 'rgba(59, 130, 246, 0.02)'
          }
        ])
      }
    }]
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

</script>

<style scoped>
/* 外层容器 - 使用更现代的渐变背景 */
.rate-container {
  padding: 20px;
  margin: 0;
  position: fixed;
  top: 6vh;          /* 改为 6vh，与顶部导航栏高度对应 */
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #001a4d 0%, #002687 100%);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 添加科技感网格背景 */
.rate-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(99, 179, 237, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 179, 237, 0.03) 1px, transparent 1px);
  background-size: 25px 25px;  /* 稍微调小网格大小 */
  pointer-events: none;
}

/* 优化标题样式 */
.page-title {
  color: #ffffff;  /* 纯白色 */
  font-size: 1.8rem;
  font-weight: 500;
  text-align: center;
  margin: 24px 0 40px;
  position: relative;
  display: inline-block;
  padding: 0 40px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);  /* 添加阴影提升立体感 */
  letter-spacing: 2px;
}

/* 修改标题装饰 */
.page-title::before,
.page-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 25px;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);  /* 纯白色装饰线 */
  transform: translateY(-50%);
}

.page-title::before {
  left: 0;
}

.page-title::after {
  right: 0;
}

/* 添加标题悬浮效果 */
.page-title:hover {
  transform: scale(1.02);
  transition: all 0.3s ease;
}

/* 卡片列表布局优化 */
.card-list {
  margin: 20px 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 40px 50px;    /* 调整间距：垂直间距40px，水平间距50px */
  padding-bottom: 100px;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* 卡片样式优化 - 增加科技感 */
.exact-card {
  width: 14rem;
  color: #fff;
  border-radius: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);  /* 降低透明度 */
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);  /* 调整阴影 */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

}

/* 上涨和下跌卡片样式优化 - 更暗沉的渐变 */
.trend-up {
  background: linear-gradient(165deg, 
    rgba(56, 189, 248, 0.75) 0%,
    rgba(59, 130, 246, 0.7) 70%,
    rgba(239, 68, 68, 0.65) 100%
  );
}

.trend-down {
  background: linear-gradient(165deg, 
    rgba(56, 189, 248, 0.75) 0%,
    rgba(59, 130, 246, 0.7) 70%,
    rgba(34, 197, 94, 0.65) 100%
  );
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

.date {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);  /* 降低亮度 */
  font-weight: 400;
}

/* 调整差值行背景 */
.diff-row {
  background: rgba(255, 255, 255, 0.06);  /* 降低透明度 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  margin-bottom: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

/* 调整价格行样式 */
.price-line {
  margin: 8px 0;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);  /* 降低边框亮度 */
}

.price-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);  /* 降低亮度 */
  margin-bottom: 4px;
}

.price-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);  /* 降低亮度 */
}

/* 货币代码样式优化 - 添加科技感字体效果 */
.big-currency {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 30%, #a5f3fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
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
    gap: 40px;       /* 在移动端保持一致的间距 */
  }
  
  .exact-card {
    width: 100%;
    padding: 20px;
  }
}

/* 趋势弹窗样式优化 */
:deep(.el-dialog) {
  background: #ffffff;
  border-radius: 20px;
  border: none;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: 1200px;
  margin: 15vh auto !important;  /* 添加上边距，并使用 !important 确保覆盖默认样式 */
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #edf2f7;
  background: #ffffff;
}

:deep(.el-dialog__title) {
  color: #1a1a1a;
  font-size: 1.4rem;
  font-weight: 500;
  letter-spacing: 1px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #666666;
}

:deep(.el-dialog__body) {
  padding: 24px;
  color: #1a1a1a;
  background: #ffffff;
  max-height: 60vh;  /* 限制最大高度 */
  overflow-y: auto;  /* 如果内容过多则显示滚动条 */
}

/* 美化弹窗滚动条 */
:deep(.el-dialog__body::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-dialog__body::-webkit-scrollbar-track) {
  background: #f1f5f9;
  border-radius: 3px;
}

:deep(.el-dialog__body::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 3px;
}

:deep(.el-dialog__body::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}

/* 控制区域样式优化 */
.trend-controls {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

/* Select 下拉框样式优化 */
:deep(.el-select .el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: none;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: #3b82f6;
}

:deep(.el-select .el-input__inner) {
  color: #1a1a1a;
}

/* 货币对选择器样式 */
.currency-pair {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 分隔符样式优化 */
.currency-separator {
  color: #3b82f6;
  font-size: 1.2rem;
  margin: 0 10px;
}

/* 图表容器样式优化 */
.trend-chart {
  height: 350px;
  width: 100%;
  margin-top: 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

/* 优化图表样式 */
:deep(.trend-chart) {
  /* 坐标轴颜色 */
  --el-color-axis: rgba(255, 255, 255, 0.65);
  
  .echarts-tooltip {
    background: rgba(0, 26, 77, 0.95) !important;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 12px;
    border-radius: 8px;
    color: #ffffff;
  }

  /* 坐标轴文字颜色 */
  path {
    stroke: var(--el-color-axis);
  }

  text {
    fill: var(--el-color-axis);
  }

  /* 网格线颜色 */
  .el-line {
    stroke: rgba(255, 255, 255, 0.1);
  }
}

/* 移除分页样式 */
.pagination {
  display: none;
}

/* 调整 header 容器样式 */
.header {
  margin: 0;
  padding: 8px 0;           /* 添加适当的内边距 */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
