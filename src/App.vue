<template>
  <v-app>
    <Header></Header>
    <main>
      <router-view />
    </main>
    <Footer></Footer>
  </v-app>
</template>

<script setup>
import Header from "@/views/Header.vue";
import Footer from "@/views/Footer.vue";
</script>

<style>
@import './style/style.css';
</style>
