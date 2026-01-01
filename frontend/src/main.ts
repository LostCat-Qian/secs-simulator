import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
// import './assets/global.less'
import globalComponents from './components/global'
import Router from './router/index'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'

const app = createApp(App)

// global components
for (const i in globalComponents) {
  app.component(i, globalComponents[i])
}

app.use(ArcoVue)

app.use(Router)
app.mount('#app')
