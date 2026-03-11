<template>
  <div>
    <v-row justify="center" align-content="center" align="center"   wrap>
      <v-col cols="10" class="padding">
        <ContactUs />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ContactUs from "@/components/Info/ContactUs.vue";
export default {
  components: {
    ContactUs
  }
};
</script>

<style scoped>
.padding {
  margin-left: 50px;
  margin-right: 25px;
}
</style>
