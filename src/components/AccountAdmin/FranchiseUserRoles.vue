<template>
  <span>
   <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2"></v-breadcrumbs>

<v-row justify="center" align-content="center" align="center">
  <v-tabs  v-model="tab" :centered="true" >
    <v-tab color=#1976d2   >Users & Roles</v-tab>
    
    <v-tab v-if="showLinkTab" >
      <v-badge 
        color="orange" 
        :content="activeLinks" 
        :model-value="activeLinks > 0"
      >
        Registration Links
      </v-badge>
    </v-tab>
  </v-tabs>
</v-row>
<div class="my-6"></div>
<v-tabs-window v-model="tab" class="tabs  justify-center align-center">
<v-tabs-window-item >
        <v-row justify="center" align-content="center" align="center">
        <v-col cols="11">
                <v-alert v-if="showSuccessMessages" color="success"  variant="tonal" closableclass="mb-4">
                    <div class="success-message">
                        <ul id="successMessage" class="ps-5 mb-0" style="color: inherit; font-size: 16px;">
                        <li v-for="message in successMessages" :key="message">
                            {{ message }}
                        </li>
                        </ul>
                    </div>
                </v-alert>

                <v-alert text color="warning" v-if="showErrorMessages">
                    <div class="error-message">
                        <ul id="errorMessage" class="ps-5 mb-0" style="color: inherit; font-size: 16px;">
                            <li v-for="message in errorMessages" :key="message">
                                {{ message }}
                            </li>
                        </ul>
                    </div>
                </v-alert>

                <v-data-table
                :headers="headers"
                :items="items"
                :loading="waiting"
                item-value="index"
                v-model:items-per-page="itemsPerPage"
                v-model:page="page"
                theme="dark" 
                variant="flat"
                style="background-color: rgb(68, 171, 168) !important; color: white !important;"
                must-sort
                :page.sync="page"
                no-data-text="No user found."
               :items-per-page-options="[10, 25, 50, 100, 200, -1]"
               page-text="Viewing items: {0}-{1} of {2}"
              :items-per-page="10"
                items-per-page-text="Display records per page:"
                show-current-page
                >
                <template v-slot:item.isActive="{ item }">
                    {{ item.isActive ? 'Yes' : 'No' }}
                </template>
                <template v-slot:item.action="{ item }">
                    <v-tooltip location="top" content-class="bg-blue-darken-4 text-white opacity-100" >
                        <template v-slot:activator="{ props }">
                            <v-icon color="blue" @click="editUserRole(item)" v-bind="props">mdi-account-edit-outline</v-icon>
                        </template>
                        <span  >View/Edit User</span>
                    </v-tooltip>
                    <v-tooltip location="top" content-class="bg-blue-darken-4 text-white opacity-100" >
                        <template v-slot:activator="{ props }">
                            <v-icon color="orange" v-if="canDeleteUserRole(item)" @click="deleteUserRole(item)" v-bind="props">mdi-account-off-outline</v-icon>
                            <v-icon color="grey" v-if="!canDeleteUserRole(item)" v-bind="props">mdi-account-off-outline</v-icon>
                        </template>
                        <span >{{ canDeleteUserRole(item) ? 'Delete User Role' : 'Delete action unavailable' }}</span>
                    </v-tooltip>
                </template>
                <template v-slot:footer.page-text="{pageStart, pageStop, itemsLength}">
                    <div
                    :class="$vuetify.breakpoint.smAndDown?'v-data-footer__select smallFooter':'v-data-footer__select'"
                    >
                    <span
                    v-if="$vuetify.breakpoint.mdAndUp"
                    >Viewing items: {{ pageStart }}-{{ pageStop }} of {{ itemsLength }}</span>
                    <span style="margin-left: 10px;">Page:&nbsp;</span>
                    <v-select
                        :items="pages"
                        v-model="page"
                        item-text="page"
                        item-value="page"
                        menu-props="auto"
                        hide-details
                        style="width:75px;font-size:0.75rem;margin-right:20px;"
                    ></v-select>
                    &nbsp;of&nbsp;{{ maxPages}}
                    </div>
                </template>
                </v-data-table>
        </v-col>
        </v-row>
        <p/>
            <v-row align-content="center" align="center" justify="center">
                <AddUpdateUserRoleDialog ref="editDialog" :franchiseId="franchiseId" :franchiseName="franchiseName" :canEditUserRole="canEditUserRole" 
                :managedUsers="managedUsers" :existingRoles="items"/>
            </v-row>
      </v-tabs-window-item>
      <!-- link tab -->
      <v-tabs-window-item v-if="showLinkTab">
        <v-row justify="center" align-content="center" align="center">
        <v-col cols="11">
            <v-data-table
            :headers="linkHeaders"
            :items="linkItems"
            class="elevation-1"
            item-key="item.index"
            dark
            must-sort
            no-data-text="No registration link found."
            >
            <template v-slot:item.action="{ item }">
                <v-tooltip
                location="top"
                :color="mainColor"
                v-if="item.isLinkActive === 'Yes' && allowResendLink"
                >
                <template v-slot:activator="{ props }">
                    <v-icon color="blue" @click="sendEmail(item)" v-bind="props">mdi-email-outline</v-icon>
                </template>
                <span>Resend Registration Link</span>
                </v-tooltip>
                <v-tooltip
                location="top"
                :color="mainColor"
                v-if="item.isLinkActive === 'Yes' && !allowResendLink"
                >
                <template v-slot:activator="{ props }">
                    <v-icon color="grey" v-bind="props">mdi-email-outline</v-icon>
                </template>
                <span>{{ permissionDeniedToolTip }}</span>
                </v-tooltip>

                <v-tooltip
                location="top"
                :color="mainColor"
                v-if="item.isLinkActive === 'Yes' && allowDeleteLink"
                >
                <template v-slot:activator="{ props }">
                    <v-icon
                    color="orange"
                    @click="changeStatus(item, false)"
                    v-bind="props"
                    >mdi-close-box-outline</v-icon>
                </template>
                <span>Deactivate link</span>
                </v-tooltip>
                <v-tooltip
                location="top"
                :color="mainColor"
                v-if="item.isLinkActive === 'Yes' && !allowDeleteLink"
                >
                <template v-slot:activator="{ props }">
                    <v-icon color="grey" v-bind="props">mdi-close-box-outline</v-icon>
                </template>
                <span>{{ permissionDeniedToolTip }}</span>
                </v-tooltip>

            </template>
            </v-data-table>
        </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>    

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
    <confirm ref="confirm"></confirm>

  </span>
