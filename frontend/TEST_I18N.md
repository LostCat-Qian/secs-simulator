# i18n 功能测试指南

## 快速测试步骤

### 1. 启动应用

```bash
cd frontend
npm run dev
```

应用将在 `http://localhost:8080` 启动

### 2. 测试语言切换

1. **查找语言切换按钮**
   - 位置：顶栏右侧，Logo 和 "SECS Simulator" 标题之前
   - 显示：当前语言（"English" 或 "中文"）

2. **切换到中文**
   - 点击语言切换按钮
   - 选择 "中文"
   - 观察界面文本是否变为中文

3. **切换回英文**
   - 点击语言切换按钮
   - 选择 "English"
   - 观察界面文本是否变为英文

### 3. 测试持久化

1. 选择一种语言（如中文）
2. 刷新页面（F5）
3. 验证语言设置是否保持

### 4. 测试各组件翻译

#### 顶栏
- [ ] "EventBind" / "事件绑定"
- [ ] "AutoFlow" / "自动流程"
- [ ] "SECS Simulator" / "SECS 模拟器"

#### 引擎列表（左侧上方）
- [ ] 标题: "Engines" / "引擎列表"
- [ ] 搜索框: "Search..." / "搜索"
- [ ] 按钮: "Add" / "添加"
- [ ] 下拉菜单:
  - "Options" / "选项"
  - "Open" / "打开"
  - "Close" / "关闭"
  - "View Config" / "查看配置"
  - "Edit Config" / "编辑配置"
  - "Delete" / "删除"
- [ ] 状态: "ACTIVE" / "活动", "Waiting connect" / "等待连接"
- [ ] 空状态: "No engines found" / "未找到引擎"

#### 文件树（左侧中间）
- [ ] 标题: "SML Files" / "SML 文件"
- [ ] 按钮:
  - "Refresh" / "刷新"
  - "File" / "文件"
  - "Folder" / "文件夹"
- [ ] 搜索框: "Search files..." / "搜索文件..."
- [ ] 右键菜单:
  - "Send To" / "发送到"
  - "Edit" / "编辑"
  - "Delete" / "删除"
  - "Add File" / "添加文件"
  - "Add Folder" / "添加文件夹"
  - "Delete Folder" / "删除文件夹"
  - "No Open Engines" / "没有打开的引擎"

#### 文件预览（左侧下方）
- [ ] 标题: "File Preview" / "文件预览"

#### 日志面板（右侧上方）
- [ ] 标题: "Logs" / "日志"
- [ ] 搜索框: "Search..." / "搜索"
- [ ] 空状态: "No log panel opened" / "未打开日志面板"
- [ ] 无日志: "No logs available" / "暂无日志"
- [ ] 无匹配: "No matching logs" / "没有匹配的日志"

#### 自动回复面板（右侧下方）
- [ ] 标题: "Auto Reply Scripts" / "自动回复脚本"
- [ ] 搜索框: "Search..." / "搜索"
- [ ] 按钮: "Add" / "添加"
- [ ] 表格列:
  - "Tool" / "工具"
  - "Handler S/F" / "处理器 S/F"
  - "Delay (s)" / "延迟（秒）"
  - "Active" / "启用"
  - "Actions" / "操作"
- [ ] 操作按钮:
  - "Edit" / "编辑"
  - "Delete" / "删除"

### 5. 测试消息提示

尝试以下操作，观察消息提示是否正确翻译：

1. **发送文件到引擎**
   - 成功: "Sent {file} to {engine}" / "已发送 {file} 到 {engine}"
   - 带回复: "Sent {file} to {engine} (reply received)" / "已发送 {file} 到 {engine}（已收到回复）"

2. **AutoFlow 警告**
   - "AutoFlow is only available when simulating Equipment side" / "AutoFlow 仅在模拟设备端时可用"

3. **EventBind 保存**
   - "EventBind saved successfully!" / "事件绑定保存成功！"

4. **自动回复脚本**
   - 加载失败: "Failed to load auto reply script detail" / "加载自动回复脚本详情失败"

## 常见问题排查

### 问题 1: 语言切换按钮不显示
**解决方案:**
- 检查 `LanguageSwitcher.vue` 是否正确导入到 `Index.vue`
- 检查浏览器控制台是否有错误

### 问题 2: 切换语言后部分文本未改变
**解决方案:**
- 检查该文本是否已添加到语言文件
- 检查组件是否使用了 `t()` 函数
- 检查翻译键是否正确

### 问题 3: 刷新后语言重置
**解决方案:**
- 检查浏览器 localStorage 是否被禁用
- 打开浏览器开发者工具 → Application → Local Storage
- 查看是否有 `locale` 键

### 问题 4: 类型错误
**解决方案:**
```bash
cd frontend
npm run type-check
```
根据错误提示修复类型问题

## 性能测试

1. **切换速度**
   - 语言切换应该是即时的，无延迟

2. **内存占用**
   - 打开浏览器开发者工具 → Performance
   - 记录切换语言时的内存变化
   - 应该没有明显的内存泄漏

3. **包大小**
   - 检查构建后的包大小
   - i18n 应该不会显著增加包大小

## 自动化测试建议

```typescript
// 示例：测试语言切换
describe('i18n', () => {
  it('should switch language', () => {
    const { locale, setLocale } = useLocale()
    
    expect(locale.value).toBe('en')
    
    setLocale('zh')
    expect(locale.value).toBe('zh')
    
    setLocale('en')
    expect(locale.value).toBe('en')
  })
  
  it('should persist language preference', () => {
    setLocale('zh')
    expect(localStorage.getItem('locale')).toBe('zh')
  })
})
```

## 测试报告模板

```
测试日期: ____________________
测试人员: ____________________
浏览器: ____________________

✅ 通过 / ❌ 失败

[ ] 语言切换按钮显示正常
[ ] 切换到中文功能正常
[ ] 切换到英文功能正常
[ ] 语言偏好持久化正常
[ ] 所有组件文本翻译正确
[ ] 消息提示翻译正确
[ ] 无控制台错误
[ ] 性能表现良好

备注:
_________________________________
_________________________________
_________________________________
```

## 完成标准

- ✅ 所有测试项通过
- ✅ 无控制台错误或警告
- ✅ 类型检查通过
- ✅ 用户体验流畅
- ✅ 翻译准确、自然
