<template>
  <div class="kline-section">
    <div v-if="loadedData.length === 0">
      <p>暂无数据</p>
    </div>
    <div v-for="(item, index) in loadedData" :key="index" class="kline-box">
      <h4>{{ item.title }}</h4>
      <div :ref="(el) => lineRefs[index] = el as HTMLElement | null" class="kline-canvas"></div>
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
      title: { 
        text: d.title,
        left: "center",
        textStyle: {
          fontSize: 16,
          fontWeight: 500,
          color: '#1e293b'
        }
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#1e293b'
        },
        padding: [8, 12],
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;'
      },
      xAxis: {
        type: "category",
        data: d.dates,
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 12
        }
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 12
        }
      },
      series: [
        {
          name: d.title,
          type: "line",
          data: d.lineData,
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
        }
      ],
      dataZoom: [
        {
          type: "slider",
          xAxisIndex: 0,
          start: 0,
          end: 100,
          borderColor: '#e5e7eb',
          backgroundColor: '#f8fafc',
          fillerColor: 'rgba(59, 130, 246, 0.05)',  // 使用蓝色主题
          handleStyle: {
            color: '#3b82f6',
            borderColor: '#3b82f6'
          },
          textStyle: {
            color: '#6b7280'
          },
          brushSelect: false,
          handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%'
        },
        {
          type: "inside",  // 启用内部缩放
          xAxisIndex: 0
        }
      ],
      grid: {
        top: '8%',
        left: '3%',
        right: '3%',
        bottom: '15%',  // 为缩放控件留出空间
        containLabel: true
      }
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
}

.kline-box h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #2563eb;
  margin-right: 8px;
  border-radius: 2px;
}

.kline-canvas {
  width: 100%;
  height: 460px;
  background: #ffffff;
  padding: 16px;
}
</style>