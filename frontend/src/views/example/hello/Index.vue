<template>
  <v-app>
    <v-main>
      <section id="hero">
        <h1 class="tagline">
          <span class="accent">Electron-Egg</span>
        </h1>
        <p class="description">
          A fast, desktop software development framework
        </p>
        <p class="actions">
          <v-btn color="white" variant="tonal" href="https://www.kaka996.com/" target="_blank">
            Get Started
          </v-btn>
        </p>
      </section>

      <v-container class="demo-section">
        <h2 class="text-center mb-6">Vuetify 组件示例</h2>

        <!-- 按钮示例 -->
        <v-card class="mb-4">
          <v-card-title>按钮组件</v-card-title>
          <v-card-text>
            <div class="d-flex flex-wrap ga-2">
              <v-btn color="primary">主要按钮</v-btn>
              <v-btn color="secondary">次要按钮</v-btn>
              <v-btn color="success">成功按钮</v-btn>
              <v-btn color="warning">警告按钮</v-btn>
              <v-btn color="error">危险按钮</v-btn>
              <v-btn disabled>禁用按钮</v-btn>
              <v-btn prepend-icon="mdi-heart">带图标</v-btn>
              <v-btn variant="outlined">轮廓按钮</v-btn>
              <v-btn variant="text">文本按钮</v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- 输入框示例 -->
        <v-card class="mb-4">
          <v-card-title>输入框组件</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="textValue" label="文本输入" placeholder="请输入文本" variant="outlined"
                  prepend-inner-icon="mdi-text" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="passwordValue" label="密码输入" type="password" placeholder="请输入密码"
                  variant="outlined" prepend-inner-icon="mdi-lock" />
              </v-col>
              <v-col cols="12" md="4">
                <v-number-input v-model="numberValue" label="数字输入" :min="0" :max="100" variant="outlined"
                  prepend-inner-icon="mdi-numeric" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 对话框示例 -->
        <v-card class="mb-4">
          <v-card-title>对话框组件</v-card-title>
          <v-card-text>
            <v-btn color="primary" @click="dialog = true">打开对话框</v-btn>
          </v-card-text>
        </v-card>

        <v-dialog v-model="dialog" max-width="500">
          <v-card>
            <v-card-title>对话框标题</v-card-title>
            <v-card-text>
              <p>这是一个 Vuetify 对话框组件示例。</p>
              <p>你可以在对话框中放置任何内容。</p>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="secondary" variant="text" @click="dialog = false">取消</v-btn>
              <v-btn color="primary" variant="text" @click="dialog = false">确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- 消息提示示例 -->
        <v-card class="mb-4">
          <v-card-title>消息提示</v-card-title>
          <v-card-text>
            <div class="d-flex flex-wrap ga-2">
              <v-btn color="success" @click="showSuccess">成功消息</v-btn>
              <v-btn color="info" @click="showInfo">信息消息</v-btn>
              <v-btn color="warning" @click="showWarn">警告消息</v-btn>
              <v-btn color="error" @click="showError">错误消息</v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-snackbar v-model="snackbar" :color="snackbarColor">
          {{ snackbarText }}
          <template #actions>
            <v-btn color="white" variant="text" @click="snackbar = false">关闭</v-btn>
          </template>
        </v-snackbar>

        <!-- 下拉框示例 -->
        <v-card class="mb-4">
          <v-card-title>下拉框组件</v-card-title>
          <v-card-text>
            <v-select v-model="selectedCity" :items="cities" item-title="name" item-value="name" label="选择城市"
              variant="outlined" prepend-inner-icon="mdi-city" />
          </v-card-text>
        </v-card>

        <!-- 复选框示例 -->
        <v-card class="mb-4">
          <v-card-title>复选框组件</v-card-title>
          <v-card-text>
            <div class="d-flex flex-wrap ga-4">
              <v-checkbox v-model="checked1" label="选项 1" />
              <v-checkbox v-model="checked2" label="选项 2" />
              <v-checkbox v-model="checked3" label="选项 3" />
            </div>
          </v-card-text>
        </v-card>

        <!-- 进度条示例 -->
        <v-card class="mb-4">
          <v-card-title>进度条组件</v-card-title>
          <v-card-text>
            <div class="mb-2">
              <v-label>进度：{{ progressValue }}%</v-label>
            </div>
            <v-progress-linear v-model="progressValue" color="primary" height="25" striped>
              <strong>{{ progressValue }}%</strong>
            </v-progress-linear>
            <div class="d-flex ga-2 mt-4">
              <v-btn color="primary" @click="increaseProgress">增加进度</v-btn>
              <v-btn color="secondary" @click="progressValue = 0">重置</v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Tree 组件示例 -->
        <v-card class="mb-4">
          <v-card-title>树形组件 (Tree)</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-treeview v-model:opened="opened" v-model:selected="selected" :items="treeItems" item-value="id"
                  activatable open-on-click select-strategy="leaf" density="comfortable">
                  <template #prepend="{ item, isOpen }">
                    <v-icon>
                      {{ isOpen ? 'mdi-folder-open' : 'mdi-folder' }}
                    </v-icon>
                  </template>
                </v-treeview>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-subtitle>选中项</v-card-subtitle>
                  <v-card-text>
                    <div v-if="selected.length === 0" class="text-grey">
                      请选择一个项目
                    </div>
                    <div v-else>
                      <v-chip v-for="item in selected" :key="item" closable @click:close="removeSelected(item)"
                        class="ma-1">
                        {{ getItemName(item) }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 数据表格示例 -->
        <v-card class="mb-4">
          <v-card-title>数据表格</v-card-title>
          <v-card-text>
            <v-data-table :items="desserts" :sort-by="[{ key: 'calories', order: 'asc' }]" class="elevation-1">
              <template #top>
                <v-toolbar flat>
                  <v-toolbar-title>我的菜单</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical />
                  <v-spacer />
                  <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="addItem">
                    添加
                  </v-btn>
                </v-toolbar>
              </template>
              <template #item.actions="{ item }">
                <v-icon size="small" class="me-2" @click="editItem(item)">
                  mdi-pencil
                </v-icon>
                <v-icon size="small" @click="deleteItem(item)">
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- 卡片示例 -->
        <v-card class="mb-4">
          <v-card-title>卡片组件</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="n in 3" :key="n" cols="12" md="4">
                <v-card>
                  <v-img src="https://picsum.photos/500/300?image=10" height="200" cover />
                  <v-card-title>卡片标题 {{ n }}</v-card-title>
                  <v-card-subtitle>副标题</v-card-subtitle>
                  <v-card-text>
                    这是卡片的描述内容。你可以在这里放置任何文本信息。
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary">查看详情</v-btn>
                    <v-spacer />
                    <v-btn icon="mdi-heart" variant="text" />
                    <v-btn icon="mdi-share-variant" variant="text" />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 标签页示例 -->
        <v-card class="mb-4">
          <v-card-title>标签页</v-card-title>
          <v-card-text>
            <v-tabs v-model="tab" bg-color="primary">
              <v-tab value="one">标签 1</v-tab>
              <v-tab value="two">标签 2</v-tab>
              <v-tab value="three">标签 3</v-tab>
            </v-tabs>
            <v-card-text>
              <v-window v-model="tab">
                <v-window-item value="one">
                  <div class="pa-4">这是标签 1 的内容</div>
                </v-window-item>
                <v-window-item value="two">
                  <div class="pa-4">这是标签 2 的内容</div>
                </v-window-item>
                <v-window-item value="three">
                  <div class="pa-4">这是标签 3 的内容</div>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'

// 响应式数据
const textValue = ref('')
const passwordValue = ref('')
const numberValue = ref(0)
const dialog = ref(false)
const selectedCity = ref('')
const checked1 = ref(false)
const checked2 = ref(false)
const checked3 = ref(false)
const progressValue = ref(0)
const tab = ref('one')

// 消息提示
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// 城市选项
const cities = ref([
  { name: '北京', code: 'BJ' },
  { name: '上海', code: 'SH' },
  { name: '广州', code: 'GZ' },
  { name: '深圳', code: 'SZ' },
  { name: '杭州', code: 'HZ' }
])

// 消息提示方法
const showSuccess = () => {
  snackbarText.value = '操作成功完成！'
  snackbarColor.value = 'success'
  snackbar.value = true
}

const showInfo = () => {
  snackbarText.value = '这是一条信息提示。'
  snackbarColor.value = 'info'
  snackbar.value = true
}

const showWarn = () => {
  snackbarText.value = '请注意这个警告！'
  snackbarColor.value = 'warning'
  snackbar.value = true
}

const showError = () => {
  snackbarText.value = '操作失败，请重试！'
  snackbarColor.value = 'error'
  snackbar.value = true
}

// 进度条方法
const increaseProgress = () => {
  if (progressValue.value < 100) {
    progressValue.value += 10
  }
}

// Tree 组件数据
const opened = ref(['Users'])
const selected = ref([])

const treeItems = ref([
  {
    id: 1,
    title: '根目录',
    children: [
      {
        id: 2,
        title: 'Users',
        children: [
          { id: 3, title: 'Admin' },
          { id: 4, title: 'Developer' },
          { id: 5, title: 'Guest' }
        ]
      },
      {
        id: 6,
        title: 'Documents',
        children: [
          { id: 7, title: 'Project' },
          { id: 8, title: 'Personal' }
        ]
      },
      {
        id: 9,
        title: 'Downloads',
        children: [
          { id: 10, title: 'Images' },
          { id: 11, title: 'Videos' }
        ]
      }
    ]
  }
])

const getItemName = (id: number) => {
  const findItem = (items: any[]): any => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findItem(item.children)
        if (found) return found
      }
    }
    return null
  }
  const item = findItem(treeItems.value)
  return item ? item.title : ''
}

