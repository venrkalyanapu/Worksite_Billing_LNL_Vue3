<template>
  <span id="accountInfo">
    <div>
      <v-dialog
        v-model="failedDialog"
        persistent
        width="350"
        :content-class="$vuetify.display.mdAndUp ? 'centerInGrid' : ''"
      >
        <v-card>
          <v-card-title class="headline dialogHeadline">
            <v-icon :color="$store.state.mainColor" large>mdi-account</v-icon
            >&nbsp;Authentication Failed
          </v-card-title>
          <v-row align="center" justify="center">
            <hr width="90%" />
          </v-row>
          <br />
          <v-card-text>{{ failedText }}</v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn topMargin"
              @click="handleFailedClose"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showPhoneInput" max-width="550" persistent>
          <v-form ref="phoneform">
            <v-card>
              <v-card-title class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
                Change Mobile Number
              </v-card-title>
              <v-card-text>
                <br/>
                  <v-container grid-list-md text-xs-center>
                    <v-row  wrap>
                      <v-col cols="9">
                        <h3>Mobile Number</h3>
                      </v-col>
                      <v-col cols="9">
                        <v-text-field label="(123) 123-1234" v-model="phoneInput" outlined single-line maxlength="14" autofocus :rules="phoneRules" 
                         v-on:keypress.enter.prevent v-mask="'(###) ###-####'" />
                      </v-col>
                      <v-col cols="12">
                        <div style="margin-left: 15px;">Enter a valid mobile number. Standard SMS/Messaging rates may apply.</div>
                      </v-col>
                      <v-row wrap>
                        <v-col cols="12" style="display:flex; justify-content:center;">
                          <v-btn color="#319B42" dark class="menuBtn" @click.stop="setupPhone" width="50%">
                            Continue
                          </v-btn>
                        </v-col>
                        <v-col cols="12" style="display:flex; justify-content:center;">
                          <v-btn class="menuBtn" style="background-color:unset;" width="50%" @click.stop="closePhonePopup"><v-icon>mdi-arrow-left</v-icon>Cancel</v-btn>
                          </v-col>
                      </v-row>
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
                      <v-layout justify="center" align-content="center" align="center" column>
                        <v-progress-circular
                          v-if="mfaWaiting"
                          indeterminate
                          color="#319B42"
                          :size="70"
                          width="10"
                          
                        ></v-progress-circular>
                      </v-layout>
                    </span>
                    
                  </v-container>

              </v-card-text>
          </v-card>        
        </v-form>
      </v-dialog>
      <v-dialog v-model="passwordDialog" max-width="550" persistent >
        <v-form ref="passwordForm">
          <v-card>
            <v-alert text color="warning" v-if="showErrorMessages" >
              <div class="error-message">
                <ul id="errorMessage">
                  <li v-for="message in errorMessages" v-bind:key="message">
                    {{ message }}
                  </li>
                </ul>
              </div>
            </v-alert>
            <v-card-title class="px-4 py-3 tbBackground text-h6 font-weight-bold title">
              Change Password
            </v-card-title>
            <v-card-text>
              <br/>
              <v-container>
                <v-row>
                  <v-text-field label="*Old Password" v-model="oldPassword" variant="outlined"
                  :append-icon="showOldPassword ? 'visibility' : 'visibility_off'"
                  :type="showOldPassword ? 'text' : 'password'" @click:append="showOldPassword = !showOldPassword"
                  :rules='oldPasswordRules' required ref="oldPassword"                        
                  ></v-text-field>
                </v-row>
                <v-row>
                  <v-text-field label="*New Password" v-model="password" variant="outlined"
                  :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                  :type="showPassword ? 'text' : 'password'" @click:append="showPassword = !showPassword"
                  :rules='passwordRules' required ref="password"                        
                  ></v-text-field>
                </v-row>
                <v-row>
                  <v-text-field label="*Confirm New Password" v-model="confirmPassword" variant="outlined"
                  :append-icon="showConfirm ? 'visibility' : 'visibility_off'"
                  :type="showConfirm ? 'text' : 'password'" @click:append="showConfirm = !showConfirm"
                  :rules='confirmRules' required ref="confirmPassword"                                                
                  ></v-text-field>
                </v-row>
              </v-container>
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
                <v-layout justify="center" align-content="center" align="center" column>
                  <v-progress-circular
                    v-if="waiting"
                    indeterminate
                    color="#319B42"
                    :size="70"
                    width="10"
                    
                  ></v-progress-circular>
                </v-layout>
              </span>
              <v-row  wrap>
                <v-col cols="12" style="display:flex; justify-content:center;">
                  <v-btn color="#319B42" dark class="menuBtn" @click.stop="continuePasswordClick" width="50%">
                    Continue
                  </v-btn>
                </v-col>
                <v-col cols="12" style="display:flex; justify-content:center;">
                  <v-btn class="menuBtn" style="background-color:unset;" width="50%" @click.stop="closePasswordDialog"><v-icon>mdi-arrow-left</v-icon>Cancel</v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-form>
      </v-dialog>
      <v-dialog v-model="pinCodeDialog" max-width="550" persistent>
          <v-form ref="pincodeform" >
            <v-card>
              <v-card-title class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
                One-Time Code
              </v-card-title>
              <v-card-text>
                <!-- <span style="margin-left: 15px;"><b>{{ pinCodeStatus }}</b></span> -->
                <br/>
                  <div style="margin-left: 15px;"><b>Text sent to phone number ending in {{ phoneSlice }}, please check it for your one-time code.</b></div>
                  <v-container grid-list-md text-xs-center>
                    <v-row  wrap>
                      <v-col cols="9">
                        <v-text-field label="*one-time code" v-model="pincode" outlined single-line v-mask="'######'" autofocus :rules="pinCodeRules"
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
                      <v-layout justify="center" align-content="center" align="center" column>
                        <v-progress-circular
                          v-if="mfaWaiting"
                          indeterminate
                          color="#319B42"
                          :size="70"
                          width="10"
                          
                        ></v-progress-circular>
                        <br />
                        <span class="status" v-if="mfaWaiting">{{ mfaStatusText }}</span>
                      </v-layout>
                    </span>
                    <v-row  wrap>
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
                    <v-row  wrap>
                      <v-col cols="12" >
                        <hr />
                      </v-col>
                    </v-row>
                    <v-row  wrap >
                      <v-col cols="9" >
                        <v-btn color="blue" dark class="menuBtn" @click.stop="resendCode">
                          Resend Code
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
      <v-row justify="center" align-content="center">
        <v-col cols="10">
          <v-card class="mx-auto">
            <!-- <header
              class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground"
            > -->
            <v-toolbar density="compact"
  flat
  color="secondary"
  class="tbBackground px-4 py-3"
