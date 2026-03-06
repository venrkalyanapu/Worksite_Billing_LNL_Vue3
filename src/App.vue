<template>
  <v-app>
    <v-navigation-drawer
      location ="right"
      v-model="showDrawer"
      theme="dark"
      :color="mainColor"
      temporary     
    >
      <v-list-item link v-for="link in links" :key="link.name" :to="link.route">
        <!-- <v-list-item-content @click.stop="$router.push(link.route)"> -->
          <v-list-item-title class="navDrawer cursor-pointer" @click.stop="$router.push(link.route)">
            <v-icon v-if="link.icon">{{ link.icon }}</v-icon>
            &nbsp;
            {{ link.name }}
          </v-list-item-title>
        <!-- </v-list-item-content> -->
      </v-list-item>
      <v-list-item v-if="loggedIn" link>
        <!-- <v-list-item-content @click.stop="logOut"> -->
          <v-list-item-title class="navDrawer" @click.stop="logOut">
            <v-icon>mdi-account</v-icon>&nbsp; Log Out
          </v-list-item-title>
        <!-- </v-list-item-content> -->
      </v-list-item>
    </v-navigation-drawer>
    <v-container fluid style="margin: 0; padding: 0">
      <v-row>
        <v-app-bar
          app
          :color="mainColor"
          theme="dark"
          class="$vuetify.display.mdAndUp?'padSides':''"
          height="90"
          no-gutters
        >
          <v-col
            lg="3"
            md="3"
            sm="11"
            xl="2"
            xs="11"
            style="padding-left: 0; margin-left: 0"
            v-if="$vuetify.display.mdAndUp"
          >
            <v-img
              height="80"
              width="343"
              :src="imagewhite"
              @click="routeHome"
              class="logo"
              contain
            ></v-img>
          </v-col>
          <v-col
            :cols="10"
            style="padding-left: 0; margin-left: 0"
            v-if="$vuetify.display.smAndDown"
          >
            <v-img
              height="80"
              width="343"
              :src="imagewhite" 
              @click="routeHome"
              class="logo"
              contain
            ></v-img>
          </v-col>

          <v-divider
            inset
            vertical
            class="mx-1"
            color="white"
            v-if="$vuetify.display.mdAndUp"
          ></v-divider>

          <v-col v-if="$vuetify.display.xl" xl="5">
            <span class="Title">Online Billing System</span>
          </v-col>
          <v-col v-if="$vuetify.display.lg" lg="3">
            <span class="TitleLg">Online Billing System</span>
          </v-col>
          <v-col v-if="$vuetify.display.md" :cols="5">
            <span class="Title">Online Billing System</span>
          </v-col>
          <v-col v-if="$vuetify.display.lgAndUp" lg="3" xl="2" md="2">
            <v-row align="start" align-content="start" justify="start">
              <span v-if="displayName != '' && displayName != null"
                >Welcome {{ displayName }}</span
              >
            </v-row>
          </v-col>
          <v-col lg="2" md="3" xl="2" v-if="$vuetify.display.mdAndUp">
            <v-row align="end" align-content="end" justify="end">
              <span v-if="loggedIn" class="routerLink" @click="logOut"
                >Log Out</span
              >
              <!-- <router-link v-if="loggedIn" to="/logout" class="routerLink">Log Out</router-link> -->
              <router-link
                v-if="showLoginLink()"
                to="/"
                ref="loginLink"
                class="routerLink"
                >Log In</router-link
              >
              <span
                v-if="
                  ($route.path != '/login' || loggedIn) && $route.path != '/faq'
                "
                >&nbsp;|&nbsp;</span
              >
            </v-row>
          </v-col>
          <v-col>
            <v-app-bar-nav-icon
              @click.stop="showDrawer = !showDrawer"
            ></v-app-bar-nav-icon>
          </v-col>
        </v-app-bar>
      </v-row>
      <v-row>
        <v-img
  :src="getBackgroundImg()"
  aspectRatio="2/3"
  cover
  height="200"
  minWidth="100%"
