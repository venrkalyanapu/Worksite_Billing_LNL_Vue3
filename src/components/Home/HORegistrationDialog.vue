<template>
    <v-dialog v-model="dialog" persistent max-width="640px">
        <template #activator="{ props }">
            <v-btn color="#319B42" dark large class="menuBtn" v-bind="props" v-show="allowCreateLink">Create</v-btn>
            <v-btn large class="menuBtn" v-show="!allowCreateLink">Create</v-btn>
        </template>
        <v-card>
            <v-card-title>
            <span class="headline">Create Administrator Registration Link</span>
            </v-card-title>
            <v-card-text>

            <v-alert text color="success" variant="tonal" v-if="showSuccessMessages" closable>
                <!-- <v-row class="success-message" style="padding-left:20px;color:#4caf50 !important;font-size:16px;"> -->
                    <ul id="successMessage" class="success-message" style="padding-left:20px;color:#4caf50 !important;font-size:16px;">
                        <li v-for="message in successMessages" v-bind:key="message">
                            {{ message }}
                        </li>
                    </ul>
                <!-- </v-row> -->
            </v-alert>

            <v-alert text color="warning" variant="tonal"  v-if="showErrorMessages">
                <!-- <v-row class="error-message"> -->
                    <ul id="errorMessage" class="error-message" style="padding-left:20px;color:red !important;font-size:16px;">
                        <li v-for="message in errorMessages" v-bind:key="message">
                            {{ message }}
                        </li>
                    </ul>
                <!-- </v-row> -->
            </v-alert>

            <v-alert text color="info" v-if="showExistingAdminUserRoles" dismissible>
                User company association for companies with assigned administrators must be performed through the User and Roles - Create User process.
                <!-- <br/>Company: <b>{{ existingAdminUserRoles[0].companyName }}</b> 
                <br/>Email: <b>{{ existingAdminUserRoles[0].userName }}</b>  -->
            </v-alert>

            <v-alert v-if="showRegisteredUserRoles" text color="info">
            <h3>Email is already registered for:</h3>
            <v-row v-show="registeredUserRoles.length > 0">
                <ul id="registeredUserRoles">
                    <li v-for="userRole in registeredUserRoles" v-bind:key="userRole">
                        {{userRole.franchiseId}} - {{ userRole.companyName }} 
                    </li>
                </ul>
            </v-row>
            <v-divider class="my-4 info" style="opacity: 0.22"></v-divider>                
            <v-row align="center" no-gutters>
                <v-col class="grow">Do you want to associate <b>{{ this.emailId }}</b> to 
                <br/><b>{{ this.franchiseId }} - {{ this.companyName }}</b></v-col>
                <span class="shrink">
                    <v-btn color="#319B42" dark class="menuBtn margin-right-30" @click="createAssociation(true)" v-if="!waiting">Yes</v-btn>
                    <v-btn color="grey" dark class="menuBtn margin-right-30" v-if="waiting">Yes</v-btn>
                </span>
                <span class="shrink">
                    <v-btn color="#319B42" dark class="menuBtn" @click="createAssociation(false)">No</v-btn>
                </span>
            </v-row>
            </v-alert>                        

            <v-form ref="form">
                <v-container>
                    <v-row style="padding-top:5px !important">
                        <v-text-field label="*Account Number" v-model="franchiseId" dense variant="outlined" color="primary"
                        :rules='franchiseIdRules' required maxlength="5" v-on:keyup="onChange" ref="franchiseId"
                        ></v-text-field>
                    </v-row>
                    <v-row style="padding-top:5px !important" v-if="companyName.length > 0">
                        <div class="company-name">
                            {{ companyName }}
                        </div>
                    </v-row>
                    <v-row style="padding-top:5px !important">
                        <v-text-field label="*User Email address (Log-in ID)" v-model="emailId" dense variant="outlined" color="primary"
                        :rules='emailIdRules' required
                        ></v-text-field>                                        
                    </v-row>
                    <v-row style="padding-top:5px !important">
                        <v-text-field label="Mobile Phone Number" v-model="phoneNumber" dense variant="outlined" color="primary"
                        :rules='phoneRules' v-mask="'(###) ###-####'"
                        ></v-text-field>                                        
                        </v-row>
                    <v-row>
                        <v-text-field label="First Name" v-model="firstName" :rules='firstNameRules' dense variant="outlined" color="primary"></v-text-field>
                    </v-row>
                    <v-row>
                        <v-text-field label="Last Name" v-model="lastName" :rules='lastNameRules' dense variant="outlined" color="primary"></v-text-field>
                    </v-row>
                </v-container>
            <small>*indicates required field</small>
            </v-form>
            </v-card-text>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#319B42" dark class="menuBtn buttonstyle" @click.stop="tryAddRegistrationLink" v-show="showCreate && !waiting">Create</v-btn>          
            <v-btn class="menuBtn" dark v-show="!showCreate || waiting">Create</v-btn>          
            <v-spacer></v-spacer>
            <v-btn color="#319B42"  dark class="menuBtn buttonstyle" @click="close">Close</v-btn>          
            <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
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
    </v-dialog>