>
              <!-- <v-col style="padding-top: 15px; padding-left: 20px">
                <b>
                  <span style="font-size: 25px"
                    >Account Information &amp; Access</span
                  >
                </b>
              </v-col> -->
              <v-col class="d-flex align-center">
    <span class="font-weight-bold" style="font-size: 25px;">
      Account Information &amp; Access
    </span>
  </v-col>
            </v-toolbar>

            <br />
            <v-alert text color="success" v-if="showSuccessMessages">
              <v-row class="success-message">
                <ul id="successMessage">
                  <li v-for="message in successMessages" v-bind:key="message">
                    {{ message }}
                  </li>
                </ul>
              </v-row>
            </v-alert>

            <v-alert text color="warning" v-if="showErrorMessages">
              <v-row class="error-message">
                <ul id="errorMessage">
                  <li v-for="message in errorMessages" v-bind:key="message">
                    {{ message }}
                  </li>
                </ul>
              </v-row>
            </v-alert>

            <v-row justify="center" align-content="center" >
              <v-col cols="9" style="margin-bottom:30px;">
                <h2>Password</h2>
                <span>To change your password, verify your current password and create a new one. Change your password anytime you think it might have been compromised.</span>
                <v-sheet border rounded elevation="2" :height="50" class="v-sheet-custom" style="margin-top:20px;">
                    <span>Current Password</span>
                    <span>********</span>
                    <v-btn @click.stop="changePasswordPopup">Change</v-btn>
                </v-sheet>
              </v-col>
              <v-col cols="9" style="margin-bottom:30px;">
                <h2>Two-Step Verification</h2>
                <span>Two-step verification provides an added layer of protection to safeguard your online experience. To enable verification through text messages (SMS), update your mobile number here.</span>
                <v-sheet border rounded elevation="2" :height="50" class="v-sheet-custom" style="margin-top:20px;">
                    <span>Mobile Number</span>
                    <span>{{ phoneNumber() }}</span>
                    <v-btn @click.stop="changePhonePopup">Change</v-btn>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <div>
      <span
        :class="
          $vuetify.display.smAndDown
            ? 'waitCircleLoginSm'
            : 'waitCircleLogin'
        "
        :style="
          $vuetify.display.smAndDown
            ? 'width:100%; color: #319B42;'
            : 'width: 25%; color: #319B42;'
        "
      >
        <v-layout justify="center" align-content="center" align="center" column>
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
  </span>
