<script setup lang="ts">
  import { useStoreAuth, useStoreTheme, useStoreNotification } from '@/stores'
  import { composables } from 'uikit-3it-vue'
  import { ref } from 'vue'

  //Components
  import {
    NavbarComponent,
    NotificationsComponent
  } from '@/components'

  //Stores
  const storeAuth = useStoreAuth()
  const storeTheme = useStoreTheme()
  const storeNotification = useStoreNotification()

  //Composables
  const { logotipo, isotipo } = composables.useLogos(storeAuth, storeTheme)

  //Get stores
  storeNotification.getNotifications()

  /** Variables **/
  const slideNotificaciones = ref(false)

  const toggleNotificaciones = (event: Event) => {
		slideNotificaciones.value = !slideNotificaciones.value
    event.stopPropagation()
  }

  const handleCloseNotificaciones = () => {
    slideNotificaciones.value = false
  }

</script>

<template>
  <main
    v-cloak
    id="layout-private-default"
    class="layout-private-default"
    :class="storeAuth.sidebar.toggleCollapse && 'layout-private-default--sidebar-collapsed'"
  >
    <SidebarComponent
      :store="storeAuth"
      :logotipo="logotipo"
      :isotipo="isotipo"
      footer="© 2025 3IT"
    />
    <section class="eit-wrapper">
      <NavbarComponent
        :user="storeAuth.user"
        :darkTheme="storeAuth.config.darkTheme"
        @changeDarkTheme="storeAuth.darkThemeToggle"
        @logout="storeAuth.logout()"
        @toggleNotificaciones="toggleNotificaciones"
        :slideNotificaction="slideNotificaciones"
      />
      <section 
        class="eit-container"
        data-eit-pt="0"
      >
        <RouterView/>
      </section>
    </section>
    <NotificationsComponent 
      :slide="slideNotificaciones"
      :counter="storeNotification.counter"
      :notifications="storeNotification.filterNotifications"
      @tabChange="storeNotification.captureTab"
      @markAllAsRead="storeNotification.mutationMarkAllAsRead"
      @archiveAll="storeNotification.mutationArchiveAll"
      @archiveNotification="storeNotification.mutationArchiveNotification"
      @markAsRead="storeNotification.mutationMarkAsRead"
      @markAsNotRead="storeNotification.mutationMarkAsNotRead"
      @toggleNotificaciones="toggleNotificaciones"
      @closeNotificaciones="handleCloseNotificaciones"
    />
  </main>
</template>