>
  <template #default>
    <div v-if="header">
      <span class="my-span">
        <span class="headerFont">{{ header }}</span>
      </span>
      <hr class="my-hr" />
      <span class="decorative"></span>
    </div>
  </template>
</v-img>
      </v-row>

      <!-- <v-main style="margin: 0; padding: 0"> -->
        <v-row class="padBottom">
          <template v-if="layoutNumber != 4">
            <v-col :cols="9" md="9" lg="9" xl="9"  xs="12">
              <router-view
                :class="
                  $vuetify.display.mdAndUp ? 'routerView' : 'routerViewSm'
                "
                :routeName="$route.name"
              ></router-view>
            </v-col>
            <v-col :cols="3" v-if="$vuetify.display.mdAndUp">
              <v-row v-if="layoutNumber === 1 || layoutNumber === 2">
                <v-col>
                  <sidebar class="padTop"></sidebar>
                </v-col>
              </v-row>
              <v-row v-if="(layoutNumber === 1 || layoutNumber === 3) && $route.path == '/login' && (sessionType == 'ext' || sessionType == '')" style="margin-left: -48px;">
                <v-icon color="#319B42" large style="align-items: baseline; padding-top: 20px;">mdi-clipboard-outline</v-icon>
                <v-col>
                  <register-side-bar></register-side-bar>
                </v-col>
              </v-row>
              <v-row v-if="layoutNumber === 1 || layoutNumber === 3">
                <v-col style="padding-bottom:0;">
                  <help-side-bar
                    :class="layoutNumber == 3 ? 'padTop' : ''"
                  ></help-side-bar>
                </v-col>
              </v-row>
            </v-col>
          </template>
          <template v-else>
            <v-col :cols="12">
              <router-view style="position: unset !important"
                :class="
                  $vuetify.display.mdAndUp ? 'routerView' : 'routerViewSm'
                "
                :routeName="$route.name"
              ></router-view>
            </v-col>
          </template>
        </v-row>
      <!-- </v-main> -->
      <v-footer
        height="auto"
        :color="mainColor"
        fixed
        v-if="$vuetify.display.mdAndUp"
      >
        <v-col>
          <span class="footerText">
            For assistance,
            <router-link to="/contactus" class="footerLink"
              >Contact Us</router-link
            >&nbsp;or call
            <span class="footerLink">{{ contactPhoneNumber }}</span>
          </span>
        </v-col>
        <v-col>
          <v-row justify-end>
            <span class="footerText">&copy;{{ currentYear }} Globe Life {{ currentVersion }}</span>
          </v-row>
        </v-col>
      </v-footer>
      <v-footer v-else height="auto" :color="mainColor" fixed>
        <v-row justify="center">
          <span>
            <v-row justify="center" column>
              <span>
                <router-link to="/contactus" class="footerLink"
                  >Contact Us&nbsp;|&nbsp;</router-link
                >
                <span class="footerLink">{{ contactPhoneNumber }}</span>
              </span>

              <span class="footerText">&copy;{{ currentYear }} Globe Life {{ currentVersion }}</span>
            </v-row>
          </span>
        </v-row>
      </v-footer>
    </v-container>

    <div v-if="logOutDialog">
      <v-dialog v-model="logOutDialog" persistent width="350" id="logOutDialog">
        <v-card>
          <v-card-title class="headline logOutDialogHeadline">
            <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon
            >&nbsp;Log Out
          </v-card-title>

          <v-row align="center" justify="center">
            <hr width="90%" />
          </v-row>

          <v-card-text>Are you sure you want to log out?</v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              variant="flat"
              class="menuBtn"
              @click="
                logOutDialog = false;
                $router.push('/logout');
              "
              >Yes</v-btn
            >
            <v-btn
              color="#319B42"
              variant="flat"
              class="menuBtn"
              @click="logOutDialog = false"
              >No</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-dialog
      v-model="activeCheckDialog"
      persistent
      width="350"
      ref="activeCheckDialog"
    >
      <v-card>
        <v-card-title class="headline logOutDialogHeadline">
          <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon
          >&nbsp;Are you still there?
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" />
        </v-row>

        <v-card-text>
          Your session is about to end. If you are still working, please click
          OK to continue.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            variant="flat"
            class="menuBtn"
            @click="
              activeCheckDialog = false;
              refresh();
            "
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="showAppInfo"
      :color="appInfo.type"
      :timeout="3000"
      :buttom="true"
      :right="true"
    >
      {{ appInfo ? appInfo.message : "" }}
      <!-- <v-btn dark text @click="showAppInfo = false">Close</v-btn> -->
    </v-snackbar>

    <v-dialog v-model="showAppError" persistent width="350">
      <v-card>
        <v-card-title class="headline">
          <v-icon :color="$store.state.mainColor" large>mdi-close</v-icon
          >&nbsp;Error
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" />
        </v-row>

        <v-card-text>{{
          appError
            ? appError.message
            : "There was an error, please contact your administrator."
        }}</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            variant="flat"
            class="menuBtn"
            @click="showAppError = false"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
