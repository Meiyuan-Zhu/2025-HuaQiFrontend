<script setup lang="ts">
import * as echarts from "echarts";
import { ref, reactive, watch, onMounted, nextTick, onUnmounted } from "vue";
import { getCurrencyFlag, parseCurrency, parseCurrencyFullName } from "../../utils/index";
import { Download } from "@element-plus/icons-vue"; //图标
import * as jspdf from "jspdf";
import "../../assets/cnfont";
import {
  ExplanationRequest,
  getExplanation,
  getPredict,
  PredictRequest,
} from "../../api/prediction";

//存放预测数据列表
const predictionList = ref([]);

//当前货币对
const currencyPair = reactive({
  from: "CNY",
  to: "USD",
});

// 可供选择的货币对
const currencyList = [
  { from: "CNY", to: "USD" },
  { from: "CNY", to: "EUR" },
  { from: "CNY", to: "JPY" },
  { from: "CNY", to: "AUD" },
];

// 选择货币对的回调函数
const selectedCurrency = ref(`${currencyPair.from}/${currencyPair.to}`);
const selectCurrency = (value: string) => {
  const [from, to] = value.split("/");
  currencyPair.from = from;
  currencyPair.to = to;
  console.log("选中的货币对：", currencyPair);
};
watch(currencyPair, () => {
  selectedCurrency.value = `${currencyPair.from}/${currencyPair.to}`;
});

//当前预测周期
const predictionPeriod = ref("1周");

//可供选择的预测周期
const predictionPeriodList = ["1周", "2周"];

// 根据时间范围返回对应数据点数量
const getCountFromTimeRange = (timeRange: string) => {
  switch (timeRange) {
    case "1周":
      return 7;
    case "2周":
      return 14;
    case "1月":
      return 30;
    default:
      return 7;
  }
};

// 格式化日期，截取T之前的部分
const formatDate = (dateString: string) => {
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  return dateString;
};

// 检查是否为日元相关货币对
const isJPYPair = () => {
  return currencyPair.from === "JPY" || currencyPair.to === "JPY";
};

// 格式化数值，根据货币对类型决定小数位数
const formatNumber = (value: number) => {
  // 日元相关货币对保留更多小数位
  if (isJPYPair()) {
    return Number(value.toFixed(5));
  }
  // 其他货币对最多保留4位小数
  return Number(value.toFixed(4));
};

// 计算合适的Y轴范围，使趋势更明显
const calculateYAxisRange = (values: number[]) => {
  if (!values || values.length === 0) return [0, 10];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // 日元相关货币对使用特殊处理
  if (isJPYPair()) {
    // 计算数据的相对变化幅度
    const relativeChange = (max - min) / min;
    
    // 如果相对变化幅度小于5%，扩大显示范围使趋势更明显
    if (relativeChange < 0.05) {
      // 对于小数值货币，使用更精确的范围计算
      const padding = min * 0.02; // 使用相对值的2%作为边距
      return [min - padding, max + padding];
    }
  } else {
    // 其他货币对使用原来的逻辑
    // 如果最大值和最小值相差太小，扩大范围使趋势更明显
    if (max - min < 0.01) {
      const mid = (max + min) / 2;
      return [mid * 0.99, mid * 1.01];
    }
  }
  
  // 对于变化较大的数据，使用常规边距
  const range = max - min;
  const padding = range * 0.1; // 10% 的边距
  return [min - padding, max + padding];
};

// ECharts K线图
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts;
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};

