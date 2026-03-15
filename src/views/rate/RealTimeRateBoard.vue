<template>
  <el-main class="rate-container">
    <!-- 顶部：基准货币选择、搜索框 -->
    <el-header class="header">
      <h1 class="page-title">今日汇率</h1>
    </el-header>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-text">加载汇率数据中...</div>
      </div>
    </div>

    <!-- 卡片列表布局：替换表格 -->
    <div v-else class="card-list">
      <!-- 单个汇率卡片（点击可查看趋势） -->
      <div class="exact-card"
        v-for="item in filteredRates"
        :key="item.id"
        :class="{
          'trend-up': item.trend === 'up',
          'trend-down': item.trend === 'down',
          'trend-neutral': item.trend === 'neutral'
        }"
        @click="showTrend(item)">
        <!-- 添加国旗 -->
        <div class="flag-container">
          <span :class="`fi fi-${getCurrencyFlag(item.currency)}`"></span>
        </div>
        
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
              <span :class="{
                'arrow-up': item.trend === 'up',
                'arrow-down': item.trend === 'down',
                'arrow-neutral': item.trend === 'neutral'
              }">
                {{ item.trend === 'up' ? '⬆' : item.trend === 'down' ? '⬇' : '—' }}
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
      :title="`${fromCurrency} / ${toCurrency} 汇率趋势`"
      width="80%"
      :close-on-click-modal="false"
      class="trend-dialog"
    >
      <div class="trend-content">
        <!-- 添加时间范围选择 -->
        <div class="trend-controls">
          <div class="trend-header">
            <h3 class="trend-title">时间范围</h3>
            <div class="trend-subtitle">选择要查看的时间跨度</div>
          </div>
          <el-radio-group v-model="currentPeriod" size="large">
            <el-radio-button 
              v-for="option in periodOptions" 
              :key="option.value" 
              :label="option.value"
              class="period-button"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 趋势图加载动画 -->
        <div v-if="isTrendLoading" class="chart-container loading-chart">
          <div class="loading-spinner">
            <div class="spinner-circle"></div>
            <div class="spinner-text">加载趋势数据中...</div>
          </div>
        </div>
        
        <!-- 趋势图 -->
        <div v-else class="chart-container">
          <v-chart class="trend-chart" :option="chartOption" autoresize />
        </div>
      </div>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";

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
  currency: string; // 对应接口字段 currencyCode
  currency_name: string; // 对应接口字段 currencyName
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
// 移除未使用的变量或添加使用它的代码
// const searchQuery = ref("");

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
    
    let trend = 'neutral';  // 新增状态：neutral
    if (change_rate > 0) trend = 'up';
    else if (change_rate < 0) trend = 'down';
    
    return {
      ...r,
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
      trend,  // 使用新的trend状态替代原来的isUp
      buy: buy_price.toFixed(2),
      sell: sell_price.toFixed(2),
      mid: toRate.toFixed(2),
    };
  })
  // .filter((item) =>
  //   item.currency.toLowerCase().includes(searchQuery.value.toLowerCase())
  // );
});

// ================== 接口调用 ================== //
const BASE_URL = API_BASE_URL;
const ALL_FOREX_API = `${BASE_URL}/v1/rate/get_all_forex`;
const SINGLE_FOREX_API = `${BASE_URL}/v1/rate/get_forex`;

// 添加请求配置
const requestConfig = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,  // 如果需要token
    'Content-Type': 'application/json'
  }
};

// 添加加载状态
const isLoading = ref(true);
const isTrendLoading = ref(false);

