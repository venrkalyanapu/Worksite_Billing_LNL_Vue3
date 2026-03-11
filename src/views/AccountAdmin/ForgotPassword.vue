<template>
    <div>
        <v-dialog
            v-model="failedDialog"
            persistent
            width="350"
            :content-class="$vuetify.display.mdAndUp ? 'centerInGrid' : ''">
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
                    @click="failedDialog = false"
                    >OK</v-btn
                >
                </v-card-actions>
            </v-card>
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
                  <div style="margin-left: 15px;"><b>{{ message() }}</b></div>
                  <v-container grid-list-md text-xs-center>
                    <v-row  wrap>
                      <v-col cols="9">
                        <v-text-field label="*one-time code" v-model="pincode" density="compact" variant="outlined" single-line autofocus :rules="pinCodeRules" v-mask="'######'"
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
    <v-row justify="center" align-content="center" v-if="!isValid">
        <v-col cols="10">
        <v-card>
            <header class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
            <v-col style="padding-top: 15px; padding-left: 20px; ">
                <span class="title">Forgot Password</span>
            </v-col>
            </header>
            <v-card-text>
            <v-alert text color="success" v-if="showSuccessMessages" class="pa-4">
                <div class="success-message">
                    <ul id="successMessage">
                        <li v-for="message in successMessages" v-bind:key="message">
                            {{ message }}
                        </li>
                    </ul>
                  </div>
            </v-alert>

            <v-alert text color="warning" v-if="showErrorMessages">
                <div class="error-message">
                    <ul id="errorMessage">
                        <li v-for="message in errorMessages" v-bind:key="message">
                            {{ message }}
                        </li>
                    </ul>
                  </div>
            </v-alert>

            <v-form ref="form">
                <v-container>
                    <v-row>
                        <v-text-field label="*Enter the email registered with your account" v-model="emailId" density="compact" variant="outlined"
                        :rules='emailIdRules' required v-bind:readonly="isEmailIdValid" color="primary"
                        v-on:keydown.enter.prevent="handleEnter"
                        ></v-text-field>                                        
                    </v-row>
                    <v-row>
                        <div class="statusMessage">
                            {{ emailStatusMessage }}
                        </div>
                    </v-row>                 
                </v-container>
            </v-form>
                <small>*indicates required field</small>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#f1f3f1"   class="menuBtn" theme="dark" @click="onNext" v-if="!isEmailIdValid">Next</v-btn>
                <v-btn color="#319B42" dark class="menuBtn" @click="onTryReset" v-if="isEmailIdValid && !showSuccessMessages && retryCounter <= maxRetryCount">Reset Password</v-btn>                
                <v-btn class="menuBtn" v-if="isEmailIdValid && !showSuccessMessages && retryCounter > maxRetryCount">Reset Password</v-btn>                                
            </v-card-actions>

        <v-progress-circular
            v-if="waiting"
            :class="$vuetify.display.smAndDown ? 'waitCircleSm' : 'waitCircle'"
            indeterminate
            color="#319B42"
            :size="100"
            width="10"></v-progress-circular>  
       

        </v-card>
        </v-col>
    </v-row>
    <ChangePassword v-if="isValid" :linkDetails="linkDetails"/>
    </div>
</template>
<script>
import { MFA_Settings } from "@/HTTP-common.js";
import dataService from '@/services/dataService';
import ChangePassword from '@/components/AccountAdmin/ChangePassword';
import Log from "@/log.js";

//Amplify Integration
import {Amplify} from '@aws-amplify/core';
import {Auth} from '@aws-amplify/auth';

var maxErrorCount = 3;

