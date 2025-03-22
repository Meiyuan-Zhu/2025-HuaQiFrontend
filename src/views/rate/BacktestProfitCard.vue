<template>
  <div class="kline-section">
    <div v-if="selectedYields.length === 0">
      <p>暂无数据</p>
    </div>
    <div v-for="(item, index) in selectedYields" :key="index" class="kline-box">
      <h4>{{ item.title }}
        <div class="strategy-tag">{{ props.strategy }}</div>
      </h4>
      <div class="yield-content">
        <ul class="metrics-list">
          <li>
            <span class="metric-label">累计收益率</span>
            <span class="metric-value" :class="getValueClass(item.Cumulative_Return)">
              {{ formatPercent(item.Cumulative_Return) }}
            </span>
          </li>
          <li>
            <span class="metric-label">年化收益率</span>
            <span class="metric-value" :class="getValueClass(item.Annualized_Return)">
              {{ formatPercent(item.Annualized_Return) }}
            </span>
          </li>
          <li>
            <span class="metric-label">夏普比</span>
            <span class="metric-value" :class="getValueClass(item.Sharpe_Ratio)">
              {{ item.Sharpe_Ratio.toFixed(2) }}
            </span>
          </li>
          <li>
            <span class="metric-label">最大回撤</span>
            <span class="metric-value drawdown">
              {{ formatPercent(item.Maximum_Drawdown) }}
            </span>
          </li>
          <li>
            <span class="metric-label">卡玛比率</span>
            <span class="metric-value" :class="getValueClass(item.Calmar_Ratio)">
              {{ item.Calmar_Ratio.toFixed(2) }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";

// 定义收益数据类型
interface YieldDataItem {
  period: string;
  Cumulative_Return: number;
  Annualized_Return: number;
  Sharpe_Ratio: number;
  Maximum_Drawdown: number;
  Calmar_Ratio: number;
}

interface YieldJson {
  currency_pair: string;
  Strategy: string;
  data: YieldDataItem[];
}

// 通过 props 传入货币对、策略、时间跨度
const props = defineProps<{
  currencyPair: string; // 例如 "中日"
  strategy: string;     // 例如 "Aberration"（注意：后续文件名为 "Aberration_result.json" 和 "Aberration+Model_result.json"）
  timeRange: string;    // 例如 "1W", "1M", "1S", "1Y", "3Y"
}>();

// 定义时间跨度映射，将 timeRange 映射到 JSON 数据中的 period 字符串
const periodMapping: Record<string, string> = {
  "1W": "1Week",
  "1M": "1Month",
  "1Q": "1Quarter",
  "1Y": "1Year",
  "3Y": "3Year"
};

// 用于存储加载到的所有收益数据（可能有传统和模型两份）
const yieldDataArray = ref<YieldJson[]>([]);

// 计算属性：从 yieldDataArray 中筛选出对应当前 timeRange 的记录
const selectedYields = computed(() => {
  const targetPeriod = periodMapping[props.timeRange];
  const list: (YieldDataItem & { title: string })[] = [];
  yieldDataArray.value.forEach(json => {
    // 从每个 JSON 文件的 data 数组中查找 period 匹配 targetPeriod 的记录
    const record = json.data.find(item => item.period === targetPeriod);
    if (record) {
      // 将记录和文件对应的标题一起返回
      list.push({ ...record, title: json.Strategy });
    }
  });
  return list;
});

// 格式化百分比的函数
function formatPercent(val: number): string {
  return (val * 100).toFixed(2) + '%';
}

// 加载收益数据的函数：尝试加载两个 JSON 文件
async function loadYieldData() {
  yieldDataArray.value = []; // 清空旧数据

  // 根据策略构造文件名：传统文件和融合模型文件
  // 假设传统文件格式为 "{strategy}_result.json"
  // 融合模型文件格式为 "{strategy}+Model_result.json"
  const baseName = props.strategy; // 如 "Aberration"
  const filesToTry = [
    { filename: `${baseName}_result.json`, title: "传统收益指标" },
    { filename: `${baseName}+Model_result.json`, title: "模型融合收益指标" }
  ];

  for (const f of filesToTry) {
    try {
      const url = `http://localhost:3000/data/backtest-profit/${props.currencyPair}/${f.filename}`;
      const res = await axios.get(url);
      // 推入时使用返回数据（假设格式符合 YieldJson），同时覆盖 Strategy 字段为标题（或保留原值也可以）
      yieldDataArray.value.push({
        ...res.data,
        Strategy: f.title
      });
      console.log(`加载成功：${f.filename}`, res.data);
    } catch (err) {
      console.warn(`文件 ${f.filename} 不存在或加载失败`, err);
    }
  }
}

// 监听 props 的变化，并在变化时重新加载收益数据
watch(() => props, () => {
  loadYieldData();
}, { deep: true });

onMounted(() => {
  loadYieldData();
});

// 添加一个新的函数来处理数值的颜色类
function getValueClass(value: number): string {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}
</script>

<style scoped>
.kline-section {
  margin-top: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.kline-box {
  margin-bottom: 20px;
}

.kline-box:last-child {
  margin-bottom: 0;
}

.kline-box h4 {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kline-box h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #3b82f6;
  margin-right: 8px;
  border-radius: 2px;
}

.strategy-tag {
  font-size: 12px;
  padding: 4px 8px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 4px;
  font-weight: 500;
}

.yield-content {
  padding: 16px 20px;
}

.metrics-list {
  list-style: none;
  padding: 16px 20px;
  margin: 0;
}

.metrics-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.metrics-list li:last-child {
  border-bottom: none;
}

.metric-label {
  color: #64748b;
  font-size: 14px;
}

.metric-value {
  font-size: 15px;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
}

.positive {
  color: #22c55e;
}

.negative {
  color: #ef4444;
}

.neutral {
  color: #64748b;
}

.drawdown {
  color: #f97316;
}

.model-card {
  border-left: 4px solid #6366f1;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: #f8fafc;
  border-radius: 8px;
  color: #64748b;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .yield-cards {
    grid-template-columns: 1fr;
  }
  
  .yield-section {
    padding: 12px;
  }
  
  .card-header {
    padding: 12px 16px;
  }
  
  .metrics-list {
    padding: 12px 16px;
  }
}
</style>