import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () =>
        h('div', { class: 'custom-notice' },
          '⚠️ コンテンツの大部分は Claude Code で生成したものであり、未精査のものを含みます。'
        ),
    })
  },
}
