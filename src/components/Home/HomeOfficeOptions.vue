<template>
  <div style="margin-left:20px !important;">
    <v-breadcrumbs :items="breadcrumbItems" class="align-left" style="color:#1976d2">
       <template v-slot:title="{ item }">
      {{ item.text }}
    </template>
    </v-breadcrumbs>

    <v-row no-gutters class="mb-6" v-if="checkPermissions('/homeOfficeRegistration')">
      <v-col :cols="$vuetify.display.smAndDown?2:1">
        <v-icon color="#00558c" size="50">mdi-account-plus</v-icon>
      </v-col>
      <v-col>
        <h2 class="menuHeaders">Registration Links</h2>
        <v-col>Registration Links Content</v-col>
        <router-link to="/homeOfficeRegistration" class="menuLinks">
          <v-btn color="#319B42" dark class="menuBtn">Registration Links</v-btn>
        </router-link>
      </v-col>
    </v-row>

    <v-row no-gutters class="mb-6" v-if="checkPermissions('/homeOfficePasswordLink')">
      <v-col :cols="$vuetify.display.smAndDown?2:1">
        <v-icon color="#00558c" size="50">mdi-lock-reset</v-icon>
      </v-col>
      <v-col>
        <h2 class="menuHeaders">Password Reset Links</h2>
        <v-col>Manage Password Reset Links</v-col>
        <router-link to="/homeOfficePasswordLink" class="menuLinks">
          <v-btn color="#319B42" dark class="menuBtn">Password Reset Links</v-btn>
        </router-link>
      </v-col>
    </v-row>

  </div>
</template>
<script>
import permissions from "@/permissions.js";
export default {
  name: "HomeOfficeOptions",
  mixins: [permissions],
  data: () => ({
    breadcrumbItems: [
      {
        text: "Home Office",
        disabled: false,
        href: "hoLanding"
      },
      {
        text: "Account Access",
        disabled: true
      }
    ],

  }),
};
</script>
<style scoped>
.v-breadcrumbs {
  margin-left: -100px;
  margin-top: -30px;
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
