<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
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

// 选中的货币对
const selectedCurrency = ref(`${currencyPair.from}/${currencyPair.to}`);

const selectCurrency = (value: string) => {
  const [from, to] = value.split('/');
  currencyPair.from = from;
  currencyPair.to = to;
  console.log(currencyPair);
}

// 监听 currencyPair 的变化，更新 selectedCurrency
watch(currencyPair, () => {
  selectedCurrency.value = `${currencyPair.from}/${currencyPair.to}`;
});
</script>

<template>
  <el-main>
    <el-container class='prediction-board'>
      <!-- 主要内容 -->
      <el-main class="main-board">
        <el-container>
          <el-header>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-select v-model="selectedCurrency" placeholder="选择货币对" @change="selectCurrency">
                  <el-option
                    v-for="(item, index) in currencyList"
                    :key="index"
                    :label="`${item.from}/${item.to}`"
                    :value="`${item.from}/${item.to}`">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="6">
                <el-input v-model="input" placeholder="请输入内容"></el-input>
              </el-col>
            </el-row>
          </el-header>

          <el-main>
            <!-- 主要内容区域 -->
          </el-main>

          <el-footer>
            <!-- 页脚内容 -->
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

/* 移除侧边栏相关样式 */

/* 主要内容区域 */
.main-board {
  width: 100%;
  height: 100%;
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
</style>