</template>
<script>
import permissions from "@/permissions.js";
import confirm from "@/components/Shared/confirm.vue";
import dataService from "@/services/dataService";
import AddUpdateUserRoleDialog from "./AddUpdateUserRoleDialog";
import eventBus from "@/event-bus.js";

export default {
    name: "FranchiseUserRoles",
    props: ['franchiseId'],
    mixins: [permissions],
    components: {
        confirm,
        AddUpdateUserRoleDialog,
    },    
    beforeDestroy() {
        eventBus.$off("userRoleUpdated");
        eventBus.$off("userRoleAdded");
        eventBus.$off("registrationLinkCreated");
    },    
    created(){
        eventBus.on("userRoleUpdated", item => {
            if (item && item.roleName) {
                item.roleName = item.roleName.replace(/\w+/g, function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase();});
                var index = this.items.findIndex(function(elem) {
                    return elem.userName.toLowerCase() == item.userName.toLowerCase();
                });
                if (index >= 0) {
                    this.items.splice(index, 1, item);
                }
                this.setupViewPermission();
            }
        });

        eventBus.on("userRoleAdded", item => {
            if (item && item.roleName) {
                item.roleName = item.roleName.replace(/\w+/g, function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase();});
                this.items.push(item);
            }
        });
        
        eventBus.on("registrationLinkCreated", link => {
            if (link) {
                this.getActiveRegistrationLinks(this.franchiseId);
            }
        });        

    },
    mounted(){
        this.getFranchiseCompanyInfo(this.franchiseId);

        this.getActiveRegistrationLinks(this.franchiseId);

        this.getFranchiseUserRoleInfo(this.franchiseId);

        this.getManagedUsersForAdmin();
    },
    data() {
        return {
            waiting: false,
            statusText: '',
            breadcrumbItems: [
                {
                title: "Users & Roles",
                disabled: true
                }
            ],            
            items: [],
            linkItems: [],
            page: 1,
            itemsPerPage: 10,
            showSuccessMessages: false,
            successMessages: [],
            showErrorMessages: false,        
            errorMessages: [],            
            tab: null,
            activeLinks: 0,
            canEditUserRole : false,
            franchiseName : '',
            allowResendLink : false,
            allowDeleteLink : false,
            showLinkTab: false,
            managedUsers : null,
        }
    },    
    methods: {
        cleanup(){
            this.waiting = false;
            this.showSuccessMessages = false;
            this.successMessages = [];
            this.showErrorMessages = false;
            this.errorMessages = [];
        },
        setupViewPermission(){
            let currentUser = this.$store.state.currentUser.user;
            //Find current role
            this.items.forEach(i => {
                if (i.userName == currentUser) {
                    this.currentRole = i.roleName;
                }
            });

            //user/roles
            let editUserRoles = [          
                "UserCreateUpdate",
                "UserMaintenanceUpdate",
                "UserCreateUpdDel",
                "UserMaintenanceUpdDel",
            ];
            this.canEditUserRole = this.checkSpecificPermission(editUserRoles);             

            //links    
            let resendLinkRoles = [          
                "HORegistrationReqUpdate"
            ];
            this.allowResendLink = this.checkSpecificPermission(resendLinkRoles) 
                || this.currentRole?.toLowerCase() == 'administrator' || this.currentRole?.toLowerCase() == 'owner'; 

            let deleteLinkRoles = [          
                "HORegistrationAssocUpdDel"
            ];
            this.allowDeleteLink = this.checkSpecificPermission(deleteLinkRoles) 
                || this.currentRole.toLowerCase() == 'administrator' || this.currentRole.toLowerCase() == 'owner'; 

            //show Link tab
            let showLinkTabRoles = [          
                "UserCreateUpdate",
                "UserMaintenanceUpdate",
                "UserCreateUpdDel",
                "UserMaintenanceUpdDel",
                "HORegistrationReqUpdate",
                "HORegistrationAssocUpdDel"
            ];
            this.showLinkTab = this.checkSpecificPermission(showLinkTabRoles) 
                || this.currentRole.toLowerCase() == 'administrator' || this.currentRole.toLowerCase() == 'owner'; 


        },
        canDeleteUserRole(item) {
            let isUserSelf = (item.userName.toLowerCase() == this.$store.state.currentUser.user.toLowerCase());
            if (this.canEditUserRole && !isUserSelf) {
                return true;
            }
            return false;
        },
        getFranchiseCompanyInfo(franchiseId){
            dataService.getCompanyInfo(franchiseId).then(companyResponse => {
                let responseData = companyResponse.data;
                if (responseData.statusCode == 200 || responseData.companyName) {
                    this.franchiseName = responseData.companyName;
                }
            });
        },
        getActiveRegistrationLinks(franchiseId){
            this.activeLinks = 0;
            this.linkItems = [];
            dataService.getRegistrationLinks(franchiseId, "@franchiseId", "registration").then(response => {
                if (response.status == "200") {
                    let responseData = response.data;
                    if (responseData.registrationLinkDetails) {
                        this.linkItems = responseData.registrationLinkDetails;
                        this.linkItems.forEach(link => {
                            if (link.isLinkActive == 'Yes') {
                                this.activeLinks ++;
                            }
                        });
                    }
                }
            });
            return;
        },        
        getFranchiseUserRoleInfo(franchiseId){
            this.waiting = true;
            dataService.getFranchiseUserRoleInfo(franchiseId, true).then(response =>{
                if (response.status == "200") {
                    this.waiting = false;
                    let responseData = response.data;
                    if (responseData.userRoles) {
                        this.items = responseData.userRoles;
                        if (this.items.length == 0) {
                            let userType = this.$store.state.currentUser.type;
                            if (userType == "homeoffice") {
                                this.setErrorMessages("The first user for an account must be created using the Registration Links option from the Account Access menu.");
                            }
                        }
                        this.setupViewPermission();
                    }
                }
            });
            return;
        },
        getManagedUsersForAdmin() {
            let userType = this.$store.state.currentUser.type;
            let userName = this.$store.state.currentUser.user;
            if (userType.toLowerCase() == 'ext' || userType.toLowerCase() == 'agency') {
                dataService.getManagedUsersForAdmin(userName).then(response => {
                    if (response.status == "200") {
                        this.managedUsers = response.data.userRoles;
                    }
                });
            }
        },
        editUserRole(item) {
            this.cleanup();
            this.$refs.editDialog.open('Update', item, this.items);
        },
        deleteUserRole(item) {
            this.cleanup();
            this.$refs.confirm.open('Delete User Role', 'Do you wish to continue ?', { width : 400 }).then((confirm) => { 
                if (!confirm) return;
                //Make sure at least one active admin
                let found = false;
                this.items.forEach(i => {
                    if (i.userName != item.userName && i.isActive && i.roleName.toLowerCase() == 'administrator') {
                        found = true;
                    }
                });
                if (!found) {
                    this.setErrorMessages("There must be at least one active administrator.");
                    return;
                }

                //don't delete userself 
                let isUserSelf = (item.userName.toLowerCase() == this.$store.state.currentUser.user);
                if (isUserSelf) {
                    this.setErrorMessages("Can't delete userself.");
                    return;
                }

                this.waiting = true;
                dataService.deleteFranchiseUserRole(item).then(response =>{
                    this.waiting = false;
                    if (response.status == "200") {
                        let responseData = response.data;
                        if (responseData.isSuccess) {
                            this.setSuccessMessages('User deleted successfully');
                            var index = this.items.findIndex(function(elem) {
                                return elem.userName == item.userName;
                            });
                            if (index >= 0) {
                                this.items.splice(index, 1);
                            }                        
                        } else {
                            this.setErrorMessages(responseData.errorMessage);
                        }
                    }
                });
            });
        },
        changeStatus(item, isLinkActive) {
            this.$refs.confirm.open('Deactivate Link', 'Do you wish to continue ?', { width : 400 }).then((confirm) => { 
                if (!confirm) return;

                let appInfo = {};
                var req = {};
                req.id = item.id;
                req.fieldName = "islinkactive";
                req.isLinkActive = isLinkActive;
                dataService.changeLinkStatus(req).then(response => {
                this.waiting = false;
                if (response.status == "200") {
                        var item = response.data.registrationLink;
                        var index = this.linkItems.findIndex(function(elem) {
                        return elem.id == item.id;
                    });
                    if (index >= 0) {
                        this.linkItems.splice(index, 1, item);
                        appInfo.type = "success";
                        appInfo.message = "Link deactivated.";
                    }
                    this.getActiveRegistrationLinks(this.franchiseId);

                } else {
                    //eslint-disable-next-line no-console
                    // console.log(response);
                    //alert("show error!");
                    appInfo.type = "error";
                    appInfo.message = "Unable to change link status.";
                }
                eventBus.$emit("appInfo", appInfo);
                });
            
            });
        },
        sendEmail(item) {
            this.$refs.confirm.open('Resend Link', 'Do you wish to continue ?', { width : 400 }).then((confirm) => { 
                if (!confirm) return;

                this.waiting = true;
                let link = item;
                let appInfo = {};
                dataService.getCompanyInfo(this.franchiseId).then(companyResponse => {
                    //Step #1, getCompanyInfo
                    let responseData = companyResponse.data;
                    if (responseData.statusCode == 200 || responseData.companyName) {
                        link.franchiseName = responseData.companyName;
                    }
                    this.sendNotification("LNLWOBREGCOMP", link).then(response => {
                        this.waiting = false;
                        if (response.status == "200") {
                            //change email sent flag
                            setTimeout(this.changeEmailSentStatus(link.id), 1000);

                            appInfo.type = "success";
                            appInfo.message = "Email sent";
                        } else {
                            appInfo.type = "error";
                            appInfo.message = "Unable to send email";
                        }
                        eventBus.$emit("appInfo", appInfo);
                    });
                });

            });
        },
        changeEmailSentStatus(id){
            this.statusText = "Change email sent status";
            let req = {};
            req.Id = id;
            req.isEmailSent = true;
            return dataService.changeEmailSentStatus(req);
        },        
        sendNotification(identifier, link) {
            let registrationLink = link ? link.linkURL + link.linkGuid : "";
            let req = {};
            req.identifier = identifier;
            req.userName = link.emailId;
            req.firstName = link.firstName;
            req.lastName = link.lastName;
            req.franchiseId = link.franchiseId;
            req.franchiseName = link.franchiseName;
            req.registrationLink = registrationLink;
            return dataService.sendCCMNotification(req);
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
    computed: {
        mainColor() {
            return this.$store.state.mainColor;
        },
        maxPages() {
        if (this.itemsPerPage === -1) return 1;

        var itemsLength = this.items.length;

        return (
            Math.floor(itemsLength / this.itemsPerPage) +
            (itemsLength % this.itemsPerPage > 0 ? 1 : 0)
        );
        },
        pages() {
        let ret = [];
        let maxPages = this.maxPages;
        for (let i = 1; i <= maxPages; i++) {
            ret.push(i);
        }
        return ret;
        },
        headers() {
        return [
            { title: "Active", key: "isActive" },
            { title: "Email Id", key: "userName" },
            { title: "First Name", key: "firstName" },
            { title: "Last Name", key: "lastName" },
            { title: "Role", key: "roleName" },
            { title: "Action", key: "action", sortable: false },
            ];
        },
        linkHeaders() {
        return [
            { title: "Account Number", key: "franchiseId" },
            { title: "User Name", key: "emailId" },
            { title: "First Name", key: "firstName" },
            { title: "Last Name", key: "lastName" },
            { title: "Active", key: "isLinkActive" },
            { title: "Email Sent", key: "isEmailSent" },
            { title: "Registered", key: "isRegistered" },            
            { title: "Actions", key: "action", sortable: false , width: "200px"  }
             ];        
        },

    }    

}
</script>
<style scoped>
.waitCircle {
  z-index: 20;
  position: fixed;
  top: 35%;
  left: 35%;
}
.waitCircleSm {
  z-index: 20;
  position: fixed;
  top: 35%;
  left: 35%;
}



</style>