<script setup>
  import imgheaderbg2 from "@/assets/header-bg-2.jpg";
  import imagewhite from "@/assets/glLnlSmWhite.png"
</script>
<script>
import {store} from "@/store";
import sidebar from "@/components/SideBar/SideBar.vue";
import helpSideBar from "@/components/SideBar/SideBarHelp.vue";
import registerSideBar from "@/components/SideBar/SideBarRegister.vue";
import encryption from "@/encryption.js";
import Log from "@/log.js";
import emitter from "@/event-bus.js";
import permissions from "@/permissions.js";
import { HTTP_SA } from "@/HTTP-common.js";

export default {
  mixins: [permissions],
  mounted() {
    this.refresh();

    emitter.on("cancelTokenRefresh", function () {
      clearInterval(this.tokTimeout);
    });

    emitter.on("loggedOutDialogClosed", function () {
      this.logOutDialog = false;
    });

    emitter.on("setTokenTimer",  (token) => {
      if (token != null) {
        clearInterval(this.tokTimeout);

        this.tokTimeout = setInterval(() => {
          // console.log("About to refresh token.");

          HTTP_SA.get("Authentication/RefreshToken")
            .then((response) => {
              // console.log(JSON.stringify(response.data));

              if (response.status == 200) {
                // console.log("Updating JWT in store.");
                store.commit("setJWT", JSON.stringify(response.data));
              }
            })
            .catch((e) => {
              Log.logError(e, "App.vue setTokenTime RefreshToken");
            });
        }, 60 * 60 * 1000); // 1 hour
      }
    });

    // eventBus.$on("setTokenTimer", function (token) {
    //   if (token != null) {
    //     try {
    //       let exp = JSON.parse(atob(token.split(".")[1])).exp;
    //       let expPeriod = new Date(exp * 1000).getTime() - new Date().getTime();
    //       //let expPeriod = new Date().getTime() - new Date(exp * 1000).getTime();

    //       expPeriod = expPeriod / 1000 / 60;

    //       console.log("Expires in: " + expPeriod.toString() + " minutes.");

    //       clearTimeout(this.tokTimeout);

    //       if (expPeriod > 0) {
    //         this.tokTimeout = setTimeout(() => {
    //           console.log("About to call RefreshToken");
    //           console.log(new Date().toString());

    //           HTTP_SA.get("Authentication/RefreshToken")
    //             .then((response) => {
    //               console.log(JSON.stringify(response.data));

    //               if (response.status == 200) {
    //                 store.commit("setJWT", JSON.stringify(response.data));
    //                 eventBus.$emit(
    //                   "setTokenTimer",
    //                   JSON.stringify(response.data)
    //                 );
    //               }
    //             })
    //             .catch((e) => {
    //               Log.logError(e, "App.vue setTokenTime RefreshToken");
    //             });
    //         }, (expPeriod - 30) * 60 * 1000); // 230 minutes before expiration
    //       }
    //     } catch (e) {
    //       Log.logError(e, "App.vue setTokenTime");
    //     }
    //   }
    // });
  },
  components: { sidebar, registerSideBar, helpSideBar },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleUnload);
    document.removeEventListener("click", this.refresh);
    emitter.off("loggedOutDialogClosed");
    emitter.off("setTokenTimer");
    emitter.off("cancelTokenRefresh");
  },
  created() {
    this.refresh();

    window.addEventListener("beforeunload", this.handleUnload);
    document.addEventListener("click", this.refresh);

    emitter.on("delayedLoggedUserInfo", (userInfo) => {
      if (userInfo != null) {
        this.delayedLoggedFlag = true;
      }
    });

    emitter.on("appInfo", (appInfo) => {
      this.showAppInfo = true;
      this.appInfo = appInfo;
    });

    emitter.on("appError", (appError) => {
      this.showAppError = true;
      this.appError = appError;
    });

    try {
      store.commit("setMainColor", "#00558C");

      // let baseUrl = window.location.href;

      store.commit(
        "setLoginType",
        this.$route.query.login ? this.$route.query.login : "ext"
      );

      // if (baseUrl.toLowerCase().indexOf("localhost") >= 0) {
      //   store.commit(
      //     "setLoginType",
      //     this.$route.query.login ? this.$route.query.login : "agency"
      //   );
      // } else {
      //   if (baseUrl.toLowerCase().indexOf("-agency") >= 0)
      //     store.commit("setLoginType", "agency");
      //   else if (baseUrl.toLowerCase().indexof("-ho") >= 0)
      //     store.commit("setLoginType", "homeoffice");
      //   else store.commit("setLoginType", "ext");
      // }

      let currentUser = {};

      currentUser.user = window.sessionStorage.getItem("user");
      currentUser.type = window.sessionStorage.getItem("type");
      currentUser.name = window.sessionStorage.getItem("name");

      this.$store.commit("setCurrentUser", currentUser);

      let tok = window.sessionStorage.getItem("tok");
      if (tok) {
        this.$store.commit("setJWT", tok);
      }

      if (
        currentUser.name != null &&
        currentUser.name != "" &&
        currentUser.name != undefined &&
        currentUser.name != "undefined"
      )
        this.$store.commit("setDisplayName", currentUser.name);
      else this.$store.commit("setDisplayName", currentUser.user);

      let franchise = window.sessionStorage.getItem("currentFranchise");

      if (franchise != null && franchise != "") {
        this.$store.commit("setCurrentFranchise", JSON.parse(franchise));
      }

      let switchCompanies = window.sessionStorage.getItem("switchCompanies");

      if (switchCompanies != null) {
        this.$store.commit("setSwitchCompanies", switchCompanies);
      }
    } catch (e) {
      Log.logError(e, "App.vue created");
    }
  },
  computed: {
    displayName() {
      try {
        return this.$store.state.displayName;
      } catch (e) {
        Log.logError(e, "App.vue displayName");
        return "";
      }
    },
    sessionType() {
      let type = this.$route.query.login;
      if (!type) {
        type = '';
      }
      return type;
    },
    header() {
      try {
        return this.$route.name;
      } catch (e) {
        Log.logError(e, "App.vue header");
        return "";
      }
    },
    loginStyle() {
      if (this.$route.path == "/login") {
        // return "align-self:flex-end;";
        return "align-self: flex-end !important;";
      }
      return "";
    },
    links() {
      let linkArray = [
        {
          name: "Reconcile & Pay",
          route: "/reconcile",
          icon: "mdi-currency-usd",
          requireCompanySelected: true,
        },
        {
          name: "Invoice Home",
          route: "/invoicehome",
          icon: "home",
          requireCompanySelected: true,
        },
        {
          name: "Invoice History",
          route: "/invoicehistory",
          icon: "mdi-history",
          requireCompanySelected: true,
        },
        {
          name: "Users & Roles",
          route: "/users",
          icon: "mdi-account-group",
          requireCompanySelected: true,
        },
        {
          name: "Payment Settings",
          route: "/Companypaymentinfo", //"/company",
          icon: "mdi-file-cog-outline",
          requireCompanySelected: true,
        },
        {
          name: "Account Settings",
          route: "/accountsettings",
          icon: "mdi-file-cog-outline",
          requireCompanySelected: true,
        },
      ];

      let type = window.sessionStorage.getItem("type");
      let isCompanySelected =
        this.$store.state.currentFranchise.franchiseNumber != "";

      if (type != "homeoffice" && this.$store.state.switchCompanies) {
        linkArray.push({
          name: "Search Companies",
          route: "/search",
          icon: "mdi-magnify",
        });
      }

      if (type == "homeoffice") {
        linkArray = [];
        linkArray.push({
          name: "Home Office",
          route: "/holanding",
          icon: "mdi-home-city",
        });
        if (this.checkPermissions("/hoSearchCompanies")) {
          linkArray.push({
            name: "Search Companies",
            route: "/hoSearchCompanies",
            icon: "mdi-magnify",
          });
        }
        if (this.checkPermissions("/hoSearchCompanies") && isCompanySelected) {
          linkArray.push({
            name: "Invoice Home",
            route: "/invoicehome",
            icon: "mdi-home",
          });
        }
        if (this.checkPermissions("/homeOffice")) {
          linkArray.push({
            name: "Account Access",
            route: "/homeOffice",
            icon: "mdi-account-cog",
          });
        }
        if (this.checkPermissions("/HomeOfficeInvoiceTool")) {
          linkArray.push({
            name: "Account Maintenance",
            route: "/hoSystemTools",
            icon: "mdi-hammer-wrench",
          });
        }
      }

      if (type != "homeoffice" && !this.loggedIn) {
        linkArray.push({
          name: "Register",
          route: "/selfregister",
          icon: "mdi-clipboard-outline",
        });
      }

      linkArray.push({
        name: "Training Video",
        route: "/training",
        icon: "mdi-human-male-board",
      });
      linkArray.push({
        name: "Contact Us",
        route: "/contactus",
        icon: "mdi-email",
      });
      linkArray.push({
        name: "FAQ",
        route: "/faq",
        icon: "mdi-help-circle-outline",
      });

      let ret = [];

      try {
        for (let link of linkArray) {
          if (link.route.toLowerCase() != this.$route.path.toLowerCase()) {
            let encryptedRole = window.sessionStorage.getItem("role");
            let role = encryption.decrypt(encryptedRole);

            let roles = [];
            let type = window.sessionStorage.getItem("type");
            if (type == "homeoffice" || type == "ext") {
              roles = role.split(",");
            } else {
              roles.push(role);
            }

            for (let route of this.$router.options.routes) {
              if (route.path.toLowerCase() == link.route.toLowerCase()) {
                let authorize = null;

                if (route.meta != null) {
                  authorize = route.meta.authorize;
                }

                if (authorize == null || authorize.length == 0) {
                  if (!link.requireCompanySelected || isCompanySelected) {
                    ret.push(link);
                  }
                } else {
                  for (let role of roles) {
                    if (role && authorize.includes(role)) {
                      if (!link.requireCompanySelected || isCompanySelected) {
                        ret.push(link);
                      }
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        if (!this.loggedIn && this.$route.path.toLowerCase() != "/login")
          ret.push({ name: "Log In", route: "/", icon: "mdi-account" });
      } catch (e) {
        Log.logError(e, "App.vue links");
      }

      return ret;
    },
    loggedIn() {
      try {
        if (this.delayedLoggedFlag) {
          return true;
        }
        return (
          this.$store.state.currentUser.user != "" &&
          window.sessionStorage.getItem("user") != null &&
          window.sessionStorage.getItem("user") != ""
        );
      } catch (e) {
        Log.logError(e, "App.vue loggedIn");
        return false;
      }
    },

    layoutNumber() {
      // 1: 2 columns with company details and need help
      // 2: 2 columns with company details only
      // 3: 2 columns with need help only (default)
      // 4: 1 column, individual router vue will control all display

      switch (this.$route.path.toLowerCase()) {
        case "/invoicehome":
        case "/invoicehistory":
        case "/invoicehistorydetail":
        case "/companypaymentinfo":
        case "/companyinfo":
        case "/paymentinfo":
        case "/users":
          return 1;

        case "/reconcile":
          return 4;

        case "/search":
        case "/login":
        case "/faq":
        case "/contactus":
        case "/holanding":
        case "/training":
        case "/promos":
          return 3;
      }

      return 3;
    },
  },
  data: function () {
    return {
      delayedLoggedFlag: false,
      showAppInfo: false,
      appInfo: { message: null },
      showAppError: false,
      appError: { message: null },
      timeout: null,
      secondaryTimeout: null,
      logOutDialog: false,
      activeCheckDialog: false,
      showDrawer: false,
      mainColor: "#00558C",
      subHeaderColor: "#90CAF9",
      contactPhoneNumber: "1-888-488-0134",
      currentYear : 2023,
      currentVersion : "V3.4"
    };
  },
  methods: {
    handleUnload() {
      //either navigate to other site or reload page will trigger "beforeunload" event
      //we save last here timestamp
      var lastHereTick = new Date().getTime(); //epoch
      window.sessionStorage.setItem("last_here_tick", lastHereTick);
    },
    refresh() {
      clearTimeout(this.timeout);
      clearTimeout(this.secondaryTimeout);

      let session = window.sessionStorage;

      this.timeout = setTimeout(() => {
        if (session != undefined && session.getItem("user") != undefined) {
          let user = session.getItem("user");
          if (user != null && user != "") {
            this.activeCheckDialog = true;
            this.secondaryTimeout = setTimeout(() => {
              if (this.activeCheckDialog) {
                if (this.$refs.activeCheckDialog) {
                  this.$refs.activeCheckDialog.removeOverlay();
                }
                this.activeCheckDialog = false;

                this.$nextTick(function () {
                  this.$router.push("/logout?timedOut=true");
                });
              }
            }, 1 * 30 * 1000); // 30 seconds
          }
        }
      }, 20 * 60 * 1000); // 20 minutes
    },

    getBackgroundImg() {
      switch (this.$route.path) {
        case "/invoicehome":
        case "/invoicehistory":
        case "/invoicehistorydetail":
          return imgheaderbg2;
      }

      return imgheaderbg2;
    },
    logOut() {
      this.logOutDialog = true;
    },
    routeHome() {
      let loginType = window.sessionStorage.getItem("type");
      if (loginType == "agency" || loginType == "ext") {
        return this.pushRoute("/search");
      }

      if (loginType == "homeoffice" || loginType == "sso") {
        return this.pushRoute("/holanding");
      }

      if (this.$route.path == "/login") return;
      return this.$router.push("/login");
    },
    pushRoute(path) {
      if (this.$route.path == path) return;
      this.$router.push(path);
      return;
    },
    showLoginLink() {
      var showLink =
        !this.loggedIn &&
        this.$route.path != "/login" &&
        this.$route.path != "/register";
      return showLink;
    },
  },
};
</script>

<style></style>