// 根据货币对获取颜色方案
const getColorScheme = () => {
  // 获取当前货币对组合
  const pair = `${currencyPair.from}${currencyPair.to}`;
  
  // 为不同货币对定义不同的颜色方案
  const colorSchemes: Record<string, {
    primary: string;
    secondary: string;
    areaStart: string;
    areaEnd: string;
  }> = {
    // 人民币美元：蓝色系
    'CNYUSD': {
      primary: '#1a237e',
      secondary: '#3949ab',
      areaStart: 'rgba(58, 71, 212, 0.3)',
      areaEnd: 'rgba(58, 71, 212, 0.1)'
    },
    // 人民币欧元：绿色系
    'CNYEUR': {
      primary: '#00695c',
      secondary: '#00897b',
      areaStart: 'rgba(0, 137, 123, 0.3)',
      areaEnd: 'rgba(0, 137, 123, 0.1)'
    },
    // 人民币日元：粉红色系
    'CNYJPY': {
      primary: '#e91e63',
      secondary: '#ec407a',
      areaStart: 'rgba(233, 30, 99, 0.3)',
      areaEnd: 'rgba(233, 30, 99, 0.1)'
    },
    // 人民币澳元：橙色系
    'CNYAUD': {
      primary: '#e65100',
      secondary: '#f57c00',
      areaStart: 'rgba(245, 124, 0, 0.3)',
      areaEnd: 'rgba(245, 124, 0, 0.1)'
    }
  };
  
  // 返回对应的颜色方案，如果没有找到则使用默认蓝色系
  return colorSchemes[pair] || colorSchemes['CNYUSD'];
};

const updateChart = () => {
  if (!chartInstance) return;

  const count = getCountFromTimeRange(predictionPeriod.value);
  const dates: any[] = [];
  const dataPred: any[] = [];

  //获取后端预测数据
  const predictRequest: PredictRequest = {
    currency: parseCurrency(currencyPair.from) + parseCurrency(currencyPair.to),
    timeSpan: count,
  };
  console.log(predictRequest);
  getPredict(predictRequest).then((res) => {
    console.log(res.data);
    if (res.data.code == 0) {
      const dataList = res.data.data;
      predictionList.value = dataList;
      //接收date作为x轴,接收pred作为y轴
      for (let i = 0; i < dataList.length; i++) {
        // 格式化日期，截取T之前的部分
        dates.push(formatDate(dataList[i].date));
        // 格式化数值，根据货币对类型决定小数位数
        dataPred.push(formatNumber(dataList[i].pred));
      }
      
      // 计算合适的Y轴范围
      const yAxisRange = calculateYAxisRange(dataPred);
      
      // 是否为日元相关货币对
      const jpyPair = isJPYPair();
      
      // 获取当前货币对的颜色方案
      const colors = getColorScheme();
      
      // 设置图表配置
      const option = {
        tooltip: { 
          trigger: "axis",
          formatter: function(params: any) {
            const date = params[0].axisValue;
            const value = params[0].data;
            // 日元相关货币对显示更多位数
            const formattedValue = jpyPair ? value.toFixed(5) : value;
            return `${date}<br/>${params[0].seriesName}: ${formattedValue}`;
          }
        },
        legend: { 
          data: ["预测汇率"],
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: "category", 
          data: dates,
          axisLabel: {
            rotate: 30,
            fontSize: 11
          },
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          }
        },
        yAxis: { 
          type: "value",
          min: yAxisRange[0],
          max: yAxisRange[1],
          // 日元相关货币对使用更多的刻度线和特殊缩放
          splitNumber: jpyPair ? 5 : 4,
          scale: jpyPair,
          axisLabel: {
            formatter: function(value: number) {
              // 日元相关货币对显示更多位数
              if (jpyPair) {
                return value.toFixed(5);
              }
              return formatNumber(value);
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#DDD'
            }
          }
        },
        series: [
          {
            name: "预测汇率",
            type: "line",
            data: dataPred,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              // 使用当前货币对的主色调
              color: colors.primary
            },
            lineStyle: {
              width: 3,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, 
                  // 使用当前货币对的主色调
                  color: colors.primary
                }, {
                  offset: 1, 
                  // 使用当前货币对的次色调
                  color: colors.secondary
                }]
              }
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  // 使用当前货币对的区域起始色
                  color: colors.areaStart
                }, {
                  offset: 1,
                  // 使用当前货币对的区域结束色
                  color: colors.areaEnd
                }]
              }
            },
            emphasis: {
              itemStyle: {
                // 使用当前货币对的次色调
                color: colors.secondary,
                borderWidth: 3,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 10
              }
            }
          },
        ],
      };
      console.log(option);

      chartInstance.setOption(option);
    } else {
      ElMessage({
        message: res.data.message,
        type: "error",
        center: true,
      });
    }
  });
};
watch([currencyPair, predictionPeriod], () => {
  nextTick(() => {
    updateChart();
  });
});
onMounted(() => {
  initChart();
  
  // 添加窗口大小变化监听，自动调整图表大小
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  });
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  });
  
  // 销毁图表实例
  if (chartInstance) {
    chartInstance.dispose();
  }
});

