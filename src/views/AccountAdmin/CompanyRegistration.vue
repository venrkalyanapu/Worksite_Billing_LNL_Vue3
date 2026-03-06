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
            style="background-color: #319b42";
            class="menuBtn topMargin"
            @click="showOTP"
            >OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showHelp" persistent width="800" max-width="70vw">
        <v-card>
            <p v-if="showHelpText" class="helpText">{{ helpText }}</p>
            <v-img v-if="showPhoneHelp" :src="phoneHelpImage" contain width="800" max-width="70vw" />
            <v-img v-if="showEmailHelp" :src="emailHelpImage" contain width="800" max-width="70vw" />
            <v-img v-if="showAccountHelp" :src="invoiceHelpImage" contain width="800" max-width="70vw" />
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="white"
                    dark
                    style="background-color: #319b42;"
                    class="menuBtn topMargin"
                    @click="hideHelp()"
                    >OK</v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="pinCodeDialog" max-width="550" persistent >
        <v-form ref="pincodeform" >
            <v-card>
                <v-card-title style="color:white" class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
                One-Time Code
                </v-card-title>
                <v-card-text>
                <!-- <span style="margin-left: 15px;"><b>{{ pinCodeStatus }}</b></span> -->
                <br/>
                    <div class = "OTPSubtitle" style="margin-left: 15px;color:rgba(0,0,0,.6)"><b>{{ messageType() }}</b></div>
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
                            :class="$vuetify.display.smAndDown ? 'waitCircleLoginSmMFA' : 'waitCircleLoginMFA'"
                            :style="$vuetify.display.smAndDown ? 'width:100%; color: #319B42;' : 'width: 25%; color: #319B42;'">
                        <v-row justify="center" align-content="center" align="center" column>
                        <v-progress-circular
                            v-if="mfaWaiting"
                            indeterminate
                            color="#319B42"
                            :size="70"
                            width="10"></v-progress-circular>
                        <br />
                        <span class="status" v-if="mfaWaiting">{{ mfaStatusText }}</span>
                        </v-row>
                    </span>
                    <v-row row wrap>
                        <v-col cols="12">
                            <hr />
                        </v-col>
                    </v-row>
                    <v-row row wrap >
                        <v-col cols="9" >
                            <v-btn color="blue" dark class="menuBtn"  @click.stop="validate()">
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
    <v-dialog v-model="associateDialog" max-width="550" persistent >
        <v-form ref="associateform" >
            <v-card>
                <v-card-title class="px-2 py-3 text-white v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
                Associate With Company
                </v-card-title>
                <v-card-text class="text-subtitle-2" style="color:#00000099;padding: 1px 24px 1px !important;"> 
                <!-- <span style="margin-left: 15px;"><b>{{ pinCodeStatus }}</b></span> -->
                <br/>
                    <!-- <div style="margin-left: 15px;"> -->
                        <b>
                        You have an account with the companies listed below. Would you like to also associate the email input with your new company, {{ companyName }}?
                     </b>
                    <!-- </div> -->
                    <div style="margin-left: 15px;">
                        <ul>
                            <li v-for="company in companyNames" v-bind:key="company">
                                {{ company }}
                            </li>
                        </ul>
                    </div>
                    <v-container class="text-center">
                        <v-row row wrap>
                            <v-col cols="3">
                                <v-btn align="right" color="#319B42" dark class="menuBtn topMargin" @click.stop="associateWithCompany()">
                                    Yes
                                </v-btn>
                            </v-col>
                            <v-col cols="3">
                                <v-btn align="right" color="#319B42" dark class="menuBtn topMargin" @click.stop="closeAssociate()">
                                    No
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>        
        </v-form>
    </v-dialog>
    <v-row theme="light" justify="center" align-content="center" align="center">
        <v-col cols="8">
        <v-card>
            <v-card-text>
            <v-alert text color="success" variant="tonal" v-if="showSuccessMessages" closable>
                <!-- <v-row class="success-message"> -->
                    <ul id="successMessage" style="padding-left:20px;color:#4caf50;font-size:16px;">
                        <li v-for="message in successMessages" v-bind:key="message">
                            {{ message }}
                        </li>
                    </ul>
                <!-- </v-row> -->
            </v-alert>
          

            <v-alert overlap transition="fade-transition" text color="warning" variant="tonal" v-if="showErrorMessages">
                <!-- <v-row class="error-message" > -->
                    <ul id="errorMessage" style="padding-left:20px;color:red;font-size:16px;">
                        <li v-for="message in errorMessages" v-bind:key="message">
                            {{ message }}
                        </li>
                    </ul>
                <!-- </v-row> -->
            </v-alert>
          
            <v-alert text color="success" class="login-alert" v-if="isRegisteredUser">
                <v-row class="success-message">                    
                    <ul>
                        <li>Click <a class="login-link-text" href="/login">Here</a> to log in</li>
                    </ul>
                </v-row>
            </v-alert>   

            <v-form ref="form">
                <v-container v-if="isDone">
                    <v-row justify="center">
                        <v-icon color="#319B42" style="font-size:140px;">mdi-checkbox-marked-circle-outline</v-icon>
                    </v-row>
                    <v-row justify="center" style="padding-top: 5px;">
                        <span class="title" style="color: rgb(0, 85, 140); font-size: 2rem !important; font-weight: 600;">Registration Complete</span>
                    </v-row>
                    <v-row justify="center" style="padding-top: 10px; font-size: 1.25rem; color: black; padding-bottom: 20px;">
                        <span class="subtitle">You are all set.</span>
                    </v-row>
                    <v-row justify="center">
                        <span style="color: black;">You can now log in to view account information, invoice history, and pay invoices online.</span>
                    </v-row>
                    <v-row justify="center" style="padding-top: 20px;">
                        <v-btn class="menuBtn" style="background-color:unset; margin-right:10px; width:250px;" @click.stop="handleBack"><v-icon>mdi-arrow-left</v-icon>Back to login</v-btn>
                    </v-row>
                </v-container>
                <v-container v-else>
                    <v-row style="padding-top: 5px; ">
                        <span class="title" style="color: rgb(0, 85, 140); font-size: 2rem !important; font-weight: 600;">{{ title }}</span>
                    </v-row>
                    <div v-if="isSearch">
                        <v-row style="padding-top: 10px; font-size: 14px; padding-bottom: 20px; color: black;">
                            <span class="subtitle">{{ subTitle1 }}</span>
                        </v-row>
                        <v-row>
                            <v-text-field label="*Account Number"  color="primary"  v-model="franchiseId"  density="compact" variant="outlined" style="padding-bottom: 5px;" border="info md"  :rules='franchiseIdRules' required maxlength="5"  v-on:keyup="onChange" ref="franchiseId">
                             <template #append-inner>
                                <v-tooltip slot="append" bottom style="color:#ff5252">
                                    <template #activator="{ props }">
                                        <v-icon v-bind="props" @click="showAccountHelp = true">mdi-information-outline</v-icon>
                                    </template>
                                    <span>{{ accountTooltip }}</span>
                                </v-tooltip>
                                </template>
                            </v-text-field>
                        </v-row>
                        <v-row>
                            <v-text-field label="*First Name"  color="primary"  v-model="firstName" :rules='firstNameRules' density="compact" variant="outlined" style="padding-bottom: 5px;"></v-text-field>
                        </v-row>
                        <v-row>
                            <v-text-field label="*Last Name"  color="primary"  v-model="lastName" :rules='lastNameRules' density="compact" variant="outlined" style="padding-bottom: 5px;"></v-text-field>
                        </v-row>
                        <v-row>
                            <v-text-field label="*Billing Contact Phone Number"  color="primary"  v-model="phoneNumber" density="compact" variant="outlined" style="padding-bottom: 5px;"
                            :rules='phoneRules' v-mask="'(###) ###-####'">
                             <template #append-inner>
                                <v-tooltip slot="append" bottom>
                                    <template #activator="{ props }">
                                        <v-icon v-bind="props" @click="showPhoneHelp = true">mdi-information-outline</v-icon>
                                    </template>
                                    <span>{{ phoneTooltip }}</span>
                                </v-tooltip>
                                </template>
                            </v-text-field>
                        </v-row>
                        <v-row>
                            <v-text-field label="*Billing Contact Email"  color="primary"  v-model="businessEmailId" density="compact"  variant="outlined" style="padding-bottom: 5px;"
                            :rules='emailIdRules' ref="businessEmailId">
                            <template #append-inner>
                                <v-tooltip slot="append" bottom>
                                    <template #activator="{ props }">
                                        <v-icon v-bind="props" @click="showEmailHelp = true" align="right">mdi-information-outline</v-icon>
                                    </template>
                                    <span>{{ emailTooltip }}</span>
                                </v-tooltip>
                               </template>
                            </v-text-field>                                        
                        </v-row>
                    </div>
                    <div v-if="isRegister">
                        <v-row>
                            <span>Welcome, <b>{{ companyName }}</b></span>
                        </v-row>
                        <v-row>
                            <span>(Account <b>{{ franchiseId }}</b>)</span>
                        </v-row>
                        <v-row style="padding-bottom:1em;">
                            <span>Not you? <router-link to="/contactus">Contact us.</router-link></span>
                        </v-row>
                        <v-row>
                            <v-text-field label="*Billing Contact Email" v-model="businessEmailId" density="compact" variant="outlined" style="padding-bottom: 5px;" readonly disabled
                            :rules='emailIdRules' ref="emailId"
                            ></v-text-field>
                        </v-row>
                        <div v-if="isRegister">
                            <v-row>
                                <v-text-field label="*Password" v-model="password" density="compact" variant="outlined" style="padding-bottom: 5px;"
                                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                                :type="showPassword ? 'text' : 'password'" @click:append="showPassword = !showPassword"
                                :rules='passwordRules' required ref="password">
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <v-text-field label="*Confirm Password" v-model="confirmPassword" density="compact" variant="outlined" style="padding-bottom: 5px;"
                                :append-icon="showConfirm ? 'visibility' : 'visibility_off'"
                                :type="showConfirm ? 'text' : 'password'" @click:append="showConfirm = !showConfirm"
                                :rules='confirmRules' required ref="confirmPassword"                                                
                                ></v-text-field>
                            </v-row>
                        </div>
                    </div>
                </v-container>
                <div v-if="isRegister">
                    <UserDisclaimerDialog :isProfileUpdated="false"/>
                    <small>*indicates required field</small>
                    <br/>
                    <small>Please note, any additional online access will be managed by the administrator. If the account number is already registered to an active account, please reach out to your business point contact for access.</small>
                </div>
            </v-form>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-col align="center">
                    <div v-if="isSearch">
                        <v-btn class="menuBtn" style="background-color:unset; margin-right:10px; width:250px;border:solid 1px;border-style: outset;" @click.stop="handleBack" v-show="!waiting"><v-icon>mdi-arrow-left</v-icon>Back to login</v-btn>
                        <v-btn color="white" style="background-color:#319b42;margin-left:10px; width:250px;" theme="dark"  class="menuBtn" @click.stop="handleSearch" v-show="!waiting">Search</v-btn>
                    </div>
                    <v-btn v-if="isRegister" color="#319B42" style="margin-left:10px; width:250px;" dark class="menuBtn" @click.stop="handleSave" v-show="!waiting">Verify</v-btn>
                </v-col>
            </v-card-actions>

        <v-progress-circular
            v-if="waiting"
            :class="$vuetify.display.smAndDown ? 'waitCircleSm' : 'waitCircle'"
            indeterminate
            color="#319B42"
            :size="100"
            width="10"
            >
            <span class="statusText" v-if="waiting">{{ statusText }}</span> 
        </v-progress-circular>  
       

        </v-card>
        </v-col>
    </v-row>

    </div>
