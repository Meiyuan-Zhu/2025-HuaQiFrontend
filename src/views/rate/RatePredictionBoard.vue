<script setup lang="ts">

</script>


<template>
  <el-main>
    <div class='prediction-board'>
      <el-header>
        <el-row>
            <h1 style="margin: auto;">汇率预测</h1>
        </el-row>

        <el-row :gutter="20" justify="space-between">
          <el-col :span="4">
            
          </el-col>

          <el-col :span="4">

          </el-col>

          <el-col :span="4">

          </el-col>
        </el-row>

      </el-header>

       <el-main>

      </el-main>
    </div>
  </el-main>
</template>


<style scoped>
.prediction-board {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  width: 80%;
  height: 95%;
  margin: 0 auto;
}
</style>