async function fetchAllForexList() {
  isLoading.value = true; // 开始加载时设置为 true
  try {
    const res = await axios.get(ALL_FOREX_API, requestConfig);
    if (res.data && res.data.data) {
      // 打印原始数据看看
      console.log("原始数据:", res.data.data);
      
      rateList.value = res.data.data.map((item: any, index: number) => ({
        id: index + 1,
        currency: item.currencyCode,
        currency_name: item.currencyName,
        fromRate: item.centralParity - item.changeRate,
        toRate: item.centralParity,
        updateTime: item.date.substring(0, 10),
        buy_price: item.buyPrice,
        sell_price: item.sellPrice,
        change_rate: item.changeRate,
      }));
      
      // 打印处理后的数据看看
      console.log("处理后的数据:", rateList.value);
      // 打印每个货币的涨跌情况
      rateList.value.forEach(item => {
        console.log(`${item.currency}: change_rate = ${item.change_rate}`);
      });
    } else {
      console.error("接口返回数据格式不符合预期", res.data);
      ElMessage.error("获取汇率数据失败");
    }
  } catch (error) {
    console.error("获取外汇列表失败", error);
    ElMessage.error("获取汇率数据失败，请稍后重试");
  } finally {
    // 无论成功或失败，都将加载状态设为 false
    isLoading.value = false;
  }
}
onMounted(() => {
  fetchAllForexList();
})

// 点击卡片时，从接口2获取单个外汇趋势数据

// 添加时间范围选项
const periodOptions = [
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' }
];

// 添加当前选中的时间范围
const currentPeriod = ref('week');

// 添加一个清空图表的函数
const clearChart = () => {
  trendData.value = [];
  chartOption.value = {};
};

const showTrend = async (row: RateItem) => {
  // 先清空图表数据
  clearChart();
  
  fromCurrency.value = row.currency;
  toCurrency.value = baseCurrency.value;
  showTrendModal.value = true;
  
  // 设置趋势图加载状态
  isTrendLoading.value = true;
  
  try {
    await fetchSingleForexTrend(periodOptions.find(opt => opt.value === currentPeriod.value)?.label || '周', row.currency_name);
    updateTrendData(); // 更新图表
  } catch (error) {
    console.error("获取趋势数据失败", error);
    ElMessage.error("获取趋势数据失败，请稍后重试");
  } finally {
    isTrendLoading.value = false;
  }
};

async function fetchSingleForexTrend(period: string, moneyCode: string) {
  try {
    const res = await axios.get(SINGLE_FOREX_API, {
      ...requestConfig,
      params: { 
        period: period,
        money_code: moneyCode
      }
    });
    if (res.data && res.data.data && res.data.data.rates) {
      // 修改数据映射以匹配接口返回格式
      trendData.value = res.data.data.rates.map((item: any) => ({
        date: item.date.substring(0, 10),  // 从完整的日期时间中只取日期部分
        rate: item.centralParity,          // 使用中间价(centralParity)作为趋势图的数据
        buyPrice: item.buyPrice,           // 添加买入价
        sellPrice: item.sellPrice,         // 添加卖出价
        changeRate: item.changeRate        // 添加变化率
      }));
      console.log("获取趋势数据成功", trendData.value);
    } else {
      console.error("接口返回数据格式不符合预期", res.data);
    }
  } catch (error) {
    console.error("获取趋势数据失败", error);
  }
}

// 监听时间范围变化时也需要先清空
watch(currentPeriod, async (newPeriod) => {
  if (showTrendModal.value && fromCurrency.value) {
    // 先清空图表数据
    clearChart();
    
    // 设置趋势图加载状态
    isTrendLoading.value = true;
    
    try {
      const periodLabel = periodOptions.find(opt => opt.value === newPeriod)?.label || '周';
      const currentCurrency = rateList.value.find(item => item.currency === fromCurrency.value);
      if (currentCurrency) {
        console.log("重新获取数据", periodLabel, currentCurrency.currency_name);
        await fetchSingleForexTrend(periodLabel, currentCurrency.currency_name);
        updateTrendData();
      }
    } catch (error) {
      console.error("获取趋势数据失败", error);
      ElMessage.error("获取趋势数据失败，请稍后重试");
    } finally {
      isTrendLoading.value = false;
    }
  }
});

// ================== 图表配置 ================== //
// chartOption: vue-echarts 绑定的配置对象
const chartOption = ref({});

