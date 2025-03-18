<template>
  <el-main class="rate-container">
    <!-- 顶部：基准货币选择、搜索框 -->
    <el-header class="header">
      <el-row :gutter="5" justify="space-between">
        <!-- 标题 -->
        <el-col :span="4">
          <h1 style="margin: auto;">今日汇率 - 基准货币</h1>
        </el-col>

        <!-- 基准货币选择 -->
        <el-col :span="3">
          <el-select v-model="baseCurrency">
            <el-option
              v-for="currency in availableCurrencies"
              :key="currency"
              :value="currency"
            >
              <div style="align-items: center;display: flex;">
                <span :class="`fi fi-${getCurrencyFlag(currency)}`" class="currency-flag"></span>
                <span>{{ currency }}</span>
              </div>
            </el-option>
          </el-select>
        </el-col>

        <!-- 占位 -->
        <el-col :span="8"></el-col>

        <!-- 搜索框 -->
        <el-col :span="8" class="search-col">
          <el-input
            v-model="searchQuery"
            placeholder="搜索"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-header>

    <!-- 卡片列表布局：替换表格 -->
    <div class="card-list">
      <el-row :gutter="20">
        <el-col
          v-for="item in extendedRates"
          :key="item.id"
          :span="8"  
        >
          <!-- 单个汇率卡片（点击可查看趋势） -->
          <div class="exact-card" @click="showTrend(item)">
            <div class="card-content">
              <!-- 左边：货币代码、中文货币名 -->
               <div class ="left-part">
                <div class="top-line">
                  <span class="big-currency">{{ item.currency }}</span>
                
                </div>

                <div class="zh-currency">{{ currencyZhMap[item.currency] }}</div>
                <span class="date">{{ item.updateTime }}</span>
               </div>

              <!-- 右边：买入价、卖出价、中间价 -->
              <div class="right-part">
                <span class="big-diff">{{ item.diffVal }}</span>
                  <span :class="item.isUp ? 'arrow-up' : 'arrow-down'">
                    {{ item.isUp ? '▲' : '▼' }}
                  </span>
                <div class="price-line">买入价： {{  item.buy  }}</div>
                <div class="price-line">卖出价： {{  item.sell  }}</div>
                <div class="bottom-line">
                  
                  <span class="mid-price">中间价： {{ item.mid }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[6, 12]"
      layout="total, sizes, prev, pager, next"
      :total="filteredRates.length"
      class="pagination"
    />

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
              <el-select v-model="fromCurrency" class="currency-select" @change="updateTrendData">
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
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

// ECharts & Vue-ECharts
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";
use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent]);

import { getCurrencyFlag } from "../../utils/index";

// ================== 接口定义 ================== //
interface RateItem {
  id: number;
  currency: string;
  fromRate: number; // CNY -> currency
  toRate: number;   // currency -> CNY
  updateTime: string;
}

interface TrendDataItem {
  date: string;
  rate: number;
}

// ================== 响应式数据 ================== //
const baseCurrency = ref("CNY");   // 基准货币
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(6);

const showTrendModal = ref(false);
const fromCurrency = ref("USD");
const toCurrency = ref("CNY");
const trendPeriod = ref("week");
const trendData = ref<TrendDataItem[]>([]);

// 示例汇率列表
const rateList = ref<RateItem[]>([
  {
    id: 1,
    currency: "USD",
    fromRate: 0.1372,
    toRate: 7.2884,
    updateTime: "2025.03.11",
  },
  {
    id: 2,
    currency: "HKD",
    fromRate: 1.06879,
    toRate: 0.93564,
    updateTime: "2025.03.11",
  },
  {
    id: 3,
    currency: "EUR",
    fromRate: 0.1265,
    toRate: 7.9051,
    updateTime: "2025.03.11",
  },
  {
    id: 4,
    currency: "GBP",
    fromRate: 0.1082,
    toRate: 9.2421,
    updateTime: "2025.03.11",
  },
  {
    id: 5,
    currency: "JPY",
    fromRate: 20.3451,
    toRate: 0.0491,
    updateTime: "2025.03.11",
  },
  {
    id: 6,
    currency: "AUD",
    fromRate: 0.2089,
    toRate: 4.7867,
    updateTime: "2025.03.11",
  },
  {
    id: 7,
    currency: "CAD",
    fromRate: 0.1851,
    toRate: 5.4025,
    updateTime: "2025.03.11",
  },
  {
    id: 8,
    currency: "SGD",
    fromRate: 0.1834,
    toRate: 5.4526,
    updateTime: "2025.03.11",
  },
  {
    id: 9,
    currency: "CHF",
    fromRate: 0.1189,
    toRate: 8.4104,
    updateTime: "2025.03.11",
  },
]);

// 货币的中文映射（可自行完善）
const currencyZhMap: Record<string, string> = {
  USD: "美 元",
  HKD: "港 元",
  EUR: "欧 元",
  GBP: "英 镑",
  JPY: "日 元",
  AUD: "澳 元",
  CAD: "加 元",
  SGD: "新 元",
  CHF: "瑞 郎",
};

// 可选的基准货币
const availableCurrencies = ["CNY","USD","EUR","GBP","JPY","HKD","AUD","CAD","SGD","CHF"];

