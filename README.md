<p>
  <h1 align="center">Platform speed</h1>
</p>

有数BI vscode快捷开发工具

## Features
- Snippets
- Auto Completion

## Snippets

| 语法  | 生成内容 | 效果 |
| -------: | ------- | ---- |
| `rglc→`   | regular component skeleton | 略 
| `list→`   | regular list | {#list}
| `if→`  | regular if | {#if}
| `ifelse→`  | regular if else | {#if} {#else} {/if}
| `ifelseif→`  | regular if else if | {#if} {#elseif} {/if}
| `include→`｜`inc`  | regular include statement | {#include}
| `update→`  | regular update | this.$update()
| `watch→`  | regular watch | this.$watch()
| `emit→`  | regular emit | this.$emit()

## 支持Platform基础组件快速导入

## Auto completion
- 支持js文件内使用`this.`进行方法的补全操作  
![this补全操作](image/this.gif)

## Requirements

### ✅ 开启字符串补全
由于regular的模板是基于字符串的，因此大部分的补全在字符串内执行。  
需要在设置(`User Setting`)中：
```
"editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": true
}
```
打开对`strings`补全的支持。

### ✅ 模板文件补全支持  
由于vscode内置语言中不支持`tpl`为后缀作为language，因此需要用户自定义关联`tpl`为`html`。  
需要在设置(`User Setting`)中：
```
"files.associations": {
    "*.tpl": "html"
}
```
配置`tpl`后缀文件到`html`的关联

**Enjoy!**
