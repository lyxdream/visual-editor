import { reactive } from "vue"

export interface CommandExecute {
    undo?: () => void, //将做的事情还原
    redo: () => void //重新做一遍要做的事情
}

export interface Command {
    name: string,                                               // 命令唯一标识
    keyboard?: string | string[],                               // 命令监听的快捷键
    execute: (...args: any[]) => CommandExecute,                // 命令被执行的时候，所做的内容
    followQueue?: boolean,                                      // 命令执行完之后，是否需要将命令执行得到的undo，redo存入命令队列
}

export function useCommander() {
    const state = reactive({
        current: -1,                                        // 队列中当前的命令
        queue: [] as CommandExecute[],
        commands: {} as Record<string, (...args: any[]) => void>,
       
    })
    const registry = (command: Command) => {
        state.commands[command.name] = (...args) => {
            const { undo, redo } = command.execute(...args)
            if (command.followQueue!==false) {
                state.queue.push({ undo, redo })
                state.current += 1
            }
            redo();//执行每个注册函数里面的redo()
            console.log(state)
        }
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
                    // if(state.current===-1) return;
                    // const queueItem = state.queue[state.current]
                    console.log('undo>>>>>')
                    const { current } = state;
                    if (current === -1) return
                    const { undo } = state.queue[current]
                    !!undo && undo()
                    state.current -= 1
                }


            }
        }
    })

    /*注册重做命令（重做命令执行结果不需要进入命令队列）*/
    registry({
        name: 'redo',
        keyboard: [
            'ctrl+y',
            'ctrl+shift+z'
        ],
        followQueue: false,
        execute: () => {
            return {
                redo: () => {
                    console.log('redo>>>>>')
                    const { current } = state;
                    if (!state.queue[current]) return;
                    const { redo } = state.queue[current];
                    redo()
                    state.current += 1;
                }
            }
        }
    })
    return {
        state,
        registry
    }
}

