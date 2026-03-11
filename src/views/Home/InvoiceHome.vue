<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2" v-if="showBreadCrumbs">
        <template v-slot:title="{ item }">
      {{ item.text }}
    </template>
    </v-breadcrumbs>

    <v-row>
      <v-col v-if="$vuetify.display.mdAndUp"></v-col>
      <v-col :cols="11">
        <v-row no-gutters class="mb-6" v-if="checkPermissions('/reconcile')">
          <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-img :src="payImage" width="48" height="48" contain></v-img>
          </v-col>
          <v-col>
            <h2 class="menuHeaders">Reconcile &amp; Pay Invoices</h2>
            <v-col class="colstyle">View and adjust current invoices, review invoice changes, and pay invoices.</v-col>
            <router-link to="/reconcile" class="menuLinks">
              <v-btn color="#319B42" dark class="menuBtn">Reconcile &amp; Pay</v-btn>
            </router-link>
          </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="checkPermissions('/invoicehistory')">
          <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-img :src="historyImage" width="48" height="48" contain></v-img>
          </v-col>
          <v-col>
            <h2 class="menuHeaders">Invoice History</h2>
            <v-col class="colstyle">View past invoices, invoice statuses, remittance notices, adjustments, due dates and paid dates.</v-col>
            <router-link to="/invoicehistory" class="menuLinks">
              <v-btn color="#319B42" dark class="menuBtn">View History</v-btn>
            </router-link>
          </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="checkPermissions('/Companypaymentinfo')">
          <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-img :src="accountInfoImage" width="48" height="48" contain></v-img>
          </v-col>
          <v-col>
            <h2 class="menuHeaders">Company Info &amp; Payment Settings</h2>
            <v-col class="colstyle">Update company and payment information associated with your account.</v-col>
            <router-link to="/Companypaymentinfo" class="menuLinks">
              <v-btn color="#319B42" dark class="menuBtn">Update Settings</v-btn>
            </router-link>
          </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="checkPermissions('/users')">
          <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-img :src="userroleImage" width="48" height="48" contain></v-img>
          </v-col>
          <v-col>
            <h2 class="menuHeaders">Users &amp; Roles</h2>
            <v-col class="colstyle">Add or update users and assign security roles or deactivate or delete users.</v-col>
            <router-link to="/users" class="menuLinks">
              <v-btn color="#319B42" dark class="menuBtn disabledPointer">Update Users</v-btn>
            </router-link>
          </v-col>
        </v-row>

        <v-row no-gutters class="mb-6" v-if="checkPermissions('/accountsettings')">
          <v-col :cols="$vuetify.display.smAndDown?2:1">
            <v-img :src="lockImage" width="48" height="48" contain></v-img>
          </v-col>
          <v-col>
            <h2 class="menuHeaders">Account Settings</h2>
            <v-col class="colstyle">Manage your password credentials and MFA settings used to access your account.</v-col>
            <router-link to="/accountsettings" class="menuLinks">
              <v-btn color="#319B42" dark class="menuBtn">Update Account</v-btn>
            </router-link>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>
<script setup>
import payImage from '@/assets/pay.png';
import historyImage from '@/assets/history.png';
import accountInfoImage from '@/assets/account-info.png';
import userroleImage from '@/assets/user-roles.png';
import lockImage from '@/assets/lock.png';
</script>
<script>
import Log from "@/log.js";
import permissions from "@/permissions.js";


export default {
  name: "InvoiceHome",
  mixins: [permissions],
  props: { mainColor: String, FranchiseId: String },
  created() {
    try {
      let userType = window.sessionStorage.getItem("type");

      if (userType == "homeoffice") {
        this.showBreadCrumbs = true;
        if (this.$store.state.currentFranchise.franchiseNumber == "") {
          return this.$router.push("hoSearchCompanies?dialog=true");
        }
      } else {
        this.showBreadCrumbs = false;
        if (this.$store.state.currentFranchise.franchiseNumber == "")
          return this.$router.push("/search?dialog=true");
      }
    } catch (e) {
      Log.logError(e, "InvoiceHome.vue created");
    }
  },

  data: () => ({
    showBreadCrumbs: false,
    breadcrumbItems: [
      {
        text: "Home Office",
        disabled: false,
        href: "hoLanding",
      },
      {
        text: "Invoice Home",
        disabled: true,
      },
    ],
  }),

  methods: {},
};
</script>
<style scoped>
.v-breadcrumbs {
  margin-top: -10px;
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
.colstyle{
  padding: 0;
  margin:0;
  color:#474c55;
}
</style>
