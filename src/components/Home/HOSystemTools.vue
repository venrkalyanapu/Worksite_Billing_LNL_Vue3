<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2"></v-breadcrumbs>

    <v-row>
      <v-col v-if="$vuetify.display.mdAndUp"></v-col>
      <v-col :cols="11">
        <v-row no-gutters class="mb-6" v-if="showInvoiceTool">
        <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-icon color="#00558c" size="50">mdi-file-document-edit</v-icon>
        </v-col>
        <v-col>
            <h2 class="menuHeaders">Invoice Maintenance</h2>
            <v-col>Update Invoice Payments Data, Delete Invoices</v-col>
            <router-link to="/HomeOfficeInvoiceTool" class="menuLinks">
            <v-btn color="#319B42" dark class="menuBtn">Invoice Maintenance</v-btn>
            </router-link>
        </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="showRecPayLock">
        <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-icon color="#00558c" size="50">mdi-lock</v-icon>
        </v-col>
        <v-col>
            <h2 class="menuHeaders">Reconcile &amp; Pay Lock Settings</h2>
            <v-col>Unlock and Reset Reconcile &amp; Pay Invoices</v-col>
             <v-btn to="/recpay" color="#319B42" class="menuBtn mt-2">
              Reconcile &amp; Pay Lock Settings
            </v-btn>
        </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="showConfiguration">
        <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-icon color="#00558c" size="50">mdi-settings</v-icon>
        </v-col>
        <v-col>
            <h2 class="menuHeaders">Settings</h2>
            <v-col>System Settings</v-col>
            <router-link to="/homeOfficeConfiguration" class="menuLinks">
            <v-btn color="#319B42" dark class="menuBtn">Settings</v-btn>
            </router-link>
        </v-col>
        </v-row>

      </v-col>
    </v-row>
  </div>
</template>
<script>
import permissions from "@/permissions.js";
export default {
  name: "HOSystemTools",
  mixins: [permissions],
  data: () => ({
      breadcrumbItems: [
        {
          title: "Home Office",
          disabled: false,
          to: "hoLanding"
        },
        {
          title: "Account Maintenance",
          disabled: true
        }
      ],    
      showConfiguration : true,
      showInvoiceTool : true,
      showRecPayLock : true,
  }),

};
</script>
<style scoped>
.v-breadcrumbs {
  margin-left: -10px;
  margin-top: -20px;
}

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

