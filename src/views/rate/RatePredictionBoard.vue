<script setup lang="ts" >
import * as echarts from 'echarts'
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { getCurrencyFlag, parseCurrency } from "../../utils/index";
import { Download } from "@element-plus/icons-vue"   //图标
import * as jspdf from 'jspdf';
import "../../assets/cnfont";
import { ExplanationRequest, getExplanation, getPredict, PredictRequest } from '../../api/prediction';

//存放预测数据列表
const predictionList = ref([]);

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

// 选择货币对的回调函数
const selectedCurrency = ref(`${currencyPair.from}/${currencyPair.to}`);
const selectCurrency = (value: string) => {
  const [from, to] = value.split('/');
  currencyPair.from = from;
  currencyPair.to = to;
  console.log('选中的货币对：', currencyPair);
}
watch(currencyPair, () => {
  selectedCurrency.value = `${currencyPair.from}/${currencyPair.to}`;
});


//当前模型
const model = ref('模型1')

//可供选择的模型
const modelList = ['模型1', '模型2', '模型3', '模型4',]

//当前预测周期
const predictionPeriod = ref('1周')

//可供选择的预测周期
const predictionPeriodList = [ '1周', '2周', '1月']

// 根据时间范围返回对应数据点数量
const getCountFromTimeRange = (timeRange: string) => {
  switch (timeRange) {
    case "1周": return 7;
    case "2周": return 14;
    case "1月": return 30;
    default: return 7;
  }
}

//当前策略
const strategy = ref('策略1')

//可供选择的策略
const strategyList = ['策略1', '策略2', '策略3']

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
  }
  console.log(predictRequest);  
  getPredict(predictRequest).then((res) => {
    console.log(res.data);
    if(res.data.code == 0){
      const dataList = res.data.data;
      predictionList.value = dataList;
      //接收date作为x轴,接收pred作为y轴
      for (let i = 0; i < dataList.length; i++) {
        dates.push(dataList[i].date);
        dataPred.push(dataList[i].pred);
      }
      //console.log(dates, dataPred);
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
      console.log(option);
      
      chartInstance.setOption(option);
    }else{
      ElMessage({
        message: res.data.message,
        type: 'error',
        center: true,
      })
    }
  })
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
  //调用后端接口，生成AI报告
  const explanationRequest: ExplanationRequest = {
    currency: parseCurrency(currencyPair.from) + parseCurrency(currencyPair.to),
    timeSpan: getCountFromTimeRange(predictionPeriod.value),
    data: predictionList.value
  }
  console.log(explanationRequest);
  
  getExplanation(explanationRequest).then(res => {
    console.log(res.data);
    
    if(res.data.code === 0){
      textOutput.value = res.data.data
      //展示AI报告，缩小表格视图
      showAIReport.value = true
      const echart = document.getElementById("echart")
      if(echart){
        echart.style.height = "420px";
      } 
      printLine()
    }else{
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
}

const closeReport = () => {
  const echart = document.getElementById("echart")
  if(echart){
    showAIReport.value = false
    echart.style.height = "700px";
  } 
}

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
}

</script>


<template>
  <el-main>
    <el-container class='prediction-board'>

      <!-- 主要内容 -->
      <el-main class="main-board">
        <el-container style="display: flex;">
          <!-- 货币对 预测模型 预测周期 -->
          <el-header style="height: 10%;">
            <el-row :gutter="20" justify="space-between">
              <el-col :span="3">
                <el-text style="font-size: 25px;font-weight: bold;color: black;">汇率预测</el-text>
              </el-col>

              <el-col :span="2" style="display: flex;font-size: 20px;">
                <span :class="`fi fi-${getCurrencyFlag(currencyPair.from)}`" class="currency-flag"></span>
                <span class="separator">/</span>
                <span :class="`fi fi-${getCurrencyFlag(currencyPair.to)}`" class="currency-flag"></span>
              </el-col>

              <el-col :span="3">
                <el-select v-model="selectedCurrency" placeholder="选择货币对" @change="selectCurrency">
                  <el-option
                    v-for="(item, index) in currencyList"
                    :key="index"
                    :label="`${item.from}/${item.to}`"
                    :value="`${item.from}/${item.to}`">
                    <template #default="">
                      <span :class="`fi fi-${getCurrencyFlag(item.from)}`" class="currency-flag"></span>
                      <span class="separator">/</span>
                      <span :class="`fi fi-${getCurrencyFlag(item.to)}`" class="currency-flag"></span>
                      <span style="padding: 2px;"></span>
                      <span>{{ item.from }}</span>
                      <span class="separator">/</span>
                      <span>{{ item.to }}</span>
                    </template>
                  </el-option>
                </el-select>
              </el-col>

              <el-col :span="1"></el-col>

              <el-col :span="4">
                <el-form-item label="预测模型" class="form-item">
                  <el-select v-model="model" placeholder="请选择预测模型">
                    <el-option v-for="item in modelList" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="4">
                <el-form-item label="预测周期" class="form-item">
                  <el-select v-model="predictionPeriod" placeholder="请选择预测周期">
                    <el-option v-for="item in predictionPeriodList" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="2"></el-col>

              <el-col :span="3">
                <el-form-item label="策略" class="form-item">
                  <el-select v-model="strategy" placeholder="请选择策略">
                    <el-option v-for="item in strategyList" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="2">
                <el-button v-if="!showAIReport" @click="generateReport" type="primary" color="#626aef">
                  生成AI报告
                </el-button>
              </el-col>

            </el-row>
          </el-header>

          <!-- 图表 -->
          <el-main style="height:90%;">
            <div id="echart" ref="chartRef" class="kline-chart"></div>
          </el-main>

          <el-divider v-if="showAIReport"></el-divider>

          <!-- 大模型 -->
          <el-footer style="height: 30%;" v-if="showAIReport">
            <el-row :gutter="60">
              <el-col :span="4">
                <el-button @click="downloadReport" type="primary">
                  <el-icon><Download/></el-icon> 下载报告
                </el-button>
              </el-col>
              <el-col :span="18"></el-col>
              <el-col :span="2">
                <el-button @click="closeReport" type="primary">
                  关闭
                </el-button>
              </el-col>                
            </el-row>
            <el-input class="textArea" v-model="textOutput" type="textarea" :autosize="{ minRows: 8, maxRows: 8 }" resize="none" readonly input-style="font-size: 16px;font-weight:bold;letter-spacing:1px; font-family: Arial, sans-serif;background-color:#00aaff10;" />
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
  width: 90%;
  height: 700px;
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