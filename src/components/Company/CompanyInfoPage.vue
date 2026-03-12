<template>
  <span id="companyInfo">
    <div>
      <v-row justify="center" align-content="center">
        <v-col cols="10">
          <v-card class="mx-auto" >
            <v-toolbar density="compact"
              flat
              color="secondary"
              class="tbBackground px-4 py-3"
            >
  <v-col class="d-flex align-center">
    <span class="font-weight-bold" style="font-size: 25px;">
      Update Address & Contact Info
    </span>
  </v-col>
</v-toolbar>
            <br />
            <v-alert
              text
              color="success"
              v-if="showSuccessMessages"
              dismissible
            >
              <v-row class="success-message">
                <ul id="successMessage">
                  <li v-for="message in successMessages" v-bind:key="message">
                    {{ message }}
                  </li>
                </ul>
              </v-row>
            </v-alert>

            <v-alert type="warning" v-if="showErrorMessages" variant="tonal" icon="mdi-alert-circle"           
  border="start"
  border-color="warning">
  <ul class="error-message">
    <li v-for="message in errorMessages" :key="message">
      {{ message }}
    </li>
  </ul>
</v-alert>
<br />
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-row justify="center" align-content="center" >
                <v-col cols="100" sm="8" md="5">
                  <v-text-field
                    v-model="companyName"
                    :rules="companyNameRules"
                    label="*Company Name"
                    variant="outlined"
                    autocomplete="companyName"
                    :readonly="!allowUpdate"
                  ></v-text-field>
                </v-col>

                <v-col cols="100" sm="8" md="5">
                  <v-text-field
                    v-model="billContact"
                    :rules="billContactRules"
                    label="*Billing Contact"
                    variant="outlined"
                    autocomplete="billContact"
                    :readonly="!allowUpdate"
                  ></v-text-field>
                </v-col>

                <v-col cols="100" sm="8" md="5">
                  <v-text-field
                    v-model="address1"
                    :rules="address1Rules"
                    label="*Address1"
                    variant="outlined"
                    autocomplete="address1"
                    :readonly="!allowUpdate"
                  ></v-text-field>
                </v-col>
                <v-col cols="100" sm="8" md="5">
                  <v-text-field
                    v-model="address2"
                    label="Address2"
                    v-if="!NA"
                    variant="outlined"
                    autocomplete="address2"
                    :readonly="!allowUpdate"
                  ></v-text-field>
                </v-col>
                <v-col cols="100" sm="8" md="5">
                  <v-text-field
                    v-model="city"
                    :rules="cityRules"
                    label="*City"
                    variant="outlined"
                    autocomplete="city"
                    :readonly="!allowUpdate"
                  ></v-text-field>
                </v-col>
                <v-col cols="100" sm="8" md="5">
                  <v-select
                    v-model="state"
                    :items="states"
                    menu-props="auto"
                    :readonly="!allowUpdate"
                    label="*Select State"
                    single-line
                    attach
                    :rules="stateRules"
                    outlined
                  ></v-select>
                </v-col>
                <v-col cols="100" sm="8" md="5">
                  <v-text-field
                    v-model="zip"
                    :rules="zipRules"
                    label="*Zip Code"
                    variant="outlined"                    
                    autocomplete="zip"
                    :readonly="!allowUpdate"
                  ></v-text-field>
                </v-col>
                <v-col cols="100" sm="8" md="5">
                  <v-mask-input
                    v-model="phone"
                    :rules="phoneRules"
                    label="*Billing Contact Phone Number"
                    variant="outlined"                    
                    autocomplete="phone"
                    :readonly="!allowUpdate"
                    mask="(###) ###-####"
                    persistent-placeholder
                  ></v-mask-input>
                </v-col>
                <v-col cols="100" sm="8" md="5">
                  <v-mask-input
                    v-model="companyPhone"
                    :rules="companyPhoneRules"
                    label="Company Phone Number"
                    variant="outlined"
                    autocomplete="phone"
                    :readonly="!allowUpdate"
                    mask="(###) ###-####"
                    persistent-placeholder
                  ></v-mask-input>
                </v-col>
                <v-col cols="100" sm="8" md="5">
                  <v-text-field
                    v-model="billContactEmail"
                    :rules="emailRules"
                    label="*Billing Contact Email"
                    variant="outlined"
                    :readonly="!allowUpdate"
                  ></v-text-field>
                </v-col>
                <v-col cols="9"> 
                  <v-switch color="primary" v-model="isPaperless" :label="`Paperless: ${isPaperless ? 'Yes' : 'No'}`" :readonly="!allowUpdate" @update:modelValue="switchChanged" inset density="compact" /> 
                </v-col>   
                <v-col cols="9">
                  <v-row justify="center">
                    <v-btn
                      color="#319B42"
                      dark
                      class="menuBtn"
                      ref
                      @click.stop="updateCompanyInfo"
                      v-show="allowUpdate"
                      >Update</v-btn
                    >
                    <v-btn
                      class="menuBtn"
                      v-show="!allowUpdate"
                      :disabled="!allowUpdate"
                      >Update</v-btn
                    >
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
            <br />
            <br />
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
  </span>