//是否展示AI报告
const showAIReport = ref(false);

//大模型回复的文本(写死的)
const reportText = ref(
  "这是基于本项目AI模型生成的汇率预测报告,预测结果仅供参考。\n你的预计收益是100美元。\n你需要在明天卖出。"
);

//文本框展示的文本
const textOutput = ref("");

//生成AI报告的流式数据
const printLine = async () => {
  if (textOutput.value.length >= reportText.value.length) {
    return;
  } else {
    setTimeout(() => {
      textOutput.value += reportText.value[textOutput.value.length];
      printLine();
    }, 50);
  }
};

const generateReport = async () => {
  //调用后端接口，生成AI报告
  const explanationRequest: ExplanationRequest = {
    currency: parseCurrency(currencyPair.from) + parseCurrency(currencyPair.to),
    timeSpan: getCountFromTimeRange(predictionPeriod.value),
    data: predictionList.value.map((item: any) => ({
      date: item.date,
      pred: typeof item.pred === 'number' ? formatNumber(item.pred) : item.pred
    })),
  };
  console.log(explanationRequest);

  showAIReport.value = true;
  setTimeout(() => {
    //视窗平滑滚动到底部
    const textArea = document.getElementById("textArea");
    if (textArea) {
      textArea.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, 150);

  getExplanation(explanationRequest).then((res) => {
    console.log(res.data);

    if (res.data.code === 0) {
      textOutput.value = res.data.data;
      //展示AI报告，缩小表格视图
      showAIReport.value = true;
      const echart = document.getElementById("echart");
      if (echart) {
        //scroll到echart位置
        echart.scrollIntoView({ behavior: "smooth" });
      }
      printLine();
    } else {
      ElMessage({
        message: res.data.msg,
        type: "error",
        center: true,
      });
    }
  });
};

const closeReport = () => {
  const echart = document.getElementById("echart");
  if (echart) {
    showAIReport.value = false;
  }
};

const downloadReport = () => {
  //将reportText字符串文本转化成pdf并下载
  const content = reportText.value;
  const doc = new jspdf.jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margins = { left: 10, top: 10, bottom: 10 };
  const maxWidth = pageWidth - margins.left * 2;
  const filename = "AI报告.pdf";

  doc.setFont("cnfont");

  // 分割文本为适合宽度的行数组
  const lines = doc.splitTextToSize(content, maxWidth);

  let yPos = margins.top;
  const lineHeight = 10; // 根据字体大小调整行高

  lines.forEach((line: string | string[]) => {
    // 检查是否需要分页
    if (yPos > doc.internal.pageSize.getHeight() - margins.bottom) {
      doc.addPage();
      yPos = margins.top;
    }
    doc.text(line, margins.left, yPos);
    yPos += lineHeight;
  });

  doc.save(filename); // 触发下载
};
</script>

<template>
  <div class="backtest-page">
    <!-- 主要内容 -->
    <div class="page-header">
      <h1 class="page-title">汇率预测</h1>
    </div>

    <div class="top-section">
      <div class="spot-rate-card">
        <div class="currency-display">
          <div class="flags-wrapper">
            <span
              :class="`fi fi-${getCurrencyFlag(currencyPair.from)}`"
              class="currency-flag"
            ></span>
            <span class="exchange-arrow">→</span>
            <span
              :class="`fi fi-${getCurrencyFlag(currencyPair.to)}`"
              class="currency-flag"
            ></span>
          </div>
          <div class="pair-info">
            <div class="pair-name">{{ parseCurrencyFullName(currencyPair.from) + "/" + parseCurrencyFullName(currencyPair.to) }}</div>
            <div class="pair-label">
              {{ currencyPair.from + "/" + currencyPair.to }}
            </div>
          </div>
          <div v-if="!showAIReport" class="rate-info">
            <el-button @click="generateReport" type="primary" color="#626aef">
              生成AI报告
            </el-button>
          </div>
        </div>
      </div>

      <div class="control-panel">
        <!-- 货币对选择卡片 -->
        <div class="control-card">
          <div class="card-title">货币对</div>
          <el-select
              v-model="selectedCurrency"
              placeholder="选择货币对"
              @change="selectCurrency"
              style="width: 100%"
            >
              <el-option
                v-for="(item, index) in currencyList"
                :key="index"
                :label="`${item.from}/${item.to}`"
                :value="`${item.from}/${item.to}`"
              >
                <template #default="">
                  <span style="padding: 2px"></span>
                  <span>{{ parseCurrencyFullName(item.from) + "/" + parseCurrencyFullName(item.to) }}</span>
                </template>
              </el-option>
            </el-select>
        </div>

        <!-- 时间跨度选择卡片 -->
        <div class="control-card">
          <div class="card-title">时间跨度</div>
            <el-select
              v-model="predictionPeriod"
              placeholder="请选择预测周期"
              style="width: 100%"
            >
              <el-option
                v-for="item in predictionPeriodList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="analysis-section">

        <div class="section-header">
          <div class="section-tools">
            <!-- 这里可以添加一些工具按钮 -->
          </div>
        </div>

        <div class="charts-wrapper">
          <div class="chart-container main" id="echart">
            <div ref="chartRef" style="height: 400px; width: 100%"></div>
          </div>
        </div>
      </div>

      <div v-if="showAIReport" class="report-section">
        <div class="report-header">
          <h3>AI 分析报告</h3>
          <div class="report-actions">
            <el-button
              type="primary"
              :icon="Download"
              size="small"
              @click="downloadReport"
              >下载报告</el-button
            >
            <el-button type="default" size="small" @click="closeReport"
              >关闭</el-button
            >
          </div>
        </div>
        <div class="report-content">
          <el-input
            id="textArea"
            v-model="textOutput"
            type="textarea"
            :rows="10"
            readonly
            resize="none"
            class="textArea"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.textArea {
  width: 100%;
  height: 100%;
  margin-top: 10px;
}
</style>

<style scoped>
.backtest-page {
  width: 100%;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  padding: 20px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  position: relative;
  display: inline-block;
}

.page-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #1a237e, #0d47a1);
  border-radius: 2px;
}

.spot-rate-card {
  background: linear-gradient(135deg, #1a237e, #0d47a1);
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.currency-display {
  display: flex;
  align-items: center;
  gap: 24px;
}

.flags-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.currency-flag {
  width: 64px;
  height: 48px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.exchange-arrow {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28px;
  margin: 0 4px;
}

.pair-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pair-name {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.pair-label {
  font-size: 15px;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.rate-info {
  position: absolute;
  right: 50px;
  text-align: right;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
}

.control-panel {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.control-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  flex: 1;
  min-width: 250px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.charts-wrapper {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  padding: 10px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container.sub {
  min-height: 300px;
}

.report-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.report-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.report-actions {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-wrapper {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
  }

  .control-card {
    width: 100%;
  }

  .spot-rate-card {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }

  .rate-info {
    width: 100%;
    text-align: center;
    position: relative;
    right: auto;
  }

  .currency-flag {
    width: 56px;
    height: 42px;
  }

  .flags-wrapper {
    padding: 16px;
    gap: 16px;
  }
}

/* 添加一些微妙的动画效果 */
.chart-container, .report-section {
  transition: transform 0.2s, box-shadow 0.2s;
}

.chart-container:hover, .report-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 添加深色模式支持 */
@media (prefers-color-scheme: dark) {
  .backtest-page {
    background: #1a1a1a;
  }

  .control-card,
  .chart-container,
  .report-section {
    background: #242424;
    color: #e0e0e0;
  }

  .card-title {
    color: #999;
  }

  .section-header h3, 
  .report-header h3 {
    color: #e0e0e0;
  }

  .page-title {
    color: #e0e0e0;
  }
}

/* 调整动画效果 */
.currency-flag {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.currency-flag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.exchange-arrow {
  transition: transform 0.3s ease;
}

.flags-wrapper:hover .exchange-arrow {
  transform: translateX(5px);
}
</style>
