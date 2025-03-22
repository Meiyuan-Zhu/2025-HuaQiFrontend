<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import * as echarts from 'echarts/core';    
import { GraphChart, HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';
import { getCurrencyFlag, parseModel } from "../../utils/index";
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
const modelList = ['模型1', '模型2', '模型3']

onMounted(() => {
  updateChart();
})

watch([model, currencyPair],() => {
  nextTick(() => { updateChart(); });
})

//Echarts图
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

  const nodes: any[] = [];
  const links: any[] = [];

  //获取后端数据nodes和links
  const requestParams: GraphRequest = {
    model: parseModel(model.value),
  }
  getInterpretData(requestParams).then((res) => {
    console.log(res.data);
    
    if(res.data.code === 0){
      const data = res.data.data;
      console.log(data);

      const nodeList: Node2[] = data.nodes;
      const linkList: Link[] = data.links;

      // 定义节点类别对应的颜色
      const categoryColors = [
        '#5470c6', '#91cc75', '#fac858', '#ee6666', 
        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
      ];
      
      // 创建类别映射，用于存储每个类别的名称
      const categoryMap = new Map();

      //接收nodes
      for(let i = 0; i < nodeList.length; i++){
        const category = i % categoryColors.length;
        // 如果该类别还没有名称，则使用第一个该类别节点的名称作为类别名
        if (!categoryMap.has(category)) {
          categoryMap.set(category, nodeList[i].name);
        }
        
        nodes.push({
          id: nodeList[i].id-1,
          name: nodeList[i].name,
          value: nodeList[i].desc,
          meaning: nodeList[i].meaning || '暂无解释',
          // 根据节点id分配不同类别，实现多样化颜色
          category: category,
          symbolSize: 25,
          itemStyle: {
            // 根据节点类别设置不同颜色
            color: categoryColors[category]
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            fontSize: 12
          }
        })
      }
      //接收links
      for(let i = 0; i < linkList.length; i++){
        // 计算线宽，确保即使权重很小也有基本可见度
        const lineWidth = Math.max(1, linkList[i].weight * 3);
        links.push({
          source: linkList[i].source-1,
          target: linkList[i].target-1,
          value: linkList[i].weight,
          lineStyle: {
            width: lineWidth,
            // 根据权重设置不同的透明度
            opacity: 0.5 + (linkList[i].weight / 10),
            curveness: 0.1
          }
        })
      }

      console.log(nodes, links);
  
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params: any) {
            if (params.dataType === 'node') {
              return `
                <div style="font-weight:bold;margin-bottom:5px">${params.data.name}</div>
                <div>名称: ${params.data.value || '暂无描述'}</div>
                <div>含义: ${params.data.meaning || '暂无解释'}</div>
              `;
            } else {
              return `权重: ${params.data.value}`;
            }
          }
        },
        legend: {
          show: true,
          data: Array.from(categoryMap.entries()).map(
            ([category, name]) => ({ name: String(name) })
          )
        },
        series: [
          { 
            type: "graph",
            layout: "force",
            force: {
              repulsion: 500, // 增加节点斥力
              gravity: 0.1,
              edgeLength: [80, 200],
              layoutAnimation: true,
              friction: 0.6 // 添加摩擦力使布局更稳定
            },
            data: nodes,
            links: links,
            categories: Array.from(categoryMap.entries()).map(
              ([category, name]) => ({ name: String(name) })
            ),
            emphasis: {
              focus: "adjacency",
              lineStyle: {
                width: 5
              },
              label: {
                show: true,
                position: "right",
                fontSize: 14,
                fontWeight: 'bold'
              },
            },
            roam: true,
            draggable: true,
            label: {
              show: true,
              position: "right",
              formatter: "{b}",
              fontSize: 12,
              color: '#333'
            },
            lineStyle: {
              color: 'source',
              curveness: 0.1
            },
            edgeSymbol: ['none', 'arrow'],
            edgeLabel: {
              show: false,
              formatter: (params: any) => `${params.data.value}`,
            },
            animation: true,
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut'
          }
        ]
      };

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
            <el-text style="font-size: 25px;font-weight: bold;color: black;">可解释性分析</el-text>
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
  width: 100%;
  height: 700px;
  margin: 0 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
}
</style>
