<template>
  <span id="paymentInfo">
    <div>
      <v-row justify="center" align-content="center">
        <v-col cols="12" md="10">
          <v-card class="mx-auto">

            <!-- HEADER -->
            <!-- <header
              class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground"
            >
              <div style="padding-top: 15px; padding-left: 20px">
                <b><span style="font-size: 25px">Update Payment Information</span></b>
              </div>
            </header> -->
            <v-toolbar density="compact"
              flat
              color="secondary"
              class="tbBackground px-4 py-3"
            >
  <v-col class="d-flex align-center">
    <span class="font-weight-bold" style="font-size: 25px;">
      Update Payment Information
    </span>
  </v-col>
</v-toolbar>
            <br />

            <!-- SUCCESS ALERT -->
            <v-alert
              v-if="showSuccessMessages"
              type="success"
              variant="tonal"
            >
              <v-row class="success-message">
                <ul id="successMessage">
                  <li v-for="message in successMessages" :key="message">
                    {{ message }}
                  </li>
                </ul>
              </v-row>
            </v-alert>

            <!-- ERROR ALERT -->
            <v-alert
              v-if="showErrorMessages"
              type="warning"
              variant="tonal"
            >
              <v-row class="error-message">
                <ul id="errorMessage">
                  <li v-for="message in errorMessages" :key="message">
                    {{ message }}
                  </li>
                </ul>
              </v-row>
            </v-alert>

            <!-- FORM -->
            <v-row justify="center" align="center">
              <v-col cols="12" md="9">
                <v-form ref="form" v-model="valid">

                  <!-- ROUTING NUMBER -->
                  <v-row>
                    <v-col cols="12" >
                      <v-text-field
  v-model="routingNumber"
  :rules="routingNumberRules"
  label="*Routing Number"
  maxlength="9"
  density="compact"
  variant="outlined"
  autocomplete="routing-number"
  @keyup="onChange"
  :readonly="!allowUpdate"
  ref="routingNumber"
