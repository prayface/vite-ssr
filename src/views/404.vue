<template>{{ error }}</template>

<script lang="ts">
import { useAsyncData } from "@/composables";
import { defineComponent } from "vue";

export default defineComponent({
    setup() {
        const error = useAsyncData("error", () => {
            return new Promise((resolve, reject) => {
                window.setTimeout(() => {
                    resolve([1, 2, 3]);
                }, 1000);
            });
        });

        return {
            error,
        };
    },
});
</script>
