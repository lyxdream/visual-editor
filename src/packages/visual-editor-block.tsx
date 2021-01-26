import { computed, defineComponent, PropType } from "vue";
import { VisualEditorBlcokData } from "./visual-editor.utils";

export const VisualEditorBlock = defineComponent({
    props: {
        block: { type: Object as PropType<VisualEditorBlcokData>, required: true }
    },
    setup(props) {
        const styles = computed(()=>({
            top:`${props.block.top}px`,
            left:`${props.block.left}px`
        }))
        return () => (
            <div class="visual-editor-block" style={styles.value}>
                这是一条block
            </div>
        )
    }
})