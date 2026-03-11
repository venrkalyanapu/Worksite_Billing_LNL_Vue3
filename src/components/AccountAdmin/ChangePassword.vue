<template>
    <div>
    <v-row justify="center" align-content="center">
        <v-col cols="10">
        <v-card>
            <header class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
            <v-col style="padding-top: 15px; padding-left: 20px; ">
                <span class="title">Change Password</span>
            </v-col>
            </header>
            <v-card-text>
            
            <v-alert
  v-if="showSuccessMessages"
  color="success"
  variant="tonal"
  class="pa-4"
>
  <div class="success-message">
    <ul id="successMessage">
      <li v-for="message in successMessages" :key="message">
        {{ message }}
      </li>
    </ul>
  </div>
</v-alert>

            <v-alert
  v-if="showErrorMessages"
  color="warning"
  variant="tonal"
  class="pa-4"
>
  <div class="error-message">
    <ul id="errorMessage">
      <li v-for="message in errorMessages" :key="message">
        {{ message }}
      </li>
    </ul>
  </div>
</v-alert>

            <v-form ref="form">
                <v-container>
                    <v-row>
                        <span class="welcome">Welcome, {{ linkDetails.firstName }} {{ linkDetails.lastName }}</span>
                    </v-row>
                    <v-row>
                        <v-text-field
  v-model="password"
  label="*New Password"
  density="compact"
  variant="outlined"
  color="primary"
  :type="showPassword ? 'text' : 'password'"
  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
  @click:append-inner="showPassword = !showPassword"
  :rules="passwordRules"
  required
  ref="password"
/>
                    </v-row>
                    <v-row>
                        <v-text-field label="*Confirm New Password" v-model="confirmPassword" density="compact" variant="outlined" color="primary"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        :type="showConfirm ? 'text' : 'password'" @click:append="showConfirm = !showConfirm"
                        :rules='confirmRules' required ref="confirmPassword"                                                
                        ></v-text-field>
                    </v-row>
                </v-container>
            </v-form>
                <small>*indicates required field</small>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#f1f3f1" there="dark" class="menuBtn" @click="changePassword" v-show="!showSuccessMessages">Change Password</v-btn>
                <v-btn color="#f1f3f1" there="dark" class="menuBtn" @click="returnLogin" v-show="showSuccessMessages">Return to Login</v-btn>
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
<script>
import dataService from '@/services/dataService';

export default {
    name: "ChangePassword",  
    props:['linkDetails'],
    data() {
        return {
            waiting: false,
            statusText: 'Please wait',        
            showSuccessMessages: false,
            successMessages: [],
            showErrorMessages: false,        
            errorMessages: [],
            password: '',
            showPassword: false,
            passwordRules: [
                v => !!v || "Password is required",
                v => v.length >= 8 || "Password length must be greater than 8",
                v => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(v) || "Password must have at least one uppercase letter, one lowercase letter, one number and one special character.",
            ],
            confirmPassword: '',
            showConfirm: false,
            confirmRules: [
                v => !!v || "Confirm Password is required",
                v => v == this.password || "Confirm password doesn't match"
            ],
            franchiseName: '',
        };
    },
    methods: {
        validate(){
            return this.$refs.form.validate();
        },    
        changePassword(){
            if (!this.validate()){
                return;
            }

            this.successMessages = [],
            this.errorMessages = [],
            this.waiting = true;

            let req = {};
            req.Id = this.linkDetails.id;
            req.linkGuid = this.linkDetails.linkGuid;
            req.password = this.password;
            dataService.tryChangeUserPassword(req).then(response =>{
                let isSuccess = (response.status == 200 && response.data.isSuccess);
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
                })
            });
        },
        returnLogin() {
            this.$router.push("/login");
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
        sendNotification(identifier) {
            this.statusText = "Sending notification";
            let req = {};
            req.identifier = identifier;
            req.userName = this.linkDetails.emailId;
            req.firstName = this.linkDetails.firstName;
            req.lastName = this.linkDetails.lastName;
            req.franchiseId = this.linkDetails.franchiseId;
            req.franchiseName = this.franchiseName;
            return dataService.sendCCMNotification(req);
        },
    },

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
.welcome {
  padding: 10px;
  font-size: 18px;
}
.menuBtn {
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
  margin-bottom: 30px;
  background-color: #319B42;
}
</style>