</template>
<script>
import dataService from '@/services/dataService';
import permissions from "@/permissions.js";

export default {
    name: "HORegistrationDialog",
    mixins: [permissions],
    data: () => ({
        franchiseIdRules: [
            v => !!v || "Account Number is required",
            v => v && v.length == 5 || "Account Number is invalid",
            v => /\d{5}/.test(v) || "Account Number is invalid"
        ],
        emailIdRules: [
            v => !!v || "User Email address (Log-in ID) is required",
            v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
            v => /^[^(())(\])([)]+$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
            v => /^[\w-.]+@([\w-]+.)+[\w-]{2,10}$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
            v => /^\S*$/.test(v.trim()) || "User Email address (Log-in ID) must be valid",
            v => /^(?!.*\.{2})[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(v.trim().toLowerCase()) || "User Email address (Log-in ID) must be valid",
        ],
        phoneRules: [
          //   (v) => !!v || "Phone number is required",
          (v) => (!v || /^[\d{1}]?[ ]?[.\-( ]?[ ]?\d{3}[ ]?[.\-) ]?[ ]?\d{3}[.\- ]?\d{4}[ ]*$/.test(v)) || "Please enter a valid phone number with area code.",
        ],
        firstNameRules: [
            v => (v.length == 0 || /^[^_]+$/.test(v)) || "Invalid First Name",
        ],                           
        lastNameRules: [
            v => (v.length == 0 || /^[^_]+$/.test(v)) || "Invalid Last Name",
        ],             
        waiting: false,
        statusText: 'Please wait',        
        dialog: false,
        franchiseId: '',
        companyName:'',
        firstName: '',
        lastName: '',
        emailId: '',
        phoneNumber: '',
        showSuccessMessages: false,
        successMessages: [],
        showErrorMessages: false,        
        errorMessages: [],
        showExistingAdminUserRoles: false,
        existingAdminUserRoles:[],
        showRegisteredUserRoles: false,
        registeredUserRoles:[],
        allowCreateLink: false,
    }),    
    created() {
        //Set permission view
        let createLinkRoles = [          
            "HORegistrationReqUpdate",
            "HORegistrationAssocUpdate"
        ];
        this.allowCreateLink = this.checkSpecificPermission(createLinkRoles);
    },
    computed: {
        showCreate() {
            return this.franchiseId != '' && this.emailId != '';
        }
    },
    methods: {
           cleanup(){
            this.waiting = false;
            this.showSuccessMessages = false;
            this.successMessages = [];
            this.showErrorMessages = false;
            this.errorMessages = [];
            this.franchiseId = '';
            this.firstName = '';
            this.lastName = '';
            this.emailId = '';
            this.companyName = '';
            this.showExistingAdminUserRoles = false;
            this.showRegisteredUserRoles = false;
            this.$refs.form.resetValidation();
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
        close() {
            this.cleanup();
            this.dialog = false;
        },
        validate(){
            return this.$refs.form.validate();
        },
        onChange() {
            this.showSuccessMessages = false;
            this.showErrorMessages = false;
            this.showExistingAdminUserRoles = false;
            this.showRegisteredUserRoles = false;
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
        tryAddRegistrationLink(){
            if (!this.validate()){
                return;
            }

            this.waiting = true;
            this.showSuccessMessages = false;
            this.successMessages = [];
            this.showErrorMessages = false;            
            this.errorMessages = [];
            this.showExistingAdminUserRoles = false;
            this.showRegisteredUserRoles = false;

            //Check if user already registerd
            this.getFranchiseUserRoleInfo(this.franchiseId, false).then(response =>{
                if (response.status == "200") {
                    let responseData = response.data;
                    if (responseData.userRoles) {
                        let found = false;
                        responseData.userRoles.forEach(item => {
                            if (item.userName.toLowerCase().trim() == this.emailId.toLowerCase().trim()) {
                                found = true;
                            }
                        });
                        if (found) {
                            this.setErrorMessages('User Email Address: ' + this.emailId);
                            this.setErrorMessages("This user already exist for the Account Number " + this.franchiseId + ".");
                            this.waiting = false;
                            return;
                        }

                        //Check Cognito first
                        this.verifyUserExists().then(response => {
                            let data = response.data;
                            if (data.userExists) {
                                //if user in cognito, try add association
                                this.addCompanyAssociation();
                                return;
                            }
                            //when user is NOT in cognito, add registration link
                            this.addRegistrationLink();
                        }).catch(error => { alert(error)});

                    }
                }
            });

        },
        addRegistrationLink(){
            this.statusText = "Create registration link";
            var req = {};
            req.franchiseId = this.franchiseId;
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.emailId = this.emailId.trim();
            req.phone = this.phoneNumber.replace(/[{()}]/g, '').replace(/\s/g, '').replace(/-/g, '').trim();
            req.createdBy = this.$store.state.currentUser.user;
            req.isLinkCreatedByHO = true;
            req.isRegistrantAdminLink = true;
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
                        //create link success
                        this.sendNotification('LNLWOBREGCOMP', responseData.registrationLink).then(() => {
                            //change emailSent flag
                            this.changeEmailSentStatus(responseData.registrationLink.id).then(()=> {
                                this.setSuccessMessages("Registration link has been created successfully");
                            });
                        });
                } else {
                    //create link failed
                    this.setErrorMessages(responseData.errorMessage);
                }
            });
        },
        addCompanyAssociation(){
            this.statusText = "Add company association";
            //user already in cognito
            //check if there is any admin for that franchise
            this.getFranchiseUserRoleInfo().then(franchiseResponse => {
                let franchiseData = franchiseResponse.data;
                if (!franchiseData.hasAdministrator) {
                    //We need to check registered companies
                    this.getRegisteredCompanyInfo().then(companyResponse => {
                        let companyData = companyResponse.data;
                        if (companyData.userRoles && companyData.userRoles.length > 0) {
                            this.waiting = false;
                            this.showRegisteredUserRoles = true;
                            this.registeredUserRoles = companyData.userRoles;
                        } else {
                            //this.$emit("registration-message", "user is in cognito, but not resistered to any company??? this shouldn't happen");
                        }
                    });
                } else {
                    this.waiting = false;
                    this.showExistingAdminUserRoles = true;
                    this.existingAdminUserRoles = franchiseData.userRoles;
                }
            });            
        },
        createAssociation(isAnswerYes){
            if (!isAnswerYes){
                this.showRegisteredUserRoles = false;
                this.setErrorMessages("Registration for User – " + this.emailId + " - " + this.firstName + " " + this.lastName + " cancelled");
                return;
            }

            this.waiting = true;
            this.tryCreateUserRole(false);
        },
        tryCreateUserRole(isRequestQueued){
            if (isRequestQueued) {
                //Queued, Send Notification LNLWOBREGAFTRHR 
                this.sendNotification("LNLWOBREGAFTRHR")
                .then(response => {
                    let isSuccess = (response.status == 200);
                    if (!isSuccess) {
                        alert("unable to send notification");
                        return;
                    }

                    this.waiting = false;
                    this.showRegisteredUserRoles = false;
                    this.setSuccessMessages("Company association has been submitted.");
                    this.setSuccessMessages("It may take up to 48 hours to complete the request.");
                    return;
                })
                .catch((error)=>{ alert(error); });  //#5b
                return;
            } 

            //Not queued
            //create user role association
            this.createUserRoleAssociation().then(response => {
                let isSuccess = (response.status == 200 && response.data.isSuccess);
                if (!isSuccess) {
                    alert("error4: unable to save user role.");
                    return;
                }

                this.sendNotification("LNLWOBREGCONF")
                .then(response => {
                    let isSuccess = (response.status == 200);
                    if (!isSuccess) {
                        alert("error5a: unable to send notification");
                        return;
                    }
                    //done
                    this.waiting = false;
                    this.showRegisteredUserRoles = false;
                    this.setSuccessMessages("The user has been successfully associated to the Account Number " + this.franchiseId);
                })

            });

        },
        createUserRoleAssociation() {
            this.statusText = "Create user role association";
            let req = {};
            req.franchiseId = this.franchiseId;
            req.emailId = this.emailId.trim();
            req.roleName = 'administrator';
            req.createdBy = this.$store.state.currentUser.user;            
            return dataService.createUserRoleAssociation(req);
        },            
        getRegisteredCompanyInfo() {
            return dataService.getRegisteredCompanyInfo(this.emailId.trim()); 
        },
        getFranchiseUserRoleInfo() {
            return dataService.getFranchiseUserRoleInfo(this.franchiseId, false); 
        },
        verifyUserExists() {
            this.statusText = "Verify user exists";
            return dataService.verifyFranchiseUserExists(this.emailId.trim());
        },
        setBillingInfo(){
            this.statusText = "Set user billing information";
            return dataService.setBillingInfo(this.franchiseId, 'W', this.emailId.trim());
        },                
        sendNotification(identifier, link) {
            this.statusText = "Send notification";
            let registrationLink = link ? link.linkURL + link.linkGuid : '';
            let req = {};
            req.identifier = identifier;
            req.userName = this.emailId.trim();
            req.firstName = this.firstName;
            req.lastName = this.lastName;
            req.franchiseId = this.franchiseId;
            req.franchiseName = this.companyName;
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
    }
}
</script>


<style scoped>
.error-message {
  color: red;
}
.company-name {
    margin-left: 10px;
    margin-top: -30px;
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
.buttonstyle{
    background-color: rgb(49, 155, 66) !important;
    color: rgb(255, 255, 255) !important;
}
</style>