const removeSelected = (id: number) => {
  selected.value = selected.value.filter((item: number) => item !== id)
}

// 数据表格数据
const headers = [
  { title: '甜点', align: 'start', key: 'name' },
  { title: '卡路里', align: 'end', key: 'calories' },
  { title: '脂肪 (g)', align: 'end', key: 'fat' },
  { title: '碳水化合物 (g)', align: 'end', key: 'carbs' },
  { title: '蛋白质 (g)', align: 'end', key: 'protein' },
  { title: '操作', align: 'end', key: 'actions', sortable: false }
]

const desserts = reactive([
  { name: 'Frozen Yogurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
  { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3 },
  { name: 'Eclair', calories: 262, fat: 16.0, carbs: 23, protein: 6.0 },
  { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3 },
  { name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9 },
  { name: 'Jelly bean', calories: 375, fat: 0.0, carbs: 94, protein: 0.0 },
  { name: 'Lollipop', calories: 392, fat: 0.2, carbs: 98, protein: 0.0 },
  { name: 'Honeycomb', calories: 408, fat: 3.2, carbs: 87, protein: 6.5 },
  { name: 'Donut', calories: 452, fat: 25.0, carbs: 51, protein: 4.9 },
  { name: 'KitKat', calories: 518, fat: 26.0, carbs: 65, protein: 7.0 }
])

const addItem = () => {
  desserts.push({
    name: 'New Item',
    calories: Math.floor(Math.random() * 500),
    fat: Math.random() * 30,
    carbs: Math.floor(Math.random() * 100),
    protein: Math.random() * 10
  })
}

const editItem = (item: any) => {
  alert(`编辑: ${item.name}`)
}

const deleteItem = (item: any) => {
  const index = desserts.indexOf(item)
  if (index > -1) {
    desserts.splice(index, 1)
  }
}

console.log('hello')
</script>

<style scoped>
#hero {
  padding: 80px 32px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tagline {
  font-size: 52px;
  line-height: 1.25;
  font-weight: bold;
  letter-spacing: -1.5px;
  margin-bottom: 24px;
}

.accent {
  background: -webkit-linear-gradient(315deg, #42d392 25%, #647eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  max-width: 960px;
  line-height: 1.5;
  font-size: 22px;
  margin: 0 auto 40px;
  opacity: 0.95;
}

.actions {
  margin-bottom: 20px;
}

.demo-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 16px 40px;
}

.demo-section h2 {
  font-size: 32px;
  color: #333;
}
</style>