/>
                    </v-col>
                  </v-row>

                  <!-- BANK NAME -->
                  <v-row v-if="validBank">
                    <v-col cols="12">
                      <div class="bank-name">{{ bankName }}</div>
                    </v-col>
                  </v-row>

                  <!-- CONFIRM ROUTING NUMBER -->
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        @click.right.prevent
                        @paste.prevent
                        v-model="confirmRoutingNumber"
                        :rules="confirmRoutingNumberRules"
                        label="*Verify Routing Number"
                        maxlength="9"
                        density="compact"
                        variant="outlined"
                        ref="confirmRoutingNumber"
                      />
                    </v-col>
                  </v-row>

                  <!-- ACCOUNT NUMBER -->
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-if="showAccountNumber"
                        label="*Checking Account Number"
                        v-model="accountNumber"
                        maxlength="20"
                        density="compact"
                        variant="outlined"
                        :rules="accountNumberRules"
                        required
                        @blur="blurHandler('accountNumber')"
                        ref="accountNumber"
                        :readonly="!allowUpdate"
                      />

                      <v-text-field
                        v-else
                        label="*Checking Account Number"
                        v-model="maskedAcountNumber"
                        density="compact"
                        variant="outlined"
                        readonly
                        @focus="focusHandler('accountNumber')"
                      />
                    </v-col>
                  </v-row>

                  <!-- CONFIRM ACCOUNT NUMBER -->
                  <v-row v-if="allowUpdate">
                    <v-col cols="12">
                      <v-text-field
                        v-if="showConfirmNumber"
                        @click.right.prevent
                        @paste.prevent
                        label="*Verify Checking Account Number"
                        v-model="confirmNumber"
                        maxlength="20"
                        density="compact"
                        variant="outlined"
                        :rules="confirmNumberRules"
                        required
                        @blur="blurHandler('confirmNumber')"
                        ref="confirmNumber"
                        :readonly="!allowUpdate"
                      />

                      <v-text-field
                        v-else
                        label="*Verify Checking Account Number"
                        v-model="maskedConfirmNumber"
                        density="compact"
                        variant="outlined"
                        readonly
                        @focus="focusHandler('confirmNumber')"
                      />
                    </v-col>
                  </v-row>

                </v-form>
              </v-col>

              <!-- BUTTONS -->
              <v-col cols="12" md="9">
                <v-row justify="center">
                  <v-card-actions>

                    <!-- ADD -->
                    <v-btn
                      v-if="allowUpdate"
                      color="#f1f3f1"
                      class="menuBtn"
                      :disabled="btnAddDisable"
                      @click.stop="paymentAdd"
                    >
                      Add
                    </v-btn>

                    <v-btn
                      v-if="!allowUpdate && !routingNumber"
                      color="grey"
                      class="menuBtn"
                    >
                      Add
                    </v-btn>

                    <!-- UPDATE -->
                    <v-btn
                      v-if="allowUpdate"
                      color="#f1f3f1"
                      class="menuBtn"
                      :disabled="btnUpdateDisable"
                      @click.stop="paymentUpdate"
                    >
                      Update
                    </v-btn>

                    <v-btn
                      v-if="!allowUpdate && routingNumber"
                      color="grey"
                      class="menuBtn"
                    >
                      Update
                    </v-btn>

                    <!-- DELETE -->
                    <v-btn
                      v-if="allowUpdate"
                      color="#f1f3f1"
                      class="menuBtn"
                      :disabled="btnDeleteDisable"
                      @click.stop="deleteDialog = true"
                    >
                      Delete
                    </v-btn>

                    <v-btn
                      v-if="!allowUpdate && routingNumber"
                      color="grey"
                      class="menuBtn"
                    >
                      Delete
                    </v-btn>

                  </v-card-actions>
                </v-row>
              </v-col>
            </v-row>

            <br /><br />
          </v-card>
        </v-col>
      </v-row>

      <!-- DELETE DIALOG -->
      <v-dialog v-model="deleteDialog" persistent max-width="350">
        <v-card>
          <v-card-title class="headline deleteDialogHeadline">
            <v-icon :color="$store.state.mainColor" size="32">mdi-delete</v-icon>
            &nbsp;Delete
          </v-card-title>

          <v-row justify="center">
            <hr width="90%" />
          </v-row>

          <v-card-text>
            Are you sure you want to delete bank details?
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="#f1f3f1"
              class="menuBtn"
              @click="deleteDialog = false; validateDelete();"
            >
              Yes
            </v-btn>
            <v-btn
              color="#f1f3f1"
              class="menuBtn"
              @click="deleteDialog = false"
            >
              No
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- PAPER BILL DIALOG -->
      <v-dialog v-model="paperDialog" persistent max-width="350">
        <v-card>
          <v-card-title class="headline paperDialogHeadline">
            <v-icon :color="$store.state.mainColor" size="32">mdi-newspaper</v-icon>
            &nbsp;Paper Bill
          </v-card-title>

          <v-row justify="center">
            <hr width="90%" />
          </v-row>

          <v-card-text>
            Receive worksite invoice by mail?
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="#f1f3f1"
              class="menuBtn"
              @click="paperDialog = false"
            >
              No
            </v-btn>
            <v-btn
              color="#f1f3f1"
              class="menuBtn"
              @click="paperDialog = false; setPaperBill();"
            >
              Yes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </div>

    <!-- WAITING SPINNER -->
    <div>
      <span
        :class="$vuetify.display.smAndDown ? 'waitCircleLoginSm' : 'waitCircleLogin'"
        :style="$vuetify.display.smAndDown ? 'width:100%; color:#319B42;' : 'width:25%; color:#319B42;'"
      >
        <v-row justify="center" align="center" class="flex-column">
          <v-progress-circular
            v-if="waiting"
            indeterminate
            color="#319B42"
            size="70"
            width="10"
          />
          <br />
          <span class="status" v-if="waiting">{{ statusText }}</span>
        </v-row>
      </span>
    </div>

  </span>
</template>

<script>
import { HTTP_Account } from "@/HTTP-common.js";
import { HTTP_HATS } from "@/HTTP-common.js";
import Log from "@/log.js";
import dataService from "@/services/dataService";
import permissions from "@/permissions.js";

