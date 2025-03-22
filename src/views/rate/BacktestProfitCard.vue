<template>
    <div class="yield-section">
      <h3>回测收益指标</h3>
      <div class="yield-cards">
        <!-- 遍历筛选后的两个收益数据（可能只有一项） -->
        <el-card v-for="(item, index) in selectedYields" :key="index" class="yield-card">
          <h4>{{ item.title }}</h4>
          <ul>
            <li>累计收益率: {{ formatPercent(item.Cumulative_Return) }}</li>
            <li>年化收益率: {{ formatPercent(item.Annualized_Return) }}</li>
            <li>夏普比: {{ item.Sharpe_Ratio }}</li>
            <li>最大回撤: {{ formatPercent(item.Maximum_Drawdown) }}</li>
            <li>卡玛比率: {{ item.Calmar_Ratio }}</li>
          </ul>
        </el-card>
      </div>
      <p v-if="selectedYields.length === 0">暂无收益数据</p>
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
</script>

<style scoped>
.yield-section {
  padding: 20px;
}
.yield-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
.yield-card {
  width: 250px;
  padding: 10px;
  text-align: center;
}
.yield-card h4 {
  margin-bottom: 10px;
  font-size: 1.2rem;
}
.yield-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.yield-card li {
  margin-bottom: 5px;
  font-size: 0.9rem;
}
</style>