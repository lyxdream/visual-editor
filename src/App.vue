<template>
    <div class="app">
        <h1>这个是页面内容哈</h1>
        <VisualEditor v-model="jsonData"  :config="visualConfig" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VisualEditor } from '@/packages/visual-editor'
import { visualConfig } from '@/visual.config'
export default defineComponent({
    name: 'App',
    components: {
        VisualEditor,
    },
    data() {
        return {
            visualConfig,
            jsonData: {
                container: {
                    width: 800,
                    height: 500,
                },
                blocks: [
                    {
                        left: 100,
                        top: 100,
                        componentKey:'button',
                        focus:true
                    },
                    {
                        left: 200,
                        top: 200,
                        componentKey:'input'
                    },
                ],
            },
        }
    },
})
</script>

<style lang="scss">
#app {
    body,
    html {
        margin: 0;
        padding: 0;
    }
}
</style>
