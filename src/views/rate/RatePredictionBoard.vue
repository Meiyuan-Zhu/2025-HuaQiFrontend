<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { getCurrencyFlag } from "../../utils/index";

//当前货币对
const currencyPair = reactive({
  from: 'CNY',
  to: 'USD'
})

// 可供选择的货币对
const currencyList = [
  { from: 'CNY', to: 'USD' },
  { from: 'CNY', to: 'EUR' },
  { from: 'CNY', to: 'JPY' },
  { from: 'CNY', to: 'AUD' },
]

//选择货币对的回调函数
const selectCurrency = (key: number) => {
  currencyPair.from = currencyList[key].from
  currencyPair.to = currencyList[key].to
  //console.log(currencyPair);
}

//当前模型
const model = ref('模型1')

//可供选择的模型
const modelList = ['模型1', '模型2', '模型3', '模型4',]

//当前预测周期
const predictionPeriod = ref('1周')

//可供选择的预测周期
const predictionPeriodList = [ '1周', '1月', '1季',]
// 根据时间范围返回对应数据点数量
const getCountFromTimeRange = (timeRange: string) => {
  switch (timeRange) {
    case "1周": return 7;
    case "1月": return 30;
    case "1季": return 90;
    default: return 7;
  }
}

// ECharts K线图
const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  }
};
const updateChart = () => {
  if (!chartInstance) return;

  const count = getCountFromTimeRange(predictionPeriod.value);
  const dates = [];
  const dataPred = [];  
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - (count - i - 1) * 24 * 3600 * 1000);
    dates.push(`${date.getMonth()+1}-${date.getDate()}`);
    dataPred.push((Math.random() * 10 + 90).toFixed(2));
  }
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: [ '预测汇率' ] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      {
        name: '预测汇率',
        type: 'line',
        data: dataPred,
        smooth: true
      }
    ]
  };
  chartInstance.setOption(option);
};
watch([currencyPair, predictionPeriod], () => {
  nextTick(() => { updateChart(); });
});
onMounted(() => { initChart(); });

//是否展示AI报告
const showAIReport = ref(false);

//大模型回复的文本(写死的)
const reportText = ref("这是基于本项目AI模型生成的汇率预测报告,预测结果仅供参考。\n你的预计收益是100美元。\n你需要在明天卖出。")

//文本框展示的文本
const textOutput = ref("")

//生成AI报告的流式数据
const printLine = async () => {
  if(textOutput.value.length >= reportText.value.length) {
    return
  }else{
    setTimeout(() => {
      textOutput.value += reportText.value[textOutput.value.length]
      printLine()
    }, 50);
  }
}

const generateReport = async () => {  
  showAIReport.value = true
  //调用后端接口，生成AI报告
  //reportText.value = await getReport()
  printLine()
}

</script>


