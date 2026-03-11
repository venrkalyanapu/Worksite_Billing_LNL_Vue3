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
                >&nbsp;Something went wrong
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
                    theme="dark"
                    class="menuBtn topMargin"
                    @click="failedDialog = false"
                    >OK</v-btn
                >
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="showPhoneInput" max-width="550" persistent>
          <v-form ref="phoneform">
            <v-card>
              <v-card-title class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
                Security Verification
              </v-card-title>
              <v-card-text>
                <!-- <span style="margin-left: 15px;"><b>{{ pinCodeStatus }}</b></span> -->
                <br/>
                  <v-container grid-list-md text-xs-center>
                    <v-row  wrap>
                      <v-col cols="9">
                        <h3>Mobile Number</h3>
                      </v-col>
                      <v-col cols="9">
                        <p>This number will be saved as a future two-step verification process for the user.</p>
                      </v-col>
                      <v-col cols="9">
                        <v-mask-input  label="Telephone" v-model="phoneInput"   variant="outlined"  maxlength="14" autofocus :rules="phoneRules" 
                          @keydown.enter.prevent  mask="(###) ###-####" placeholder="(123) 123-1234" persistent-placeholder />
                      </v-col>
                      <v-col cols="12">
                        <div style="margin-left: 15px;">Enter a valid mobile number. Standard SMS/Messaging rates may apply.</div>
                      </v-col>
                      <v-col cols="6">
                        <v-btn align="right" color="#319B42" dark class="menuBtn topMargin"  ref="submitPhoneNumber" @click.stop="setupPhoneOTP()">
                          Send
                        </v-btn>
                        <v-btn align="right" color="#319B42" dark class="menuBtn topMargin" @click.stop="showPhoneInput = false">
                          Close
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
                      <v-row justify="center" align-content="center" align="center" class="flex-column">
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
                    
                  </v-container>

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
                  <div style="margin-left: 15px;"><b>Message sent to user's device, have them check it for their one-time code.</b></div>
                  <v-container grid-list-md text-xs-center>
                    <v-row row wrap>
                      <v-col cols="8">
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
                      <v-row justify="center" align-content="center" align="center" class="flex-column">
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
                      <v-col cols="12" >
                        <hr />
                      </v-col>
                    </v-row>
                    <v-row row wrap >
                      <v-col cols="6" >
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
        
        <v-dialog v-model="dialog" persistent max-width="550px">
            <template v-slot:activator="{ props }">
                <v-btn color="#319B42" dark size="large" class="menuBtn  mt-9 mb-8 px-6" v-bind="props" @click="addNewUser" style="display: flex; margin-left: auto; margin-right: auto;" cv-show="allowCreateUser && (existingRolesCount > 0)">Create New User</v-btn>
                <v-btn size="large"  class="menuBtn mt-2"  v-show="!allowCreateUser || (existingRolesCount == 0)">Create New User</v-btn>
            </template>
            <v-card>
                <v-card-title>
                <span class="headline">{{ mode }} User Role</span>
                </v-card-title>
                <v-card-text>

               <v-alert v-if="showSuccessMessages" color="success"  variant="tonal" closable class="mb-4">
  
                <div class="success-message">
                    <ul id="successMessage" class="ps-5">
                    <li v-for="message in successMessages" :key="message">
                        {{ message }}
                    </li>
                    </ul>
                </div>
                </v-alert>

                <v-alert v-if="showErrorMessages" color="warning" variant="tonal" class="mb-4">
                  <v-sheet color="transparent" class="text-body-1">
                  <ul id="errorMessage" style="padding-left: 20px; color: red; font-size: 16px;">
                  <li v-for="message in errorMessages" :key="message">
                  {{ message }}
                  </li>
                  </ul>
                  </v-sheet>
                </v-alert>

                <v-alert v-if="showRegisteredUserRoles" text color="info">
                <h3>Email ID already exists for:</h3>
                <v-row v-show="registeredUserRoles.length > 0">
                    <ul id="registeredUserRoles">
                        <li v-for="userRole in registeredUserRoles" v-bind:key="userRole.franchiseId">
                            {{userRole.franchiseId}} - {{ userRole.companyName }} 
                        </li>
                    </ul>
                </v-row>
                <v-divider class="my-4 info" style="opacity: 0.22"></v-divider>                
                <v-row align="center" no-gutters>
                    <v-col class="grow">Do you want to associate <b>{{ this.userName }}</b> to account  
                    <br/><b>{{ this.franchiseId }} - {{ this.franchiseName }}</b></v-col>
                    <span class="shrink">
                        <v-btn color="#319B42" class="menuBtn margin-right-30" @click="createAssociation(true)" v-if="!waiting">Yes</v-btn>
                        <v-btn color="grey"  class="menuBtn margin-right-30" v-if="waiting">Yes</v-btn>
                    </span>
                    <span class="shrink">
                        <v-btn color="#319B42" dark class="menuBtn" @click="createAssociation(false)">No</v-btn>
                    </span>
                </v-row>
                </v-alert>                

                <v-form ref="form">
                    <v-container>
                        <v-row>
                            <v-text-field label="*User Email address (Log-in ID)" v-model="userName"  variant="outlined" density="compact"
                            :readonly="isUpdateMode" v-on:keyup="onChange" ref="emailId" :rules='emailIdRules' required
                            ></v-text-field>                                       
                        </v-row>
                        <v-row>
                        <v-select v-model="selectedRole" :items="roleItems" label="*Role Name" variant="outlined" density="compact"
                              item-title="text" item-value="value" :rules="roleNameRules"  required:readonly="readonly"
                              @update:model-value="roleChangeHandler">
                        </v-select>                    
                        </v-row>
                        <v-row>
                            <v-text-field label="*First Name" v-model="firstName" variant="outlined" density="compact" :rules='firstNameRules' required></v-text-field>
                        </v-row>
                        <v-row>
                            <v-text-field label="*Last Name" v-model="lastName"  variant="outlined" density="compact" :rules='lastNameRules' required></v-text-field>
                        </v-row>
                        <v-row v-if="isUpdateMode">
                            <v-btn class="menuBtn" style="background-color:unset; margin-right:10px; width:100%;" @click.stop="showPhoneInput = true">Add/Update Mobile Number<v-icon>mdi-arrow-right</v-icon></v-btn>
                        </v-row>
                        <v-alert color="blue-grey" dark dense prominent v-if="showUnsubscribeAlert && isUpdateMode" dismissible>
                            User will only receive User ID and Password related emails
                        </v-alert>
                       <v-row v-if="isUpdateMode" class="align-center">
                      <v-switch v-model="isUserActive" :label="`Active: ${isUserActive ? 'Yes' : 'No'}`" 
                         @update:model-value="toggleMFA"color="primary" inset>
                    </v-switch>
  
                    <div style="width:100px" />
                    
                    <v-switch 
                        v-model="subscribeToEmail" 
                        :label="`Email Notifications: ${subscribeToEmail ? 'Yes' : 'No'}`" 
                        @update:model-value="onSubscribeChange"
                        color="primary"
                        inset
                    ></v-switch>
                    </v-row>
                        <v-row v-if="isUpdateMode" style="justify-content:center;">
                            <v-switch :disabled="shouldDisableMFAToggle()" v-model="isUserMFALocked" :label="`MFA Locked: ${isUserMFALocked ? 'Yes' : 'No'}`"></v-switch>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props" style="margin-left:.25rem">mdi-information-outline</v-icon>
                                </template>
                                <span style="max-width: 400px; width: 50vw; display: inline-block;">{{ mfaTooltip }}</span>
                            </v-tooltip>
                        </v-row> 
                        <small>*indicates required field</small>
                    </v-container>
                </v-form>
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#319B42" theme="dark"  variant="flat" class="menuBtn" @click="save" v-show="!readonly && !waiting">Save</v-btn>          
                <v-btn class="menuBtn" v-show="readonly || waiting">Save</v-btn>
                <v-spacer></v-spacer>
                <v-btn color="#319B42" theme="dark" variant="flat" class="menuBtn" @click="close">
                    Close
                </v-btn>          
                <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
            <v-progress-circular
                v-if="waiting"
                :class="$vuetify.display.smAndDown ? 'waitCircleSm' : 'waitCircle'"
                indeterminate
                color="#319B42"
                :size="100"
                width="10">
            <span class="statusText" v-if="waiting">{{ statusText }}</span> 
            </v-progress-circular>
        </v-dialog>
    </div>