const updateTrendData = () => {
  // 首先对数据按日期进行排序
  trendData.value.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
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
      scale: true,
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
}

// 根据货币代码获取国旗代码
const getCurrencyFlag = (currencyCode: string): string => {
  const flagMap: Record<string, string> = {
    'USD': 'us',
    'EUR': 'eu',
    'GBP': 'gb',
    'JPY': 'jp',
    'AUD': 'au',
    'CAD': 'ca',
    'CHF': 'ch',
    'CNY': 'cn',
    'HKD': 'hk',
    'NZD': 'nz',
    'SGD': 'sg',
    'KRW': 'kr',
    'THB': 'th',
    'RUB': 'ru',
    'INR': 'in',
    'MYR': 'my',
    'ZAR': 'za',
    'MXN': 'mx',
    'BRL': 'br',
    'SEK': 'se',
    'NOK': 'no',
    'DKK': 'dk',
    'TRY': 'tr',
    'PLN': 'pl',
    'IDR': 'id',
    'PHP': 'ph',
    'AED': 'ae',
    'SAR': 'sa',
    // 可以根据需要添加更多货币和国家代码
  };
  
  return flagMap[currencyCode] || 'un'; // 如果找不到对应的国旗，返回联合国旗帜
};

</script>

<style scoped>
/* 外层容器 - 改为浅色渐变背景 */
.rate-container {
  padding: 20px;
  margin: 0;
  position: fixed;
  top: 6vh;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 修改网格背景为浅色 */
.rate-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(51, 65, 85, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(51, 65, 85, 0.03) 1px, transparent 1px);
  background-size: 25px 25px;
  pointer-events: none;
}

/* 修改标题样式为深色 */
.page-title {
  color: #1e293b;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  margin: 24px 0 40px;
  position: relative;
  display: inline-block;
  padding: 0 40px;
  text-shadow: none;
  letter-spacing: 2px;
}

/* 修改标题装饰线颜色 */
.page-title::before,
.page-title::after {
  background: rgba(51, 65, 85, 0.2);
}

/* 修改卡片基础样式 */
.exact-card {
  width: 14rem;
  color: #1e293b;
  border-radius: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 0 20px rgba(255, 255, 255, 0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
  animation: slideIn 0.4s ease-out;
  animation-fill-mode: both;
}

/* 添加卡片悬浮效果 */
.exact-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 12px 20px -5px rgba(0, 0, 0, 0.15),
    0 4px 6px -2px rgba(0, 0, 0, 0.08),
    inset 0 0 20px rgba(255, 255, 255, 0.8);
}

/* 修改上涨卡片样式 */
.trend-up {
  background: linear-gradient(165deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(239, 68, 68, 0.08) 100%
  );
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.trend-up::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(239, 68, 68, 0.7),
    rgba(239, 68, 68, 0.3)
  );
  border-radius: 3px 3px 0 0;
}

/* 修改下跌卡片样式 */
.trend-down {
  background: linear-gradient(165deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(34, 197, 94, 0.08) 100%
  );
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.trend-down::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(34, 197, 94, 0.7),
    rgba(34, 197, 94, 0.3)
  );
  border-radius: 3px 3px 0 0;
}

/* 添加中性（不涨不跌）卡片样式 */
.trend-neutral {
  background: linear-gradient(165deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(59, 130, 246, 0.08) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.3);
  position: relative;
}

.trend-neutral::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 0.7),
    rgba(59, 130, 246, 0.3)
  );
  border-radius: 3px 3px 0 0;
}