<template>
  <el-main>
    <el-container class='prediction-board'>
      <!-- 侧边栏 -->
      <el-aside class="sidebar">

        <h1 style="text-align: center;font-size: 20px;">汇率预测</h1>

        <el-divider />

        <el-menu class="currency-menu" default-active="1" mode="vertical" @select="selectCurrency" active-text-color="#3875ed" background-color="#0d00ff00" >

          <el-menu-item v-for="(item, index) in currencyList" :index="index" >
            <span :class="`fi fi-${getCurrencyFlag(item.from)}`" class="currency-flag"></span>
            <span class="separator">/</span>
            <span :class="`fi fi-${getCurrencyFlag(item.to)}`" class="currency-flag"></span>
            <span style="padding: 2px;"></span>
            <span>{{item.from}}</span>
            <span class="separator">/</span>
            <span>{{item.to}}</span>
          </el-menu-item>

        </el-menu>

      </el-aside>

      <!-- 主要内容 -->
      <el-main class="main-board">
        <el-container>
          <!-- 货币对 预测模型 预测周期 -->
          <el-header style="height: 10%;">
            <el-row :gutter="20">
              <el-col :span="4" style="display: flex;font-size: 20px;">
                <span :class="`fi fi-${getCurrencyFlag(currencyPair.from)}`" class="currency-flag"></span>
                <span class="separator">/</span>
                <span :class="`fi fi-${getCurrencyFlag(currencyPair.to)}`" class="currency-flag"></span>
                <span style="padding: 2px;"></span>
                <span>{{currencyPair.from}}</span>
                <span class="separator">/</span>
                <span>{{currencyPair.to}}</span>
              </el-col>

              <el-col :span="1"></el-col>

              <el-col :span="4">
                <el-form-item label="预测模型" class="form-item">
                  <el-select v-model="model" placeholder="请选择预测模型">
                    <el-option v-for="item in modelList" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="11"></el-col>

              <el-col :span="4">
                <el-form-item label="预测周期" class="form-item">
                  <el-select v-model="predictionPeriod" placeholder="请选择预测周期">
                    <el-option v-for="item in predictionPeriodList" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-header>

          <!-- 图表 -->
          <el-main style="height: 50%;">
            <div ref="chartRef" class="kline-chart"></div>
          </el-main>

          <el-divider></el-divider>

          <!-- 大模型 -->
          <el-footer style="height: 30%;">
            <el-row :gutter="40">
              <el-col :span="24">
                <button v-if="!showAIReport" class="showReportButton" @click="generateReport">
                  生成AI报告
                </button>
                <el-input v-else class="textArea" v-model="textOutput" type="textarea" :autosize="{ minRows: 8, maxRows: 8 }" resize="none" readonly input-style="font-size: 16px;font-weight:bold;letter-spacing:1px; font-family: Arial, sans-serif;background-color:#00aaff10;" />
              </el-col>
            </el-row>

          </el-footer>
        </el-container>
      </el-main>

    </el-container>
  </el-main>
</template>


<style scoped>
.prediction-board {
  background: #00aaff89;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 90%;
  height: 100%;
  margin: 0 auto;
}

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

.currency-flag {
  width: 1.5em;
  height: 1.5em;
  margin: 0 auto;
}

.separator {
  color: #6b7280;
  font-weight: bold;
}

.main-board {
  
}

:deep(.form-item .el-form-item__label) {
  color: rgb(0, 0, 0);
  font-weight: bold;
}

.kline-chart {
  width: 100%;
  height: 450px;
}

.textArea {
  width: 100%;
  height: 100%;
  margin-top: 10px; 
}

</style>

<style scoped>
  button {
    align-self: center;
    --width: 75vw; 
    --timing: 5s;
    border: 0;
    width: var(--width);
    height: 22vh;
    padding-block: 1em;
    color: #fff;
    font-weight: bold;
    font-size: 1em;
    background: rgb(162, 203, 247);
    transition: all 0.2s;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-image: linear-gradient(
      to right,
      rgb(250, 82, 82, 0.6),
      rgba(250, 82, 82, 0.6) 16.65%,
      rgb(190, 75, 219, 0.6) 16.65%,
      rgb(190, 75, 219, 0.6) 33.3%,
      rgb(76, 110, 245, 0.6) 33.3%,
      rgb(76, 110, 245, 0.6) 49.95%,
      rgb(64, 192, 87, 0.6) 49.95%,
      rgb(64, 192, 87, 0.6) 66.6%,
      rgb(250, 176, 5, 0.6) 66.6%,
      rgb(250, 176, 5, 0.6) 83.25%,
      rgb(253, 126, 20, 0.6) 83.25%,
      rgb(253, 126, 20, 0.6) 100%,
      rgb(250, 82, 82, 0.6) 100%
    );
    animation: var(--timing) linear dance6123 infinite;
    transform: scale(1.01) translateY(-1px);
  }

  @keyframes dance6123 {
    to {
      background-position: var(--width);
    }
  }
</style>