</template>
<script setup>
import phoneHelpImage from '@/assets/125-form-phone.png';
import emailHelpImage from '@/assets/125-form-email.png';
import invoiceHelpImage from '@/assets/invoice-example.png';
</script>
<script>
import dataService from '@/services/dataService';
import emitter from "@/event-bus.js";
import UserDisclaimerDialog from '../../components/AccountAdmin/UserDisclaimerDialog.vue'
import Log from "@/log.js";

import { MFA_Settings } from "@/HTTP-common.js";
import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

var maxErrorCount = 3;

export default {
    name : "CompanyRegistration",
    components: {
        UserDisclaimerDialog
    },
    data() {
        return {
            franchiseIdRules: [
                v => !!v || "Account Number is required",
                v => v && v.length == 5 || "Account Number is invalid",
                v => /\d{5}/.test(v) || "Account Number is invalid"
            ],
            emailIdRules: [
                v => !!v || "Billing Contact Email is required",
                v => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) || "Email address must be valid",
                v => (!v || /^[^(())(\])([)]+$/.test(v.trim())) || "Email address must be valid",
            ],
            phoneRules: [
                (v) => !!v || "Billing Contact Phone Number is required",
                (v) => (!v || /^[\d{1}]?[ ]?[.\-( ]?[ ]?\d{3}[ ]?[.\-) ]?[ ]?\d{3}[.\- ]?\d{4}[ ]*$/.test(v)) || "Please enter a valid phone number with area code.",
            ],
            pinCodeRules: [
                (v) => !!v || "One-time code is required.",
                v => (v && v.length == 6) || "One-time code must be digits.",
                v => /^\d+$/.test(v) || "One-time code must contain only digits."
            ],
            firstNameRules: [
                v => !!v || "First Name is required",
                v => (v.length == 0 || /^[^_]+$/.test(v)) || "Invalid First Name",
            ],
            lastNameRules: [
                v => !!v || "Last Name is required",
                v => (v.length == 0 || /^[^_]+$/.test(v)) || "Invalid Last Name",
            ],
            passwordRules: [
                v => !!v || "Password is required",
                v => v.length >= 8 || "Password length must be greater than 8",
                v => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v) || "Password must have at least one uppercase letter, one lowercase letter, one number and one special character.",
            ],
            confirmRules: [
                v => !!v || "Confirm Password is required",
                v => v === this.password || "Confirm password doesn't match"
            ],
            waiting: false,
            statusText: 'Please wait',
            accountTooltip: 'Click to see example invoice showing where to find your Account/Company Number',
            phoneTooltip: 'Click to see example form showing where to find your Billing Contact Phone Number',
            emailTooltip: 'Click to see an example form showing where to find your Billing Contact Email',
            franchiseId: '',
            pin: '',
            companyName:'',
            companyNames: [],
            firstName: '',
            lastName: '',
            emailId: '',
            businessEmailId: '',
            phoneNumber: '',
            showTooltip: false,
            password: '',
            showPassword: false,
            confirmPassword: '',
            showConfirm: false,
            showSuccessMessages: false,
            successMessages: [],
            showErrorMessages: false,
            errorMessages: [],
            showAccountHelp: false,
            showPhoneHelp: false,
            showEmailHelp: false,
            isRegisteredUser: false,            //user register to current company
            isRegisterToOtherCompany: false,    //user register to other company
            existingRoles: null,
            isSearch: true,
            isRegister: false,
            isDone: false,
            isAccepted: false,
            associateDialog: false,
            pinCodeDialog: false,
            pincode: null,
            failedText: null,
            failedDialog: false,
            mfaWaiting: false,
            mfaStatusText: "",
            remainingAttempts: 3,
            verificationAttempts: 0,
            userMFAErrorCount: 0,
            mfaUser: {},
            mfaSession: {},
            linkId: 0,
            linkGuid: '',
            failedGeneration: false,
        };
    },
    mounted() {
        // Uncertain if we will be using amplify at all. This is copied over from the external login page to mimic the functionality at the very least.
        Amplify.configure({
            Auth: {
                region: MFA_Settings.Region,
                userPoolWebClientId: MFA_Settings.UserPoolClientId,
                userPoolId: MFA_Settings.UserPoolId
            }
        });
    },
    created(){
        Amplify.configure({
        Auth: {
            region: MFA_Settings.Region,
            userPoolWebClientId: MFA_Settings.UserPoolClientId,
            userPoolId: MFA_Settings.UserPoolId
        }
        });
        this.$store.state.loginType = 'ext';
        emitter.on("is-accepted-changed", val => {
            this.isAccepted = val;
        });
    },
    beforeDestroy() {
        emitter.off("is-accepted-changed");
    },   
    methods: {
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
            else {
                this.showErrorMessages = false;
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
        validate(){
            this.errorMessages = [];
            this.showErrorMessages = false;
            let valid = this.phoneNumber && this.businessEmailId;
            if (!valid) {
                this.setErrorMessages('Phone number and email address are required.');
            }
            return this.$refs.form.validate() && valid;
        },
        saveValidate() {
            this.errorMessages = [];
            this.showErrorMessages = false;
            let valid = this.$refs.form.validate() && this.isAccepted;
            if(!this.isAccepted) {
                this.setErrorMessages("Please accept terms and conditions to register.");
            }
            return valid;
        },
        onChange() {
            this.showSuccessMessages = false;
            this.showErrorMessages = false;
            if (this.$refs.franchiseId.validate()) {
                setTimeout(this.getCompanyName(), 200);
            }
            else {
                this.companyName = '';
            }
        },
        getCompanyName() {
            dataService.getCompanyInfo(this.franchiseId).then(response => {
                let responseData = response.data;
                if (responseData.statusCode == 200 || responseData.companyName) {
                    this.companyName = responseData.companyName;
                }
            });
        },
        handleBack() {
            this.$router.push('/login');
        },
        handleSearch() {
            if (!this.validate()){
                return;
            }

            this.waiting = true;
            this.successMessages = [];
            this.errorMessages = [];
            this.isRegisteredUser = false;
            this.isRegisterToOtherCompany = false;
            this.existingRoles = null;

            let req = {};
            req.franchiseId = this.franchiseId;
            req.emailId = this.businessEmailId.trim();
            req.phone = this.phoneNumber.replace(/[{()}]/g, '').replace(/\s/g, '').replace(/-/g, '').trim();
            req.firstName = this.firstName;
            req.lastName = this.lastName;            

            //Step #1, validate email + phone
            dataService.validateUserSelfRegister(req).then(companyResponse => {
                let companyResponseData = companyResponse.data;
                this.waiting = false;
                if (companyResponseData.isAuthenticated) {
                    this.$store.commit("setJWT", companyResponseData.wsbApiAuthToken);
                 } else {
                    if (companyResponseData.statusCode == 208) {
                        let messages = [];
                        messages.push("Administrator already exists for the Account Number " + this.franchiseId);
                        messages.push("New user must contact Company Admin for registration.");
                        this.setErrorMessages(messages);
                    }
                    else if (companyResponseData.statusCode == 203) {
                        if (!companyResponseData.emailValid && companyResponseData.phoneValid) {
                            this.setErrorMessages("The email provided does not match our records. Please contact customer service at 888-488-0134 to assist.");
                        }
                        else if (!companyResponseData.phoneValid && companyResponseData.emailValid) {
                            this.setErrorMessages("The phone number provided does not match our records. Please contact customer service at 888-488-0134 to assist.");
                        }
                        else {
                            this.setErrorMessages("Unable to find account information.");
                        }
                    }
                    return;
                }
                this.handleCheckEmail();
            });
        },
        handleCheckEmail() {
            this.showErrorMessages = false;
            this.errorMessages = [];
            this.waiting = true;
            this.successMessages = [];
            this.errorMessages = [];
            this.isRegisteredUser = false;
            this.isRegisterToOtherCompany = false;
            this.existingRoles = null;         

            //Step #1, validate email + phone
            dataService.getRegisteredCompanyInfo(this.businessEmailId).then(companyResponse => {
                let companyResponseData = companyResponse.data;
                this.companyNames = [];
                if (companyResponseData.hasAdministrator) {
                    for (let company of companyResponseData.userRoles) {
                        this.companyNames.push(company.companyName);
                    }
                    this.checkOTPLockout();
                 } else {
                    dataService.verifyFranchiseUserExists(this.businessEmailId).then(userResponse => {
                        if (userResponse.status == 200) {
                            let userResponseData = userResponse.data;
                            if (userResponseData.userExists) {
                                this.setErrorMessages('This email address is already in use and cannot be used to register a new account.');
                                this.waiting = false;
                                this.isRegister = false;
                                this.isSearch = true;
                            }
                            else {
                                // TODO: Might need an additional call to check the SQL database for email.
                                this.waiting = false;
                                this.isSearch = false;
                                this.isRegister = true;
                            }
                        }
                    });
                }
            });
        },
        handleSave() {
            if (!this.saveValidate()) {
                return;
            }
            this.waiting = true;
            this.statusText = "";
            var req = {};
            req.franchiseId = this.franchiseId;
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.emailId = this.businessEmailId.trim();
            req.createdBy = 'web-ui';
            req.selfRegister = true;
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
                if (responseData.statusCode == 404) {
                    this.setErrorMessages("Invalid Account Number " + this.franchiseId + ".");
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
                    this.linkId = responseData.registrationLink.id;
                    this.linkGuid = responseData.registrationLink.linkGuid;
                    //this.checkOTPLockout();
                    this.save();
                } else {
                    //create link failed
                    this.setErrorMessages(responseData.errorMessage);
                }
            });
        },
        save() {
            this.waiting = true;            
            this.successMessages = [];

            this.createFranchiseUser().then(response => {
                let isSuccess = (response.status == 200 && response.data.statusCode == 200);
                Log.logInfo("Cognito create franchise user: ",
                    JSON.stringify({ "response": response.data,
                    "emailId": this.businessEmailId,
                    "firstName": this.firstName,
                    "lastName": this.lastName,
                    "franchiseId": this.franchiseId
                }));
                if (!isSuccess){
                    Log.logError("Unable to save user info to Cognito", this.businessEmailId);

                    this.setErrorMessages("Unable to save user info.");
                    
                    //Step #2b failed, Send Notification LNLWOBREGFAIL 
                    this.sendNotification("LNLWOBREGFAIL").then(response => {
                        let isSuccess = (response.status == 200);
                        if (!isSuccess) {
                            this.setErrorMessages("Unable to send notification");
                            return;
                        }
                    });
                    return;
                }//!isSuccess

                //checking for email existing in cognito
                dataService.validateEmailId(this.businessEmailId).then(r => {
                    this.waiting = false;
                    let responseData = r.data;
                    if ((responseData.statusCode != 200) || (!responseData.isEmailIdValid)) {
                        Log.logError("Cognito error during registration", Error(JSON.stringify({ "responseData": responseData, "emailId": this.businessEmailId })));
                        this.setErrorMessages('An error occurred. Please try again later.');
                    }
                    else {
                        this.waiting = true;
                        //change link status
                        Log.logInfo("User info is saved to Cognito", this.businessEmailId);
                        setTimeout(this.changeLinkStatus(), 1000);
                        this.saveRegistrant();
                    }
                });
            })
            .catch((error) => { 
                Log.logError("Unexpected error", error);
                this.setErrorMessages(error); 
            }); //#2b;
        },
        createFranchiseUser(){
            this.statusText = "Save user information";
            let cognitoReq = {};
            cognitoReq.userName = this.businessEmailId;
            cognitoReq.password = this.password;
            cognitoReq.firstName = this.firstName;
            cognitoReq.lastName = this.lastName;
            cognitoReq.email = this.businessEmailId;
            cognitoReq.franchiseId = this.franchiseId;
            cognitoReq.role = 'Administrator';
            cognitoReq.isRegistrant = true;
            return dataService.franchiseUserRegister(cognitoReq);
        },
        changeLinkStatus() {
            var req = {};
            req.id = this.linkId;
            req.fieldName = "islinkactive";
            req.isLinkActive = false;
            dataService.changeLinkStatus(req).then(response => { 
            if (response.data.statusCode != 200) {
                this.setErrorMessages('unable to set link status');          
            }
            });
        },
        saveRegistrant() {
            //Step #4, Create role
            this.createUserRole().then(response => {
            let isSuccess = (response.status == 200 && response.data.isSuccess);
            if (!isSuccess) {
                this.setErrorMessages("Unable to save user role.");
                Log.logError("Unable to createUserRole for Registrant", this.businessEmailId);
                this.disableFranchiseUser();
                return;
            }
            Log.logInfo("Registrant is saved", this.businessEmailId);
            //Step #5a, Send Notification LNLWOBREGCONF 
            this.sendNotification("LNLWOBREGCONF").then(response => {
                let isSuccess = (response.status == 200);
                if (!isSuccess) {
                    this.setErrorMessages("Unable to send notification");
                    return;
                }

                //done
                this.waiting = false;
                this.checkOTPLockout();
            })
            .catch((error)=>{ this.setErrorMessages(error); });  //#5

            })
            .catch((error) => { this.setErrorMessages(error); }); //#4

            return;
        },
        createUserRole() {
            this.statusText = "Create user role";
            let req = {};
            req.franchiseId = this.franchiseId;
            req.emailId = this.businessEmailId;
            req.roleName = 'Administrator';
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.isRegistrantAdminLink = false;
            req.isRegistrant = true;
            req.selfRegister = true;
            req.Id = this.linkId;
            req.linkGuid = this.linkGuid;
            req.isRegistrantUserVerified = false;
            return dataService.createUserRole(req);
        },
        checkOTPLockout() {
            dataService.getSelfRegisterMFAError(this.franchiseId).then(response => {
                if (response.data.isLockedout) {
                    this.errorMessages = [];
                    this.failedText = "You have exceeded the amount of verification attempts. Please contact Customer Service at 1-888-488-0134, select option #2.";
                    this.failedDialog = true;
                    this.waiting = false;
                    this.mfaWaiting = false;
                }
                else {
                    this.remainingAttempts -= response.data.errorCount;
                    this.userMFAErrorCount = response.data.errorCount;
                    this.amplifySignIn(false);
                }
            }).catch(e => {
                Log.logError(
                e,
                "CompanyRegistration.vue checkOTPLockout"
                );
                Log.logError('Check OTP Lockout failed for - ' + this.businessEmailId, 'CompanyRegistration.vue checkOTPLockout');
                this.waiting = false;
                this.mfaWaiting = false;
                this.failedText = 'Could not verify OTP lockout';
                this.failedDialog = true;
            });
        },
        closePinDialog() {
            this.$refs.pincodeform.resetValidation();      
            this.pincode = null;
            this.pinCodeDialog = false;
        },
        verifyOTP() {
            if (!this.$refs.pincodeform.validate()) { return; }

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
        showOTP() {
            this.pincode = null;
            this.failedDialog = false;
            if (!this.failedGeneration) {
                this.pinCodeDialog = true;
            }
        },
        amplifySignIn(isVerifyPinCode) {
            this.businessEmailId = this.businessEmailId.trim();
            Auth.signIn(this.businessEmailId)
            .then((amplifyUser) => {
                this.mfaUser = amplifyUser;
                this.mfaSession = JSON.stringify(amplifyUser);
                this.failedGeneration = false;
                if (isVerifyPinCode) {
                    //if coming in from verifyOTP then display number of attempts remaining. 
                    //scenario of attempts left is 0 is handled in verifyOTP
                    this.mfaWaiting = false;
                    this.failedText = "Invalid one-time code. You have " + this.remainingAttempts + " attempts left. New one-time code sent to device you are attempting to verify, please check it for your new one-time code.";
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
                    "CompanyRegistration.vue amplifySignIn"
                );
                Log.logError('One-time code generation failed for - ' + this.businessEmailId, 'CompanyRegistration.vue amplifySignIn');
                this.waiting = false;
                this.mfaWaiting = false;
                this.failedText = 'One-time code generation failed'
                this.failedDialog = true;
                this.failedGeneration = true;
            return;
            });
        },
        amplifyVerify() {
            //update attempts made 
            this.remainingAttempts--;
            this.userMFAErrorCount++;

            //verify pin code
            // As noted above, unsure if we are using this library.
            Auth.sendCustomChallengeAnswer(this.mfaUser, this.pincode)
            .then(() => {
                //update userMFAErrorCount
                this.mfaStatusText = "Updating MFA Status...";

                //pin code verification is good. Reset errorCount
                this.updUserMFAError(-1);
                this.confirmRegisteredUser();
                this.closePinDialog();
                if (!this.isRegister) {
                    this.associateDialog = true;
                }
                else {
                    this.isRegister = false;
                    this.isDone = true;
                }
            })
            .catch((e) => {
                Log.logError(
                    e,
                    "CompanyRegistration.vue amplifyVerify"
                );

                //have we reached max try limit. if not, then ampify sign in
                this.mfaStatusText = "Updating MFA Status...";
                this.updUserMFAError(this.userMFAErrorCount);
            });
        },
        updUserMFAError(errorCount) {
            //update database with new errorCount
            dataService.updateSelfRegisterMFAError(this.franchiseId, errorCount).then((response) =>{
                Log.logInfo('User MFA Error update completed. ');

                this.mfaWaiting = false;
                if (response.data.statusCode == 200)
                {
                    if (errorCount <= 0)
                    { 
                        //MFA is successful. Error Count in database has been reset.
                        this.remainingAttempts = maxErrorCount;
                        this.userMFAErrorCount = 0;
                        this.$refs.pincodeform.resetValidation();      
                        this.pincode = null;
                        this.pinCodeDialog = false;
                    }
                    else
                    {
                        if (this.remainingAttempts > 0)
                        {
                            //call signIn
                            this.statusText = "Regenerating one-time code ...";
                            this.amplifySignIn(true);
                        }
                        else 
                        {
                            Log.logInfo('User  ' + this.businessEmailId + ' will be locked for exceeding mfa attempts ....', 'CompanyRegistration.vue amplifyVerify');
                            this.failedText = `You have exceeded the amount of verification attempts. Please contact Customer Service at 1-888-488-0134, select option #2.`;
                            this.failedDialog = true;

                            //lock the user
                            window.setTimeout(dataService.updateSelfRegisterMFAError(this.franchiseId, this.maxErrorCount), 1000);


                            //close mfa pop up
                            this.$refs.pincodeform.resetValidation();      
                            this.pincode = null;
                            this.pinCodeDialog = false;
                            return;
                        }
                    }
                }
                else {
                    Log.logError(
                        'Database update of MFA ErrorCount failed',
                        "CompanyRegistration.vue updUserMFAError"
                    );
                }
                })
                .catch((e) => {
                    this.mfaWaiting = false;
                    this.setErrorMessages(e);
                    Log.logError(
                        e,
                        "CompanyRegistration.vue updUserMFAError"
                    );
                });
        },
        confirmRegisteredUser() {
            let req = {};
            req.emailId = this.businessEmailId.trim();
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
        closeAssociate() {
            this.associateDialog = false;
            this.isRegister = false;
            this.isSearch = true;
        },
        associateWithCompany() {
            this.createUserRoleAssociation().then(response => {
                let isSuccess = (response.status == 200 && response.data.isSuccess);
                this.associateDialog = false;
                this.isRegister = false;
                this.isSearch = false;
                if (!isSuccess) {
                    this.waiting = false;
                    alert("Unable to save user role.");
                    return;
                }

                this.sendNotification("LNLWOBREGCONF")
                .then(response => {
                    let isSuccess = (response.status == 200);
                    if (!isSuccess) {
                        this.waiting = false;
                        alert("Unable to send notification");
                        return;
                    }
                    //done
                    this.waiting = false;
                    this.isRegister = false;
                    this.isDone = true;
                })

            });
        },
        createUserRoleAssociation() {
            this.waiting = true;
            this.statusText = "Create user role association";
            let req = {};
            req.franchiseId = this.franchiseId;
            req.emailId = this.businessEmailId.trim();
            req.roleName = 'administrator';
            req.createdBy = this.businessEmailId.trim();          
            return dataService.createUserRoleAssociation(req);
        },
        sendNotification(identifier) {
            this.statusText = "Sending notification";
            let req = {};
            req.identifier = identifier;
            req.userName = this.businessEmailId;
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.franchiseId = this.franchiseId;
            req.franchiseName = this.companyName;
            return dataService.sendCCMNotification(req);
        },
        messageType() {
            return 'To verify your identity, please enter the 6-digit verification code sent to ' + this.maskedEmail + '. This code expires in 10 minutes.';
        },
        hideHelp() {
            this.showAccountHelp = false;
            this.showEmailHelp = false;
            this.showPhoneHelp = false;
        }
    },
    computed: {
        showHelp() {
            return this.showAccountHelp || this.showEmailHelp || this.showPhoneHelp;
        },
        showHelpText() {
            return this.showEmailHelp || this.showPhoneHelp;
        },
        helpText() {
            if (this.showEmailHelp) {
                return 'This is the same email you input into the circled field below on the 125 form';
            }
            return 'This is the same phone number you input into the circled field below on the 125 form';
        },
        
        maskedEmail() {
            if (this.businessEmailId) {
                let name = this.businessEmailId;
                let atIndex = name.indexOf('@');
                let periodIndex = name.indexOf('.', atIndex + 1);
                let maskedUser = name.substr(0, 1) + '****' + name.substr(atIndex - 1, 1) + '@*.' + name.substr(periodIndex + 1);
                return maskedUser;
            }
            return null;
        },
        title() {
            let title = 'Create an account';
            return title;
        },
        subTitle1(){
            let subTitle = `To set up an administrator for your account, please complete the fields below.`;
            return subTitle;
        }
    }
}
</script>
<style scoped>
.row+.row {
    margin-top: unset;
}
.helpText {
  margin: unset;
  padding-top: .5rem;
  text-align: center;
}
.success-message {
  max-width: 650px;    
}
.error-message {
  color: red;
  max-width: 650px;
}
.company-name {
    margin-left: 10px;
    margin-top: -25px;
    margin-bottom: 10px;
    height: 20px;;
    font-size: 14px;
}

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
.statusText {
  margin-top: 120px;
  margin-left: 100px;
  width: 300px;
}
.margin-right-30 {
    margin-right: 30px;
}
.OTPSubtitle{
    font-size: .875rem;
    font-weight: 400;
    line-height: 1.375rem;
    letter-spacing: .0071428571em;
    color: rgba(0, 0, 0, .6);
}
</style>