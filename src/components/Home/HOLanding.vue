<template>
  <div>
    <v-row>
      <v-col></v-col>
      <v-col :cols="11">
        <v-row no-gutters class="mb-6" v-if="showHOSearchCompanies">
        <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-icon color="#00558c" size="50">mdi-magnify</v-icon>
        </v-col>
        <v-col>
            <h2 class="menuHeaders">Search Companies</h2>
            <v-col>Select single account for Invoice and Account Management</v-col>
            <router-link to="/hoSearchCompanies" class="menuLinks">
            <v-btn color="#319B42" dark class="menuBtn">Search Companies</v-btn>
            </router-link>
        </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="showInvoiceHome">
        <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-img :src="payimage" width="48" height="48" contain></v-img>
        </v-col>
        <v-col>
            <h2 class="menuHeaders">Invoice Home</h2>
            <v-col>Reconcile & Pay, Invoice History, Account Information, Account Users & Roles</v-col>
            <router-link to="/InvoiceHome" class="menuLinks">
            <v-btn color="#319B42" dark class="menuBtn">Invoice Home</v-btn>
            </router-link>
        </v-col>
        </v-row> 

        <v-row no-gutters class="mb-6" v-if="showHORegistration">
        <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-icon color="#00558c" size="50">mdi-account-cog</v-icon>
        </v-col>
        <v-col>
            <h2 class="menuHeaders">Account Access</h2>
            <v-col>Add/Update Registration & Password Reset Links</v-col>
            <router-link to="/homeOffice" class="menuLinks">
            <v-btn color="#319B42" dark class="menuBtn">Account Access</v-btn>
            </router-link>
        </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="showHOAccountMaintenance">
        <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-icon color="#00558c" size="50">mdi-hammer-wrench</v-icon>
        </v-col>
        <v-col>
            <h2 class="menuHeaders">Account Maintenance</h2>
            <v-col>Update/Delete Invoices, Update Settings</v-col>
            <router-link to="/hoSystemTools" class="menuLinks">
            <v-btn color="#319B42" dark class="menuBtn">Account Maintenance</v-btn>
            </router-link>
        </v-col>
        </v-row>       

      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import payimage from '@/assets/pay.png';</script>
<script>

import permissions from "@/permissions.js";
export default {
  name: "HOLanding",
  mixins: [permissions],
  data: () => ({
      showHOSearchCompanies : false,
      showInvoiceHome : false,
      showHORegistration : false,
      showHOAccountMaintenance : false,
  }),
  mounted(){
      this.showHOSearchCompanies = this.checkPermissions("/hoSearchCompanies");
      this.showHORegistration = this.checkPermissions("/homeOffice");
      this.showHOAccountMaintenance = this.checkPermissions("/HomeOfficeInvoiceTool");

      let isCompanySelected = this.$store.state.currentFranchise.franchiseNumber != "";
      if (isCompanySelected) {
        this.showInvoiceHome = true;
      } else {
        this.showInvoiceHome = false;
      }
  },

};
</script>
<style scoped>
.menuHeaders {
  color: #00558c;
}
.menu {
  margin-left: 100px;
}
.menuBtn {
  margin-top: 10px;
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
}
.disabledPointer {
  cursor: default;
}
.menuLinks {
  text-decoration: none !important;
  color: inherit;
}
.wrap {
  word-wrap: break-word !important;
}
</style>
