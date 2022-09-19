<template>
    <div v-if="data">
        <Test></Test>
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import Test from "@/components/Test.vue";

import { useAsyncData } from "@/composables";
import { defineComponent, ref } from "vue";
export default defineComponent({
    components: { Test },
    setup() {
        const data = useAsyncData("data", () => {
            return new Promise((resolve, reject) => {
                window.setTimeout(() => {
                    resolve(ref("data"));
                }, 500);
            });
        });

        return {
            data,
        };
    },
});
</script>
