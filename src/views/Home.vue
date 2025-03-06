<script setup lang="ts">
import Header from "../components/Header.vue"
import Aside from "../components/Aside.vue"
</script>


<template>
  <Header/>
  <el-container style="height: 100%;">
    <Aside/>
    <router-view />
  </el-container>
</template>


<style scoped>
</style>
