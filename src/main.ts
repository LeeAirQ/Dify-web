import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { marked } from 'marked'
import App from './App.vue'
import router from './router'
import './style.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true
})

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Register store, router and Element Plus
app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
