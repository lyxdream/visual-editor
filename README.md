# visual-editor

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
### 可视化编辑器实现的基本功能列表
- [ ] 主页面结构：左侧可选组件列表、中间容器画布、右侧编辑组件定义好的属性
- [ ] 从菜单拖拽组件到容器；
    - 1、左侧渲染拖拽列表
    - 2、渲染容器中组件
    - 3、容器中添加组件的时候，自动调整位置上下左右居中
- [ ] Block的选中状态；
    - 1、增加选中属性，block的选中状态
    - 2、按住shift键再操作组件状态变化
- [ ] 容器内的组件可以拖拽移动位置；
    - 使用mousedown事件
- [ ] 单选、多选；
- [ ] 命令队列以及对应的快捷键；
   - 容器内得拖拽与队列相结合
   - 快捷键
- [ ] 设计好操作栏按钮：
    - [ ] 撤销、重做；
    - [ ] 导入、导出；
    - [ ] 置顶、置底；
    - [ ] 删除、清空；

    
- [ ] 拖拽贴边；
- [ ] 组件可以设置预定义好的属性；
- [ ] 右键操作菜单；
- [ ] 拖拽调整宽高；
- [ ] 组件绑定值；
- [ ] 根据组件标识，通过作用域插槽自定义某个组件的行为
    - [ ] 输入框：双向绑定值、调整宽度；
    - [ ] 按钮：类型、文字、大小尺寸、拖拽调整宽高；
    - [ ] 图片：自定义图片地址，拖拽调整图片宽高；
    - [ ] 下拉框：预定义选项值，双向绑定字段；






    拖拽实现部分用到了：
**移动拖动的元素到所选择的放置目标节点**
drop是监听的放置拖拽节点的目标容器的事件。但是用户有可能拖拽一个组件过来，但是没有放到放置拖拽节点的目标容器里，在容器外边就放开了，这种情况下，就监听不到容器的drop事件了，所以事件的解除动作得在拖拽节点的dragend事件里边处理，

HTML 5 拖放
- 设置元素为可拖放
  首先，为了使元素可拖动，把 draggable 属性设置为 true ：
  ```js
  <img draggable="true" />
  ```
 -  拖动什么 - ondragstart 和 setData()
   规定当元素被拖动时，会发生什么。
```js
ondragstart 属性调用了一个函数，dragstart(event)，它规定了被拖动的数据。
dataTransfer.setData() 方法设置被拖数据的数据类型和值：

<img id="drag1" src="logo.gif" draggable="true"
ondragstart="dragstart(event)" width="336" height="69" />

function dragstart(ev)
{
   ev.dataTransfer.setData("Text",ev.target.id);
}
```
在这个例子中，数据类型是 "Text"，值是可拖动元素的 id ("drag1")。

- 放到何处 - ondragover

ondragover 事件规定在何处放置被拖动的数据。
**默认地，无法将数据/元素放置到其他元素中。如果需要设置允许放置，我们必须阻止对元素的默认处理方式。这要通过调用 ondragover 事件的 event.preventDefault() 方法：**

```js
event.preventDefault()
```
- 进行放置 - ondrop

当放置被拖数据时，会发生 drop 事件。

在上面的例子中，ondrop 属性调用了一个函数，drop(event)：

```js
function drop(ev)
{
ev.preventDefault();
var data=ev.dataTransfer.getData("Text");
ev.target.appendChild(document.getElementById(data));
}
```
- 注意：
    - 调用 preventDefault() 来避免浏览器对数据的默认处理（drop 事件的默认行为是以链接形式打开）
    - 通过 dataTransfer.getData("Text") 方法获得被拖的数据。该方法将返回在 setData() 方法中设置为相同类型的任何数据。
    - 被拖数据是被拖元素的 id ("drag1")
    - 把被拖元素追加到放置元素（目标元素）中

实现功能

```js
请把 图片拖放到矩形中：

<div id="div1" ondrop="drop(event)"
ondragover="allowDrop(event)"></div>
<img id="drag1" src="img_logo.gif" draggable="true"
ondragstart="drag(event)" width="336" height="69" />

```
另外，关于拖放drag中的其它一些坑：
1.调用drop之前一定要先调用dragover,不管你想不想用，并且在处理函数的第一行加上：event.preventDefault();表示允许放下元素
2.只能在dragstart调用函数里执行setData;在drop调用函数了执行getData;这是由操作权限所决定的。
    
  

