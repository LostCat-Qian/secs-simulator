import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
// import './assets/global.less'
import globalComponents from './components/global'
import Router from './router/index'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives
})

const app = createApp(App)

// components
for (const i in components) {
  app.component(i, globalComponents[i])
}

app.use(Router)
app.use(vuetify)
app.mount('#app')
