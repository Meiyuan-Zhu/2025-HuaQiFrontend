<template>
    <div class="kline-section">
      <!-- 
        当 loadedData 中有N个文件，就渲染N个图表容器
        如果没数据则显示“暂无数据”
      -->
      <div v-if="loadedData.length === 0">
        <p>暂无数据</p>
      </div>
      <div
        v-for="(item, index) in loadedData"
        :key="index"
        class="kline-box"
      >
        <h4>{{ item.title }}</h4>
        <div 
          :ref="(el) => {
            console.log('ref callback', index, el);
            chartRefs[index] = el as HTMLElement | null;
          }"
          class="kline-canvas"
        ></div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted, nextTick } from "vue";
  import axios from "axios";
  import * as echarts from "echarts";
  
  /**
   * 父组件通过props传入
   */
  const props = defineProps<{
    currencyPair: string; // e.g. "CNY/JPY"
    strategy: string;     // e.g. "MACD"
    timeRange: string;    // e.g. "1M"
  }>();
  
  /** chartRefs: Ref数组，用来存放多个图表容器引用 */
  const chartRefs = ref<(HTMLElement | null)[]>([]);
  let chartInstances: echarts.ECharts[] = [];
  
  /** loadedData: 可能有2个文件(传统 / +Model)，每个文件产生1个K线 */
  const loadedData = ref<Array<{
    title: string;
    candlestickData: (string|number)[][];
    dates: string[];
  }>>([]);
  
  /** 组件挂载 & watch */
  onMounted(() => {
    loadAndRender();
  });
  watch(
    () => [props.currencyPair, props.strategy, props.timeRange],
    () => {
      nextTick(() => loadAndRender());
    }
  );
  
  /** 根据props加载json文件,筛选数据,填充loadedData */
  async function loadAndRender() {
    // 1) 清理旧图表
    chartInstances.forEach(inst => inst.dispose());
    chartInstances = [];
    chartRefs.value = [];
    loadedData.value = [];
  
    // 2) 判断要加载哪些文件(传统 & +Model)
    const baseName = props.strategy; 
    const filesToTry = [
      { filename: `${baseName}_result.json`, title: "传统策略K线" },
      { filename: `${baseName}+Model_result.json`, title: "模型融合K线" }
    ];
  
    // 3) 并行加载
    const results: Array<{ title:string; raw: any}> = [];
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
  
    // 4) 按 timeRange 计算起始日期(如 "1M" => 最近30天)
    const startDate = calcStartDate(props.timeRange);
    console.log("startDate", startDate);
  
    // 5) 解析各文件，过滤数据
    const newData: any[] = [];
    for (const r of results) {
      if (!r.raw || !r.raw.data) continue;
      const fullData = r.raw.data; // 2021~至今
      // 筛选 >= startDate
      const filtered = fullData.filter((item: any) => item.date >= startDate);
      
      // 组装 candlestickData
      const candlestickData: (string|number)[][] = [];
      const dateArr: string[] = [];
      filtered.forEach((item: any) => {
        const date = item.date;
        // open,close,high,low
        candlestickData.push([date, item.true.open, item.true.close, item.true.low, item.true.high]);
        dateArr.push(date);
      });
      newData.push({
        title: r.title,
        candlestickData,
        dates: dateArr
      });
    }
    loadedData.value = newData;
    console.log("loadedData", loadedData.value);
    console.log("newData", newData);
  
    // 6) DOM更新后 => renderCharts
    nextTick(() => {
      renderCharts();
    });
  }
  
  /** renderCharts: 逐个init & setOption */
  function renderCharts() {
    loadedData.value.forEach((d, i) => {
      const el = chartRefs.value[i];
      if (!el) return;
      const inst = echarts.init(el);
      chartInstances.push(inst);
  
      const option: echarts.EChartsOption = {
        title: { text: d.title, left: "center" },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: d.dates },
        yAxis: { 
            type: "value",
            scale: true, 
        },
        dataZoom: [
          { type: "slider", xAxisIndex: 0, start: 0, end: 100 },
          { type: "inside", xAxisIndex: 0 }
        ],
        series: [
          {
            name: d.title,
            type: "candlestick",
            encode: { x: 0, y: [1, 2, 3, 4] },
            data: d.candlestickData
          }
        ]
      };
      inst.setOption(option);
    });
  }
  
  /** 根据 timeRange("1W","1M","1Q","1Y","3Y")计算起始日期(YYYY-MM-DD) */
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
    const startTs = now.getTime() - offsetDays * 24*3600*1000;
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
    border: 1px solid #ddd;
    padding: 10px;
  }
  .kline-box {
    margin-bottom: 20px;
  }
  .kline-canvas {
    width: 100%;
    height: 400px;
    background: #f8f8f8;
    margin-top: 10px;
  }
  </style>
