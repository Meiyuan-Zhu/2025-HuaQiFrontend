<script setup lang="ts">
import VChart from "vue-echarts";

import { ref, reactive } from 'vue'
import { getCurrencyFlag } from "../../utils/index";

//当前货币对
const currencyPair = reactive({
  from: 'CNY',
  to: 'USD'
})

//可供选择的货币对
const currencyList = [
  {
    from: 'CNY',
    to: 'USD'
  },
  {
    from: 'CNY',
    to: 'EUR'
  },
  {
    from: 'CNY',
    to: 'JPY'
  },
  {
    from: 'CNY',
    to: 'AUD'
  },
]

//选择货币对的回调函数
const selectCurrency = (key: string) => {
  currencyPair.from = currencyList[key].from
  currencyPair.to = currencyList[key].to
  //console.log(currencyPair);
}

//当前模型
const model = ref('模型1')

//可供选择的模型
const modelList = [
  '模型1',
  '模型2',
  '模型3',
  '模型4',
]

//当前预测周期
const predictionPeriod = ref('1周')

//可供选择的预测周期
const predictionPeriodList = [
  '1周',
  '1月',
  '1年',
]

//表格option
const chartOption = ref({
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line'
    }
  ]
})

//大模型回复的文本(写死的)
const reportText = ref("123456890abcdefghijk123456890abcdefghijk123456890abcdefghijk")

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
            <v-chart class="chart" :option="chartOption" />
          </el-main>

          <el-divider></el-divider>

          <!-- 大模型 -->
          <el-footer style="height: 30%;">
            <el-row :gutter="40">
              <el-col :span="21">
                <el-input class="textArea" v-model="textOutput" type="textarea" :autosize="{ minRows: 8, maxRows: 8 }" resize="none" readonly />
              </el-col>
              <el-col :span="2">
                <el-button type="success" @click="generateReport">生成AI预测报告</el-button>
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

.chart{
  height: 480px;
}

</style>