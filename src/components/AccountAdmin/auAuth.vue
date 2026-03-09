<template>
  <div>
    <div>
      <v-layout justify-center align-content-center>
        <v-flex xs10>
          <v-card :class="waiting ? 'waitingOverlay mx-auto' : 'mx-auto'">

            <br />
            <br />
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-layout justify-center align-content-center row>

                <v-flex xs9>
                  <v-card-text align="center">
                    This system is only for authorized Globe Life and its
                    affiliates (hereinafter referred to as "The Company")
                    employees, contractors and business partners. Users should
                    be aware that The Company reserves the right to monitor
                    usage of this system. By using this system, you are
                    consenting to The Company monitoring your activity on the
                    system and conducting reasonable investigations into any
                    possible misuse of the system. Misuse of this system may
                    lead to disciplinary or legal action.
                  </v-card-text>
                </v-flex>
              </v-layout>
            </v-form>
            <br />
            <br />
          </v-card>
        </v-flex>
      </v-layout>

      <v-dialog
        v-model="failedDialog"
        persistent
        width="350"
        :content-class="$vuetify.breakpoint.mdAndUp ? 'centerInGrid' : ''"
      >
        <v-card>
          <v-card-title class="headline dialogHeadline">
            <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon
            >&nbsp;Authentication Failed
          </v-card-title>
          <v-layout align="center" justify="center">
            <hr width="90%" />
          </v-layout>
          <br />
          <v-card-text>{{ failedText }}</v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn topMargin"
              @click="failedDialog = false"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- <v-dialog v-model="waiting" persistent width="425">
      <v-card width="100%">
        <v-container>
          <v-row no-gutters>
            <v-col cols="3">
              <v-layout justify-center align-center align-content-center>
                <v-progress-circular indeterminate color="#319B42" :size="70" width="10"></v-progress-circular>
              </v-layout>
            </v-col>
            <v-col>
              <v-card-title class="headline dialogHeadline">
                <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon>&nbsp;Please Wait
              </v-card-title>
              <v-layout align-center justify-center>
                <hr width="90%" />
              </v-layout>

              <v-card-text>{{ statusText }}</v-card-text>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      </v-dialog>-->

      <v-dialog
        v-model="unsupportedDialog"
        persistent
        width="500"
        :content-class="$vuetify.breakpoint.mdAndUp ? 'centerInGrid' : ''"
      >
        <v-card>
          <v-card-title class="headline dialogHeadline">
            <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon
            >&nbsp;Unsupported Agency Role
          </v-card-title>
          <v-layout align-center justify-center>
            <hr width="90%" />
          </v-layout>
          <br />
          <v-card-text v-if="supportedRoles.length > 0">
            Your following agency role(s) are not supported by this application:
            <li v-for="ur in unsupportedRoles" :key="ur">{{ ur }}</li>
            <br />Franchises will be displayed for your following agency role(s)
            only:
            <li v-for="r in supportedRoles" :key="r">{{ r }}</li>
          </v-card-text>
          <v-card-text v-else>
            Your agency role(s) are not supported by this application:
            <li v-for="ur in unsupportedRoles" :key="ur">{{ ur }}</li>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn topMargin"
              @click="closeUnsupportedDialog()"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div>
      <span
        :class="
          $vuetify.breakpoint.smAndDown
            ? 'waitCircleLoginSm'
            : 'waitCircleLogin'
        "
        :style="
          $vuetify.breakpoint.smAndDown
            ? 'width:100%; color: #319B42;'
            : 'width: 25%; color: #319B42;'
        "
      >
        <v-layout justify-center align-content-center align-center column>
          <v-progress-circular
            v-if="waiting"
            indeterminate
            color="#319B42"
            :size="70"
            width="10"
          ></v-progress-circular>
          <br />
          <span class="status" v-if="waiting">{{ statusText }}</span>
        </v-layout>
      </span>
    </div>
  </div>
</template>

