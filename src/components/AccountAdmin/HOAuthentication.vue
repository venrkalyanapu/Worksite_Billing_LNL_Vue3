<template>
    <div>
        <v-row v-show="errorMessages.length > 0" class="error-message">
            <ul id="example-1">
                <li v-for="message in errorMessages" v-bind:key="message">
                    {{ message }}
                </li>
            </ul>
        </v-row>

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
import dataService from '@/services/dataService';
import eventBus from "@/event-bus.js";

export default {
    name: "HOAuthentication",
    data() {
        return {
            waiting: false,
            errorMessages: [],
            validADRoles: [],
            statusText: '',
            userName: '',
            isAuthenticated: false,
        }
    },
    created() {
        dataService.getHomeOfficeADRoles().then(response => {
            if (response.status == 200) {
                this.validADRoles = response.data.roles;
            }
        });
    },    
    mounted() {
        this.getUserPrincipal();
    },
    methods: {
        setErrorMessages(errors){
            if (Array.isArray(errors)) {
                this.errorMessages = errors;
            } 
            else {
                this.errorMessages.push(errors);
            }
        }, 
        getUserPrincipal(){
            this.statusText = "Authenticating...";          
            this.waiting = true;
            dataService.getUserPrincipal().then(response => {
                this.waiting = false;
                let responseData = response.data;
                if (responseData.statusCode == 200 && responseData.status == 'valid') {
                    let domainUserName = responseData.domainUserName;
                    this.userName = domainUserName.substring(domainUserName.lastIndexOf('\\') + 1);
                    this.isAuthenticated = responseData.isAuthenticated;
                    
                    //Get permissions
                    this.statusText = "Getting Profile...";
                    this.waiting = true;
 
                    dataService.hoGetProfile(this.userName).then(response => {
                        this.waiting = false;
                        let curUser = {};
                        let userProps = response.data;
                        let WOBSRoles = [];

                        for (let adRole of response.data.adRoles) {
                            for (let validRole of this.validADRoles) {
                                if (adRole.role.trim().toUpperCase() == validRole.adRoleName.trim().toUpperCase()) {
                                    WOBSRoles.push(adRole.role);
                                }
                            }
                        }

                        //WOBSRoles = ["TG_WOBSTest_NB_Verification_Clerk"];
                        
                        if (WOBSRoles.length) WOBSRoles.push("HomeOfficeUser");
                        let counter = WOBSRoles.length;
                        let userRoles = [];

                        this.statusText = "Retrieving permissions...";
                        this.waiting = true;
                      for (let WOBSRole of WOBSRoles) {
                        dataService.getRolePermissionsByHORole(WOBSRole).then(response => {
                            counter--;
                            if (response.status == 200) {
                                for (let det of response.data.rolePermissionDetails) {
                                    if (userRoles.indexOf(det.uiRoleName) <= 0) {
                                        userRoles.push(det.uiRoleName);
                                    }
                                }
                            }

                            // console.log(userRoles);

                            if (counter == 0) {
                                if (userProps != null && userProps.firstName != null) {
                                        curUser = {
                                        user: this.userName,
                                        name: ((userProps.firstName ? userProps.firstName : "") + " " + (userProps.lastName ? userProps.lastName : "")).trim(),
                                        role: userRoles.join(),
                                        type: "homeoffice"
                                    };
                                } else {
                                        curUser = {
                                        user: this.userName,
                                        role: userRoles.join(),
                                        type: "homeoffice"
                                        };
                                }

                                this.waiting = false;
                                 eventBus.emit("login", curUser);
                            }

                        });//getRolePermissionsByHORole
                      }//for

                    }).catch(error => { this.waiting = false; alert(error)});

                } else {
                    this.isAuthenticated = false;
                    this.setErrorMessages("You are not authenticated to access this page.");
                }
                      this.$emit('AuthenticatedStatusChange', this.isAuthenticated);
            }).catch(error => { this.waiting = false; alert(error)});
        },
    }    
}
</script>
<style scoped>
.error-message {
    margin-left: 20px;
    color: red;
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
</style>