// ================== 过滤 & 分页 ================== //
const filteredRates = computed(() => {
  return rateList.value.filter((item) =>
    item.currency.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedRates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRates.value.slice(start, start + pageSize.value);
});

/**
 * 计算并扩展卡片需要的数据：
 *  - diffVal: 涨跌值 (toRate - fromRate)
 *  - isUp: 判断涨跌
 *  - buy / sell / mid: 这里简单模拟
 */
const extendedRates = computed(() => {
  return paginatedRates.value.map((r) => {
    const diff = r.toRate - r.fromRate;
    const isUp = diff >= 0;
    return {
      ...r,
      diffVal: diff.toFixed(2),
      isUp,
      // 模拟：买入价 = toRate - 0.05，卖出价 = toRate + 0.05
      buy: (r.toRate - 0.05).toFixed(2),
      sell: (r.toRate + 0.05).toFixed(2),
      mid: r.toRate.toFixed(2),
    };
  });
});

// ================== 搜索、弹窗、趋势 ================== //
const handleSearch = () => {
  currentPage.value = 1;
};

const showTrend = (row: RateItem) => {
  fromCurrency.value = row.currency;
  toCurrency.value = baseCurrency.value;
  showTrendModal.value = true;
  updateTrendData();
};

// 模拟更新趋势数据
const chartOption = computed(() => ({
  title: {
    text: `${fromCurrency.value} → ${toCurrency.value} 汇率趋势`,
    left: "center",
  },
  tooltip: {
    trigger: "axis",
    formatter: (params: any[]) => {
      const date = params[0].axisValue;
      const value = params[0].data;
      return `${date}<br/><strong>${value.toFixed(4)}</strong>`;
    },
  },
  xAxis: {
    type: "category",
    data: trendData.value.map((item) => item.date),
    axisLabel: { rotate: 45 },
  },
  yAxis: {
    type: "value",
    axisLabel: { formatter: (value: number) => value.toFixed(4) },
  },
  series: [
    {
      type: "line",
      data: trendData.value.map((item) => item.rate),
      smooth: true,
      lineStyle: { color: "#6366f1", width: 2 },
      itemStyle: { color: "#6366f1" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(99, 102, 241, 0.2)" },
            { offset: 1, color: "rgba(99, 102, 241, 0)" },
          ],
        },
      },
    },
  ],
}));

function updateTrendData() {
  // 模拟获取趋势数据
  trendData.value = generateMockTrendData();
  ElMessage.success("趋势数据已更新");
}

function generateMockTrendData(): TrendDataItem[] {
  const days = trendPeriod.value === "week" ? 7 : trendPeriod.value === "month" ? 30 : 365;
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000).toISOString().split("T")[0],
    rate: 1 + Math.random() * 0.2, // 模拟汇率波动
  }));
}
</script>

<style scoped>
/* 外层容器 */
.rate-container {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  width: 80%;
  margin: 0 auto;
}

/* 头部样式（基准货币、搜索框） */
.header {
  margin-top: 20px;
}
.search-col {
  text-align: right;
}

/* 卡片列表区域 */
.card-list {
  margin-top: 20px;
}

/* 分页 */
.pagination {
  padding: 30px 0;
  text-align: center;
}

/* 单个卡片：模拟图2的外观 */
.exact-card {
  width: 20rem; 
  border: 1px solid #000;  /* 黑色边框 */
  background-color: #f0f8ff;
  color: #000;
  border-radius: 12px;        /* 圆角 */
  padding: 10px 14px;
  box-sizing: border-box;
  font-family: "Arial", sans-serif; 
  margin-bottom: 20px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 添加阴影 */
  transition: transform 0.2s, box-shadow 0.2s;
}

.exact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 左右对齐时，顶部对齐 */
}

/* 左侧区域 */
.left-part {
  display: flex;
  flex-direction: column;
  margin-right: 10px; /* 右侧留点间距 */
}

/* 右侧区域 */
.right-part {
  display: flex;
  flex-direction: column;
  text-align: right; /* 如果想让右侧文字靠右 */
}

/* 第一行：USD 7.15 ▲ */
.top-line {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.big-currency {
  font-size: 3rem;
  font-weight: bold;
  margin-right: 6px;
}

.big-diff {
  font-size: 1.2rem;
  margin-right: 2px;
}

.arrow-up {
  color: #e60000; /* 红色箭头 */
  font-size: 1.2rem;
}
.arrow-down {
  color: #22c55e; /* 绿色箭头 */
  font-size: 1.2rem;
}

/* 第二行：中文货币名称 */
.zh-currency {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

/* 买入/卖出价 */
.price-line {
  font-size: 0.95rem;
  margin: 3px 0;
  color: #333;
}

/* 底部：时间 + 中间价 */
.bottom-line {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.9rem;
  color: #555;
}

.date {
  margin-right: 8px;
}

.mid-price {
  /* 让中间价与日期分开 */
}

/* 趋势弹窗相关 */
.trend-chart {
  height: 400px;
  width: 100%;
  margin-top: 20px;
}
.currency-separator {
  color: #6366f1;
  font-weight: bold;
  margin: 0 8px;
  font-size: 16px;
}
.currency-flag {
  width: 1.5em;
  height: 1.5em;
  margin-right: 4px;
}
</style>
