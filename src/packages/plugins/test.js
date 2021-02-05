// const focusHandler = (() => {
//     return {
//         container: {
//             onMouseDown: (e) => {
//                 e.stopPropagation();
//                 e.preventDefault();
//             }
//         },
//         block: {
//             onMouseDown: (e, block) => {
//                 e.stopPropagation();
//                 e.preventDefault();
//                 if (e.shiftKey) {
//                     //如果按住shift键
//                     block.focus = !block.focus;
//                 } else {
//                     //如果没按shift键
//                     //block项其他都为未选中状态
//                     block.focus = true;
//                 }
//             }
//         }
//     }
// })()
// let fn =  {...focusHandler.container};
// let fn1 = {...{
//     onMousedown: (e) => focusHandler.block.onMouseDown(e, block)
// }}



/*
执行函数
{...{
    onMousedown: (e) => focusHandler.block.onMouseDown(e, block)
 }}
*/

// console.log(fn1)

/*例子2
const blocks = [
    {
        adjustPosition: true, // 是否需要调整位置
        focus: true // 当前是否为选中状态
    },
    {
        adjustPosition: true, // 是否需要调整位置
    }
]

let focus = [];
let unFocus = [];
blocks.forEach(block=>(block.focus?focus:unFocus).push(block));
console.log(focus,unFocus)
*/

/*
如果用户自定义的属性，放在扩展运算符后面，则扩展运算符内部的同名属性会被覆盖掉。
let aWithOverrides = { ...a, x: 1, y: 2 }; 
a对象的x属性和y属性，拷贝到新对象后会被覆盖掉。
*/

/*
const dataModel =  {
    container: {
        width: 100,
        height: 200
    },
    blocks: [
        {
            adjustPosition: true, // 是否需要调整位置
            focus: true // 当前是否为选中状态
        },
        {
            adjustPosition: true, // 是否需要调整位置
        }
    ]
}

// console.log({unFocus,...blocks})
console.log({...dataModel})
let arr = [{
    adjustPosition: true, // 是否需要调整位置
}]
let fn = {...dataModel, adjustPosition: true}

console.log(fn)

*/

//  let queue = [1,2,3,4]

//   queue = queue.slice(0, 3)
//   console.log(queue)





//如果数组是[1，2，3，2，4]，那么在2之后添加6后，

// let arr = [1,2,5,2]

// function addElement(arr,index,element){
//       let resArr = [];
//       if(index>arr.length-1){
//           resArr = [...arr, element]
//       }else if(index<0){
//           resArr = [element,...arr]
//       }else{
//           resArr = [...arr.slice(0, index), element, ...arr.slice(index)]
//       }
//       return resArr
// }
// console.log(addElement(arr,-1,9))


//filter过滤器  请输出结果并进行解释
var ary = [0,1,2];
ary[10] = 10;
let res = ary.filter(function(x) {
    console.log(x)
  return x === undefined;
});
console.log(res)