export default {
  name: "PaymentInfo",
  mixins: [permissions],

  data() {
    return {
      btnAddDisable: false,
      btnDeleteDisable: true,
      btnUpdateDisable: true,
      modal: false,
      menu2: false,
      menu2small: false,
      valid: true,
      NA: false,
      waiting: false,
      allowUpdate: false,
      statusText: "Please wait",
      showSuccessMessages: false,
      successMessages: [],
      showErrorMessages: false,
      errorMessages: [],
      accountType: "",
      bankNotFound: false,
      //accountTypeRules: [(v) => !!v || "Account Type is required"],
      ac: "",
      deleteDialog: false,
      paperDialog: false,
      bankName: "",
      rules: {},
      routingNumber: "",
      confirmRoutingNumber: "",
      routingNumberRules: [
        (v) => !!v || "Routing Number is required",
        (v) => v.length == 9 || "Routing Number is invalid",
        (v) => /\d{9}/.test(v) || "Routing Number is invalid",
        () => !this.bankNotFound || "Bank not found, enter valid Routing Number",
      ],
      confirmRoutingNumberRules: [
        (v) => !!v || "Verify Routing Number is required",
        (v) =>
          v == this.routingNumber || "The Verify Routing Number must match the Routing Number.",
      ],
      accountNumber: "",
      showAccountNumber: false,
      accountNumberRules: [
        (v) => !!v || "Checking Account Number is required",
        (v) => /\d/.test(v) || "Account Number is invalid",
        (v) =>
          v.length > 4 || "Account Number must be longer than 4 characters",
          (v) => /^(?=.*\d)(?=.*[1-9]).{1,20}$/.test(v) || "Account Number cannot be all zeros"
      ],
      confirmNumber: "",
      showConfirmNumber: false,
      confirmNumberRules: [
        (v) => !!v || "Verify Bank Account Number is required.",
        (v) =>
          v == this.accountNumber || "The Verify Bank Account Number must match the Bank Account Number.",
      ],
      uniqueId: -1,
    };
  },
  computed: {
    validBank () {
      return this.bankName.length > 0 && !this.bankNotFound;
    },
    maskedAcountNumber() {
      return this.getMaskedString(this.accountNumber);
    },
    maskedConfirmNumber() {
      return this.getMaskedString(this.confirmNumber);
    },
    franchiseInfo() {
      try {
        return this.$store.state.currentFranchise;
      } catch (e) {
        Log.logError(e, "PaymentInfoPage.vue franchiseInfo");
        return "";
      }
    },
    userInfo() {
      try {
        return this.$store.state.currentUser.user;
      } catch (e) {
        Log.logError(e, "PaymentInfoPage.vue userInfo");
        return "";
      }
    },
  },
  methods: {
    validate() {
      let isValid = this.$refs.form.validate();
      if (!this.$refs.accountNumber.validate()) {
        this.showAccountNumber = true;
      }
      if (!this.$refs.confirmNumber.validate()) {
        this.showConfirmNumber = true;
      }
      if (!this.$refs["routingNumber"].validate(true) || this.bankNotFound) {
        isValid = false;
      }
      if (!this.$refs["confirmRoutingNumber"].validate(true)) {
        isValid = false;
      }
      return isValid;
    },
    getMaskedString(word) {
      if (word.length <= 4) {
        return word;
      } else {
        var masked =
          word.substring(0, word.length - 4).replace(/[a-z\d]/gi, "*") +
          word.substring(word.length - 4, word.length);
        return masked;
      }
    },
    focusHandler(fieldName) {
      if (!this.allowUpdate) return;
      if (fieldName == "accountNumber") {
        this.showAccountNumber = true;
        this.accountNumber = "";
        this.$refs.accountNumber.$el.focus();
      }
      if (fieldName == "confirmNumber") {
        this.showConfirmNumber = true;
        this.confirmNumber = "";
        this.$refs.confirmNumber.$el.focus();
      }
    },
    blurHandler(fieldName) {
      if (fieldName == "accountNumber") {
        if (this.$refs.accountNumber.validate()) {
          this.showAccountNumber = false;
        }
      }
      if (fieldName == "confirmNumber") {
        if (this.$refs.confirmNumber.validate()) {
          this.showConfirmNumber = false;
        }
      }
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
    close() {
      this.cleanup();
      this.dialog = false;
    },
    onChange() {
      this.showSuccessMessages = false;
      this.showErrorMessages = false;
      this.showExistingAdminUserRoles = false;
      this.showRegisteredUserRoles = false;
      this.bankNotFound = false;
      if (this.$refs.routingNumber.validate()) {
        setTimeout(this.getRoutingInfo(), 200);
      } else {
        this.bankName = "";
      }
    },
    getRoutingInfo() {
      dataService.getRoutingInfo(this.routingNumber).then((response) => {
        let responseData = response.data;
        if (responseData.statusCode == 200) {
          this.bankNotFound = false;
          this.bankName = responseData.routingDetails[0].bankName;
        }
        else {
          this.bankName = "BANK NOT FOUND";
          this.bankNotFound = true;
        }
        this.$refs.form.validate();
      });
    },
    paymentUpdate() {
      if (!this.validate()) {
        return;
      }
      // try {
      this.statusText = "Updating...";
      this.waiting = true;
      this.showSuccessMessages = false;
      this.showErrorMessages = false;
      this.successMessages = [];
      this.errorMessages = [];

      HTTP_Account.post("Payment/SetPaymentInfo", {
        routingNumber: this.routingNumber,
        accountNumber: this.accountNumber,
        franchiseID: this.franchiseInfo.franchiseNumber,
        //accountType: this.accountType,
        accountType:"C",
        username: this.userInfo,
        isDelete: "0",
      })
        .then((response) => {
          let responseData = response.data;
          try {
            if (responseData.statusCode == 200) {
              this.sendAdditionalNotifications(
                "LNLWOBPYMTINFOCHG",
                this.franchiseInfo.franchiseNumber,
                this.userInfo
              );
              this.setSuccessMessages(
                "Bank account information has been updated successfully."
              );
              this.confirmNumber = "";
              this.$refs.form.resetValidation();
            } else {
              this.setErrorMessages(
                "Bank account information has been not updated, please check with administrator."
              );
            }
            this.waiting = false;
          } catch (e) {
            Log.logError(e, "PaymentInfoPage.vue paymentUpdate (1)");
            this.searching = false;
          }
        })
        .catch((e) => {
          Log.logError(e, "PaymentInfoPage.vue paymentUpdate (2)");

          this.errors.push(e);
        });
      this.waiting = true;
      //}
      //  catch (e) {
      //       // log here.
      //       this.searching = false;
      //     }
      //}
    },
    paymentAdd() {
      if (!this.validate()) {
        return;
      }

      try {
        this.statusText = "adding...";
        this.waiting = true;
        this.showSuccessMessages = false;
        this.successMessages = [];
        this.errorMessages = [];

        HTTP_Account.post("Payment/SetPaymentInfo", {
          routingNumber: this.routingNumber,
          accountNumber: this.accountNumber,
          franchiseID: this.franchiseInfo.franchiseNumber,
          //accountType: this.accountType,
          accountType:"C",
          username: this.userInfo,
          isDelete: "0",
        })
          .then((response) => {
            let responseData = response.data;
            try {
              if (responseData.statusCode == 200) {
                this.sendAdditionalNotifications(
                  "LNLWOBPYMTINFOCHG",
                  this.franchiseInfo.franchiseNumber,
                  this.userInfo
                );
                this.setSuccessMessages(
                  "Bank account information has been added successfully."
                );
                this.btnAddDisable = true;
                this.btnUpdateDisable = false;
                this.btnDeleteDisable = false;
                this.confirmNumber = "";
                this.$refs.form.resetValidation();
              } else {
                this.setErrorMessages(
                  "Bank account information has been not added, please check with administrator."
                );
                this.btnAddDisable = false;
                this.btnUpdateDisable = true;
                this.btnDeleteDisable = true;
              }
              this.waiting = false;
            } catch (e) {
              Log.logError(e, "PaymentInfoPage.vue paymentAdd (1)");
              this.searching = false;
            }
          })
          .catch((e) => {
            Log.logError(e, "PaymentInfoPage.vue paymentAdd (2)");
            this.errors.push(e);
          });
        this.waiting = true;
      } catch (e) {
        Log.logError(e, "PaymentInfoPage.vue paymentAdd (3)");
        this.searching = false;
      }
    },

    validateDelete() {
      this.statusText = "Deleting...";
      this.waiting = true;
      this.showSuccessMessages = false;
      this.successMessages = [];

      HTTP_Account.post("Payment/SetPaymentInfo", {
        routingNumber: this.routingNumber,
        accountNumber: this.accountNumber,
        franchiseID: this.franchiseInfo.franchiseNumber,
        //accountType: this.accountType,
        accountType:"C",
        username: this.userInfo,
        isDelete: "1",
      })
        .then((response) => {
          let responseData = response.data;
          try {
            if (responseData.statusCode == 200) {
              this.setSuccessMessages(
                "Bank account information has been deleted successfully."
              );

              this.btnAddDisable = false;
              this.btnUpdateDisable = true;
              this.btnDeleteDisable = true;
              this.routingNumber = "";
              this.accountNumber = "";
              this.confirmNumber = "";
              this.bankName = "";
              this.accountType = "";
              this.paperDialog = false;
              this.$refs.form.resetValidation();
            } else {
              this.setErrorMessages(
                "Bank account information has been not delete, please check with administrator."
              );
              this.btnAddDisable = true;
              this.btnUpdateDisable = false;
              this.btnDeleteDisable = false;
              this.routingNumber = "";
              this.accountNumber = "";
              this.confirmNumber = "";
              this.$refs.form.resetValidation();
            }
            this.waiting = false;
          } catch (e) {
            Log.logError(e, "PaymentInfoPage.vue validateDelete (1)");
            this.searching = false;
          }
        })
        .catch((e) => {
          Log.logError(e, "PaymentInfoPage.vue validateDelete (2)");
          this.errors.push(e);
        });
      this.waiting = true;
    },

    setPaperBill() {
      this.statusText = "PaperBill...";
      this.waiting = true;
      this.showSuccessMessages = false;
      this.successMessages = [];

      HTTP_HATS.get("BillingInfo/SetBillingInfo", {
        params: {
          companyId: this.franchiseInfo.franchiseNumber,
          printBillYNW: "Y",
          userName: this.userInfo,
        },
        //withCredentials: true
      })
        .then((response) => {
          let responseData = response.data;
          try {
            if (
              responseData.statusCode == 200 &&
              responseData.isSuccess == true &&
              responseData.isRequestQueued == false
            ) {
              this.setSuccessMessages(
                "Worksite invoice paper bill submitted successfully"
              );
              //this.routingNumber='';
            } else if (
              responseData.statusCode == 200 &&
              responseData.isSuccess == true &&
              responseData.isRequestQueued == true
            ) {
              this.setErrorMessages(
                "There is a pending change under processing.Please check back later."
              );
            } else {
              this.setErrorMessages(
                "Printed Bill update error. Please contact Customer Service at 1-888-488-0134 and select option 2"
              );
            }

            this.waiting = false;
          } catch (e) {
            Log.logError(e, "PaymentInfoPage.vue setPaperBill (1)");

            this.searching = false;
            this.waiting = false;
          }
        })
        .catch((e) => {
          Log.logError(e, "PaymentInfoPage.vue setPaperBill (2)");

          this.errors.push(e);
          this.waiting = false;
        });
    },
  },

  created() {
    //Set permission view
    let updateRoles = ["AcctBankInfoUpdDel"];
    this.allowUpdate = this.checkSpecificPermission(updateRoles);

    this.statusText = "Getting...";
    this.waiting = true;

    HTTP_Account.get("Payment/GetPaymentInfo", {
      params: {
        franchiseId: this.franchiseInfo.franchiseNumber,
      },
      //withCredentials: true
    })
      .then((response) => {
        let responseData = response.data;
        try {
          if (
            responseData.statusCode == 200 &&
            response.data.paymentDetails[0].routingNumber > 0 &&
            response.data.paymentDetails[0].accountNumber > 0
          ) {
            this.routingNumber = response.data.paymentDetails[0].routingNumber;
            this.accountNumber = response.data.paymentDetails[0].accountNumber;
            this.accountType = response.data.paymentDetails[0].accountType;
            this.btnAddDisable = true;
            this.btnUpdateDisable = false;
            this.btnDeleteDisable = false;
          } else {
            this.routingNumber = response.data.paymentDetails[0].routingNumber;
            this.accountNumber = response.data.paymentDetails[0].accountNumber;
            this.btnAddDisable = false;
            this.btnUpdateDisable = true;
            this.btnDeleteDisable = true;
          }

          this.waiting = false;
        } catch (e) {
          Log.logError(e, "PaymentInfoPage.vue created (1)");

          this.searching = false;
          this.waiting = false;
        }
      })
      .catch((e) => {
        Log.logError(e, "PaymentInfoPage.vue created (2)");

        this.errors.push(e);
        this.waiting = false;
      });
  },
};
</script>
<style scoped>
.menuBtn {
  margin-top: 10px;
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
  background-color: #319B42;
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
</style>
