import { computed, defineComponent, PropType, ref } from 'vue'
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
        const dataModel = useModel(
            () => props.modelValue,
            (val) => ctx.emit('update:modelValue', val)
        )

        const containerRef = ref({} as HTMLDivElement)
        console.log(dataModel)
        const containerStyles = computed(() => ({
            width: `${dataModel.value.container.width}px`,
            height: `${dataModel.value.container.height}px`,
        }))
        const methods = {
            clearFocus: (block?: VisualEditorBlockData) => {
                let blocks = (dataModel.value.blocks || []);
                if (blocks.length === 0) return;
                if (!!block) {
                    //如果有入参，则除了传入的block，其他都为未选中状态
                    blocks = blocks.filter(item => item !== block)
                }
                 
                blocks.forEach(block => block.focus = false)
            }
        }


        // console.log(props.config)
        //拖拽操作
        const menuDraggiter = (() => {
            let component = null as null | VisualEditorComponent
            const blockHandler = {
                //处理拖拽组件开始操作
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
                    const blocks = dataModel.value.blocks || []
                    console.log('blocks', blocks)
                    blocks.push(
                        createNewBlock({
                            component: component!,
                            top: e.offsetY,
                            left: e.offsetX,
                        })
                    )
                    //   console.log('dataModel111', dataModel.value)
                    dataModel.value = {
                        ...dataModel.value,
                        blocks,
                    }
                },
            }
            return blockHandler
        })()
        //选中之后状态操作
        const focusHandler = (() => {
            return {
                container: {
                    onMouseDown: (e: MouseEvent) => {
                        e.stopPropagation();
                        e.preventDefault();
                        methods.clearFocus()
                    }
                },
                block: {
                    onMouseDown: (e: MouseEvent, block: VisualEditorBlockData) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.shiftKey) {
                            //如果按住shift键
                            block.focus = !block.focus;
                        } else {
                            //如果没按shift键
                            //block项其他都为未选中状态
                            block.focus = true;
                            methods.clearFocus(block);
                        }
                    }
                }
            }
        })()

        return () => (
            <div class="visual-editor">
                <div class="visual-editor-menu">
                    {props.config.componentList.map((component) => (
                        <div
                            class="visual-component-item"
                            draggable
                            onDragstart={(e) =>
                                menuDraggiter.dragstart(e, component)
                            }
                            onDragend={menuDraggiter.dragend}
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
                <div class="visual-editor-head">visual-editor-head</div>
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
                                                onMousedown: (e: MouseEvent) => focusHandler.block.onMouseDown(e, block)
                                            }
                                            }
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
