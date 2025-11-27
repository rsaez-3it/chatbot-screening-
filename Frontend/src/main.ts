import 'bootstrap/dist/css/bootstrap-grid.min.css'
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import 'vue-select/dist/vue-select.css'
import vSelect from 'vue-select'
import uikit from 'uikit-3it-vue'
import 'uikit-3it-vue/dist/css/uikit-3it-vue.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas, far, fab)

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Library
app.use(uikit)
app.use(VueTippy)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('VueDatePicker', VueDatePicker)
app.component('v-select', vSelect)

app.mount('#app')
