<template>
  <div>
    <v-row>
      <v-col v-if="$vuetify.display.mdAndUp"></v-col>
      <v-col :cols="11">
        <HomeOfficeOptions></HomeOfficeOptions>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import HomeOfficeOptions from "./HomeOfficeOptions.vue";

export default {
  name: "HomeOffice",
  components: {
    HomeOfficeOptions
  },

  data: () => ({}),

  computed: {},

  watch: {},

  mounted() {},

  created() {},

  methods: {}
};
</script>

<style scoped>
</style>
