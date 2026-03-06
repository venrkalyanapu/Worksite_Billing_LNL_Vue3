<template>
  <v-row align="center" justify="center"  wrap style="position:sticky !important;">
    <v-col col="12" class="padding">
      <InvHistDetail />
    </v-col>
  </v-row>
</template>
<script>
import InvHistDetail from "@/components/Invoice/InvoiceHistoryDetailPage.vue";
export default {
  name: "InvoiceHistoryDetail",
  props: {},
  created() {},
  components: {
    InvHistDetail
  }
};
</script>
<style scoped>
.padding {
  padding-left: 25px;
  padding-right: 20px;
}
</style>
