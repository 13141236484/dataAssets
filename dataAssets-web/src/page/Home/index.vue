<template>
    <div class="layout">
        <home-header></home-header>
        <div class="layout-content" >
            <router-view></router-view>
        </div>
    </div>

</template>
<script>
    import HomeHeader from './componets/Header.vue'
    export default {
      name: 'home',
      components: {
        HomeHeader
      },
      data () {
        return {

        }
      },
      mounted () {
      },
      methods: {

      }
    }
</script>
<style lang="scss" scoped>
    .layout {
        width: 100%;
        .layout-content {
            padding: 0 40px 0 40px;
            margin: 40px 0 20px 0;
        }
    }

</style>