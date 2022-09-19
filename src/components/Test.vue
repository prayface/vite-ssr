<template>
    <div>{{ value }}</div>
</template>

<script lang="ts">
import { upperCase } from "lodash-es";
import { defineComponent, ref } from "vue";
export default defineComponent({
    setup() {
        const value = ref(upperCase("test"));

        return {
            value,
        };
    },
});
</script>
