<template>
  <div>
    <agencyLogin
      v-if="
        $store.state.loginType == 'agency' || $route.query.login == 'agency'
      "
    />
    <HOLogin
      v-if="
        $store.state.loginType == 'homeoffice' ||
        $route.query.login == 'homeoffice'
      "
    />
    <HOAuthentication
      v-if="$store.state.loginType == 'sso' || $route.query.login == 'sso'"
    />
    <ExternalLogin
      v-if="$store.state.loginType == 'ext' || $route.query.login == 'ext'"
    />

    <div v-if="loggedOutDialog">
      <v-dialog
        v-model="loggedOutDialog"
        persistent
        width="350"
        ref="loggedOutDialog"
        id="loggedOutDialog"
      >
        <v-card>
          <v-card-title class="headline logOutDialogHeadline">
            <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon
            >&nbsp;Logged Out
          </v-card-title>

          <v-layout align-center justify-center>
            <hr width="90%" />
          </v-layout>

          <v-card-text class="alerttext">
            You have been automatically logged out due to inactivity. Please log
            in again to continue.
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click.stop="closeLoggedOutDialog()"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="forbiddenDialog == true">
      <v-dialog
        v-model="forbiddenDialog"
        persistent
        width="350"
        ref="forbiddenDialog"
        id="forbiddenDialog"
      >
        <v-card>
          <v-card-title class="headline logOutDialogHeadline">
            <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon
            >&nbsp;Authentication Required
          </v-card-title>

          <v-layout align-center justify-center>
            <hr width="90%" />
          </v-layout>

          <v-card-text class="alerttext"> Please re-log in to continue. </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click.stop="closeForbiddenDialog()"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import agencyLogin from "@/components/AccountAdmin/AgencyLogIn.vue";
import HOLogin from "@/components/AccountAdmin/HOLogin.vue";
import ExternalLogin from "@/components/AccountAdmin/ExternalLogin.vue";
import HOAuthentication from "@/components/AccountAdmin/HOAuthentication.vue";
import encryption from "@/encryption.js";
import emitter from "@/event-bus.js";
import Log from "@/log.js";
import permissions from "@/permissions.js";

import { HTTP_Notify } from "@/HTTP-common.js";

export default {
  mixins: [permissions],
  created() {
    HTTP_Notify.get("/Notification/GetAllNotificationTypes").then(
      (response) => {
        if (response.status != 200) {
          Log.logError(
            response.statusText,
            "Login.vue /Notification/GetAllNotificationTypes"
          );
          this.errDialog = true;
        } else {
          try {
            for (let notif of response.data.notificationTypeDetails) {
              this.$store.commit("addNotificationType", notif);
            }
          } catch (e) {
            Log.logError(e, "Login.vue /Notification/GetAllNotificationTypes");
          }
        }
      }
    );
  },
  methods: {
    closeLoggedOutDialog() {
      this.$refs.loggedOutDialog.removeOverlay;
      emitter.emit("loggedOutDialogClosed");

      let elements = document.getElementsByClassName("v-overlay--active");

      for (let el of elements) {
        el.style.display = "none";
      }

      this.loggedOutDialog = false;
    },
    closeForbiddenDialog() {
      this.$refs.forbiddenDialog.removeOverlay;

      let elements = document.getElementsByClassName("v-overlay--active");

      for (let el of elements) {
        el.style.display = "none";
      }

      this.forbiddenDialog = false;
    },
  },
  mounted() {
    if (this.$route.query.timedOut == "true") {
      this.loggedOutDialog = true;
    }

    if (this.$route.query.returnUrl) {
      this.returnUrl = this.$route.query.returnUrl;
    }

    if (this.$route.query && this.$route.query.status == "401") {
      this.forbiddenDialog = true;
    }

    emitter.on(
      "login",
      function (curUser) {
        try {
          let role = curUser.role;
          curUser.role = "";

          this.$store.commit("setCurrentUser", curUser);
          this.$store.state.currentFranchise.franchiseNumber = "";

          window.sessionStorage.setItem(
            "user",
            curUser.user ? curUser.user.trim() : curUser.user
          );
          window.sessionStorage.setItem("type", curUser.type);
          window.sessionStorage.setItem("name", curUser.name);

          let encryptedRole = encryption.encrypt(role);
          window.sessionStorage.setItem("role", encryptedRole);
          window.sessionStorage.setItem("phone", curUser.phone);

          if (
            curUser.name != null &&
            curUser.name != "" &&
            curUser.name != undefined
          )
            this.$store.commit("setDisplayName", curUser.name);
          else this.$store.commit("setDisplayName", curUser.user);

          //redirect returnUrl
          if (this.returnUrl.length > 0) {
            this.$router.push(this.returnUrl);
            return;
          }

          //redirect homeoffice user
          if (
            this.$store.state.loginType == "homeoffice" ||
            this.$store.state.loginType == "sso" ||
            this.$route.query.login == "homeoffice" ||
            this.$route.query.login == "sso" ||
            this.$store.state.loginType == "sso"
          ) {
            this.$router.push("/holanding");
            return;
          }

          //if (this.$store.state.loginType == "agency")
          this.$router.push("/search");
          // else
          // this.$router.push("/invoicehome");
        } catch (e) {
          Log.logError(e, "LogIn.vue eventBus.$on login");
        }
      }.bind(this)
    );

    try {
      if (
        window.sessionStorage.getItem("user") != null &&
        window.sessionStorage.getItem("user") != ""
      ) {
        let curUser = {};

        curUser.user = window.sessionStorage.getItem("user");
        curUser.type = window.sessionStorage.getItem("type");
        curUser.name = window.sessionStorage.getItem("name");

        this.$store.commit("setCurrentUser", curUser);

        this.$router.push("/invoicehome");
      }
    } catch (e) {
      Log.logError(e, "LogIn.vue mounted");
    }
  },
  beforeDestroy() {
    emitter.off("login");
  },
  data() {
    return {
      returnUrl: "",
      loggedOutDialog: false,
      forbiddenDialog: false,
    };
  },
  components: {
    agencyLogin,
    HOLogin,
    HOAuthentication,
    ExternalLogin,
  },
};
</script>

<style scoped></style>
