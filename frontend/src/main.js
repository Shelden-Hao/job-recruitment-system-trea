import { createSSRApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import uviewPlus from 'uview-plus'
import './style.css'
import './services/api' // 导入API配置

export function createApp() {
  const app = createSSRApp(App)
  
  // 注册全局组件和插件
  app.use(pinia)
  
  // 使用并初始化uview-plus
  app.use(uviewPlus)

  return {
    app
  }
}
