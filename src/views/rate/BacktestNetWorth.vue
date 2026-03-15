<template>
  <div class="kline-section">
    <!-- 优化暂无数据的显示 -->
    <div v-if="loadedData.length === 0 && !isLoading" class="no-data-container">
      <el-empty 
        description="暂无净值数据" 
        :image-size="120"
      >
        <template #image>
          <div class="custom-empty-icon">
            <i class="el-icon-data-line"></i>
          </div>
        </template>
        <template #description>
          <p class="no-data-text">暂无净值数据</p>
          <p class="no-data-hint">请尝试选择其他货币对或策略</p>
        </template>
      </el-empty>
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
import { buildApiUrl } from "../../utils/api";

/** 父组件通过 props 传入 currencyPair, strategy, timeRange */
const props = defineProps<{
  currencyPair: string;
  strategy: string;
  timeRange: string;
}>();

// 定义事件
const emit = defineEmits(['loading-change']);

// 添加加载状态
const isLoading = ref(false);

/** 存放多个折线图容器的引用 */
const lineRefs = ref<(HTMLElement | null)[]>([]);
let lineChartInstances: echarts.ECharts[] = [];

/** loadedData: 可能有两份文件(传统 / +Model)，每份都生成一条折线 */
const loadedData = ref<Array<{
  title: string;
  lineData: [string, number][]; // [date, pred]
  dates: string[];
}>>([]);

const currencyPairMap: Record<string, string> = {
  "CNY/USD": "中美",
  "CNY/EUR": "中欧",
  "CNY/AUD": "中澳",
  "CNY/JPY": "中日"
}

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
  // 设置加载状态为true并通知父组件
  isLoading.value = true;
  emit('loading-change', true);
  
  try {
    // 清理旧图表
    lineChartInstances.forEach(inst => inst.dispose());
    lineChartInstances = [];
    lineRefs.value = [];
    loadedData.value = [];

    // 1. 判断要加载哪些文件
    const baseName = props.strategy; 
    const filesToTry = [
      { filename: `${baseName}_result`, title: "传统策略净值折线图" },
      { filename: `${baseName}+Model_result`, title: "模型融合净值折线图" }
    ];

    // 2. 并行加载
    const results: Array<{ title: string; raw: any }> = [];
    for (const f of filesToTry) {
      try {
        const url = buildApiUrl(`/v1/backtest/result?currency_pair=${currencyPairMap[props.currencyPair]}&strategy=${f.filename}`);
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

      // 生成 lineData: [ [date, Current_net_worth], ... ]
      const lineData: [string, number][] = [];
      const dateArr: string[] = [];
      filtered.forEach((item: any) => {
        const date = item.date.substring(0, 10);
        const netWorthVal = item.current_net_worth; 
        lineData.push([date, netWorthVal]);
        dateArr.push(date);
      });

      newData.push({
        title: r.title,
        lineData,
        dates: dateArr
      });
    }
    loadedData.value = newData;

    // 5. DOM更新后 => render
    nextTick(() => {
      renderCharts();
      // 渲染完成后设置加载状态为false
      isLoading.value = false;
      emit('loading-change', false);
    });
  } catch (error) {
    console.error("加载或渲染净值数据时出错:", error);
    // 出错时也需要设置加载状态为false
    isLoading.value = false;
    emit('loading-change', false);
  }
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
            color: '#10b981'  // 使用绿色表示净值
          },
          itemStyle: {
            color: '#10b981',
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(16, 185, 129, 0.2)'
              },
              {
                offset: 1,
                color: 'rgba(16, 185, 129, 0.02)'
              }
            ])
          }
        }
      ],
      grid: {
        top: '8%',
        left: '3%',
        right: '3%',
        bottom: '15%',
        containLabel: true
      },
      dataZoom: [
        {
          type: "slider",
          xAxisIndex: 0,
          start: 0,
          end: 100,
          borderColor: '#e5e7eb',
          backgroundColor: '#f8fafc',
          fillerColor: 'rgba(16, 185, 129, 0.05)',  // 使用绿色主题
          handleStyle: {
            color: '#10b981',
            borderColor: '#10b981'
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
  color: #10b981; /* 使用绿色主题 */
  background: #ecfdf5;
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
  background: #10b981;  /* 使用绿色主题 */
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