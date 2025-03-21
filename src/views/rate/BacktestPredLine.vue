<template>
    <div class="pred-line-section">
      <!-- 如果 loadedData 没有任何文件，就显示“暂无数据” -->
      <div v-if="loadedData.length === 0">
        <p>暂无数据</p>
      </div>
      <!-- 否则，对每份文件(传统 / +Model)渲染一条折线图 -->
      <div
        v-for="(item, index) in loadedData"
        :key="index"
        class="line-box"
      >
        <h4>{{ item.title }}</h4>
        <div
          :ref="(el) => lineRefs[index] = el as HTMLElement | null"
          class="line-canvas"
        ></div>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import axios from "axios";
import * as echarts from "echarts";
import { resampleData } from "./resampleData";

/** 父组件通过 props 传入 currencyPair, strategy, timeRange */
const props = defineProps<{
  currencyPair: string;
  strategy: string;
  timeRange: string;
}>();

/** 存放多个折线图容器的引用 */
const lineRefs = ref<(HTMLElement | null)[]>([]);
let lineChartInstances: echarts.ECharts[] = [];

/** loadedData: 可能有两份文件(传统 / +Model)，每份都生成一条折线 */
const loadedData = ref<Array<{
  title: string;
  lineData: [string, number][]; // [date, pred]
  markPoints: any[];
  dates: string[];
}>>([]);

/** 组件挂载 & 监听 props 变化 */
onMounted(() => {
  loadAndRender();
});
watch(
  () => [props.currencyPair, props.strategy, props.timeRange],
  () => {
    nextTick(() => loadAndRender());
  }
);

/** 加载 JSON 并渲染折线图 */
async function loadAndRender() {
    // 清理旧图表
  lineChartInstances.forEach(inst => inst.dispose());
  lineChartInstances = [];
  lineRefs.value = [];
  loadedData.value = [];

  // 1. 判断要加载哪些文件
const baseName = props.strategy; 
const filesToTry = [
    { filename: `${baseName}_result.json`, title: "传统策略预测" },
    { filename: `${baseName}+Model_result.json`, title: "模型融合预测" }
];

// 2. 并行加载
const results: Array<{ title: string; raw: any }> = [];
  for (const f of filesToTry) {
    try {
      const url = `http://localhost:3000/data/backtest-result/${props.currencyPair}/${f.filename}`;
      const res = await axios.get(url);
      results.push({ title: f.title, raw: res.data });
      console.log(`文件 ${f.filename} 加载成功`);
    } catch (err) {
      console.warn(`文件 ${f.filename} 不存在或加载失败`, err);
    }
  }

// 3. 计算起始日期
const startDate = calcStartDate(props.timeRange);

// 4. 解析 each file 的 data => lineData
const newData: any[] = [];
for (const r of results) {
    if (!r.raw || !r.raw.data) continue;

    const fullData = r.raw.data;
    // 筛选 >= startDate
    const filtered = fullData.filter((item: any) => item.date >= startDate);
    let mode = 'none';
    if (props.timeRange === '3Y') {
      mode = 'month';
    } else if (props.timeRange === '1Y') {
      mode = 'week';
    }
    const aggregated = resampleData(filtered,mode);
    
    // 生成 lineData: [ [date, pred], ... ]
    const lineData: [string, number][] = [];
    const dateArr: string[] = [];
    const markPoints: any[] = [];
    aggregated.forEach((item: any) => {
      const date = item.date;
      const predVal = item.pred; // 预测值
      lineData.push([date, predVal]);
      dateArr.push(date);

      if (item.signal == "buy") {
        console.log("buy", date, predVal);
        
        markPoints.push({
          name: "Buy",
          coord: [date, predVal],
          value: predVal,
          itemStyle: { color: "red" },
          label: { show: true, formatter: "Buy" } // 修改此处
        });
      } else if (item.signal === "sell") {
        markPoints.push({
          name: "Sell",
          coord: [date, predVal],
          value: predVal,
          itemStyle: { color: "green" },
          label: { show: true, formatter: "Sell" } // 修改此处
        });
      }
    });

    newData.push({
      title: r.title,
      lineData,
      dates: dateArr,
      markPoints
    });
}
loadedData.value = newData;

// 5. DOM更新后 => render
nextTick(() => {
    renderCharts();
});
    
}

/** renderCharts: init ECharts & setOption for each file */
function renderCharts() {
  loadedData.value.forEach((d, i) => {
    const el = lineRefs.value[i];
    if (!el) return;
    const inst = echarts.init(el);
    lineChartInstances.push(inst);

    const option: echarts.EChartsOption = {
      title: { text: d.title, left: "center" },
      tooltip: {
        trigger: "axis",
        formatter: (ps) => {
          const params = ps as any[];
          if (!params.length) return "";
          const param = params[0];
          const date = param.axisValue;
          const val = param.data?.[1];
          return `${date}<br/>预测值: ${val}`;
        }
      },
      dataZoom: [
        { type: "slider", xAxisIndex: 0, start: 0, end: 100 },
        { type: "inside", xAxisIndex: 0 }
      ],
      xAxis: {
        type: "category",
        data: d.dates,
        axisLabel: { rotate: 45 }
      },
      yAxis: {
        type: "value",
        scale: true, 
      },
      series: [
        {
          name: d.title,
          type: "line",
          encode: { x: 0, y: 1 },
          data: d.lineData,
          smooth: true,
          markPoint: {
            symbol: 'pin',
            symbolSize: 50,
            data: d.markPoints
          }
        }
      ]
    };

    inst.setOption(option);
  });
}


function calcStartDate(tr: string): string {
  const now = new Date("2025-01-27"); 
  let offsetDays = 30;
  switch(tr) {
    case "1W": offsetDays = 7; break;
    case "1M": offsetDays = 30; break;
    case "1S": offsetDays = 90; break;
    case "1Y": offsetDays = 365; break;
    case "3Y": offsetDays = 365 * 3; break;
  }
  const startTs = now.getTime() - offsetDays * 86400000;
  const start = new Date(startTs);
  const y = start.getFullYear();
  const m = String(start.getMonth()+1).padStart(2,"0");
  const d = String(start.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

</script>

<style scoped>
.pred-line-section {
  border: 1px solid #ddd;
  padding: 10px;
}
.line-box {
  margin-bottom: 20px;
}
.line-canvas {
  width: 100%;
  height: 400px;
  background: #f8f8f8;
  margin-top: 10px;
}
</style>