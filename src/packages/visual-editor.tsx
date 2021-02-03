import {
    computed,
    defineComponent,
    PropType,
    ref,
    registerRuntimeCompiler,
} from 'vue'
import './visual-editor.scss'
import {
    createNewBlock,
    VisualEditorBlockData,
    VisualEditorComponent,
    VisualEditorConfig,
    VisualEditorModelValue,
} from '@/packages/visual-editor.utils'
import { useModel } from './utils/useModel'
import { VisualEditorBlock } from './visual-editor-block'
import { useVisualCommand } from './utils/visual.command'
import { createEvent } from './plugins/event'

export const VisualEditor = defineComponent({
    props: {
        modelValue: {
            type: Object as PropType<VisualEditorModelValue>,
            required: true,
        },
        config: {
            type: Object as PropType<VisualEditorConfig>,
            required: true,
        },
    },
    emits: {
        'update:modelValue': (val?: VisualEditorModelValue) => true,
    },
    setup(props, ctx) {
        /*双向绑定至容器中的组件数据*/
        const dataModel = useModel(
            () => props.modelValue,
            (val) => ctx.emit('update:modelValue', val)
        )
        /*container节点dom对象的引用*/
        const containerRef = ref({} as HTMLDivElement)
        // console.log(dataModel)
        /*container节点style样式对象*/
        const containerStyles = computed(() => ({
            width: `${dataModel.value.container.width}px`,
            height: `${dataModel.value.container.height}px`,
        }))
        const focusData = computed(() => {
            const focus: VisualEditorBlockData[] = []
            const unFocus: VisualEditorBlockData[] = [];
            (dataModel.value.blocks || []).forEach((block) =>
                (block.focus ? focus : unFocus).push(block)
            )
            return {
                focus, // 此时选中的数据
                unFocus, // 此时未选中的数据
            }
        })

        const dragstart = createEvent();//注册两个事件
        const dragend = createEvent()
        // dragstart.on(()=>{
        //     console.log('listen drag start')
        // })
        // dragend.on(() => {
        //     console.log('listen drag end')
        // })

        /*对外暴露的一些方法*/
        const methods = {
            clearFocus: (block?: VisualEditorBlockData) => {
                let blocks = dataModel.value.blocks || []
                if (blocks.length === 0) return
                if (!!block) {
                    //如果有入参，则除了传入的block，其他都为未选中状态
                    blocks = blocks.filter((item) => item !== block)
                }
                blocks.forEach((block) => (block.focus = false))
            },
            updateBlocks: (blocks: VisualEditorBlockData[]) => {
                //合并完只剩下传入的blocks的内容
                // console.log('dataModel',dataModel.value)
                //  console.log('blocks', blocks)
                dataModel.value = {
                    ...dataModel.value,
                    blocks,
                }
                // console.log(dataModel.value)
            },
        }
        // console.log(props.config)
        /* 处理从菜单拖拽组件到容器的相关动作*/
        const menuDraggiter = (() => {
            let component = null as null | VisualEditorComponent
            const blockHandler = {
                /*处理拖拽组件开始操作*/
                dragstart: (e: DragEvent, current: VisualEditorComponent) => {
                    containerRef.value.addEventListener(
                        'dragenter',
                        containerHandler.dragenter
                    )
                    containerRef.value.addEventListener(
                        'dragover',
                        containerHandler.dragover
                    )
                    containerRef.value.addEventListener(
                        'dragleave',
                        containerHandler.dragleave
                    )
                    containerRef.value.addEventListener(
                        'drop',
                        containerHandler.drop
                    )
                    component = current
                    dragstart.emit() //发布事件
                },
                //处理拖拽组件结束操作
                dragend: (e: DragEvent) => {
                    containerRef.value.removeEventListener(
                        'dragenter',
                        containerHandler.dragenter
                    )
                    containerRef.value.removeEventListener(
                        'dragover',
                        containerHandler.dragover
                    )
                    containerRef.value.removeEventListener(
                        'dragleave',
                        containerHandler.dragleave
                    )
                    containerRef.value.removeEventListener(
                        'drop',
                        containerHandler.drop
                    )
                    component = null
                },
            }
            const containerHandler = {
                /*拖拽菜单组件，进入容器的时候，设置鼠标为可放置状态*/
                dragenter: (e: DragEvent) => {
                    e.dataTransfer!.dropEffect = 'move'
                },
                /*拖拽组件，鼠标在容器中移动的时候，禁止默认事件*/
                dragover: (e: DragEvent) => {
                    e.preventDefault()
                },
                /*如果拖拽过程中，鼠标离开了容器，设置鼠标为不可放置状态*/
                dragleave: (e: DragEvent) => {
                    e.dataTransfer!.dropEffect = 'none'
                },
                /*在容器中放置的时候，给事件对象的offsetX,offsetY添加一条组件数据*/
                drop: (e: DragEvent) => {
                    //当前拖拽的元素位置信息 push到dataModel里面
                    const blocks = [...(dataModel.value.blocks || [])]
                    // console.log('blocks', blocks)
                    blocks.push(
                        createNewBlock({
                            component: component!,
                            top: e.offsetY,
                            left: e.offsetX,
                        })
                    )
                    methods.updateBlocks(blocks)
                    dragend.emit() //发布事件
                },
            }
            return blockHandler
        })()

        /*处理block选中的相关动作*/
        const focusHandler = (() => {
            return {
                container: {
                    onMouseDown: (e: MouseEvent) => {
                        e.stopPropagation()
                        e.preventDefault()
                        /*点击空白处清空所有选中的block*/
                        methods.clearFocus()
                    },
                },
                block: {
                    onMouseDown: (
                        e: MouseEvent,
                        block: VisualEditorBlockData
                    ) => {
                        e.stopPropagation()
                        e.preventDefault()
                        if (e.shiftKey) {
                            /*如果摁住了shift键，如果此时没有选中的block，就选中这个block，否则令这个block的选中状态去翻*/
                            if (focusData.value.focus.length <= 1) {
                                block.focus = true
                            } else {
                                block.focus = !block.focus
                            }
                        } else {
                            //如果没按shift键
                            /*如果点击的这个block没有被选中，才清空这个其他选中的block，否则不做任何事情。放置拖拽多个block，取消其他block的选中状态*/
                            if (!block.focus) {
                                block.focus = true
                                methods.clearFocus(block)
                            }
                        }
                        blockDraggier.mousedown(e)
                    },
                },
            }
        })()
        /*处理block在container中拖拽移动的相关动作*/
        const blockDraggier = (() => {
            let dragState = {
                startY: 0,
                startX: 0,
                startPos: [] as { left: number; top: number }[],
                dragging: false, //在移动的时候再触发事件
            }
            const mousedown = (e: MouseEvent) => {
                dragState = {
                    startX: e.clientX,
                    startY: e.clientY,
                    startPos: focusData.value.focus.map(({ top, left }) => ({
                        top,
                        left,
                    })),
                    dragging: false,
                }
                document.addEventListener('mousemove', mousemove)
                document.addEventListener('mouseup', mouseup)
            }
            const mousemove = (e: MouseEvent) => {
                const durX = e.clientX - dragState.startX
                const durY = e.clientY - dragState.startY
                if (!dragState.dragging) {
                    //如果为false，则触发dragstart事件
                    dragState.dragging = true
                    dragstart.emit()
                }
                focusData.value.focus.forEach((block, index) => {
                    block.top = dragState.startPos[index].top + durY,
                   block.left = dragState.startPos[index].left + durX
                })
            }
            const mouseup = () => {
                document.removeEventListener('mousemove', mousemove)
                document.removeEventListener('mouseup', mouseup)
                if(dragState.dragging){
                    dragend.emit()
                }
            }
            return { mousedown }
        })()

        /*快捷键*/
        const commander = useVisualCommand({
            focusData,
            updateBlocks: methods.updateBlocks,
            dataModel,
            dragstart,
            dragend,
        })
        const buttons = [
            {
                label: '撤销',
                icon: 'icon-back',
                handler: commander.undo,
                tip: 'ctrl+z',
            },
            {
                label: '重做',
                icon: 'icon-forward',
                handler: commander.redo,
                tip: 'ctrl+y, ctrl+shift+z',
            },
            {
                label: '删除',
                icon: 'icon-delete',
                handler: () => commander.delete(),
                tip: 'ctrl+d, backspace, delete',
            },
        ]
        return () => (
            <div class="visual-editor">
                <div class="visual-editor-menu">
                    {props.config.componentList.map((component) => (
                        <div
                            class="visual-component-item"
                            draggable
                            onDragend={menuDraggiter.dragend}
                            onDragstart={(e) =>
                                menuDraggiter.dragstart(e, component)
                            }
                        >
                            <span class="visual-component-item-label">
                                {component.label}
                            </span>
                            <div class="visual-component-item-content">
                                {component.preview()}
                            </div>
                        </div>
                    ))}
                    {/* visual-editor-menu */}
                </div>
                <div class="visual-editor-head">
                    {buttons.map((btn, index) => (
                        <el-tooltip
                            effect="dark"
                            content={btn.tip}
                            placement="bottom"
                        >
                            <div
                                key={index}
                                class="visual-editor-head-button"
                                onClick={btn.handler}
                            >
                                <i class={`iconfont ${btn.icon}`} />
                                <span>{btn.label}</span>
                            </div>
                        </el-tooltip>
                    ))}
                </div>
                {/* 右边操作组件部分 */}
                <div class="visual-editor-operator">visual-editor-operator</div>
                {/* 中间画布部分 */}
                <div class="visual-editor-body">
                    <div class="visual-editor-content">
                        <div
                            class="visual-editor-container"
                            ref={containerRef}
                            style={containerStyles.value}
                            {...focusHandler.container}
                        >
                            {!!dataModel.value.blocks &&
                                dataModel.value.blocks.map((block, index) => {
                                    return (
                                        <VisualEditorBlock
                                            config={props.config}
                                            block={block}
                                            key={index}
                                            {...{
                                                onMousedown: (e: MouseEvent) =>
                                                    focusHandler.block.onMouseDown(
                                                        e,
                                                        block
                                                    ),
                                            }}
                                        />
                                    )
                                })}
                        </div>
                    </div>
                </div>
            </div>
        )
    },
})