</template>


<script>
import Log from "@/log.js";
import dataService from "@/services/dataService";
import permissions from "@/permissions.js";
import eventBus from "@/event-bus.js";
import { MFA_Settings } from "@/HTTP-common.js";

//Amplify Integration
import {Amplify} from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

var maxErrorCount = 3;
var maxPasswordCount = 5;
var failedPasswordAttempts = 0;
export default {
  name: "AccountSettings",
  mixins: [permissions],

  mounted() {
    Amplify.configure({
      Auth: {
        region: MFA_Settings.Region,
        userPoolWebClientId: MFA_Settings.UserPoolClientId,
        userPoolId: MFA_Settings.UserPoolId
      }
    });
  },

  data() {
    return {
      btnAddDisable: false,
      btnDeleteDisable: true,
      btnUpdateDisable: true,
      modal: false,
      menu2: false,
      menu2small: false,
      valid: true,
      waiting: false,
      failedDialog: false,
      failedText: '',
      statusText: "Please wait",
      showSuccessMessages: false,
      successMessages: [],
      showErrorMessages: false,
      errorMessages: [],
      accountType: "",
      emailRules: [
        v => !!v || "Email is required.",
        v => /.+@.+\..+/.test(v.trim()) || "Email must be valid.",
        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
      ],
      passwordDialog: false,
      showOldPassword: false,
      oldPassword: '',
      password: '',
      showPassword: false,
      oldPasswordRules: [
          v => !!v || "Password is required",
          v => v.length >= 8 || "Password length must be greater than 8",
          v => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v) || "Password must have at least one uppercase letter, one lowercase letter, one number and one special character.",
      ],
      passwordRules: [
          v => !!v || "Password is required",
          v => v != this.oldPassword || "New password cannot match old password",
          v => v.length >= 8 || "Password length must be greater than 8",
          v => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v) || "Password must have at least one uppercase letter, one lowercase letter, one number and one special character.",
      ],
      confirmPassword: '',
      showConfirm: false,
      confirmRules: [
          v => !!v || "Confirm Password is required",
          v => v == this.password || "Confirm password doesn't match"
      ],
      showPhoneInput: false,
      phoneRules: [
        (v) => !!v || "Mobile phone number is required",
        (v) =>
          /^[\d{1}]?[ ]?[.\-( ]?[ ]?\d{3}[ ]?[.\-) ]?[ ]?\d{3}[.\- ]?\d{4}[ ]*$/.test(
            v
          ) || "Please enter a valid phone number with area code.",
      ],
      mfaWaiting: false,
      phoneInput: '',
      pincode: '',
      pinCodeDialog: false,
      pinCodeRules: [
        (v) => !!v || "One-time code is required.",
        v => (v && v.length == 6) || "One-time code must be digits.",
        v => /^\d+$/.test(v) || "One-time code must contain only digits."
      ],
      mfaStatusText: '',
      remainingAttempts: 5,
      userMFAErrorId: 0,
      userMFAErrorCount: 0,
      customPhone: '',
    };
  },
  computed: {
    phoneInputNoMask() {
      return this.phoneInput.replace(/[{()}]/g, '').replace(/\s/g, '').replace(/-/g, '').trim();
    },
    userInfo() {
      try {
        return this.$store.state.currentUser;
      } catch (e) {
        Log.logError(e, "AccountSettingsPage.vue userInfo");
        return "";
      }
    },
    phoneSlice() {
      return this.phoneInputNoMask.slice(-4);
    },
    email() {
      return this.userInfo.user;
    }
  },
  methods: {
    phoneNumber() {
      let phone = this.customPhone ? this.customPhone : this.$store.state.currentUser.phone;
      if (phone) {
        if (phone.startsWith('+')) {
          phone = phone.substring(1);
        }
        if (phone.startsWith('1')) {
          phone = phone.substring(1);
        }
        let match = phone.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
          return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        else {
          return phone;
        }
      }
      return null;
    },
    validate() {
      let isValid = this.$refs.passwordForm.validate();
      return isValid;
    },
    sendAdditionalNotifications(identifier, franchiseId, userName) {
      dataService
        .getAdditionalRecipients(identifier, franchiseId, userName)
        .then((recResponse) => {
          if (recResponse.status == "200") {
            let recResponseData = recResponse.data;
            let recipients = recResponseData.recipientDetails;
            if (recipients) {
              recipients.forEach((item) => {
                this.sendExtraNotification(identifier, item).then(() => {});
              });
            }
          }
        });
    },
    sendExtraNotification(identifier, item) {
      this.statusText = "Sending notification";
      let req = {};
      req.identifier = identifier;
      req.userName = item.userName;
      req.firstName = item.firstName;
      req.lastName = item.lastName;
      req.franchiseId = item.franchiseId;
      req.franchiseName = item.franchiseName;
      return dataService.sendCCMNotification(req);
    },
    setErrorMessages(errors) {
      this.waiting = false;
      if (Array.isArray(errors)) {
        this.errorMessages = errors;
      } else {
        this.errorMessages.push(errors);
      }
      if (this.errorMessages.length > 0) {
        this.showErrorMessages = true;
      }
    },
    setSuccessMessages(messages) {
      this.waiting = false;
      if (Array.isArray(messages)) {
        this.successMessages = messages;
      } else {
        this.successMessages.push(messages);
      }
      if (this.successMessages.length > 0) {
        this.showSuccessMessages = true;
      }
    },
    changePasswordPopup () {
      this.passwordDialog = true;
    },
    closePasswordDialog() {
      this.passwordDialog = false;
    },
    continuePasswordClick() {
      if (!this.validate()){
          return;
      }
      if (failedPasswordAttempts >= maxPasswordCount) {
        this.setErrorMessages("You have exceeded the amount of attempts. At next login, please contact your company's administrator to unlock your account or contact Customer Service at 1-888-488-0134, select option #2.");
      }
      else {
        this.waiting = true;
        dataService.franchiseUserCheckPassword(this.email, this.oldPassword, "")
        .then(response =>{
          
          this.apiUserData = {};
          this.apiUserData = response.data;

          if (this.apiUserData.statusCode == "200") {
            //authentication successful. Can now try and change password.
            failedPasswordAttempts = 0;
            this.changePassword();
          }
          else {
            this.waiting = false;
            this.errorMessages = [];
            
            failedPasswordAttempts++;
            if (failedPasswordAttempts >= maxPasswordCount) {
              this.setErrorMessages("You have exceeded the amount of attempts. At next login, please contact your company's administrator to unlock your account or contact Customer Service at 1-888-488-0134, select option #2.");
            }
            else {
              this.setErrorMessages("A problem occurred trying to update your password. Please try again.");
            }
          }
        })
        .catch((e) => {
          this.waiting = false;
          this.setErrorMessages('There was a problem validating your current password.');
          Log.logError(
            e,
            "AccountSettingsPage.vue validate franchiseUserCheckPassword"
          );
        });
      }
    },
    changePassword(){
      this.successMessages = [],
      this.errorMessages = [],
      this.waiting = true;

      let req = {};
      req.newPassword = this.password;
      req.userName = this.email;
      dataService.tryFranchiseUserChangePassword(req).then(response =>{
          let isSuccess = (response.data.statusCode == 200 && response.data.isSuccess);
          if (!isSuccess) {
              this.waiting = false;
              this.setErrorMessages("Unable to change password.");
              return;
          }

          //Send Notification LNLWOBPASCONF 
          this.sendNotification("LNLWOBPASCONF").then(response => {
              let isNotifySuccess = (response.status == 200);
              if (!isNotifySuccess) {
                  this.waiting = false;
                  this.setErrorMessages('Unable to send notification');
                  return;
              }
              this.setSuccessMessages("Change password successful.");
              this.waiting = false;
              this.passwordDialog = false;
              this.oldPassword = '';
              this.password = '';
              this.confirmPassword = '';
          })                


      }).catch(e => {
        Log.logError(e, "AccountSettingsPage.vue ");
        this.waiting = false;
        this.setErrorMessages("Unable to change password");
      });
    },
    sendNotification(identifier) {
      try {
        this.statusText = "Sending notification";
        let req = {};
        req.identifier = identifier;
        req.userName = this.email;
        var names = this.$store.state.currentUser.name.split(' ');
        req.firstName = names[0];
        req.lastName = names[1];
        req.franchiseId = this.$store.state.currentFranchise.franchiseNumber;
        req.franchiseName = this.$store.state.currentFranchise.franchiseName;
        return dataService.sendCCMNotification(req);
      }
      catch (e) {
        Log.logError(e, 'AccountSettingsPage.vue sendNotification');
      }
    },
    changePhonePopup() {
      this.showPhoneInput = true;
    },
    setupPhone() {
      if (this.$refs.phoneform.validate()) {
        this.mfaWaiting = true;
        let req = {};
        req.userName = this.email;
        req.phoneNumber = this.phoneInputNoMask;
        req.otpMethod = "sms";
        dataService.setUserOTP(req).then(response => {
          this.mfaWaiting = false;
          if (response.data.statusCode == "200") {
            this.amplifySignIn(false);
            this.showPhoneInput = false;
            this.pinCodeDialog = true;
            this.pincode = null;
          }
          else {
            this.setErrorMessages("Unable to save mobile phone number. Please try again later.");
          }
        }).catch(e => {
          this.mfaWaiting = false;
          this.showPhoneInput = false;
          this.failedDialog = true;
          this.setErrorMessages(e);
          Log.logError(e, "ExternalLogin.vue setUserOTPWithPhone");
        });
      }
    },
    amplifySignIn(isVerifyPinCode) {
      Auth.signIn(this.email)
        .then((amplifyUser) => {
          this.mfaUser = amplifyUser;
          this.mfaSession = JSON.stringify(amplifyUser);

          if (isVerifyPinCode) {
            //if coming in from verifyOTP then display number of attempts remaining. 
            //scenario of attempts left is 0 is handled in verifyOTP
            this.mfaWaiting = false;
            this.failedText = "Invalid one-time code. You have " + this.remainingAttempts + " attempts left. New SMS sent to mobile number you logged in with, please check it for your new one-time code.";
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
          Log.logError('One-time code generation failed for - ' + this.email, 'ExternalLogin.vue amplifySignIn');
          this.waiting = false;
          this.mfaWaiting = false;
          this.failedText = 'One-time code generation failed'
          this.failedDialog = true;
          return;
        });
    },
    closePhonePopup() {
      this.showPhoneInput = false;
    },
    resendCode() {
      this.$refs.pincodeform.resetValidation();
      this.waiting = true;
      this.amplifySignIn(false);
    },
    closePinDialog(){
      this.$refs.pincodeform.resetValidation();
      this.pincode = null;
      this.pinCodeDialog = false;
    },
    verifyOTP() {
      if (!this.$refs.pincodeform.validate()) {return; }

      //do not display status text on parent
      this.waiting = false;

      //display mfa status text
      this.mfaWaiting = true;

      //set default failedText
      this.failedText = 'One-time code verification failed.';

      //check verification attempts
      if (this.remainingAttempts <= 0)
      {
        this.mfaWaiting = false;  
        this.failedText = "One-time2 code verification exceeded maximum limits. You are being logged out.";
        this.failedDialog = true;

        this.$refs.pincodeform.resetValidation();      
        this.pincode = null;
        this.pinCodeDialog = false;
        setTimeout(this.$router.push('/logout'), 5000);
        return;
      }

      this.verificationAttempts--;
      this.mfaStatusText = "Verifying one-time code ...";

      this.amplifyVerify();
    },
    amplifyVerify() {
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
            this.confirmSMS();
            let curUser = {};
            curUser = {
              user: this.email,
              name: this.userInfo.name,
              role: this.userInfo.role,
              type: "ext",
              phone: this.phoneInputNoMask,
            };
            eventBus.$emit("login", curUser);
            this.customPhone = this.phoneInputNoMask;
            this.waiting = false;
            this.mfaWaiting = false;
            this.phoneInput = '';
            this.pinCodeDialog = false;
            this.$forceUpdate();
          }
          else {
            this.updUserMFAError(this.userMFAErrorCount);
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "AccountSettingsPage.vue amplifyVerify"
          );

          //have we reached max try limit. if not, then ampify sign in
          this.mfaStatusText = "Updating MFA Status...";
          this.updUserMFAError(this.userMFAErrorCount);
        });
    },
    updUserMFAError(errorCount) {
      //update database with new errorCount
      dataService.postUserMFAError(this.email, this.userMFAErrorId, errorCount, "sms")
        .then((response) =>{
          Log.logInfo('User MFA Error update completed. ');

          if (response.data.statusCode == 200)
          {
            if (errorCount == 0)
            { 
              //MFA is successful. Error Count in database has been reset.
              this.remainingAttempts = maxErrorCount;
              this.userMFAErrorCount = 0;
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
                Log.logInfo('User  ' + this.email + ' will be locked for exceeding mfa attempts ....', 'AccountSettingsPage.vue amplifyVerify');
                this.failedText = `You have exceeded the amount of verification attempts. Please contact your company's administrator to unlock your account or contact Customer Service at 1-888-488-0134, select option #2.`;
                this.failedDialog = true;

                //lock the user
                window.setTimeout(dataService.setlockFranchiseUser(encodeURIComponent(this.email.trim()), true), 1000);


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
            Log.logError(
              'Database update of MFA ErrorCount failed',
              "ExternalLogin.vue updUserMFAError"
            );
          }
        })
        .catch((e) => {
          this.mfaWaiting = false;
          this.failedDialog = true;
          this.setErrorMessages(e);
          Log.logError(
            e,
            "ExternalLogin.vue updUserMFAError"
          );
        });
    },
    confirmSMS() {
        let req = {};
        req.emailId = this.email;
        req.phone = this.phoneInputNoMask;
        dataService.confirmRegisteredUserSMS(req).then(response => {
          if (response.data.statusCode != "200") {
            Log.logInfo("confirmRegisteredUserSMS returned bad status code: " + response.data.statusCode);
            Log.logInfo("confirmRegisterdUserSMS data: " + JSON.stringify(response.data));
          }
        }).catch(e => {
          Log.logError(e, "AccountSettingsPage.vue confirmRegisteredUserSMS");
        });
    },
    handleFailedClose() {
      this.failedDialog = false;
    },
  },

  created() {
    this.waiting = true;
    dataService.getUserMFAError(this.email)
    .then(response => {
          this.apiUserData = {};
          this.apiUserData = response.data;

          this.userMFAErrorId = this.apiUserData.userMFAErrorId;
          this.userMFAErrorCount = this.apiUserData.errorCount;

          //how many attempts are remaining
          this.remainingAttempts = maxErrorCount - this.userMFAErrorCount;
    })
    .catch(e => {
      Log.logError(e);
    });
    this.waiting = false;
  },
};
</script>
<style scoped>
.menuBtn {
  margin-top: 10px;
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
}
.bank-name {
  margin-left: 10px;
  margin-top: -30px;
  margin-bottom: 10px;
  height: 20px;
  font-size: 14px;
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
.tbBackground {
  background-color: #44aba8;
  /* background-color: #00558c; */
}
.v-sheet-custom {
  display: flex;
  align-items: center;
}
.v-sheet-custom * {
  flex: 1;
  margin: 0 1%;
}
</style>
