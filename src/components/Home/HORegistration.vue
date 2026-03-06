<template>
  <span>
    <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2">
       <template v-slot:title="{ item }">
      {{ item.text }}
    </template>
    </v-breadcrumbs>
    <v-form ref="form" style="position:sticky !important;margin-left: 40px !important;">
      <v-row>
        <v-layout
          align-content="center"
          align="center"
          justify="center"
        >
          <v-col lg="3" xl="3" md="4" sm="4">
            <v-text-field
              v-model="searchFor"
                variant="solo"
                rounded
              label="Search for..."
              class="roundedTextBox search-text-box"
              append-icon="search"
              append-inner-icon="mdi-magnify"
            />
          </v-col>
          <v-col lg="1" xl="1" md="1" sm="1" align="right" style="margin-top:50px !important;">
            <span>by</span>
          </v-col>
          <v-col lg="3" xl="3" md="3" sm="4">
            <v-select
              class="roundedTextBox search-text-box"
                variant="solo"
                rounded
              :items="searchByItems"
              v-model="searchBy"
              :item-props="true"
            ></v-select>
          </v-col>
          <v-col lg="1" xl="1" md="2" sm="2" align="center" style="margin-top:40px !important;">
            <v-btn class="menuBtn" large color="#319B42" dark @click="search">Search</v-btn>
          </v-col>
          <v-col lg="1" xl="1" md="2" sm="2" style="margin-top:40px !important;">
            <v-btn class="menuBtn" large v-show="searchFor == '' && searchBy == ''">Reset</v-btn>
            <v-btn class="menuBtn" large color="#319B42" dark v-show="searchFor != '' || searchBy != ''" @click="reset">Reset</v-btn>
          </v-col>
          <v-col lg="1" xl="1" md="2" sm="2" class="padding-left" style="margin-top:40px !important;">
            <HORegistrationDialog />
          </v-col>
        </v-layout>
      </v-row>
    </v-form>

    <v-layout justify="center" align-content="center" align="center" style="margin-left:20px;position:unset !important;">
      <v-col cols="12">
        <v-data-table v-if="isSearched"
          :headers="headers"
          :items="items"
          class="elevation-1"
          :loading="waiting"
          item-key="item.index"
          :items-per-page.sync="itemsPerPage"
          dark
          must-sort
          :page.sync="page"
          no-data-text="No registration link found."
          :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, 200,-1] ,
                'show-current-page': true,
                'show-first-last-page': true,
                'items-per-page-text': 'Display records per page: ' }"
        >
          <template v-slot:item.action="{ item }">
            <v-tooltip
              top
              :color="mainColor"
              v-if="item.isLinkActive === 'Yes' && checkSpecificPermission(['HORegistrationReqUpdate'])"
            >
              <template #activator="{ props }">
                <v-icon color="blue" @click="sendEmail(item)" v-bind="props">mdi-email-outline</v-icon>
              </template>
              <span>Resend Registration Link</span>
            </v-tooltip>
            <v-tooltip
              top
              :color="mainColor"
              v-if="!checkSpecificPermission(['HORegistrationReqUpdate'])"
            >
              <template #activator="{ props }">
                <v-icon color="grey" v-bind="props">mdi-email-outline</v-icon>
              </template>
              <span>{{ permissionDeniedToolTip }}</span>
            </v-tooltip>

            <v-tooltip
              top
              :color="mainColor"
              v-if="item.isLinkActive === 'Yes' && allowDeleteLink"
            >
              <template #activator="{ props }">
                <v-icon
                  color="orange"
                  @click="changeStatus(item, false)"
                  v-bind="props"
                >mdi-close-box-outline</v-icon>
              </template>
              <span>Deactivate link</span>
            </v-tooltip>
            <v-tooltip
              top
              :color="mainColor"
              v-if="item.isLinkActive === 'Yes' && !allowDeleteLink"
            >
              <template #activator="{ props }">
                <v-icon color="grey" v-bind="props">mdi-close-box-outline</v-icon>
              </template>
              <span>{{ permissionDeniedToolTip }}</span>
            </v-tooltip>

            <v-tooltip top :color="mainColor" v-if="item.isLinkActive === 'Yes' && allowDeleteLink">
              <template #activator="{ props }">
                <v-icon color="green" v-bind="props" @click="copyLinkToClipboard(item)">mdi-content-copy</v-icon>
              </template>
              <span>Copy</span>
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
    </v-layout>

    <confirm ref="confirm"></confirm>
    
    <v-snackbar v-model="clipboardBar" color="success">
      {{ clipboardText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="clipboardBar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

  </span>
</template>
<script>
import HORegistrationDialog from "./HORegistrationDialog";
import dataService from "@/services/dataService";
import eventBus from "@/event-bus.js";
import permissions from "@/permissions.js";
import confirm from "@/components/Shared/confirm.vue";

export default {
  name: "HORegistration",
  mixins: [permissions],
  components: {
    confirm,
    HORegistrationDialog
  },
  data() {
    return {
      clipboardBar : false,
      clipboardText : '',
      allowDeleteLink : false,
      breadcrumbItems: [
        {
          text: "Home Office",
          disabled: false,
          href: "HOLanding"
        },
        {
          text: "Account Access",
          disabled: false,
          href: "HomeOffice"
        },        
        {
          text: "Registration Link",
          disabled: true
        }
      ],
      noItemsFlag: false,
      waiting: false,
      linkType: "registration",
      isSearched : false,
      searchFor: "",
      searchBy: "",
      searchByItems: [
        { title: "Account Number", key: "@franchiseId" },
        { title: "User Name", key: "@emailId" },
        { title: "First Name", key: "@firstName" },
        { title: "Last Name", key: "@lastName" }
      ],
      items: [],
      page: 1,
      itemsPerPage: 10
    };
  },
  created() {
    //Set permission view
    let deleteLinkRoles = [          
        "HORegistrationAssocUpdDel"
    ];
    this.allowDeleteLink = this.checkSpecificPermission(deleteLinkRoles);    

    this.search();
  },  
  methods: {
    search() {
      this.isSearched = true;
      this.waiting = true;
      this.items = [];
      let serchedbykey = "";
    
      switch(this.searchBy){
case "Account Number" :  this.serchedbykey = "@franchiseId"; break;
case "User Name" :  this.serchedbykey = "@emailId"; break;
case "First Name" :  this.serchedbykey = "@firstName";break;
case "Last Name" :  this.serchedbykey = "@lastName";break;


 }
      dataService
        .getRegistrationLinks(this.searchFor, this.serchedbykey, this.linkType)
        .then(response => {
          this.waiting = false;
          if (response.status == "200") {
            this.items = response.data.registrationLinkDetails;
          } else {
            //eslint-disable-next-line no-console
            // console.log(response);

            //alert("show error!");
          }
        });
    },
    reset() {
      this.isSearched = false;
      this.searchFor = "";
      this.searchBy = "";
      this.search();
    },
    copyLinkToClipboard(item){
      let url = item.linkURL + item.linkGuid;
      this.clipboardText = url;
      this.clipboardBar = true;
      navigator.clipboard.writeText(url);
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
            var index = this.items.findIndex(function(elem) {
              return elem.id == item.id;
            });
            if (index >= 0) {
              this.items.splice(index, 1, item);
              appInfo.type = "success";
              appInfo.message = "Link deactivated.";
            }
          } else {
            //eslint-disable-next-line no-console
            // console.log(response);
            //alert("show error!");
            appInfo.type = "error";
            appInfo.message = "Unable to change link status.";
          }
          eventBus.emit("appInfo", appInfo);
        });
      
      });
    },
    sendEmail(item) {
      this.$refs.confirm.open('Resend Link', 'Do you wish to continue ?', { width : 400 }).then((confirm) => { 
        if (!confirm) return;

        this.waiting = true;
        let link = item;
        let appInfo = {};
        dataService.getCompanyInfo(link.franchiseId).then(companyResponse => {
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
            eventBus.emit("appInfo", appInfo);
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
    }
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
        { title: "Account Number", key: "franchiseId" },
        { title: "User Name", key: "emailId" },
        { title: "First Name", key: "firstName" },
        { title: "Last Name", key: "lastName" },
        { title: "Active", key: "isLinkActive" },
        { title: "Email Sent", key: "isEmailSent" },
        { title: "Registered", key: "isRegistered"},        
        { title: "Actions", key: "action", sortable: false , width: "200px" }
      ];
    }
  }
};
</script>
<style scoped>
.search-text-box {
  margin-top: 30px;
}
.padding-left {
  padding-left : 2em;
}
</style>