export default {
  name: "ForgotPassword",
  components: {
    ChangePassword
  },
  data() {
    return {
        emailId: '',
        emailIdRules: [
            v => !!v || "Email address is required",
            v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Email address must be valid",
        ], 
        isEmailIdValid : false,
        emailStatusMessage : '',
        waiting: false,
        showSuccessMessages: false,
        successMessages: [],
        showErrorMessages: false,        
        errorMessages: [],
        retryCounter: 0,
        maxRetryCount: 3,
        remainingAttempts: 3,
        userMFAErrorId: 0,
        userMFAErrorCount: 0,
        pincode: '',
        pinCodeRules: [
            (v) => !!v || "One-time code is required.",
            v => (v && v.length == 6) || "One-time code must be digits.",
            v => /^\d+$/.test(v) || "One-time code must contain only digits."
        ],
        pinCodeDialog: false,
        mfaWaiting: false,
        linkGuid: '',
        linkDetails: {},
        isValid: false,
        failedDialog: false,
        failedText: '',
    }
  },
  mounted() {
    Amplify.configure({
      Auth: {
        region: MFA_Settings.Region,
        userPoolWebClientId: MFA_Settings.UserPoolClientId,
        userPoolId: MFA_Settings.UserPoolId
      }
    });
  },
  created(){
    this.$store.state.loginType = 'ext';
  },
  methods: {
    message() {
      return "To verify your identity, please enter the 6-digit verification code sent to your preferred contact.";
    },
    cleanup(){
        this.waiting = false;
        this.showSuccessMessages = false;
        this.successMessages = [];
        this.showErrorMessages = false;
        this.errorMessages = [];
        this.$refs.form.resetValidation();
    },
    validate(){
        this.statusMessage = '';
        return this.$refs.form.validate();
    },
    handleEnter() {
        if (this.validate()){
            this.onNext();
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

      //check verification attempts
      if (this.remainingAttempts <= 0)
      {
        this.mfaWaiting = false;  
        this.failedText = "One-time code verification exceeded maximum limits";
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
    amplifySignIn(isVerifyPinCode) {
      this.emailId = this.emailId.trim();
      Auth.signIn(this.emailId)
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
            dataService.getUserMFAError(this.emailId)
                .then(response => {
                    this.apiUserData = response.data;

                    this.userMFAErrorId = response.data.userMFAErrorId;
                    this.userMFAErrorCount = response.data.errorCount;

                    //how many attempts are remaining
                    this.remainingAttempts = maxErrorCount - this.userMFAErrorCount;
                    //all good. Display popup
                    this.waiting = false;
                    this.pincode = null;
                    this.pinCodeDialog = true;
                })
                .catch(e => {
                    Log.logError(e);
                    this.waiting = false;
                    this.dialog = true;
                });
          }

          return;
        })
        .catch((e) => {
          Log.logError(
            e,
            "ExternalLogin.vue amplifySignIn"
          );
          Log.logError('One-time code generation failed for - ' + this.emailId, 'ExternalLogin.vue amplifySignIn');
          this.waiting = false;
          this.mfaWaiting = false;
          this.failedText = 'One-time code generation failed'
          this.failedDialog = true;
          return;
        });
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
            this.generatePasswordGuid();
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
    updUserMFAError(errorCount) {
      //update database with new errorCount
      // I can't do this???
      dataService.postUserMFAError(this.emailId, this.userMFAErrorId, errorCount, "email")
        .then((response) =>{
          Log.logInfo('User MFA Error update completed. ');

          if (response.data.statusCode == 200)
          {
            if (errorCount == 0)
            { 
              //MFA is successful. Error Count in database has been reset.
              this.remainingAttempts = maxErrorCount;
              this.userMFAErrorCount = 0;
              this.pinCodeDialog = false;
            }
            else
            {
              if (this.remainingAttempts > 0)
              {
                //error count is still not maxed out. do retry again.
                this.userMFAErrorId = response.data.userMFAErrorResponseDTO.userMFAErrorDetails.id;

                //call signIn
                this.amplifySignIn(true);
              }
              else 
              {
                this.mfaWaiting = false;
                Log.logInfo('User  ' + this.emailId + ' will be locked for exceeding mfa attempts ....', 'ExternalLogin.vue amplifyVerify');
                this.failedText = `You have exceeded the amount of log in attempts. Please contact your company's administrator to unlock your account or contact Customer Service at 1-888-488-0134, select option #2.`;
                this.failedDialog = true;

                //lock the user
                window.setTimeout(dataService.setlockFranchiseUser(encodeURIComponent(this.emailId.trim()), true, true), 1000);


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
          this.errorMessages.push(e);
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
    closePinDialog(){
      this.$refs.pincodeform.resetValidation();
      this.pincode = null;
      this.pinCodeDialog = false;
    },
    onNext() {
        this.cleanup();
        this.isEmailIdValid = false;
        this.emailStatusMessage = '';                  
        if (this.validate()) {
            this.waiting = true;
            dataService.validateEmailId(this.emailId).then(response => {
                this.waiting = false;
                let responseData = response.data;
                if ((responseData.statusCode != 200) || (!responseData.isEmailIdValid)) {
                    if (responseData.statusCode == 423 && responseData.isLockedOut) {
                        this.setErrorMessages('You have exceeded the amount of log in attempts.');
                        this.setErrorMessages(`Please contact your company's administrator to unlock your account or contact Customer Service at 1-888-488-0134, select option #2.`);                            
                    } else {
                        this.setErrorMessages('An error occurred. Please try again later.');
                    }
                }
                else {
                    this.waiting = true;
                    this.amplifySignIn(false);
                }
            });
        }
    },
    generatePasswordGuid() {
        this.waiting = true;
        let req = {};
        req.emailId = this.emailId;
        dataService.tryResetPassword(req).then(response => {
            let responseData = response.data;
            if ((responseData.statusCode != 200) || (!responseData.isSuccess)) {
                this.setErrorMessages('Unable to reset password');
            } else {
                this.linkGuid = responseData.resetPasswordLink.linkGuid;
                this.validatePasswordLinkGuid();
            }
        });
    },
    validatePasswordLinkGuid() {
        this.waiting = true;
        this.linkDetails = {};
        this.errorMessages = [];

        dataService.validatePasswordLinkUrl(this.linkGuid).then(response => {
            this.waiting = false;
            let responseData = response.data;
            if (responseData.statusCode == 200) {
                let link = responseData.passwordLinkDetails[0];
                if (link.isLinkActive.toLowerCase() == 'yes')
                {
                    this.linkDetails = responseData.passwordLinkDetails[0];
                    this.isValid = true;
                } else {
                    this.setErrorMessages("The registration link has expired. Please contact your account administrator or Customer Service at 1-888-488-0134 and select option2.");
                    this.errorMessages = this.errorMessages;
                }

            } else {
                this.setErrorMessages(responseData.errorMessage);
                this.errorMessages = this.errorMessages;
            }
        })
        .catch(error => { alert(error); });
    },
    setErrorMessages(errors){
        this.waiting = false;
        if (Array.isArray(errors)) {
            this.errorMessages = errors;
        } 
        else {
            this.errorMessages.push(errors);
        }
        if (this.errorMessages.length > 0){
            this.showErrorMessages = true;
        }
    },
    setSuccessMessages(messages){
        this.waiting = false;
        if (Array.isArray(messages)) {
            this.successMessages = messages;
        } 
        else {
            this.successMessages.push(messages);
        }
        if (this.successMessages.length > 0){
            this.showSuccessMessages = true;
        }
    },
  }
}
</script>

<style scoped>
.tbBackground {
  background-color: #44aba8;
}
.title {
  color: #fafafa;
  line-height: 1.2;
  margin-bottom: 2px;
}
.menuBtn {
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
  margin-bottom: 30px;
  background-color: #319B42;
}
</style>