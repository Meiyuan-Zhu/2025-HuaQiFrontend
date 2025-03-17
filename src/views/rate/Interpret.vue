<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import * as echarts from 'echarts/core';    
import { GraphChart, HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { TitleComponent, TooltipComponent, VisualMapComponent, LegendComponent } from 'echarts/components';

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

// 生成模拟数据
const generateData = () => {
  const nodes = [];
  const categories = [];

  
  // 创建节点
  for (let i = 0; i < 100; i++) {
    nodes.push({
      id: i.toString(),
      name: `Node ${i}`,
      value: Math.random() * 100,
      symbolSize: Math.random() * 15 + 10,
      category: i % 4,
    //   x: Math.random() * 800,
    //   y: Math.random() * 800,
    });
  }

  // 创建分类
  for (let i = 0; i < 4; i++) {
    categories.push({ name: `Category ${i}` });
  }
  //console.log(categories);
  

  // 创建关系
  const links = [];
  for (let i = 0; i < 300; i++) {
    links.push({
      source: Math.floor(Math.random() * 100).toString(),
      target: Math.floor(Math.random() * 100).toString()
    });
  }

  return { nodes, categories, links };
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

  const { nodes, categories, links } = generateData();

  const option = {
    title: {
      text: "可解释性-热力导向布局图",
      top: 'top',
      left: 'left'
    },
    tooltip: {},
    legend: [
      {
        data: categories.map((c) => c.name),
        selectedMode: "single",
      },
    ],
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
        categories: categories,
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
          color: "gray",
          curveness: 0.1,
        },
        edgeSymbol: ["none", "arrow"],
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
        <div id="echart" ref="chartRef" class="force-chart"></div>
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
}

.force-chart {
  width: 90%;
  height: 700px;
  margin: 0 auto;
}
</style>
