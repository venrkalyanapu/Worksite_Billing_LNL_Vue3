<template>
  <v-row align="center" justify="center" wrap>
    <v-col cols="12" class="padding">
      <AccountSettingsPage />
    </v-col>
  </v-row>
</template>

<script>
import AccountSettingsPage from "@/components/AccountAdmin/AccountSettingsPage.vue";
export default {
  name: "AccountSettings",
  props: {
    mainColor: String
  },
  components: {
    AccountSettingsPage
  },
  methods: {}
};
</script>
<style scoped>
.padding {
  margin-left: 25px;
  margin-right: 25px;
}
</style>