/* 修改差值行样式 */
.diff-row {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 修改大数字样式 */
.big-diff {
  font-size: 1.8rem;
  font-weight: 700;
  font-family: 'Monaco', monospace;
  background: linear-gradient(135deg, #1e293b 30%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

/* 修改箭头样式 */
.arrow-up {
  color: #ef4444;
  font-size: 1.6rem;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
  transition: transform 0.3s ease;
}

.arrow-down {
  color: #22c55e;
  font-size: 1.6rem;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  transition: transform 0.3s ease;
}

/* 添加箭头悬浮效果 */
.exact-card:hover .arrow-up {
  transform: translateY(-3px);
}

.exact-card:hover .arrow-down {
  transform: translateY(3px);
}

/* 添加中性箭头样式 */
.arrow-neutral {
  color: #3b82f6;  /* 使用蓝色 */
  font-size: 1.6rem;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  transition: transform 0.3s ease;
}

/* 修改箭头悬浮效果 */
.exact-card:hover .arrow-neutral {
  transform: scale(1.1);  /* 对于中性状态使用缩放效果而不是上下移动 */
}

/* 修改价格行样式 */
.price-line {
  margin: 8px 0;
  padding: 6px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-line:last-child {
  border-bottom: none;
}

/* 修改价格标签样式 */
.price-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 修改价格值样式 */
.price-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Monaco', monospace;
  background: linear-gradient(90deg, #1e293b, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 修改货币代码样式 */
.big-currency {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 30%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  position: relative;
  display: inline-block;
}

/* 添加货币代码装饰效果 */
.big-currency::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 0.5),
    rgba(59, 130, 246, 0.1)
  );
  border-radius: 1px;
}

/* 修改中文货币名称样式 */
.zh-currency {
  color: #64748b;
  font-size: 0.9rem;
  margin: 4px 0;
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
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
.trend-dialog {
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    margin: 0;
    border-bottom: 1px solid #e2e8f0;
    background: #ffffff;
  }

  :deep(.el-dialog__title) {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    letter-spacing: 0.5px;
  }

  :deep(.el-dialog__headerbtn) {
    top: 20px;
    right: 20px;
    
    .el-dialog__close {
      font-size: 1.2rem;
      color: #64748b;
      transition: color 0.2s;
      
      &:hover {
        color: #3b82f6;
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
    background: #f8fafc;
  }
}

.trend-content {
  padding: 24px;
}

.trend-controls {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.trend-header {
  margin-bottom: 16px;
}

.trend-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.trend-subtitle {
  font-size: 0.9rem;
  color: #64748b;
}

.period-button {
  :deep(.el-radio-button__inner) {
    padding: 12px 24px;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s;
    
    &:hover {
      background-color: #f1f5f9;
    }
  }
  
  &.is-active {
    :deep(.el-radio-button__inner) {
      background-color: #3b82f6;
      border-color: #3b82f6;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }
  }
}

.chart-container {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.trend-chart {
  height: 400px;  /* 调整图表高度 */
  width: 100%;
}

/* 调整 header 容器样式 */
.header {
  margin: 0;
  padding: 8px 0;           /* 添加适当的内边距 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 添加加载动画样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
}

.loading-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-circle {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-text {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 添加卡片加载动画 */
.card-list {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 为每个卡片设置不同的延迟，创造序列动画效果 */
.exact-card:nth-child(1) { animation-delay: 0.1s; }
.exact-card:nth-child(2) { animation-delay: 0.15s; }
.exact-card:nth-child(3) { animation-delay: 0.2s; }
.exact-card:nth-child(4) { animation-delay: 0.25s; }
.exact-card:nth-child(5) { animation-delay: 0.3s; }
.exact-card:nth-child(6) { animation-delay: 0.35s; }
.exact-card:nth-child(7) { animation-delay: 0.4s; }
.exact-card:nth-child(8) { animation-delay: 0.45s; }
.exact-card:nth-child(9) { animation-delay: 0.5s; }
.exact-card:nth-child(10) { animation-delay: 0.55s; }
/* 可以根据需要添加更多 */

/* 添加国旗样式 */
.flag-container {
  position: absolute;
  top: 20px;
  right: 15px;
  z-index: 2;
}

.flag-container .fi {
  width: 60px;
  height: 45px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.exact-card:hover .flag-container .fi {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

</style>
