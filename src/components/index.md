---
layout: page
title: 组件文档
search: false
---

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

onMounted(() => {
  window.location.replace(withBase('/button/') + window.location.search + window.location.hash)
})
</script>

[进入按钮文档](./button/index.md)
