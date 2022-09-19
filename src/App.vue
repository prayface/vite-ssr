<template>
    <div class="container">
        <header>App Header</header>

        <main>
            <section>
                <router-link to="/test">Home</router-link>
                <router-link to="/404">404</router-link>
            </section>

            <router-view />
        </main>

        <footer>App Footer {{ number }}</footer>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
    setup() {
        const number = ref(1);

        return { number };
    },
});
</script>

<style lang="less" scoped>
main {
    padding: 80px 0;
    text-align: center;
    section {
        margin: 0 0 20px;
        a {
            padding: 8px 20px;
        }
    }
}
</style>
