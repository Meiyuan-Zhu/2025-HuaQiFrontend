<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import * as echarts from 'echarts/core';    
import { GraphChart, HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';
import { getCurrencyFlag, parseCurrency, parseModel } from "../../utils/index";
import { getInterpretData, GraphRequest, Link, Node2 } from "../../api/interpret";

// 注册必要组件
echarts.use([
  GraphChart,
  HeatmapChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent
]);

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

onMounted(() => {
  updateChart();
})

watch([model, currencyPair],() => {
  nextTick(() => { updateChart(); });
})

// 获取后端数据
const generateData = () => {
  // 创建节点
  let nodes = [];
  for (let i = 0; i < 20; i++) {
    nodes.push({
      id: i.toString(),
      name: `Node ${i}`,
      value: Math.random() * 100,
      symbolSize: Math.random() * 15 + 10,
    //   x: Math.random() * 800,
    //   y: Math.random() * 800,
    });
  }

  // 创建关系
  let links = [];
  for (let i = 0; i < 30; i++) {
    links.push({
      source: Math.floor(Math.random() * 20).toString(),
      target: Math.floor(Math.random() * 20).toString(),
      lineStyle: {
        width: 2,
      }
    });
  }

  //获取后端数据nodes和links
  const requestParams: GraphRequest = {
    model: parseModel(model.value),
    currencyPair: parseCurrency(currencyPair.from) + parseCurrency(currencyPair.to),
  }
  getInterpretData(requestParams).then((res) => {
    console.log(res.data);
    
    if(res.data.code === 0){
      const data = res.data.data;
      console.log(data);

      const nodeList: Node2[] = data.nodes;
      const linkList: Link[] = data.relationships;

      //接收nodes
      const newNodes = [];
      for(let i = 0; i < nodeList.length; i++){
        newNodes.push({
          id: nodeList[i].id,
          name: nodeList[i].currency,
          symbolSize: 5,
        })
      }
      nodes = newNodes;
      //接收links
      const newLinks = [];
      for(let i = 0; i < linkList.length; i++){
        
        newLinks.push({
          source: linkList[i].sourceId,
          target: linkList[i].targetId,
          lineStyle: {
            width: linkList[i].weight,
          }
        })
      }
      links = newLinks;
    }else{
      ElMessage({
        message: res.data.message,
        type: 'error',
        center: true,
      })
    }
  })

  return { nodes, links };
};

//Echarts图
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

  const { nodes, links } = generateData();

  console.log(nodes, links);
  
  const option = {
    tooltip: {},
    series: [
      { 
        type: "graph",
        layout: "force",
        force: {
          repulsion: 300, // 节点斥力
          gravity: 0.2,
          edgeLength: [50, 250],
          layoutAnimation: true
        },
        data: nodes,
        links: links,
        emphasis: {
          focus: "adjacency",
          label: {
            show: true,
            position: "right",
          },
        },
        roam: true,
        label: {
          formatter: "{b}",
          fontSize: 12,
        },
        lineStyle: {
          color: "black",
        },
        edgeLabel: {
          show: true,
          formatter: (params: { dataIndex: any; }) => `Link ${params.dataIndex}`,
        },
      }
    ],
    visualMap: [
      {
        type: "piecewise",
        show: false,
        dimension: 2,
        seriesIndex: 1,
        pieces: [
          { min: 0, max: 25, color: "#65B581" },
          { min: 25, max: 50, color: "#FFE58F" },
          { min: 50, max: 75, color: "#FFA940" },
          { min: 75, max: 100, color: "#FF6C76" },
        ],
      },
    ],
  };

  chartInstance.setOption(option);
};

watch([], () => {
  nextTick(() => {
    updateChart();
  });
});
onMounted(() => {
  initChart();
});
</script>

<template>
  <el-main>
    <el-container class="interpret-board">
      <el-header class="interpret-header">
        <el-row :gutter="20" justify="space-between">
          <el-col :span="4">
            <el-text style="font-size: 25px;font-weight: bold;color: black;">汇率预测</el-text>
          </el-col>

          <el-col :span="2" style="display: flex;font-size: 20px;">
            <span :class="`fi fi-${getCurrencyFlag(currencyPair.from)}`" class="currency-flag"></span>
            <span class="separator">/</span>
            <span :class="`fi fi-${getCurrencyFlag(currencyPair.to)}`" class="currency-flag"></span>
          </el-col>

          <el-col :span="4">
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

          <el-col :span="8"></el-col>

          <el-col :span="4">
            <el-form-item label="预测模型" class="form-item">
              <el-select v-model="model" placeholder="请选择预测模型">
                <el-option v-for="item in modelList" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <div id="echart" ref="chartRef" class="force-chart"></div>
      </el-main>
    </el-container>
  </el-main>
</template>

<style scoped>
.interpret-board {
  background: #00aaff89;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 90%;
  height: 100%;
  margin: 0 auto;
  display: flex;
}

.interpret-header {
  height: 7%;
  padding: 10px;
  justify-content: center;
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

:deep(.form-item .el-form-item__label) {
  color: rgb(0, 0, 0);
  font-weight: bold;
}

.force-chart {
  width: 90%;
  height: 700px;
  margin: 0 auto;
}
</style>
