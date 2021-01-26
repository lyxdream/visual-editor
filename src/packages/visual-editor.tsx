import {
    computed,
    defineComponent,
    PropType,
    ref,
    useCssVars,
    withCtx,
} from 'vue'
import './visual-editor.scss'
import {
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
        // console.log(props.config)
        const menuDraggiter = {
            current: {
                component: null as null | VisualEditorComponent,
            },
            dragstart: (e: DragEvent, component: VisualEditorComponent) => {
                containerRef.value.addEventListener(
                    'dragenter',
                    menuDraggiter.dragenter
                )
                containerRef.value.addEventListener(
                    'dragover',
                    menuDraggiter.dragover
                )
                containerRef.value.addEventListener(
                    'dragleave',
                    menuDraggiter.dragleave
                )
                containerRef.value.addEventListener('drop', menuDraggiter.drop)
                menuDraggiter.current.component = component
            },
            dragenter: (e: DragEvent) => {
                e.dataTransfer!.dropEffect = 'move'
            },
            dragover: (e: DragEvent) => {
                e.preventDefault()
            },
            dragleave: (e: DragEvent) => {
                e.dataTransfer!.dropEffect = 'none'
            },
            dragend: (e: DragEvent) => {
                containerRef.value.removeEventListener(
                    'dragenter',
                    menuDraggiter.dragenter
                )
                containerRef.value.removeEventListener(
                    'dragover',
                    menuDraggiter.dragover
                )
                containerRef.value.removeEventListener(
                    'dragleave',
                    menuDraggiter.dragleave
                )
                containerRef.value.removeEventListener(
                    'drop',
                    menuDraggiter.drop
                )
                menuDraggiter.current.component = null
            },
            drop: (e: DragEvent) => {
                console.log('drop', menuDraggiter.current.component)
                const blocks = dataModel.value.blocks || [];
                console.log(blocks)
                blocks.push({
                    top:e.offsetY,
                    left:e.offsetX
                })
                dataModel.value = {
                    ...dataModel.value,
                    blocks
                }
            },
        }
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
                        >
                            {!!dataModel.value.blocks &&
                                dataModel.value.blocks.map((block, index) => {
                                    return (
                                        <VisualEditorBlock
                                            block={block}
                                            key={index}
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
