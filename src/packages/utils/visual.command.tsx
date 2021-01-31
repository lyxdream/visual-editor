import { useCommander } from "../plugins/command.plugin";
import { VisualEditorBlockData, VisualEditorModelValue } from "../visual-editor.utils";
import deepcopy from "deepcopy";

export function useVisualCommand(
    {
        focusData,
        updateBlocks,
        dataModel,
        // dragstart,
        // dragend,
    }: {
        focusData: { value: { focus: VisualEditorBlockData[], unFocus: VisualEditorBlockData[] } },
        updateBlocks: (blocks: VisualEditorBlockData[]) => void,
        dataModel: { value: VisualEditorModelValue },
        // dragstart: { on: (cb: () => void) => void, off: (cb: () => void) => void },
        // dragend: { on: (cb: () => void) => void, off: (cb: () => void) => void },
    }
) {
    const commander = useCommander();
    commander.registry({
        name: 'delete',
        keyboard: [
            'backspace',
            'delete',
            'ctrl+d'
        ],
        execute: () => {
            const data = {
                before: dataModel.value.blocks || [],
                after: focusData.value.unFocus,//删除之后剩下的block项
            }
            console.log('执行删除命令')
            return {
                redo: () => {
                    console.log('重做删除命令')
                    // console.log(data.after)
                    updateBlocks(deepcopy(data.after))
                },
                undo: () => {
                    console.log('撤回删除命令')
                    updateBlocks(deepcopy(data.before))
                },
            }
        }
    })
    return {
        undo: () => commander.state.commands.undo(),
        redo: () => commander.state.commands.redo(),
        delete: () => commander.state.commands.delete(),
    }
}