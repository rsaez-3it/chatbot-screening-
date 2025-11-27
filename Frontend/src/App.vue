<script setup lang="ts">
  import { useStoreAuth, useStoreTheme } from '@/stores'
  import { watch, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  //Stores
  const storeAuth = useStoreAuth()
  const storeTheme = useStoreTheme()

  //Get stores
  onMounted(async () => {
    try {
      await storeTheme.getTheme()
      await storeAuth.getUserConfig()
      storeAuth.changeTheme()
    } catch (error) {
      console.error('Error inicializando app:', error)
      storeAuth.changeTheme()
    }
  })
  
  watch(storeAuth, () => {
      storeAuth.changeTheme()
  })

  //Layouts
  import {
    LayoutPublicDefault,
    LayoutPrivateDefault
  } from '@/layouts'

  const layoutComponents = {
    LayoutPublicDefault,
    LayoutPrivateDefault,
  };

  const route = useRoute()

  const currentLayout = computed(() => {
    const layoutName = route.meta.layout as keyof typeof layoutComponents
    return layoutComponents[layoutName] || LayoutPublicDefault
  })

</script>
<template>
  <component :is="currentLayout" />
</template>
