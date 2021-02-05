import { onUnmounted, reactive } from 'vue'
import { KeyboardCode } from './keyboard-code'
export interface CommandExecute {
    undo?: () => void //将做的事情还原
    redo: () => void //重新做一遍要做的事情
}
export interface Command {
    name: string // 命令唯一标识
    keyboard?: string | string[] // 命令监听的快捷键
    execute: (...args: any[]) => CommandExecute // 命令被执行的时候，所做的内容
    followQueue?: boolean // 命令执行完之后，是否需要将命令执行得到的undo，redo存入命令队列
    init?: () => () => void | undefined //命令初始化函数
    data?: any //命令缓存所需要得数据
}

export function useCommander() {
    const state = reactive({
        current: -1, // 队列中当前的命令
        queue: [] as CommandExecute[], //命令队列
        commands: {} as Record<string, (...args: any[]) => void>, //命令对象，方便通过命令的名称调用命令的execute函数，并且执行额外的命令队列的逻辑
        commandArray: [] as Command[], //命令对象数组
        destroyList: [] as ((() => void) | undefined)[], // 组件销毁的时候，需要调用的销毁逻辑数组
    })

    /*注册一个命令*/
    const registry = (command: Command) => {
        console.log(1)
        state.commandArray.push(command)
        state.commands[command.name] = (...args) => {
            console.log(command.name)
            const { undo, redo } = command.execute(...args)
            redo() //执行每个注册函数里面的redo()
            /*如果命令执行之后，不需要进入命令队列，则直接结束*/
            if (command.followQueue === false) {
                return
            }
            /*否则，将命令队列中剩余的命令去除，保留current及其之前的命令*/
            let { queue, current } = state
            if (queue.length > 0) {
                queue = queue.slice(0, current + 1) //截取当前元素之前的所有元素
                state.queue = queue
            }
            //删除的时候会push
            /*设置命令队列中最后一个命令为当前执行的命令*/
            state.queue.push({ undo, redo })
            /*索引+1，指向队列中的最后一个命令*/
            state.current = current + 1
            console.log('current', state.current)
        }
    }
    /*快捷键*/
    const keyboardEvent = (() => {
        const onKeydown = (e: KeyboardEvent) => {
            /**/
            if (document.activeElement !== document.body) {
                //如果不是document.body则执行默认行为
                return
            }
            // console.log(e)
            const { keyCode, shiftKey, altKey, ctrlKey, metaKey } = e
            let keyString: string[] = []
            if (ctrlKey || metaKey) {
                keyString.push('ctrl')
            }
            if (shiftKey) keyString.push('shift')
            if (altKey) keyString.push('alt')
            keyString.push(KeyboardCode[keyCode])
            const keyNames = keyString.join('+')
            //命令对象数组 循环
            state.commandArray.forEach(({ keyboard, name }) => {
                //keyboard 快捷键名称数组
                if (!keyboard) {
                    return
                }
                const keys = Array.isArray(keyboard) ? keyboard : [keyboard]
                console.log(keys)
                if (keys.indexOf(keyNames) > -1) {
                    //找到操作得那个快捷键，并执行
                    state.commands[name]()
                    e.stopPropagation()
                    e.preventDefault()
                }
            })
        }
        const init = () => {
            window.addEventListener('keydown', onKeydown)
            return () => window.removeEventListener('keydown', onKeydown)
        }
        return init
    })()

    /**
     * useCommander初始化函数，负责初始化键盘监听事件，调用命令的初始化逻辑
     * @author  yx
     * @date    2021/2/2  下午
     */
    const init = () => {
        state.commandArray.forEach(
            (command) =>
                !!command.init && state.destroyList.push(command.init())
        )
        // console.log(state.commandArray,'commandArray')
        state.destroyList.push(keyboardEvent())
        console.log(state.destroyList) /*destroyList里面有两个事件 （"drag"的init事件和keydown的removeEventListener）*/
    }
    /*注册撤回命令（撤回命令执行结果不需要进入命令队列）*/
    registry({
        name: 'undo',
        keyboard: 'ctrl+z',
        followQueue: false,
        execute: () => {
            //命令执行的时候，要做的事情
            return {
                redo: () => {
                    //重新做一遍要做的事情
                    console.log('撤销>>>>>')
                    console.log(state.current)
                    if (state.current === -1) return
                    const queueItem = state.queue[state.current]
                    if (!!queueItem) {
                        !!queueItem.undo && queueItem.undo()
                        state.current-- //队列移除一项
                    }
                },
            }
        },
    })

    /*注册重做命令（重做命令执行结果不需要进入命令队列）*/
    registry({
        name: 'redo',
        keyboard: ['ctrl+y', 'ctrl+shift+z'],
        followQueue: false,
        execute: () => {
            return {
                redo: () => {
                    console.log('redo>>>>>')
                    const queueItem = state.queue[state.current + 1]
                    if (!!queueItem) {
                        queueItem.redo()
                        state.current++
                    }
                },
            }
        },
    })
    onUnmounted(() => state.destroyList.forEach((fn) => !!fn && fn()))
    return {
        state,
        registry,
        init,
    }
}



