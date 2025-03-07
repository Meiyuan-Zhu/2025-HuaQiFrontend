<script setup lang="ts">
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

const selectCurrency = (key: string) => {
  currencyPair.from = currencyList[key].from
  currencyPair.to = currencyList[key].to
  console.log(currencyPair);
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
          <el-header>

          </el-header>

          <el-main>

          </el-main>

          <el-footer>
            
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
</style>