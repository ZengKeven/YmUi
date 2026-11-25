<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmSwitch, YmTree, type ControlSize, type TreeNode, type TreeValue } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const categories: TreeNode[] = [
  { value: 'fresh', label: '生鲜食品', children: [
    { value: 'fresh/fruit', label: '新鲜水果', children: [
      { value: 'fresh/fruit/citrus', label: '柑橘类' },
      { value: 'fresh/fruit/berries', label: '浆果类' },
    ] },
    { value: 'fresh/vegetables', label: '新鲜蔬菜' },
  ] },
  { value: 'pantry', label: '粮油调味', children: [
    { value: 'pantry/rice', label: '大米' },
    { value: 'pantry/oil', label: '食用油' },
  ] },
]
const products = [
  { name: '赣南脐橙', pack: '5 kg / 箱', category: 'fresh/fruit/citrus' },
  { name: '云南蓝莓', pack: '125 g / 盒', category: 'fresh/fruit/berries' },
  { name: '上海青', pack: '500 g / 袋', category: 'fresh/vegetables' },
  { name: '东北粳米', pack: '5 kg / 袋', category: 'pantry/rice' },
  { name: '压榨菜籽油', pack: '5 L / 桶', category: 'pantry/oil' },
]
const category = ref<TreeValue>('fresh')
const filterable = ref(true)
const size = ref<ControlSize>()
// 示例使用分类路径作为标识，查询父分类时包含下级分类的商品。
const visibleProducts = computed(() => products.filter(product =>
  product.category === category.value || product.category.startsWith(category.value + '/'),
))
</script>

<template>
  <PreviewFrame name="YmTree">
    <template #preview>
      <div class="tree-demo">
        <div class="tree-demo__categories">
          <h3>商品分类</h3>
          <YmTree v-model="category" :data="categories" :default-expanded="['fresh']"
            :filterable="filterable" :size="size" filter-placeholder="搜索商品分类" aria-label="商品分类" />
        </div>
        <section class="tree-demo__products" aria-label="商品列表">
          <h3>商品列表</h3>
          <table>
            <thead><tr><th scope="col">商品名称</th><th scope="col">规格</th></tr></thead>
            <tbody>
              <tr v-for="product in visibleProducts" :key="product.name">
                <td>{{ product.name }}</td><td>{{ product.pack }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </template>
    <template #controls>
      <label>分类树尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
      <label>显示过滤框 <YmSwitch v-model="filterable" /></label>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.tree-demo {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 1.25rem;
  width: 100%;
  color: var(--ym-color-text);
}
.tree-demo__categories { flex: 1 1 10rem; min-width: 0; }
.tree-demo__products { flex: 1.5 1 13rem; min-width: 0; }
.tree-demo h3 { margin: 0 0 .6rem; font-size: .875rem; font-weight: 600; }
.tree-demo table { display: table; width: 100%; margin: 0; border-collapse: collapse; font-size: .8125rem; }
.tree-demo :is(th, td) {
  padding: .45rem .6rem;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--ym-color-border) 65%, transparent);
  text-align: start;
}
.tree-demo th { background: color-mix(in srgb, var(--ym-color-text) 5%, var(--ym-color-surface)); }
.tree-demo td { background: var(--ym-color-surface); }
</style>