<script>
import { Role } from "@/role.js";
import eventBus from "@/event-bus.js";
import { HTTP } from "@/HTTP-common.js";
//import { HTTP_SA } from "@/HTTP-common.js";
import { PasswordResetRealm } from "@/HTTP-common.js";
import encryption from "@/encryption.js";
import dataService from '@/services/dataService';
import Log from "@/log.js";
//import secureAuthService from "@/services/secureAuthService.js";

export default {
  name: "AUAuth",
  mounted() {
    //this.$blockUI(true, 'Finishing up...')
    //console.log('Exchanging auth code for access token...')

 
    // Get/verify auth code
    const authCode = this.$route.query.code
    //console.log('Received auth code:', authCode)
  
    if (!authCode || authCode.length <= 1) {
      //this.$root.showAlert('Login Failed', 'Invalid auth code received', 'danger')
      Log.logError(
        "Invalid auth code",
        "AUAuth.vue mouted()"
      );
      return
    }
  
    //call web api with obtained secure auth code
    //setCapsLock();
    this.validateTokenAndRedirect(authCode);
},

  data() {
    return {
      waiting: false,
      valid: true,
      userName: this.$cookie.get("agency_username"),
      password: "",
      show: false,
      remember: false,
      failedDialog: false,
      statusText: "",
      failedText: "",
      errors: [],
      userNameRules: [(v) => !!v || "Username is required."],
      rules: {
        required: (value) => !!value || "Password is required.",
      },
      apiUserData: {},
      pwdResetRealm: PasswordResetRealm,
      unsupportedRoles: [],
      supportedRoles: [],
      unsupportedDialog: false,
      curUser: {},
      autofillContent: `"${String.fromCharCode(0xfeff)}"`,
      caps_lock_on: false,
    };
  },
  methods: {

    closeUnsupportedDialog() {
      this.unsupportedDialog = false;

      if (this.supportedRoles.length > 0) eventBus.$emit("login", this.curUser);
      else {
        this.unsupportedRoles = [];
      }
    },
    GetCompanies(associateCode, agencyRoles) {
      let returnCount = agencyRoles.length;
      let companyList = [];

      for (let agencyRole of agencyRoles) {
        HTTP.get("Agency/GetAgentFranchises", {
          params: {
            agentNumber: associateCode,
            branchNumber: agencyRole.agencyCode,
            agentRole: agencyRole.roleName,
          },
        })
          .then((response) => {
            if (response.status != 200) {
              this.waiting = false;
              this.errDialog = true;
              return;
            }

            let supported = true;

            if (response.data.statusCode === 500) {
              if (
                response.data.errorMessage
                  .toLowerCase()
                  .indexOf("role not supported") >= 0
              ) {
                this.unsupportedRoles.push(
                  agencyRole.roleName +
                    " (Agency: " +
                    agencyRole.agencyCode +
                    ")"
                );
                supported = false;
              }
            } else if (response.data.statusCode === 200 && supported) {
              this.supportedRoles.push(
                agencyRole.roleName + " (Agency: " + agencyRole.agencyCode + ")"
              );
            }

            returnCount = returnCount - 1;

            for (let franchise of response.data.franchiseDetails) {
              // console.log(franchise);

              companyList.push({
                franchiseId: franchise.franchiseId,
                franchiseName: franchise.franchiseName,
                agencyName:
                  franchise.agencyName +
                  " " +
                  (franchise.agencyNameDesc == ""
                    ? agencyRole.agencyName
                    : franchise.agencyNameDesc),
                branchNumber: franchise.agencyName,
                agencyNumber: "",
                printBillMode: franchise.printBillMode,
                activeCompany: franchise.activeCompany,
                enrollmentString: franchise.enrollmentString,
              });
            }
            if (returnCount === 0) {
              let companyStorage = JSON.stringify(companyList);

              window.sessionStorage.setItem("franchises", companyStorage);

              if (this.unsupportedRoles.length > 0) {
                this.waiting = false;
                this.unsupportedDialog = true;
              } else {
                this.setCurrentUser(this.curUser);
              }
            }
          })
          .catch((e) => {
            returnCount = returnCount - 1;

            Log.logError(
              e,
              "CompanySearch.vue created Agency/GetFranchises agency: " +
                agencyRole.agencyCode
            );
            this.waiting = false;
            this.errDialog = true;
          });
      }
    },
    
    setCurrentUser(curUser) {
      this.statusText = "Redirecting ......";

      let role = curUser.role;
      curUser.role = "";

      this.$store.commit("setCurrentUser", curUser);
      this.$store.state.currentFranchise.franchiseNumber = "";

      window.sessionStorage.setItem("user", curUser.user ? curUser.user.trim() : curUser.user);
      window.sessionStorage.setItem("type", curUser.type);
      window.sessionStorage.setItem("name", curUser.name);

      let encryptedRole = encryption.encrypt(role);
      window.sessionStorage.setItem("role", encryptedRole);

      if (curUser.name != null && curUser.name != "" && curUser.name != undefined)
        this.$store.commit("setDisplayName", curUser.name);
      else 
        this.$store.commit("setDisplayName", curUser.user);

      this.$store.state.loginType = "agency"
      eventBus.$emit("delayedLoggedUserInfo", { user: curUser});
      //this.$router.push("/search")
      setTimeout(this.$router.push("/search"), 2000);
    },
    
    validateTokenAndRedirect(authCode) {

      this.statusText = "Validating ...";
      this.waiting = true;

      dataService.getSecureAuthTokensForAgencyUser(authCode)
      .then((response) => {
        this.apiUserData = {};
        this.apiUserData = response.data;

        let isValid = this.apiUserData.status.toLowerCase() === "valid";

        if (isValid) {
          this.$store.commit("setJWT", this.apiUserData.wsbApiAuthToken);
          eventBus.emit(
            "setTokenTimer",
            this.apiUserData.wsbApiAuthToken
          );

          this.curUser = {};

          let userProps = response.data;

          if (userProps.roles == null || userProps.roles.length == 0) {
            this.waiting = false;
            this.failedDialog = true;
            this.failedText =
            "No applicable system roles were located for your user ID. Please contact your administrator for further instructions.";
            
            return;
          } 
          else {
            if (userProps != null && userProps.firstName != null) {
              this.curUser = {
                user: this.userName,
                name: (
                  (userProps.firstName ? userProps.firstName : "") +
                  " " +
                  (userProps.lastName ? userProps.lastName : "")
                ).trim(),
                role: Role.AgencyUser,
                type: "agency",
              };
            } 
            else {
              this.curUser = {
              user: this.userName,
              role: Role.AgencyUser,
              type: "agency",
             };
            }
          }

          this.statusText = "Retrieving companies...";
          this.GetCompanies(userProps.associateCode, userProps.roles);
        } 
        else {
          this.waiting = false;
          this.failedDialog = true;
          this.failedText =
            "Unable to validate authorization code.";
          }
      })
      .catch((e) => {
        Log.logError(
          e,
         "AgencyLogin.vue validate Authentication/Authenticate post"
        );
        this.waiting = false;
        this.failedDialog = true;
        this.failedText = "Something went wrong. Please try again.";
      });
    },
  },
};
</script>
<style scoped>
.topMargin {
  margin-top: 10px;
}
.tbBackground {
  background-color: #44aba8;
  /* background-color: #00558c; */
}
.title {
  color: #fafafa;
  line-height: 1.2;
  margin-bottom: 2px;
}
.subtitle {
  color: #fafafa;
  font-size: 0.875rem;
  line-height: 1.2;
}
.dialogHeadline {
  color: #00558c;
}
.waitCircleLogin {
  position: fixed;
  top: 40%;
  left: 25%;
}
.waitCircleLoginSm {
  position: fixed;
  top: 25%;
  left: 0%;
}
.status {
  font-size: 1rem;
  text-align: center;
}
.waitingOverlay {
  opacity: 0.5;
  background-color: whitesmoke;
  border-color: whitesmoke;
}
</style>
<style>
.centerInGrid {
  position: absolute;
  top: 33%;
  left: 25%;
}
input:-webkit-autofill {
  content: "\feff";
}
.labelClass {
  background-color: #fff;
  z-index: 23;
}
input:-internal-autofill-selected {
  background-color: #fff !important;
}
.caps-lock-on {
  color: red;
  font-size: 14px;
}
</style>
