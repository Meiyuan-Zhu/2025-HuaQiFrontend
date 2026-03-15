<template>
    <div class="kline-section">
      <!-- 
        当 loadedData 中有N个文件，就渲染N个图表容器
        如果没数据则显示"暂无数据"
      -->
      <div v-if="loadedData.length === 0 && !isLoading" class="no-data-container">
        <el-empty 
          description="暂无K线数据" 
          :image-size="120"
        >
          <template #image>
            <div class="custom-empty-icon">
              <i class="el-icon-data-empty"></i>
            </div>
          </template>
          <template #description>
            <p class="no-data-text">暂无K线数据</p>
            <p class="no-data-hint">请尝试选择其他货币对或策略</p>
          </template>
        </el-empty>
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
  import { resampleData } from "./resampleData";
  import { buildApiUrl } from "../../utils/api";
  
  /**
   * 父组件通过props传入
   */
  const props = defineProps<{
    currencyPair: string; // e.g. "CNY/JPY"
    strategy: string;     // e.g. "MACD"
    timeRange: string;    // e.g. "1M"
  }>();
  
  // 定义事件
  const emit = defineEmits(['loading-change']);
  
  // 添加加载状态
  const isLoading = ref(false);
  
  /** chartRefs: Ref数组，用来存放多个图表容器引用 */
  const chartRefs = ref<(HTMLElement | null)[]>([]);
  let chartInstances: echarts.ECharts[] = [];
  
  /** loadedData: 可能有2个文件(传统 / +Model)，每个文件产生1个K线 */
  const loadedData = ref<Array<{
    title: string;
    candlestickData: (string|number)[][];
    dates: string[];
  }>>([]);

  const currencyPairMap: Record<string, string> = {
  "CNY/USD": "中美",
  "CNY/EUR": "中欧",
  "CNY/AUD": "中澳",
  "CNY/JPY": "中日"
}
  
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
    // 设置加载状态为true并通知父组件
    isLoading.value = true;
    emit('loading-change', true);
  
    // 1) 清理旧图表
    chartInstances.forEach(inst => inst.dispose());
    chartInstances = [];
    chartRefs.value = [];
    loadedData.value = [];
  
    // 2) 判断要加载哪些文件(传统 & +Model)
    const baseName = props.strategy; 
    const filesToTry = [
      { filename: `${baseName}_result`, title: "传统策略K线" },
      { filename: `${baseName}+Model_result`, title: "模型融合K线" }
    ];
  
    // 3) 并行加载
    const results: Array<{ title:string; raw: any}> = [];
    for (const f of filesToTry) {
      try {
        const url = buildApiUrl(`/v1/backtest/result?currency_pair=${currencyPairMap[props.currencyPair]}&strategy=${f.filename}`);
        const res = await axios.get(url);
        if (res.data && res.data.data) {  // 添加数据有效性检查
          results.push({ title: f.title, raw: res.data });
          console.log(`文件 ${f.filename} 加载成功`);
        }
      } catch (err) {
        console.warn(`文件 ${f.filename} 不存在或加载失败`, err);
      }
    }
  
    // 4) 如果没有任何有效数据，直接返回
    if (results.length === 0) {
      console.log("没有找到任何有效数据");
      return;
    }
  
    // 5) 按 timeRange 计算起始日期
    const startDate = calcStartDate(props.timeRange);
    console.log("startDate", startDate);
  
    // 6) 解析各文件，过滤数据
    const newData: any[] = [];
    for (const r of results) {
      if (!r.raw || !r.raw.data) continue;
      const fullData = r.raw.data;
      const filtered = fullData.filter((item: any) => item.date >= startDate);
      
      if (filtered.length === 0) continue;  // 跳过空数据

      let mode = 'none';
      if (props.timeRange === '3Y') {
        mode = 'week';
      } else if (props.timeRange === '1Y') {
        mode = 'week';
      }
      const aggregated = resampleData(filtered, mode);

      // 组装 candlestickData
      const candlestickData: number[][] = [];
      const dateArr: string[] = [];
      aggregated.forEach((item: any) => {
        if (!item.trueData) return;  // 添加数据有效性检查
        
        const date = item.date.substring(0, 10);
        const open = parseFloat(item.trueData.open);
        const close = parseFloat(item.trueData.close);
        const low = parseFloat(item.trueData.low);
        const high = parseFloat(item.trueData.high);
        
        if (!isNaN(open) && !isNaN(close) && !isNaN(low) && !isNaN(high)) {
          candlestickData.push([open, close, low, high]);
          dateArr.push(date);
        }
      });

      if (candlestickData.length > 0) {  // 只添加有效数据
        newData.push({
          title: r.title,
          candlestickData,
          dates: dateArr
        });
      }
    }

    // 7) 更新数据并渲染
    if (newData.length > 0) {
      loadedData.value = newData;
      console.log("loadedData", loadedData.value);
      
      // 8) DOM更新后渲染图表
      nextTick(() => {
        renderCharts();
        // 渲染完成后设置加载状态为false
        isLoading.value = false;
        emit('loading-change', false);
      });
    } else {
      // 如果没有数据，也需要设置加载状态为false
      isLoading.value = false;
      emit('loading-change', false);
    }
  }
  
  /** renderCharts: 逐个init & setOption */
  function renderCharts() {
    loadedData.value.forEach((d, i) => {
      const el = chartRefs.value[i];
      if (!el) return;
      const inst = echarts.init(el);
      chartInstances.push(inst);
  
      const option: echarts.EChartsOption = {
        title: { 
          text: d.title,
          left: "left",  // 改为左对齐
          textStyle: {
            fontSize: 16,
            fontWeight: 600,
            color: '#1e293b'
          },
          padding: [0, 0, 20, 0]  // 添加底部内边距
        },
        tooltip: { 
          trigger: "axis",
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#9ca3af'
            },
            lineStyle: {
              type: 'dashed'
            }
          },
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          textStyle: {
            color: '#374151',
            fontSize: 12
          },
          padding: [8, 12],
          formatter: function (params: any) {
            const data = params[0].data;
            return [
              `<div style="font-weight:500;margin-bottom:4px;color:#374151">${params[0].axisValue}</div>`,
              `<div style="display:flex;justify-content:space-between;margin:4px 0">`,
              `<span style="color:#6b7280">开盘</span>`,
              `<span style="font-weight:500;color:#374151">${data[1]}</span>`,
              `</div>`,
              `<div style="display:flex;justify-content:space-between;margin:4px 0">`,
              `<span style="color:#6b7280">收盘</span>`,
              `<span style="font-weight:500;color:#374151">${data[2]}</span>`,
              `</div>`,
              `<div style="display:flex;justify-content:space-between;margin:4px 0">`,
              `<span style="color:#6b7280">最低</span>`,
              `<span style="font-weight:500;color:#374151">${data[3]}</span>`,
              `</div>`,
              `<div style="display:flex;justify-content:space-between;margin:4px 0">`,
              `<span style="color:#6b7280">最高</span>`,
              `<span style="font-weight:500;color:#374151">${data[4]}</span>`,
              `</div>`
            ].join('');
          },
          extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-radius: 4px;'
        },
        xAxis: { 
          type: "category", 
          data: d.dates,
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#6b7280',
            fontSize: 11,
            rotate: 30
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#f1f5f9',
              type: 'dashed'
            }
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
            color: '#6b7280',
            fontSize: 11,
            formatter: (value: number) => value.toFixed(4)
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#e5e7eb'
            }
          }
        },
        dataZoom: [
          { 
            type: "slider",
            xAxisIndex: 0,
            start: 0,
            end: 100,
            borderColor: '#e5e7eb',
            backgroundColor: '#f8fafc',
            fillerColor: 'rgba(37, 99, 235, 0.05)',
            handleStyle: {
              color: '#2563eb',
              borderColor: '#2563eb'
            },
            textStyle: {
              color: '#6b7280'
            },
            brushSelect: false,
            handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%'
          },
          { 
            type: "inside",
            xAxisIndex: 0
          }
        ],
        series: [
          {
            name: d.title,
            type: "candlestick",
            data: d.candlestickData,
            itemStyle: {
              color: '#ef4444',      // 上涨红色
              color0: '#22c55e',     // 下跌绿色
              borderColor: '#ef4444',
              borderColor0: '#22c55e'
            }
          }
        ],
        grid: {
          top: '8%',
          left: '3%',
          right: '3%',
          bottom: '15%',
          containLabel: true
        }
      };

      // 输出数据进行调试
      console.log("K线数据:", d.candlestickData);
      
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
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    min-height: 300px; /* 确保即使没有数据也有一定高度 */
  }
  
  /* 暂无数据样式 */
  .no-data-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    width: 100%;
  }
  
  .custom-empty-icon {
    font-size: 60px;
    color: #e5e7eb;
    background: #f9fafb;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }
  
  .no-data-text {
    font-size: 16px;
    color: #374151;
    font-weight: 500;
    margin: 0 0 8px;
  }
  
  .no-data-hint {
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
  }
  
  .kline-box {
    margin-bottom: 20px;
  }
  
  .kline-box:last-child {
    margin-bottom: 0;  /* 最后一个图表不需要底部边距 */
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
    height: 460px;  /* 增加图表高度 */
    background: #ffffff;
    padding: 16px;
  }
  </style>
