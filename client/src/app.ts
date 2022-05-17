import Vue from 'vue'
import Taro, { Config } from '@tarojs/taro'
import 'taro-ui/dist/style/index.scss' // 全局引入一次即可

import './app.scss'

const App = {
  mounted () {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init()
    }
  },
  onShow (options) {
  },
  render(h) {
    // this.$slots.default 是将要会渲染的页面
    return h('block', this.$slots.default)
  }
}

export default App
