<template>
  <v-row align="center" justify="center" wrap style="position:sticky !important">
    <v-col col="12" class="padding">
      <InvHist />
    </v-col>
  </v-row>
</template>
<script>
import InvHist from "@/components/Invoice/InvoiceHistoryPage.vue";
export default {
  name: "InvoiceHistory",
  props: {
    mainColor: String
  },
  components: {
    InvHist
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
