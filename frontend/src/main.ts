import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
// import './assets/global.less'
import globalComponents from './components/global'
import Router from './router/index'
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import { loader } from '@guolao/vue-monaco-editor'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// Configure Monaco Editor to use local workers
// This works in both web and Electron environments without CDN
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

loader.config({ monaco })

// Configure TOML language for Monaco Editor
monaco.languages.register({ id: 'toml' })

monaco.languages.setMonarchTokensProvider('toml', {
  tokenizer: {
    root: [
      [/^\s*\[.*\]$/, 'metatag'],
      [/^\s*\[\[.*\]\]$/, 'metatag'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/'/, 'string', '@string'],
      [/true|false/, 'keyword'],
      [/\d+/, 'number'],
      [/#.*$/, 'comment'],
      [/[a-zA-Z_][\w]*/, 'identifier'],
      [/=/, 'delimiter'],
      [/\./, 'delimiter'],
    ],
    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop']
    ]
  }
})

// Define TOML editor theme
monaco.editor.defineTheme('toml-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'metatag', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'comment', foreground: '6A9955' },
    { token: 'identifier', foreground: '9CDCFE' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
  }
})

const app = createApp(App)

// global components
for (const i in globalComponents) {
  app.component(i, globalComponents[i])
}

app.use(ArcoVue)

app.use(Router)
app.mount('#app')
