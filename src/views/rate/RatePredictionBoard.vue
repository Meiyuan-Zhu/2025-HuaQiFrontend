<script setup lang="ts">
import * as echarts from "echarts";
import { ref, reactive, watch, onMounted, nextTick } from "vue";
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
const predictionPeriodList = ["1周", "2周", "1月"];

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

//当前策略
const strategy = ref("策略1");

//可供选择的策略
const strategyList = ["策略1", "策略2", "策略3"];

// ECharts K线图
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts;
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};
const updateChart = () => {
  if (!chartInstance) return;

  const count = getCountFromTimeRange(predictionPeriod.value);
  const dates: any[] = [];
  const dataPred: any[] = [];
  // const now = new Date();
  // for (let i = 0; i < count; i++) {
  //   const date = new Date(now.getTime() - (count - i - 1) * 24 * 3600 * 1000);
  //   dates.push(`${date.getMonth()+1}-${date.getDate()}`);
  //   dataPred.push((Math.random() * 10 + 90).toFixed(2));
  // }

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
        dates.push(dataList[i].date);
        dataPred.push(dataList[i].pred);
      }
      //console.log(dates, dataPred);
      const option = {
        tooltip: { trigger: "axis" },
        legend: { data: ["预测汇率"] },
        xAxis: { type: "category", data: dates },
        yAxis: { type: "value" },
        series: [
          {
            name: "预测汇率",
            type: "line",
            data: dataPred,
            smooth: true,
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
    data: predictionList.value,
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

        <!-- 策略选择卡片 -->
        <div class="control-card">
          <div class="card-title">交易策略</div>
            <el-select v-model="strategy" placeholder="请选择策略">
              <el-option
                v-for="item in strategyList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
        </div>

        <!-- 时间跨度选择卡片 -->
        <div class="control-card">
          <div class="card-title">时间跨度</div>
            <el-select
              v-model="predictionPeriod"
              placeholder="请选择预测周期"
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
          <!-- <h3>技术分析</h3> -->
          <div class="section-tools">
            <!-- 这里可以添加一些工具按钮 -->
          </div>
        </div>

        <div class="charts-wrapper">
          <div class="chart-container main">
            <div id="echart" ref="chartRef" class="kline-chart"></div>
          </div>
        </div>

        <div v-if="showAIReport" class="charts-wrapper" id="textArea">
          <div class="chart-container main">
            <el-row :gutter="60">
              <el-col :span="4">
                <el-button @click="downloadReport" type="primary">
                  <el-icon><Download /></el-icon> 下载报告
                </el-button>
              </el-col>
              <el-col :span="18"></el-col>
              <el-col :span="2">
                <el-button @click="closeReport" type="primary"> 关闭 </el-button>
              </el-col>
            </el-row>
            <el-input
              class="textArea"
              v-model="textOutput"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
              resize="none"
              readonly
              input-style="font-size: 16px;font-weight:bold;letter-spacing:1px; font-family: Arial, sans-serif;background-color:#00aaff10;"
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

.sidebar {
  width: 10%;
  height: 100%;
  border-right: #00000022 1px solid;
  border-radius: 8px 0 0 8px;
  background-color: #77a0f127;
}

.currency-menu {
  background-color: #0d00ff00;
}

.separator {
  color: #6b7280;
  font-weight: bold;
}

:deep(.form-item .el-form-item__label) {
  color: rgb(0, 0, 0);
  font-weight: bold;
}

.kline-chart {
  width: 90%;
  height: 600px;
  margin: 0 auto;
}

/* .showReportButton {
  position: fixed;
  right: 0%;
  bottom: 10%;
  z-index: 999;
} */

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

.current-rate {
  font-size: 42px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 1px;
}

.rate-change {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
  font-size: 15px;
}

.change-value,
.change-percent {
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
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

.time-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.time-btn {
  padding: 6px 12px;
  border: none;
  background: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-btn.active {
  background: #1a237e;
  color: white;
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

.section-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
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

/* .chart-container.main {
  min-height: 400px;
} */

.chart-container.sub {
  min-height: 300px;
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
  }

  .rate-change {
    justify-content: center;
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
.chart-container {
  transition: transform 0.2s, box-shadow 0.2s;
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 添加深色模式支持 */
@media (prefers-color-scheme: dark) {
  .backtest-page {
    background: #1a1a1a;
  }

  .control-card,
  .chart-container {
    background: #242424;
    color: #e0e0e0;
  }

  .card-title {
    color: #999;
  }

  .section-header h3 {
    color: #e0e0e0;
  }

  .time-btn {
    background: #333;
    color: #e0e0e0;
  }

  .time-btn.active {
    background: #3949ab;
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

.change-value.up,
.change-percent.up {
  color: #ef4444; /* 上涨显示红色 */
  background: rgba(239, 68, 68, 0.15);
}

.change-value.down,
.change-percent.down {
  color: #22c55e; /* 下跌显示绿色 */
  background: rgba(34, 197, 94, 0.15);
}

.change-value.neutral,
.change-percent.neutral {
  color: #ffffff; /* 持平显示白色 */
  background: rgba(255, 255, 255, 0.15);
}

/* 添加数据加载时的过渡效果 */
.current-rate,
.change-value,
.change-percent {
  transition: all 0.3s ease;
}
</style>
