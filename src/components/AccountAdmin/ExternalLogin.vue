<template>

  <div>
    <v-dialog
      v-model="failedDialog"
      persistent
      width="350"
      :content-class="$vuetify.display.mdAndUp ? 'centerInGrid' : ''"
    >
      <v-card>
        <v-card-title class="headline dialogHeadline">
          <v-icon :color="$store.state.mainColor" size="large">mdi-account</v-icon
          >&nbsp;Authentication Failed
        </v-card-title>
        <v-row align="center" justify="center">
          <hr class="mx-auto" style="width: 90%; border: none; border-top: 1px solid rgba(0,0,0,0.12);" />
        </v-row>
        <br />        
        <v-card-text>{{ failedText }}</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            variant="elevated"
            class="menuBtn topMargin"
            @click="handleFailedClose"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-row justify="center" align-content="center">
      <v-col cols="10">
        <v-card class="mx-auto">
          <header>
            <v-col style="padding-top: 15px; padding-left: 20px">

    <!-- <v-dialog v-model="alertDialog" width="600">
      <template v-slot:activator="{ on }">
        <v-btn color="#00558C" large dark class="menuBtn big-button-font" style="margin-top: -30px; margin-left: 450px;" v-on="on"><b>Haven’t Registered?
        <br/><u>Click Here</u></b></v-btn>
      </template>
      <v-card>
        <v-card-title class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
          Welcome to our Upgraded Online Billing website!
        </v-card-title>
        <v-card-text>
        <br/>How to Register for Our New Billing Site
            <ol style="list-style-type: decimal">
              <li>Check your email (and spam folders) for an email from <a href="mailto:LNBilling@Globe.Life">LNBilling@Globe.Life</a>.<br/>The subject line is “Update Your Password-Action Required”</li>
              <li>Click on the registration link in the email</li>
              <li>Still no email? Call Customer Service at 1-888-488-0134 for assistance</li>
            </ol> 
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#319B42" dark class="menuBtn" @click="alertDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>-->
    <v-dialog v-model="showDidntGet" persistent width="800" max-width="70vw">
        <v-card>
            <v-card-text>For help, please contact Customer Service at 1-888-488-0134, select option #2.</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="#319B42"
                    dark
                    class="menuBtn topMargin"
                    @click="showDidntGet = false"
                    >OK</v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="mfaChooserDialog" max-width="550" persistent >
        <v-form>
          <v-card>
            <v-card-title class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
              Security Verification
            </v-card-title>
            <v-card-text>
              <!-- <span style="margin-left: 15px;"><b>{{ pinCodeStatus }}</b></span> -->
              <br/>
                <div style="margin-left: 15px;"><b>We need to verify it's you. What is the best way?</b></div>
                <v-container grid-list-md>
                  <v-row row wrap>
                    <v-col cols="12" v-if="isAccountNotVerified()">
                      <span style="color:red;">Your account has not been verified. Please complete the two-step verification process to verify your email or mobile phone.</span>
                    </v-col>
                    <v-col cols="9" class="button-like">
                      <v-text-field
                        append-icon="mdi-arrow-right"
                        v-model=emailText
                        @click.stop="selectEmail"
                        outlined
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" v-if="shouldShowEmailDefault()">
                      
                    </v-col>
                    <v-col cols="9" class="button-like">
                      <v-text-field
                        append-icon="mdi-arrow-right"
                        :value=phoneText()
                        @click.stop="selectPhone"
                        outlined
                        readonly
                      ></v-text-field>
                    </v-col>
                    <v-col cols="3" v-if="shouldShowPhoneDefault()">
                      
                    </v-col>
                  </v-row>
                  <v-row row wrap>
                    <v-col cols="9">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <a v-on="on" style="color:green;font-size:1rem;" v-bind="attrs">Why do I need two-step verification?</a>
                        </template>
                        <span>
                          <h3>Additional Security</h3>
                          <br/>{{ mfaTooltip }}</span>
                      </v-tooltip>
                    </v-col>
                    <v-col cols="3">
                        <v-btn color="#319B42" dark class="menuBtn" @click.stop="closeChooserDialog">
                          Close
                        </v-btn>
                    </v-col>
                  </v-row>
                </v-container>

            </v-card-text>
          </v-card>
        </v-form>
      </v-dialog>
      <v-dialog v-model="pinCodeDialog" max-width="550" persistent>
          <v-form ref="pincodeform" >
            <v-card>
              <v-card-title style="color:white" class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
                One-Time Code
              </v-card-title>
              <v-card-text>
                <!-- <span style="margin-left: 15px;"><b>{{ pinCodeStatus }}</b></span> -->
                <br/>
                  <div class = "OTPSubtitle" style="margin-left: 15px;color:rgba(0,0,0,.6)"><b>{{ messageType() }}, please check it for your one-time code.</b></div>
                  <v-container grid-list-md text-xs-center>
                    <v-row row wrap>
                      <v-col cols="9">
                        <v-text-field label="*one-time code" v-model="pincode" variant="outlined" color="primary" single-line v-mask="'######'" autofocus :rules="pinCodeRules"
                         v-on:keypress.enter.prevent hide-spin-buttons />
                      </v-col>
                    <v-col cols="3">
                        <v-btn align="right" color="#319B42" dark class="menuBtn topMargin"  ref="submitPinCode" @click.stop="verifyOTP()">
                          Submit
                        </v-btn>
                      </v-col>
                    </v-row>
                     <span
      :class="
        $vuetify.display.smAndDown ? 'waitCircleLoginSmMFA' : 'waitCircleLoginMFA'
      "
      :style="
        $vuetify.display.smAndDown
          ? 'width:100%; color: #319B42;'
          : 'width: 25%; color: #319B42;'
      "
    >
                      <v-row justify="center" align-content="center" align="center" column>
                        <v-progress-circular
                          v-if="mfaWaiting"
                          indeterminate
                          color="#319B42"
                          :size="70"
                          width="10"
                          
                        ></v-progress-circular>
                        <br />
                        <span class="status" v-if="mfaWaiting">{{ mfaStatusText }}</span>
                      </v-row>
                    </span>
                    <v-row row wrap>
                      <v-col cols="12">
                        <v-checkbox
                          v-if="false"
                          color="#00558c"
                          v-model="trustme"
                          label="Remember this device and skip this step during next login."
                          class="topMargin" 
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                    <v-row row wrap>
                      <v-col cols="12">
                        <hr />
                      </v-col>
                    </v-row>
                    <v-row row wrap >
                      <v-col cols="4">
                        <v-btn color="blue" dark class="menuBtn" @click.stop="resendCode">
                          Resend Code
                        </v-btn> 
                      </v-col>
                      <v-col cols="5">
                        <v-btn color="blue" dark class="menuBtn" @click.stop="showDidntGet = true">
                          Didn't Receive a Code?
                        </v-btn> 
                      </v-col>
                      <v-col cols="3">
                        <v-btn color="#319B42" dark class="menuBtn" @click.stop="closePinDialog">
                          Close
                        </v-btn>
                      </v-col>
                    </v-row>
                    
                  </v-container>

              </v-card-text>
          </v-card>        
        </v-form>
      </v-dialog>
            </v-col>
          </header>
          <v-row justify="center" align-content="center" >
            <v-col cols="9" style="margin-top: 5px;">
              <span class="title" style="color: rgb(0, 85, 140); font-size: 2rem !important; font-weight: 600;">Log In</span>
            </v-col>
            <v-col cols="9">
              <v-form ref="form" v-model="valid" lazy-validation>
                <v-text-field
                  label="*Email Address"
                  v-model="userName"
                  :rules="userNameRules"
                  ref="usr"
                  variant="outlined"
                  name="userName"
                  id="userName"
                  v-on:keyup.enter="$refs['pwd'].focus()"
                  autocomplete="username"
                  color="primary"
                ></v-text-field>

                <v-text-field
                 v-model="password"
                label="*Password"
                :rules="rules"
               :type="show ? 'text' : 'password'"
               :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
               @click:append-inner="show = !show"
                id="password"
                  name="password"
                  v-on:keyup.enter="$refs['logIn'].$el.click()"
                  autocomplete="current-password"
                  variant="outlined"
                  color="primary"
                required
                /> 
                <span v-if="caps_lock_on" class="caps-lock-on"
                  >CAPS Lock is ON</span
                >
              </v-form>
            </v-col>
            <v-col cols="9" style="height: 50px;">
              <v-checkbox 
                color="#00558c"
                v-bind="remember"
                label="Remember my username"
                density="compact" hide-details
              ></v-checkbox>
            </v-col>
            <v-col cols="9" >
              <a href="/forgotpassword" >Forgot your password?</a>
            </v-col>
            <v-col cols="9" style="height: 20px;">
              <v-row justify="center">
                <v-btn
                  color="#319B42"
                  dark
                  class="menuBtn topMargin"
                  ref="logIn"
                  @click.stop="validate()"
                  style="width:250px;" 
                  >Log In</v-btn
                >
              </v-row>
            </v-col>
            <v-col cols="9">
              <v-card-text align="center">
                This system is only for authorized Globe Life and its affiliates
                (hereinafter referred to as "The Company") employees,
                contractors and business partners. Users should be aware that
                The Company reserves the right to monitor usage of this system.
                By using this system, you are consenting to The Company
                monitoring your activity on the system and conducting reasonable
                investigations into any possible misuse of the system. Misuse of
                this system may lead to disciplinary or legal action.
              </v-card-text>
            </v-col>
          </v-row>
          <br />
          <br />
        </v-card>
      </v-col>
    </v-row>

    <span
      :class="
        $vuetify.display.smAndDown ? 'waitCircleLoginSm' : 'waitCircleLogin'
      "
      :style="
        $vuetify.display.smAndDown
          ? 'width:100%; color: #319B42;'
          : 'width: 25%; color: #319B42;'
      "
    >
      <v-row justify="center" align-content="center" align="center" column>
        <v-progress-circular
          v-if="waiting"
          indeterminate
          color="#319B42"
          :size="70"
          width="10"
          
        ></v-progress-circular>
        <br />
        <span class="status" v-if="waiting">{{ statusText }}</span>
      </v-row>
    </span>
  </div>
