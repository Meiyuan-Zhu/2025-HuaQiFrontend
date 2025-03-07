<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { ElMessage } from "element-plus";
import { use } from "echarts/core";
import { LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from "echarts/components";
import VChart from "vue-echarts";

import { getCurrencyFlag } from "../../utils/index";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
]);

interface RateItem {
  id: number;
  currency: string;
  fromRate: number;
  toRate: number;
  updateTime: string;
}

interface TrendDataItem {
  date: string;
  rate: number;
}

// 响应式数据
const baseCurrency = ref("CNY");
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const showTrendModal = ref(false);
const fromCurrency = ref("USD");
const toCurrency = ref("CNY");
const trendPeriod = ref("week");
const trendData = ref<TrendDataItem[]>([]);

// 示例数据
const rateList = ref<RateItem[]>([
  {
    id: 1,
    currency: "USD",
    fromRate: 0.1372,
    toRate: 7.2884,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 2,
    currency: "HKD",
    fromRate: 1.06879,
    toRate: 0.93564,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 3,
    currency: "EUR",
    fromRate: 0.1265,
    toRate: 7.9051,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 4,
    currency: "GBP",
    fromRate: 0.1082,
    toRate: 9.2421,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 5,
    currency: "JPY",
    fromRate: 20.3451,
    toRate: 0.0491,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 6,
    currency: "AUD",
    fromRate: 0.2089,
    toRate: 4.7867,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 7,
    currency: "CAD",
    fromRate: 0.1851,
    toRate: 5.4025,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 8,
    currency: "SGD",
    fromRate: 0.1834,
    toRate: 5.4526,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 9,
    currency: "CHF",
    fromRate: 0.1189,
    toRate: 8.4104,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 10,
    currency: "CHF",
    fromRate: 0.1189,
    toRate: 8.4104,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 11,
    currency: "CHF",
    fromRate: 0.1189,
    toRate: 8.4104,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 12,
    currency: "CHF",
    fromRate: 0.1189,
    toRate: 8.4104,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 13,
    currency: "CHF",
    fromRate: 0.1189,
    toRate: 8.4104,
    updateTime: "2025.01.22 21:02",
  },
  {
    id: 14,
    currency: "CHF",
    fromRate: 0.1189,
    toRate: 8.4104,
    updateTime: "2025.01.22 21:02",
  },
]);

// 计算属性
const filteredRates = computed(() =>
  rateList.value.filter((item) =>
    item.currency.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const paginatedRates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRates.value.slice(start, start + pageSize.value);
});

// 图表配置
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

const showTrend = (row: RateItem) => {
  fromCurrency.value = row.currency;
  toCurrency.value = baseCurrency.value;
  showTrendModal.value = true;
  updateTrendData();
};

const updateTrendData = async () => {
  try {
    // 模拟API调用
    trendData.value = generateMockTrendData();
    ElMessage.success("趋势数据已更新");
  } catch (error) {
    ElMessage.error("数据加载失败");
  }
};

const generateMockTrendData = (): TrendDataItem[] => {
  const days =
    trendPeriod.value === "week" ? 7 : trendPeriod.value === "month" ? 30 : 365;

  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000)
      .toISOString()
      .split("T")[0],
    rate: 1 + Math.random() * 0.2, // 模拟汇率波动
  }));
};

const handleSearch = () => {
  currentPage.value = 1;
};

const availableCurrencies = [
  "CNY",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "HKD",
  "AUD",
  "CAD",
  "SGD",
  "CHF",
];

// 监视器
watchEffect(() => {
  if (showTrendModal.value) {
    updateTrendData();
  }
});
</script>

<template>
  <el-main class="main-container">
  <div class="rate-container">
    <el-header class="header">
      <el-row :gutter="5" justify="space-between">
        <!-- 基准货币选择 -->
        <el-col :span="4">
            <h1 style="margin: auto;">今日汇率 - 基准货币</h1>
        </el-col>

        <el-col :span="3">
          <div class="currency-selector">
            <el-select v-model="baseCurrency">
              <el-option v-for="currency in availableCurrencies" :key="currency" :value="currency">
                <div style="align-items: center;display: flex;">
                    <span :class="`fi fi-${getCurrencyFlag(currency)}`" class="currency-flag"></span>
                    <span>{{ currency }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
        </el-col>

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

    <el-main>
      <!-- 汇率表格 -->
      <el-table
        :data="paginatedRates"
        style="width: 100%"
        @row-click="showTrend"
        :row-class-name="'clickable-row'"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        
        <el-table-column prop="currency" label="货币" width="150" align="center">
          <template #default="{ row }">
            <div style="display: flex; justify-content: center">
              <span :class="`fi fi-${getCurrencyFlag(row.currency)}`" class="currency-flag"></span>
              <span>{{ row.currency }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="From" prop="fromRate" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-green': row.fromRate > 0 }">
              {{ row.fromRate.toFixed(4) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="To" prop="toRate" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-red': row.toRate > 0 }">
              {{ row.toRate.toFixed(4) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="上次更新时间" width="180" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-blue': row.updateTime }">
              {{ row.updateTime }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10]"
        layout="total, sizes, prev, pager, next"
        :total="filteredRates.length"
        class="pagination"
      />
    </el-main>

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
                <el-option v-for="currency in availableCurrencies" :key="currency" :value="currency">
                  <div style="display: flex;align-items: center;">
                    <span :class="`fi fi-${getCurrencyFlag(currency)}`" class="currency-flag"></span>
                    {{ currency }}
                  </div>
                </el-option>
              </el-select>
              <span class="currency-separator">=></span>
              <el-select v-model="toCurrency" class="currency-select" @change="updateTrendData">
                <el-option v-for="currency in availableCurrencies" :key="currency" :value="currency">
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
            <el-select v-model="trendPeriod" @change="updateTrendData" style="width: 35%;left: 65%;">
              <el-option value="week">近一周</el-option>
              <el-option value="month">近一月</el-option>
              <el-option value="year">近一年</el-option>
            </el-select>
          </el-col>
          
        </el-row>

        <v-chart class="trend-chart" :option="chartOption" autoresize />
      </div>
    </el-dialog>
  </div>
</el-main>
</template>

<style scoped>
.main-container {
    height: 100%;
}

.rate-container {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  width: 80%;
  height: 95%;
  margin: 0 auto;
}

/* 覆盖 Element 组件样式 */
:deep(.el-table) {
  --el-table-border-color: #e2e8f0;
  --el-table-header-bg-color: #f8fafc;
}

:deep(.el-table th) {
  font-weight: 600;
  color: #1f2937;
  text-transform: uppercase;
  font-size: 14px;
}

:deep(.el-table td) {
  padding: 14px 0;
}

:deep(.clickable-row) {
  cursor: pointer;
}

:deep(.clickable-row:hover) {
  background-color: #f8fafc !important;
}

.currency-flag {
  width: 1.5em;
  height: 1.5em;
  margin-right: 8px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.currency-select {
  width: 25%;
  margin: 0 auto;
}

.text-green {
  color: #22c55e;
  font-weight: bold;
}

.text-red {
  color: #ef4444;
  font-weight: bold;
}

.text-blue {
  color: blue;
}

.pagination {
  padding: 50px;
  justify-content: center;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #6366f1;
}

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

:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #e2e8f0;
}

.header {
  justify-content: space-between;
  margin-top: 20px;
}
</style>
