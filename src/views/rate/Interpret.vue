<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch } from "vue";
import * as echarts from 'echarts/core';    
import { GraphChart, HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';
import { parseModel } from "../../utils/index";
import { getInterpretData, GraphRequest, Link, Node2 } from "../../api/interpret";
import { ElMessage } from 'element-plus';
import { DataAnalysis } from '@element-plus/icons-vue'; // 导入图标

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
      // console.log(data);

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
          id: Number(nodeList[i].id) - 1,
          name: nodeList[i].name,
          value: nodeList[i].desc,
          meaning: (nodeList[i] as any).meaning || '暂无解释',
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
          source: Number(linkList[i].source) - 1,
          target: Number(linkList[i].target) - 1,
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
            ([_, name]) => ({ name: String(name) })
          )
        },
        series: [
          { 
            type: "graph",
            layout: "force",
            zoom: 2.5,
            force: {
              repulsion: 500, // 增加节点斥力
              gravity: 0.5,
              edgeLength: [80, 200],
              layoutAnimation: true,
              friction: 0.6 // 添加摩擦力使布局更稳定
            },
            data: nodes,
            links: links,
            categories: Array.from(categoryMap.entries()).map(
              ([_, name]) => ({ name: String(name) })
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
  <div class="interpret-page">
    <header class="interpret-header">
      <div class="header-content">
        <div class="page-title">
          <h2>可解释性分析</h2>
        </div>
        
        <div class="model-selector">
          <!-- 美化后的模型选择器 -->
          <div class="selector-wrapper">
            <span class="selector-label">预测模型</span>
            <el-select 
              v-model="model" 
              placeholder="请选择预测模型"
              class="custom-select"
              popper-class="model-select-dropdown"
            >
              <el-option 
                v-for="item in modelList" 
                :key="item" 
                :label="item" 
                :value="item" 
                class="model-option"
              >
                <div class="model-option-content">
                  <span class="model-icon">
                    <el-icon><DataAnalysis /></el-icon>
                  </span>
                  <span>{{ item }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
    </header>

    <main class="interpret-content">
      <div id="echart" ref="chartRef" class="force-chart"></div>
    </main>
  </div>
</template>

<style scoped>
.interpret-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.interpret-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
  background: linear-gradient(to right, #f8f9fa, #e9ecef);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
  position: relative;
  padding-left: 12px;
}

.page-title h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #3b82f6;
  border-radius: 2px;
}

/* 美化选择器样式 */
.model-selector {
  display: flex;
  align-items: center;
}

.selector-wrapper {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.selector-label {
  font-weight: 500;
  color: #333;
  margin-right: 12px;
  white-space: nowrap;
}

/* 自定义下拉选择器样式 */
.custom-select {
  width: 160px;
}

:deep(.el-input__wrapper) {
  background-color: transparent;
  box-shadow: none !important;
  padding-left: 0;
}

:deep(.el-input__inner) {
  font-weight: 500;
  color: #3b82f6;
}

:deep(.el-select-dropdown__item.selected) {
  color: #3b82f6;
  font-weight: 600;
}

/* 下拉选项样式 */
.model-option-content {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.model-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #e6f0ff;
  border-radius: 4px;
  margin-right: 8px;
  color: #3b82f6;
}

.interpret-content {
  flex: 1;
  padding: 20px;
  overflow: hidden;
}

.force-chart {
  width: 100%;
  height: 700px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}

/* 添加响应式样式 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .selector-wrapper {
    width: 100%;
  }
  
  .custom-select {
    width: 100%;
  }
}
</style>
