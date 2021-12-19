<p>
  <h1 align="center">Platform speed</h1>
</p>

有数BI Platform vscode快捷开发插件

## Features
- Snippets代码片段 包括Regular代码片段、基础组件代码片段及组件路径引入
- 补全提示 函数补全，$refs补全
- 快速跳转 this/组件名/ref
- Regular表达式高光 list、if、@、i18n、函数名、变量名

## Snippets代码片段

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

## Snippets 基础组件代码片段及组件路径引入
tip
> 组件路径引入只在module目录下有效，因为components目录下无法确定是否已经引入了组件

### example

| 组件名称  | 生成内容 | 效果 |
| -------: | ------- | ---- |
| `r-table`  | <r-table disabled={isDisabled} heads={heads} body={body} list={list} ref="table" loading={loading} \></r-table\>| - 

## 补全提示
函数补全

![函数补全](https://img-blog.csdnimg.cn/1adbb5ab2f5d47bd86c6ca8defbfded4.gif#pic_center)

refs补全

![refs补全](https://img-blog.csdnimg.cn/78976e085af74c09964a29930e594e3a.gif#pic_center)

## 快速跳转
函数跳转

![函数跳转](https://img-blog.csdnimg.cn/f2863e296e084940a2b220f841337cd1.gif#pic_center)

ref跳转

![ref跳转](https://img-blog.csdnimg.cn/483c0ae6822f487c8ee5f85b4e511054.gif#pic_center)

this跳转

![this跳转](https://img-blog.csdnimg.cn/06b873b917674722b0dd72f27cb93269.gif#pic_center)
## Regular表达式高光

![表达式高光](https://img-blog.csdnimg.cn/6538025d61924aac9857bb35b6293e37.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAQ29tb25lZQ==,size_20,color_FFFFFF,t_70,g_se,x_16)