</template>

<script>
import { Role } from "@/role.js";
import eventBus from "@/event-bus.js";
import { MFA_Settings } from "@/HTTP-common.js";
import Log from "@/log.js";
import dataService from '@/services/dataService';

//Amplify Integration
import {Amplify} from '@aws-amplify/core';
import {Auth} from '@aws-amplify/auth';
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();
var maxErrorCount = 3;
/*
try
{
  //get required information from config file
  fetch(process.env.BASE_URL + "config.json")
   .then(function(response) {
      return response.json(); // As a function call
   })
   .then(function(data) {
      let region = data.Region;
      let userPoolClientId = data.UserPoolClientId;
      let userPoolId = data.UserPoolId;
      maxErrorCount = parseInt(data.MaxMFAVerificationAttempts);
      Amplify.configure({
        Auth: {
          region: region,
          userPoolWebClientId: userPoolClientId,
          userPoolId: userPoolId
        }
      });
    });
}
catch (e)
{
  Log.logError( e, "ExternalLogin.vue Amplify Configure" );
}
*/


export default {
  name: "LogIn",
  
  mounted() {
    Amplify.configure({
      Auth: {
        region: MFA_Settings.Region,
        userPoolWebClientId: MFA_Settings.UserPoolClientId,
        userPoolId: MFA_Settings.UserPoolId
      }
    });

    const input = document.querySelector("input[type=password]");
    document.addEventListener("keyup", this.setCapsLock);
    document.addEventListener("click", this.setCapsLock);

    if (!this.checkAutofill(input)) {
      let interval = 0;
      const intervalId = setInterval(() => {
        if (this.checkAutofill(input) || interval++ >= 20)
          clearInterval(intervalId);
      }, 100);
    }
  },
  data() {
    return {
      valid: true,
      pinCodeDialog: false,
      alertDialog: false,
      failedDialog: false,
      failedText:
        "Please verify your username and password have been entered correctly.",
      userName: cookies.get("franchise_username"),
      password: "",
      pincode: null,
      show: false,
      remember: false,
      trustme: false,
      waiting: false,
      isPhoneMfa: false,
      statusText: "",
      userNameRules: [
        v => !!v || "Email is required.",
        v => /.+@.+\..+/.test(v.trim()) || "Email must be valid.",
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
      ],
      pinCodeRules: [
        (v) => !!v || "One-time code is required.",
        v => (v && v.length == 6) || "One-time code must be digits.",
        v => /^\d+$/.test(v) || "One-time code must contain only digits."
      ],
      rules: [
        value => !!value || "Password is required.",
    ],
      autofillContent: `"${String.fromCharCode(0xfeff)}"`,
      errors: [],
      caps_lock_on: false,
      showDidntGet: false,
      mfaWaiting: false,
      mfaStatusText: "",
      remainingAttempts: 5,
      userMFAErrorId: 0,
      userMFAErrorCount: 0,
      mfaChooserDialog: false,
      mfaTooltip: `Add an extra layer of security like two-step verification and help ensure it's really you signing in. It takes less than two minutes to set up.`,
      phoneInput: '',
      showPhoneInput: false,
      phoneSelected: false,
      emailSelected: true,
      registerMessage: `We noticed that the account creation process was not completed due to missing Multi-Factor Authentication (MFA). Please verify your email to complete the registration process.`,
      //dialog: false,
    };
  },
  computed: {
    maskedEmail() {
      if (this.userName) {
        let name = this.userName;
        let atIndex = name.indexOf('@');
        let periodIndex = name.indexOf('.', atIndex + 1);
        let maskedUser = name.substr(0, 1) + '****' + name.substr(atIndex - 1, 1) + '@*.' + name.substr(periodIndex + 1);
        return maskedUser;
      }
      return null;
    },
    pincodeText() {
      if (this.emailSelected) {
        return 'email ' + this.maskedEmail;
      }
      return 'phone ending in ' + this.apiUserData.registerDetails[0].phone_number.slice(-4);
    },
    emailText() {
      let email = this.maskedEmail;
      if (email) {
        return 'Email to ' + this.maskedEmail;
      }
      return '';
    },
  },
  methods: {
    isAccountNotVerified() {
      return !(this.apiUserData && this.apiUserData.registerDetails && this.apiUserData.registerDetails[0].isAccountVerified);
    },
    shouldShowEmailDefault() {
      return this.apiUserData && this.apiUserData.registerDetails && this.apiUserData.registerDetails[0].current_OtpMethod == "email";
    },
    shouldShowPhoneDefault() {
      return this.apiUserData && this.apiUserData.registerDetails && this.apiUserData.registerDetails[0].current_OtpMethod == "sms";
    },
    phoneAvailable() {
      return this.apiUserData && this.apiUserData.registerDetails && this.apiUserData.registerDetails[0].isSMSVerified;
    },
    phoneText() {
        return 'Text to (***) *** ' + this.phoneSlice();
    },
    phoneSlice() {
      if (this.apiUserData && this.apiUserData.registerDetails && this.apiUserData.registerDetails[0].phone_number) {
        return this.apiUserData.registerDetails[0].phone_number.slice(-4);
      }
      return '';
    },
    messageType() {
      return this.isPhoneMfa ? "Text sent to phone number ending in " + this.phoneSlice() : "Email sent to " + this.maskedEmail;
    },
    handleFailedClose() {
      this.failedDialog = false;
      if (this.apiUserData.statusCode == "200" && !this.apiUserData.registerDetails[0].isAccountVerified) {
        if (this.phoneAvailable())
        {
          this.mfaChooserDialog = true;
        }
        else {
          this.selectOTP("email");
        }
      }
    },
    setCapsLock(e) {
      if (e.getModifierState) {
        this.caps_lock_on = e.getModifierState("CapsLock");
      }
    },
    checkAutofill(input) {
      try {
        if (!input.value) {
          const style = window.getComputedStyle(input);
          if (style.content !== this.autofillContent) return false;
        }

        //the autofill was detected

        input.classList.add("v-input--is-label-active");

        let label = document.querySelector('label[for="userName"]');
        label.classList.add("v-label--active");
        label.classList.add("labelClass");

        let label2 = document.querySelector('label[for="password"]');
        label2.classList.add("v-label--active");
        label2.classList.add("labelClass");

        return true;
      } catch (e) {
        return true;
      }
    },
    franchiseUserAuthenticate() {
      //cognito authentication
      dataService.postFranchiseUserAuthenticate(this.userName, this.password, "")
        .then(response =>{
          
          this.apiUserData = {};
          this.apiUserData = response.data;

          if (this.apiUserData.statusCode != "200") {
            if (this.isUserLockedOut(this.apiUserData)) {
              //user is locked out. This code is executed for both user/password lock and mfa lock
              this.waiting = false;
              this.failedText = `You have exceeded the amount of log in attempts. Please contact your company's administrator to unlock your account or contact Customer Service at 1-888-488-0134, select option #2.`;
              this.failedDialog = true;
              return;
            }
            if (this.isUserDisabled(this.apiUserData)) {
              //user is disabled
              this.waiting = false;
              this.failedText = `Your account creation process is not complete. Please check after 24 hours. If issue still exists, contact your company’s benefits administrator. If you do not have a company administrator, contact the Liberty National home office at (866) 441-3018.`;
              this.failedDialog = true;
              return;
            }
            if (!this.apiUserData.registerDetails[0].isAccountVerified) {
              this.$store.commit("setJWT", this.apiUserData.wsbApiAuthToken);
              eventBus.emit("setTokenTimer", this.apiUserData.wsbApiAuthToken);
              //franchise admin email was not verified
              this.waiting = false;
              this.failedText = this.registerMessage;
              this.failedDialog = true;
              return;
            }
            this.waiting = false;
            this.failedDialog = true;
          }
          else if (this.apiUserData.statusCode == "200" && !this.apiUserData.registerDetails[0].isAccountVerified) {
            this.$store.commit("setJWT", this.apiUserData.wsbApiAuthToken);
            eventBus.emit("setTokenTimer", this.apiUserData.wsbApiAuthToken);
            //franchise admin email was not verified
            this.waiting = false;
            this.failedText = this.registerMessage;
            this.failedDialog = true;
            return;
          }
          else if (this.apiUserData.statusCode == "200") {
            //authentication successful. Need to display mfa pop up.
            this.$store.commit("setJWT", this.apiUserData.wsbApiAuthToken);
            eventBus.emit("setTokenTimer", this.apiUserData.wsbApiAuthToken);

            //pincodedialog is not visible
            this.statusText = "Generating one-time code ...";

            this.userMFAErrorId = this.apiUserData.userMFAErrorId;
            this.userMFAErrorCount = this.apiUserData.errorCount;

            //how many attempts are remaining
            this.remainingAttempts = maxErrorCount - this.userMFAErrorCount;

            //Cognito Auth is good. Now show MFA selector
            if (this.phoneAvailable())
            {
              this.mfaChooserDialog = true;
            }
            else {
              this.selectOTP("email");
            }
          }
          else {
            //this is error condition. display default this.failedText
            //this can occur when tasks like getting device info, mfa bypass, mfaErrorCount retrieval fail.
            this.waiting = false;
            this.failedDialog = true;
          }
        })
        .catch((e) => {
          this.waiting = false;
          this.failedDialog = true;
          this.errors.push(e);
          Log.logError(
            e,
            "ExternalLogin.vue validate franchiseUserAuthenticate"
          );
        });
    },
    closeChooserDialog() {
      this.waiting = false;
      this.mfaChooserDialog = false;
    },
    selectPhone() {
      this.isPhoneMfa = true;
      if (this.phoneAvailable()) {
        this.selectOTP("sms");
      }
    },
    selectEmail() {
      this.isPhoneMfa = false;
      this.selectOTP("email");
    },
    selectOTP(otpMethod) {
      this.mfaChooserDialog = false;
      this.waiting = true;
      dataService.setUserMFATrack(this.userName, otpMethod);
      if (otpMethod != this.apiUserData.registerDetails[0].current_OtpMethod) {
        let req = {};
        req.otpMethod = otpMethod;
        req.userName = this.userName;
        dataService.setUserOTP(req).then((response) => {
          if (response.data.statusCode == "200") {
            this.amplifySignIn(false);
          } else {
            this.waiting = false;
            this.failedDialog = true;
            this.failedText = 'Unable to send OTP, please try again later.';
          }
        }).catch(e => {
          this.waiting = false;
          this.failedDialog = true;
          this.errors.push(e);
          Log.logError(e, "ExternalLogin.vue setUserOTP");
        });
      }
      else {
        this.amplifySignIn(false);
      }
    },
    extFranchisesAndRoles() {

      if (this.apiUserData.registerDetails) {
        let fullName =
        this.apiUserData.registerDetails[0].firstName +
        " " +
        this.apiUserData.registerDetails[0].lastName;
        dataService.getExtFranchisesAndRoles(this.userName).then(userRoleResponse =>{
          if (userRoleResponse.data.statusCode == "200") {
            let curUser = {};

            let companyStorage = JSON.stringify(
              userRoleResponse.data.franchisesAndRoles
            );

            window.sessionStorage.setItem(
              "franchises",
              companyStorage
            );

            curUser = {
              user: this.userName,
              name: fullName,
              role: Role.FranchiseUser,
              type: "ext",
              phone: this.apiUserData.registerDetails[0].phone_number,
            };
            this.mfaStatusText = "Redirecting...";
            this.statusText = "Redirecting...";
            eventBus.emit("login", curUser);
          } 
          else {
            this.waiting = false;
            this.mfaWaiting = false;
            this.failedText =
              "Failed to retrieve company list. Please try again or contact your administrator.";
            this.failedDialog = true;
          }
        })
        .catch((e) => {
          this.waiting = false;
          this.mfaWaiting = false;
          this.failedDialog = true;
          this.errors.push(e);
          Log.logError(
            e,
            "ExternalLogin.vue extFranchisesAndRoles"
          );
        });
      }
      else {
          //this.apiUserData.registerDetails is not true
          this.waiting = false;
          this.mfaWaiting = false;
          this.failedDialog = true;
      }
    },
    updUserDevice() {
      dataService.postUserDevice(this.userName, this.apiUserData.userDeviceId)
        .then(userDeviceResponse =>{
          Log.logInfo('User Device update completed. ' + userDeviceResponse.Id, 'ExternalLogin.vue updUserDevice');

          if (userDeviceResponse.status == 200)
          {
            this.mfaStatusText = "Getting Roles...";
            this.extFranchisesAndRoles();
          }
          else
          {
            this.mfaWaiting = false;
            this.failedDialog = true;
            Log.logError(
              'Database update of user device failed',
              "ExternalLogin.vue updUserDevice"
            );
          }
        })
        .catch((e) => {
          this.mfaWaiting = false;
          this.failedDialog = true;
          this.errors.push(e);
          Log.logError(
            e,
            "ExternalLogin.vue updUserDevice"
          );
        });
    },
    updUserMFAError(errorCount) {
      //update database with new errorCount
      dataService.postUserMFAError(this.userName, this.userMFAErrorId, errorCount, this.isPhoneMfa ? "sms" : "email")
        .then((response) =>{
          Log.logInfo('User MFA Error update completed. ');

          if (response.data.statusCode == 200 || !this.apiUserData.registerDetails[0].isAccountVerified)
          {
            if (errorCount == 0)
            { 
              //MFA is successful. Error Count in database has been reset.
              this.remainingAttempts = maxErrorCount;
              this.userMFAErrorCount = 0;

              //check if device update is required
              if (this.trustme) {
                this.mfaStatusText = "Updating device...";
                this.updUserDevice();
              }
              else {
                this.mfaStatusText = "Getting Roles...";
                this.extFranchisesAndRoles();
              }
            }
            else
            {
              if (this.remainingAttempts > 0)
              {
                //error count is still not maxed out. do retry again.
                this.userMFAErrorId = response.data.userMFAErrorResponseDTO.userMFAErrorDetails.id;

                //call signIn
                this.statusText = "Regenerating one-time code ...";
                this.amplifySignIn(true);
              }
              else 
              {
                this.mfaWaiting = false;
                Log.logInfo('User  ' + this.userName + ' will be locked for exceeding mfa attempts ....', 'ExternalLogin.vue amplifyVerify');
                this.failedText = `You have exceeded the amount of log in attempts. Please contact your company's administrator to unlock your account or contact Customer Service at 1-888-488-0134, select option #2.`;
                this.failedDialog = true;

                //lock the user
                window.setTimeout(dataService.setlockFranchiseUser(encodeURIComponent(this.userName.trim()), true, true), 1000);


                //close mfa pop up
                this.$refs.pincodeform.resetValidation();      
                this.pincode = null;
                this.pinCodeDialog = false;
                return;
              }
            }
          }
          else
          {
            this.mfaWaiting = false;
            this.failedDialog = true;
            Log.logError(
              'Database update of MFA ErrorCount failed',
              "ExternalLogin.vue updUserMFAError"
            );
          }
        })
        .catch((e) => {
          this.mfaWaiting = false;
          this.failedDialog = true;
          this.errors.push(e);
          Log.logError(
            e,
            "ExternalLogin.vue updUserMFAError"
          );
        });
    },
    resendCode() {
      this.$refs.pincodeform.resetValidation();
      this.waiting = true;
      this.amplifySignIn(false);
    },
    amplifySignIn(isVerifyPinCode) {
      this.userName = this.userName.trim();
      Auth.signIn(this.userName)
        .then((amplifyUser) => {
          this.mfaUser = amplifyUser;
          this.mfaSession = JSON.stringify(amplifyUser);

          if (isVerifyPinCode) {
            //if coming in from verifyOTP then display number of attempts remaining. 
            //scenario of attempts left is 0 is handled in verifyOTP
            this.mfaWaiting = false;
            this.failedText = "Invalid one-time code. You have " + this.remainingAttempts + " attempts left. New " + (this.isPhoneMfa ? "SMS" : "email")  + " sent to " + (this.isPhoneMfa ? "mobile number" : "address") + " you logged in with, please check it for your new one-time code.";
            this.failedDialog = true;
          }
          else {
            //all good. Display popup
            this.waiting = false;
            this.pincode = null;
            this.pinCodeDialog = true;
          }

          return;
        })
        .catch((e) => {
          Log.logError(
            e,
            "ExternalLogin.vue amplifySignIn"
          );
          Log.logError('One-time code generation failed for - ' + this.userName, 'ExternalLogin.vue amplifySignIn');
          this.waiting = false;
          this.mfaWaiting = false;
          this.failedText = 'One-time code generation failed'
          this.failedDialog = true;
          return;
        });
    },
    amplifyVerify() {
      if (!this.apiUserData.registerDetails) {
        //this is error condition. Should never hit but display default failedText if we this code is hit
        this.mfaWaiting = false;
        this.failedDialog = true;
        return;
      }

      //update attempts made 
      this.remainingAttempts--;
      this.userMFAErrorCount++;

      //verify pin code
      Auth.sendCustomChallengeAnswer(this.mfaUser, this.pincode)
        .then((response) => {
          //update userMFAErrorCount
          this.mfaStatusText = "Updating MFA Status...";
          if (response.signInUserSession)
          {
            //pin code verification is good. Reset errorCount
            this.updUserMFAError(0);
            this.confirmEmail();
          }
          else {
            this.updUserMFAError(this.userMFAErrorCount);
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "ExternalLogin.vue amplifyVerify"
          );

          //have we reached max try limit. if not, then ampify sign in
          this.mfaStatusText = "Updating MFA Status...";
          this.updUserMFAError(this.userMFAErrorCount);
        });
    },
    confirmRegisteredUser() {
      let req = {};
      req.emailId = this.userName.trim();
      dataService.confirmRegisteredUserEmail(req).then(response => {
          if (!(response.status == 200 && response.data.isSuccess)) {
              this.setErrorMessages("Unable to confirm user registration");
          }
      })
      .catch(e => {
          this.setErrorMessages(e);
          Log.logError(e, "CompanyRegister.vue confirmRegisterUser");
      });
    },
    validate() {
      this.userName = this.userName.trim();
      if (this.$refs.form.validate()) {
        this.waiting = true;
        this.mfaWaiting = false;
        this.statusText = "Authenticating...";

        //set default failedText
        this.failedText = 'Please verify your username and password have been entered correctly.';

        //blank out pincode
        this.pincode = null;
        this.pinCodeDialog = false;
        
        if (this.remember) {
          this.$cookies.set("franchise_username", this.userName, {
            samesite: "none",
            expires: "12M",
            secure: true,
          });
        }

        this.franchiseUserAuthenticate();
      }
    },
    verifyOTP() {
      if (this.$refs.form.validate()) {
        if (!this.$refs.pincodeform.validate()) {return; }
      }

      //do not display status text on parent
      this.waiting = false;

      //display mfa status text
      this.mfaWaiting = true;

      //set default failedText
      this.failedText = 'One-time code verification failed.';
      this.remainingAttempts =6;
      //check verification attempts
      if (this.remainingAttempts <= 0)
      {
        this.mfaWaiting = false;  
        this.failedText = "One-time1 code verification exceeded maximum limits";
        this.failedDialog = true;

        this.$refs.pincodeform.resetValidation();      
        this.pincode = null;
        this.pinCodeDialog = false;
        return;
      }

      this.verificationAttempts--;
      this.mfaStatusText = "Verifying one-time code ...";

      this.amplifyVerify();

    },
    confirmEmail() {
      if (!this.apiUserData.registerDetails[0].isEmailVerified) {
        let req = {};
        req.emailId = this.userName;
        dataService.confirmRegisteredUserEmail(req).then(response => {
        if (response.data.statusCode != "200") {
            Log.logInfo("confirmRegisteredUserEmail returned bad status code: " + response.data.statusCode);
            Log.logInfo("confirmRegisterdUserEmail data: " + JSON.stringify(response.data));
        }
        }).catch(e => {
            Log.logError(e, "ExternalLogin.vue confirmRegisteredUserEmail");
        });
      }
    },
    closePinDialog(){
      this.$refs.pincodeform.resetValidation();
      this.pincode = null;
      this.pinCodeDialog = false;
    },
    isUserDisabled(apiUserData) {
      let isLockOut = false;
      if (apiUserData.errorMessage) {
        let wsbError = this.parseWSBErr(apiUserData.errorMessage);
        if (wsbError != null && wsbError.toLowerCase() == ":disabled:") {
          isLockOut = true;
        }
      }
      return isLockOut;
    },
    isUserLockedOut(apiUserData) {
      let isLockOut = false;
      if (apiUserData.errorMessage) {
        let wsbError = this.parseWSBErr(apiUserData.errorMessage);
        if (wsbError != null && wsbError.toLowerCase() == ":lockedout:") {
          isLockOut = true;
        }
      }
      return isLockOut;
    },
    parseWSBErr(errorMessage) {
      let errorCode = null;

      let pos1 = errorMessage.toLowerCase().indexOf("wsberr");
      let pos2 = errorMessage.toLowerCase().lastIndexOf("wsberr");
      if (pos2 > pos1) {
        errorCode = errorMessage.substr(pos1 + 6, pos2 - pos1 - 6);
      }
      return errorCode;
    },
  },
};
</script>

<style scoped>
.big-button-font {
    font-size: 16px;
    font-weight: bold;
}
.topMargin {
  margin-top: 10px;
}
.title {
  color: #fafafa;
  line-height: 1.2;
  margin-bottom: 2px;
}
.tbBackground {
  background-color: #44aba8;
  /* background-color: #00558c; */
}
.subtitle {
  color: #fafafa;
  /* color: hsla(0, 0%, 100%, 0.7); */
  font-size: 0.875rem;
  line-height: 1.2;
}
.status {
  font-size: 1rem;
  text-align: center;
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
.waitCircleLoginMFA {
  position: fixed;
  top: 40%;
  left: 35%;
}
.waitCircleLoginSmMFA {
  position: fixed;
  top: 25%;
  left: 25%;
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
.button-like .v-input__slot * {
  cursor: pointer !important;
}
.OTPSubtitle{
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.375rem;
    letter-spacing: .0071428571em;
    color: rgba(0, 0, 0, .6);
}
</style>