</template>


<script>
import statesList from "@/state.js";
import { HTTP_HATS } from "@/HTTP-common.js";
import Log from "@/log.js";
import dataService from "@/services/dataService";
import permissions from "@/permissions.js";

export default {
  mixins: [permissions],
  name: "companyInfo",
  data: () => ({
    waiting: false,
    showSuccessMessages: false,
    successMessages: [],
    showErrorMessages: false,
    errorMessages: [],
    modal: false,
    menu2: false,
    menu2small: false,
    valid: true,
    NA: false,
    rules: {},
    companyName: "",
    companyNameRules: [(v) => !!v || "Company Name is required."],
    billContact: "",
    billContactRules: [(v) => !!v || "Billing Contact is required."],
    address1: "",
    address1Rules: [(v) => !!v || "Address1 is required."],
    address2: "",
    city: "",
    cityRules: [(v) => !!v || "City is required."],
    state: "",
    states: statesList,
    stateRules: [(v) => !!v || "Please enter state."],
    zip: "",
    // zip must be 5 digits, 9 digits, or 5 dash 4 digits
    zipRules: [
      (v) =>
        /^\d{5}$/.test(v) ||
        /^\d{9}$/.test(v) ||
        /^\d{5}-\d{4}$/.test(v) ||
        "Zip code must be 5 or 9 digits.",
    ],
    phone: "",
    phoneRules: [
      (v) => !!v || "Billing Contact Phone Number is required",
      (v) =>
        /^[\d{1}]?[ ]?[.\-( ]?[ ]?\d{3}[ ]?[.\-) ]?[ ]?\d{3}[.\- ]?\d{4}[ ]*$/.test(
          v
        ) || "Please enter a valid phone number with area code.",
    ],
    billContactEmail: "",
    emailRules: [
        v => !!v || "Billing Contact Email is required",
        v => (!v || /.+@.+\..+/.test(v.trim())) || "Email must be valid.",
        v => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) || "User Email address (Log-in ID) must be valid",
      ],
    companyPhone: "",
    companyPhoneRules: [
      (v) =>
        (!v ||
        /^[\d{1}]?[ ]?[.\-( ]?[ ]?\d{3}[ ]?[.\-) ]?[ ]?\d{3}[.\- ]?\d{4}[ ]*$/.test(
          v
        )) || "Please enter a valid phone number with area code.",
    ],
    uniqueId: -1,
    isPaperless : true,
    isPaperlessSwitchCliked : false
  }),
  computed: {
    companyPhoneNoMask() {
      return this.companyPhone.replace(/[{()}]/g, '').replace(/\s/g, '').replace(/-/g, '').trim()
    },
    franchiseInfo() {
      try {
        return this.$store.state.currentFranchise;
      } catch (e) {
        Log.logError(e, "CompanyInfoPage.vue franchiseInfo");
        return "";
      }
    },
    userInfo() {
      try {
        return this.$store.state.currentUser.user;
      } catch (e) {
        Log.logError(e, "CompanyInfoPage.vue userInfo");
        return "";
      }
    },
  },

  methods: {
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
    switchChanged() {
      this.isPaperlessSwitchCliked = true;
    },
    updateCompanyInfo() {
        if (this.$refs.form.validate()) {
          this.statusText = "Updating...";
          this.showSuccessMessages = false;
          this.successMessages = [];
          this.waiting = true;
          if (this.isPaperlessSwitchCliked) {
            //If paperless switch is changed, we need to call setBillingInfo
            this.setPaperBillingInfo().then(response =>{
                let responseData = response.data;
                let isSuccess = (response.status == 200 && responseData.isSuccess);
                if (!isSuccess) {
                    this.setErrorMessages("There was an error, Please contact administrator.");
                    this.waiting = false;
                }
                if (isSuccess) {
                    this.saveContactInfo();
                }
            });
          } else {
            //otherwise, olny save contactInfo
              this.saveContactInfo();
          }
        }
    },
    setPaperBillingInfo(){
      let printBillYNW = this.isPaperless ? 'W' : 'Y';
      return dataService.setPaperBillingInfo(this.franchiseInfo.franchiseNumber, printBillYNW, this.userInfo);
    },     
    saveContactInfo(){
      HTTP_HATS.post("CompanyInfo/SetCompanyInfo", {
        companyId: this.franchiseInfo.franchiseNumber,
        companyName: this.companyName,
        billAddressLine1: this.address1,
        billAddressLine2: this.address2,
        city: this.city,
        state: this.state,
        zip: this.zip,
        billContact: this.billContact,
        phone: this.phone.replace(/[{()}]/g, '').replace(/\s/g, '').replace(/-/g, '').trim(),
        userName: this.userInfo,
        BillContactEmail: this.billContactEmail,
        CompanyPhone: this.companyPhoneNoMask,
      })
      .then((response) => {
        let responseData = response.data;
        try {
          if (
            responseData.statusCode == 200 &&
            responseData.isSuccess == true &&
            responseData.isRequestQueued == false
          ) {
            this.sendAdditionalNotifications(
              "LNLWOBINFOCHG",
              this.franchiseInfo.franchiseNumber,
              this.userInfo
            );
            this.setSuccessMessages(
              "Company Information has been updated successfully."
            );
            this.allowUpdate = true;
          } else if (
            responseData.statusCode == 200 &&
            responseData.isSuccess == true &&
            responseData.isRequestQueued == true
          ) {
            this.setErrorMessages(
              "Company Information changes have been submitted and will be processed in 24 hours"
            );
            this.allowUpdate = false;
          } else {
            this.setErrorMessages(
              "Company Information has been not updated, please check with administrator."
            );
          }
          this.waiting = false;
        } catch (e) {
          Log.logError(e, "CompanyInfoPage.vue validate (1)");

          this.searching = false;
        }
      })
      .catch((e) => {
        Log.logError(e, "CompanyInfoPage.vue validate (2)");

        this.errors.push(e);
      });
    },//saveCompanyInfo

  },
  created() {
    //Set permission view
    let updateRoles = ["AcctContactInfoUpdate"];
    this.allowUpdate = this.checkSpecificPermission(updateRoles);
    this.statusText = "Getting...";
    this.waiting = true;

    let companyId = this.franchiseInfo.franchiseNumber;
    dataService.getBillingInfo(companyId).then(response => {
        if (response.status == 200 && response.data) {
            var companyData = response.data;
            if (companyData.billingDetails && companyData.billingDetails.length > 0) {
              let originalPrintBill = companyData.billingDetails[0].printBill;
              if (originalPrintBill == 'Y' || originalPrintBill == 'YES') {
                //Y - YES, print bill
                this.isPaperless = false;
              } else {
                //N-W, No - Web
                this.isPaperless = true;
              }

            } else {
                this.showMessage("Invalid Account Number.", true);                            
            }
        } else {
            this.showMessage("Invalid Account Number.", true);
        }
    });

    HTTP_HATS.get("CompanyInfo/GetCompanyInfo", {
      params: {
        companyId: this.franchiseInfo.franchiseNumber,
      },
      //withCredentials: true
    })
      .then((response) => {
        let responseData = response.data;
        try {
          if (responseData.companyDetails.length > 0) {
            if (
              responseData.statusCode == 200 &&
              responseData.isSuccess
            ) {
              this.companyName = response.data.companyDetails[0].companyName;
              this.billContact = response.data.companyDetails[0].billContact;
              this.address1 = response.data.companyDetails[0].billAddressLine1;
              this.address2 = response.data.companyDetails[0].billAddressLine2;
              this.city = response.data.companyDetails[0].city;
              this.zip = response.data.companyDetails[0].zip;
              this.state = response.data.companyDetails[0].state;
              //this.phone = response.data.companyDetails[0].phone;  
              this.phone = response.data.companyDetails[0].phone.replace(/\D/g, ''); 
              if (responseData.isPortalUpdatePending) {
                this.allowUpdate = false;
                this.setErrorMessages(
                  "There is a pending change under processing.Please check back later."
                );
              }
              HTTP_HATS.get("CompanyInfo/GetCompanyAdditionalInfo", {
                params: {
                  companyId: this.franchiseInfo.franchiseNumber
                }
              })
                .then(response => {
                  if (response.data.statusCode == 200) {
                    this.companyPhone = response.data.companyAdditionalDetails[0].companyPhone;
                    this.billContactEmail = response.data.companyAdditionalDetails[0].billContactEmail;
                  } else {
                    this.setErrorMessages("Company contact Information not retrieved, Please check with your administrator");
                  }
                  this.waiting = false;
                })
                .catch(e => {
                  Log.logError(e, "CompanyInfoPage.vue created (3)");
                  this.errors.push(e);
                  this.waiting = false;
                });
            } else {
              this.setErrorMessages(
                "Company contact Information not retrieved, Please check with your administrator"
              );
              this.waiting = false;
            }
          }
        } catch (e) {
          Log.logError(e, "CompanyInfoPage.vue created (1)");

          this.searching = false;
          this.waiting = false;
        }
      })
      .catch((e) => {
        Log.logError(e, "CompanyInfoPage.vue created (2)");

        this.errors.push(e);
        this.waiting = false;
      });
  },
  //}
};
</script>
<style scoped>
.menuBtn {
  margin-top: 10px;
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
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
</style>