</template>
<script>
import dataService from '@/services/dataService';
import permissions from "@/permissions.js";
import Log from "@/log.js";
import eventBus from "@/event-bus.js";

//Amplify Integration
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import { MFA_Settings } from "@/HTTP-common.js";
var maxErrorCount = 3;

export default {
    name: "AddUpdateUserRoleDialog",
    mixins: [permissions],
    props:['franchiseId',  'franchiseName', 'canEditUserRole', 'managedUsers', 'existingRoles'],
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
            emailIdRules: [
                v => !!v || "User Email address (Log-in ID) is required",
                v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
                v => /^[^(())(\])([)]+$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
                v => /^[\w-.]+@([\w-]+.)+[\w-]{2,10}$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
                v => /^(?!.*\.{2})[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(v.trim().toLowerCase()) || "User Email address (Log-in ID) must be valid",
            ],
            firstNameRules: [
                v => !!v || "First Name is required",
                v => /^[^_]+$/.test(v) || "Invalid First Name",
            ],                           
            lastNameRules: [
                v => !!v || "Last Name is required",
                v => /^[^_]+$/.test(v) || "Invalid Last Name",
            ],                           
            mode: 'Create',
            waiting: false,
            failedDialog: false,
            failedText: '',
            statusText: 'Please wait',        
            dialog: false,
            userRoleItem : {},
            userName: '',
            isUserActive: false,
            isUserMFALocked: false,
            firstName: '',
            lastName: '',
            selectedRole: null,
            selectedRoleId: '',
            roleItems: [
                { id: 8, text: "Administrator", value: "administrator" },
                { id: 9, text: "Invoice Adjuster", value: "invoice adjuster" },
                { id: 10, text: "Payment Remitter", value: "payment remitter" },
                { id: 11, text: "Owner", value: "owner" },
            ],            
            roleNameRules: [
                v => !!v || "Role name is required"
            ], 
            showSuccessMessages: false,
            successMessages: [],
            showErrorMessages: false,        
            errorMessages: [],
            showRegisteredUserRoles: false,
            registeredUserRoles:[],
            subscribeToEmail : true,
            showUnsubscribeAlert : false,
            mfaTooltip: 'MFA lock is when a user has three consecutive unsuccessful multifactor authentication one-time passcode attempts. This slider will unlock the user account so they can attempt to login again.',
            phoneInput: '',
            pincode: '',
            pinCodeDialog: false,
            showPhoneInput: false,
            phoneRules: [
                (v) => !!v || "Mobile phone number is required",
                (v) =>
                /^[\d{1}]?[ ]?[.\-( ]?[ ]?\d{3}[ ]?[.\-) ]?[ ]?\d{3}[.\- ]?\d{4}[ ]*$/.test(
                    v
                ) || "Please enter a valid phone number with area code.",
            ],
            pinCodeRules: [
                (v) => !!v || "One-time code is required.",
                v => (v && v.length == 6) || "One-time code must be digits.",
                v => /^\d+$/.test(v) || "One-time code must contain only digits."
            ],
            errors: [],
            mfaWaiting: false,
            mfaStatusText: '',
            userMFAErrorId: '',
            userMFAErrorCount: 0,
        }
    },
    computed: {
        phoneInputNoMask() {
            return this.phoneInput.replace(/[{()}]/g, '').replace(/\s/g, '').replace(/-/g, '').trim();
        },
        existingRolesCount(){
            return this.existingRoles.length;
        },
        allowCreateUser(){
            return this.canEditUserRole;
        },
        readonly() {
            return !this.canEditUserRole;
        },
        isViewMode() {
          return this.mode == "View";
        },
        isUpdateMode() {
          return this.mode == "Update";
        },
        isCreatedMode() {
          return this.mode == "Create";
        },
    },
    methods: {
        shouldDisableMFAToggle() {
            return this.userRoleItem.mfaErrorCount < maxErrorCount;
        },
        toggleMFA() {
            if (this.isUserActive) {
                this.isUserMFALocked = false;
            }
        },
        addNewUser(){
            this.cleanup();
            this.open('Create', { franchiseId: this.franchiseId, userName : '', roleName : null, firstName: '', lastName : '' });
        },
        open(mode, userRoleItem, allUserRoles) {
            this.mode = mode;
            this.allUserRoles = allUserRoles;
            this.selectedRole = '';
            this.selectedRoleId = '';
            
            this.userRoleItem = userRoleItem;
            this.userName = userRoleItem.userName;
            this.phoneInput = userRoleItem.phone;
            this.isUserActive = userRoleItem.isActive;
            this.isUserMFALocked = userRoleItem.mfaErrorCount >= maxErrorCount;
            this.firstName = userRoleItem.firstName;
            this.lastName = userRoleItem.lastName;
            this.subscribeToEmail = userRoleItem.subscribeToEmail;
            this.showUnsubscribeAlert = false;
            if (userRoleItem.roleName) {
            let originalItem = this.roleItems.find(e => e.value == userRoleItem.roleName.toLowerCase());
                if (originalItem.value) {
                    this.selectedRole = originalItem.value;
                    this.selectedRoleId = originalItem.id;
                }
            }
            if (this.userName) {
                // This is an edited user, we need to fetch their mfa error id and count.
                this.waiting = true;
                dataService.getUserMFAError(this.userName)
                .then(response => {
                    this.apiUserData = {};
                    this.apiUserData = response.data;

                    this.userMFAErrorId = this.apiUserData.userMFAErrorId;
                    this.userMFAErrorCount = this.apiUserData.errorCount;

                    //how many attempts are remaining
                    this.remainingAttempts = maxErrorCount - this.userMFAErrorCount;
                    this.waiting = false;
                    this.dialog = true;
                })
                .catch(e => {
                    Log.logError(e);
                    this.waiting = false;
                    this.dialog = true;
                });
            }
            else {
                this.dialog = true;
            }
        },
        onSubscribeChange(){
            this.showUnsubscribeAlert = (!this.subscribeToEmail);
        },
        onChange() {
            this.showSuccessMessages = false;
            this.showErrorMessages = false;
            if (this.$refs.emailId.validate()) {
                setTimeout(this.getExistingUserInfo(), 200);
            }
        },
        isInManagedUsers(userName) {
            if (this.managedUsers) {
                var found = this.managedUsers.find(item => (item.userName.toLowerCase() == userName.toLowerCase()));
                return found;
            }
            return false;
        },
        getExistingUserInfo() {
            let userType = this.$store.state.currentUser.type;
            if (userType.toLowerCase() != 'homeoffice') {
                if (!this.isInManagedUsers(this.userName)) {
                    if (this.firstName) {
                        this.firstName = '';
                    }
                    if (this.lastName) {
                        this.lastName = '';
                    }
                    this.$refs.form.resetValidation();
                    return;
                }
            }
            dataService.verifyFranchiseUserExists(this.userName).then(userResponse =>{
                if (userResponse.status == 200) {
                    let userResponseData = userResponse.data;
                    if (userResponseData.userExists) {
                        if (userResponseData.verifyDetails) {
                            let ud = userResponseData.verifyDetails[0];
                            this.isUserActive = !(ud.isDisabled.toLowerCase() == 'true');
                            this.isUserMFALocked = userResponseData.mfaErrorCount >= maxErrorCount;
                            this.firstName = ud.firstName;
                            this.lastName = ud.lastName;
                        }
                    } 
                }
            });
        },
        validate(){
            return this.$refs.form.validate();
        },
        roleChangeHandler(){
            if (!this.selectedRole) return;
           
            let selectedItem = this.roleItems.find(e => e.value == this.selectedRole.toLowerCase());
            if (selectedItem) {
                this.selectedRoleId = selectedItem.id;
            }
        },
        setupPhoneOTP() {
            if (this.$refs.phoneform.validate()) {
                this.mfaWaiting = true;
                let req = {};
                req.userName = this.userName;
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
            this.userName = this.userName.trim();
            Auth.signIn(this.userName)
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
                    this.mfaWaiting = false;
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
            dataService.postUserMFAError(this.userName, this.userMFAErrorId, errorCount, "sms")
            .then((response) =>{
                Log.logInfo('User MFA Error update completed. ');

                if (response.data.statusCode == 200)
                {
                    this.mfaWaiting = false;
                    if (errorCount == 0)
                    { 
                        //MFA is successful. Error Count in database has been reset.
                        this.remainingAttempts = maxErrorCount;
                        this.userMFAErrorCount = 0;
                        this.closePinDialog();
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
        confirmSMS() {
            let req = {};
            req.emailId = this.userName;
            req.phone = this.phoneInputNoMask;
            dataService.confirmRegisteredUserSMS(req).then(response => {
            if (response.data.statusCode != "200") {
                Log.logInfo("confirmRegisteredUserSMS returned bad status code: " + response.data.statusCode);
                Log.logInfo("confirmRegisterdUserSMS data: " + JSON.stringify(response.data));
            }
            }).catch(e => {
                Log.logError(e, "ExternalLogin.vue confirmRegisteredUserSMS");
            });
        },
        closePinDialog(){
            this.$refs.pincodeform.resetValidation();
            this.pincode = null;
            this.pinCodeDialog = false;
        },
        resendCode() {
      this.$refs.pincodeform.resetValidation();
      this.waiting = true;
      this.amplifySignIn(false);
    },
        save() {
            if (!this.validate()){
                return;
            }

            this.waiting = true
            this.showSuccessMessages = false;
            this.successMessages = [];
            this.showErrorMessages = false;
            this.errorMessages = [];

            //Step #1, if mode = create
            if (this.isCreatedMode) {
                this.verifyUserExists().then(userResponse => {
                    if (userResponse.status == 200) {
                        let userResponseData = userResponse.data;
                        if (!userResponseData.userExists) {
                            //when user is NOT in cognito, add user registration link
                            this.tryCreateRegistrationLink();
                            return;
                        } 
                        
                        //Step #2, check already has role
                        dataService.getFranchiseUserRoleInfo(this.franchiseId, false).then(response =>{
                            this.waiting = false;
                            if (response.status == "200") {
                                let responseData = response.data;
                                if (responseData.userRoles) {
                                    let found = false;
                                    responseData.userRoles.forEach(item => {
                                        if (item.userName == this.userName) {
                                            found = true;
                                        }
                                    });

                                    if (!found) {
                                        //Step #2b, make sure username is in managedUsers
                                        let userType = this.$store.state.currentUser.type;
                                        if (userType.toLowerCase() != 'homeoffice') {
                                            if (!this.isInManagedUsers(this.userName)) {
                                                this.setErrorMessages("Email already exist.");
                                                this.setErrorMessages(`If email is correct, please contact Worksite Customer Service at
                                                 1-888-488-0134, select Option #2.`);
                                                return;
                                            }
                                            //Step #3a, try save
                                            this.addUpdateFranchiseUserRole();
                                        }

                                        if (userType.toLowerCase() == 'homeoffice') {
                                            //We need to check registered companies
                                            this.getRegisteredCompanyInfo().then(companyResponse => {
                                                let companyData = companyResponse.data;
                                                if (companyData.userRoles && companyData.userRoles.length > 0) {
                                                    this.waiting = false;
                                                    this.showRegisteredUserRoles = true;
                                                    this.registeredUserRoles = companyData.userRoles;
                                                }  else {
                                                    //orphan user??
                                                    this.addUpdateFranchiseUserRole();
                                                }
                                            });
                                        }

                                    } else {
                                        this.setErrorMessages("User already exists.");
                                    }
                                }
                            }
                        });

                        
                    }
                });
            }

            if (this.isUpdateMode) {
                this.addUpdateFranchiseUserRole();
            }

        },
        createAssociation(isAnswerYes) {
            this.showRegisteredUserRoles = false;
            if (!isAnswerYes){
                return;
            }
            //Step #3b, try save
            this.addUpdateFranchiseUserRole();
        },
        verifyUserExists() {
            this.statusText = "Verify user exists";
            return dataService.verifyFranchiseUserExists(this.userName);
        },
        getRegisteredCompanyInfo() {
            return dataService.getRegisteredCompanyInfo(this.userName); 
        },
        tryCreateRegistrationLink() {
            //Step A, check role exists
            dataService.getFranchiseUserRoleInfo(this.franchiseId, false).then(response =>{
                if (response.status == "200") {
                    let responseData = response.data;
                    if (responseData.userRoles) {
                        let found = false;
                        responseData.userRoles.forEach(item => {
                            if (item.userName == this.userName) {
                                found = true;
                            }
                        });

                        if (!found) {
                            //Step B, check already has a link
                            dataService.getRegistrationLinks(this.franchiseId, "@franchiseId", "registration").then(response => {
                                let foundLink = false;
                                if (response.status == "200") {
                                    let responseData = response.data;
                                    if (responseData.registrationLinkDetails) {
                                        this.linkItems = responseData.registrationLinkDetails;
                                        this.linkItems.forEach(link => {
                                            if (link.isLinkActive == 'Yes' && link.emailId.toLowerCase().trim() == this.userName.toLowerCase()) {
                                                foundLink = true;
                                            }
                                        });
                                    }
                                }
                                if (!foundLink) {
                                    this.addUserRegistrationLink();
                                } else {
                                    this.setErrorMessages("Registration link already exists.");
                                }
                            });//links

                        } else {
                            //This shouldn't happen
                            //this code is to ensure old data still work
                            this.setErrorMessages("User already exists.");
                        }
                    }
                }
            }); //roleInfo
        },  
        addUserRegistrationLink(){
            this.statusText = "Create user registration link";
            var req = {};
            req.franchiseId = this.franchiseId;
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.emailId = this.userName;
            req.createdBy = this.$store.state.currentUser.user;
            req.isLinkCreatedByHO = (this.$store.state.currentUser.type == "homeoffice"); 
            req.isRegistrantAdminLink = false;
            req.roleId = this.selectedRoleId;
            req.roleName  = this.selectedRole;           
            dataService.createRegistrationLink(req).then(response => {
                let responseData = response.data;
                if (responseData.statusCode == 400) {
                    var errorMsg = JSON.parse(responseData.errorMessage);
                    if (errorMsg.ValidationMessages){
                        this.setErrorMessages(errorMsg.ValidationMessages);
                    }
                    this.waiting = false;
                    return;
                }
                if (responseData.statusCode == 302) {
                    this.setErrorMessages("Administrator already exist for the Account Number " + this.franchiseId + ".");
                    this.setErrorMessages("New user must contact Company Admin for registration.");
                    this.waiting = false;
                    return;
                }                
                if (responseData.statusCode == 200) {
                        //create link success
                        this.sendNotification('LNLWOBREGCOMP', responseData.registrationLink).then(() => {
                            //change emailSent flag
                            this.changeEmailSentStatus(responseData.registrationLink.id).then(()=> {
                                this.setSuccessMessages("Registration link has been created successfully.");
                                eventBus.$emit("registrationLinkCreated", responseData.registrationLink);
                            });
                        });
                } else {
                    //create link failed
                    this.setErrorMessages(responseData.errorMessage);
                }
            });
        },
        addUpdateFranchiseUserRole(){
            let req = {};
            req.franchiseId = this.franchiseId;
            req.userName = this.userName;
            req.roleId = this.selectedRoleId;
            req.roleName = this.selectedRole;
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.subscribeToEmail = this.subscribeToEmail;
            //Save role
            dataService.addUpdateFranchiseUserRole(req).then(response => {
                this.waiting = false;
                if (response.status == "200") {
                    let responseData = response.data;
                    if (responseData.isSuccess) {
                        if (this.isUpdateMode)
                        {
                            //Step 2, update active flag
                            if (this.userRoleItem.isActive != this.isUserActive || (this.userRoleItem.mfaErrorCount >= maxErrorCount && !this.isUserMFALocked)) {
                                //Make sure at least one active admin
                                if (!this.isUserActive) {
                                    if (this.$store.state.currentUser.type != "homeoffice") {
                                        let found = false;
                                        this.allUserRoles.forEach(item => {
                                            if (item.userName != this.userName && item.isActive && item.roleName.toLowerCase() == 'administrator') {
                                                found = true;
                                            }
                                        });
                                        if (!found) {
                                            this.setErrorMessages("There must be at least one active administrator.");
                                            return;
                                        }
                                    }
                                }

                                //don't disable userself 
                                if (!this.isUserActive) {
                                    let isUserSelf = (this.userName.toLowerCase() == this.$store.state.currentUser.user);
                                    if (isUserSelf) {
                                        this.setErrorMessages("Can't disable userself.");
                                        return;
                                    }
                                }

                                this.waiting = true;
                                dataService.setlockFranchiseUser(this.userRoleItem.userName, !this.isUserActive, this.isUserMFALocked).then(lockUserResponse => {
                                    this.waiting = false;
                                    let lockUserData = lockUserResponse.data;
                                    if (lockUserData.statusCode == 200) {
                                        this.setSuccessMessages("User was updated successfully");
                                        req.isActive = this.isUserActive;
                                        eventBus.emit("userRoleUpdated", req);
                                    } else {
                                        this.setErrorMessages("unable to update user staus, please contact your administrator"); 
                                    }
                                });

                            } else {
                                this.setSuccessMessages("User was updated successfully");
                                req.isActive = this.isUserActive;
                                eventBus.emit("userRoleUpdated", req);
                            }
                        }
                        if (this.isCreatedMode)
                        {
                            this.setSuccessMessages("User was created successfully");
                            req.isActive = this.isUserActive; //keep current active flag
                            eventBus.emit("userRoleAdded", req);
                        }
                    } else {
                        this.setErrorMessages(responseData.errorMessage);
                    }
                }
            });
        },
        sendNotification(identifier, link) {
            this.statusText = "Send notification";
            let registrationLink = link ? link.linkURL + link.linkGuid : '';
            let req = {};
            req.identifier = identifier;
            req.userName = this.userName;
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.franchiseId = this.franchiseId;
            req.franchiseName = this.franchiseName;
            req.registrationLink = registrationLink;
            return dataService.sendCCMNotification(req);
        },
        changeEmailSentStatus(id){
            this.statusText = "Change link status";
            let req = {};
            req.Id = id;
            req.isEmailSent = true;
            return dataService.changeEmailSentStatus(req);
        },        
        cleanup(){
            this.waiting = false;
            this.showSuccessMessages = false;
            this.successMessages = [];
            this.showErrorMessages = false;
            this.errorMessages = [];
            this.selectedRole = '';
            if (this.$refs.form) {
                this.$refs.form.resetValidation();            
            }
            this.showRegisteredUserRoles = false;
            this.registeredUserRoles = [];
        },
        close() {
            this.cleanup();
            this.dialog = false;
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
    },
}
</script>
<style scoped>
.waitCircle {
  z-index: 20;
  position: absolute;
  top: 40%;
  left: 45%;
}
.waitCircleSm {
  z-index: 20;
  position: absolute;
  top: 40%;
  left: 55%;
}
.multi-line {
  white-space: pre-line;
}
</style>