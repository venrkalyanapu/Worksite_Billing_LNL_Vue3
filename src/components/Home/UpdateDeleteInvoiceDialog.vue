<template>
  <v-dialog v-model="dialog" persistent max-width="550px">
    <v-card>
      <v-card-title>
        <span style="white-space: nowrap;font-weight:bold;font-size: small;" >
        <span  >Account # {{this.accountId ? this.accountId : ''}}</span>
        <span > | Due Date - {{invoiceItem ? invoiceItem.dueDate : ''}}</span>
        <span > | Invoice #{{invoiceItem ? invoiceItem.invoiceId : ''}}</span>
        </span>
      </v-card-title>
      <v-card-text>
        <v-alert text color="success" v-if="showSuccessMessages" dismissible >
                <div class="success-message">
                  <ul id="successMessage" class="ps-5">
                  <li v-for="message in successMessages" :key="message">
                      {{ message }}
                  </li>
                  </ul>
                </div>
        </v-alert>

        <v-alert text color="warning" v-if="showErrorMessages">
          <v-row class="error-message">
            <ul id="errorMessage">
              <li v-for="message in errorMessages" v-bind:key="message">{{ message }}</li>
            </ul>
          </v-row>
        </v-alert>

        <v-form ref="form">
          <v-container>
            <v-row>
              <v-text-field
                label="*Payment Amount"
                v-model="paymentAmount"
                dense
                outlined
                :disabled="isDeleteMode"
                ref="paymentAmount"
                :rules="paymenyAmountRules"
                required
                prefix="$"
              ></v-text-field>
            </v-row>
            <v-row>
              <v-dialog
                ref="dialog"
                v-model="datePickerModal"
                :return-value.sync="paymentDate"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    outlined
                    v-model="computedDateFormatted"
                    label="*Payment Date"
                    readonly
                    v-bind="props"
                    :rules="paymenyDateRules"
                    :disabled="isDeleteMode"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="paymentDate" scrollable color="#00558c">
                  <v-spacer></v-spacer>
                   <template v-slot:actions>
                      <v-btn variant="text" color="#00558c"  @click="datePickerModal = false">Cancel</v-btn>
                      <v-btn variant="text" color="#00558c" @click="datePickerModal = false">OK</v-btn>
                    </template>
                </v-date-picker>
              </v-dialog>
            </v-row>
            <v-row>
              <v-textarea
                label="*Commentxxx"
                v-model="comment"
                auto-grow
                dense
                outlined
                ref="comment"
                :rules="commentRules"
                required
                :disabled="isInvoiceDeleted"
              ></v-textarea>
            </v-row>
            <small>*indicates required field</small>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="#319B42"
          theme="dark"
          variant="flat"
          class="menuBtn"
          @click.stop="submit"
          v-show="!waiting && !isInvoiceDeleted"
        >{{ mode }}</v-btn>
        <v-btn class="menuBtn" v-show="waiting || isInvoiceDeleted">{{ mode }}</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="#319B42" theme="dark" variant="flat" class="menuBtn" @click.stop="close">Close</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
    <v-progress-circular
      v-if="waiting"
      :class="$vuetify.dispaly.smAndDown ? 'waitCircleSm' : 'waitCircle'"
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
import dataService from "@/services/dataService";
import eventBus from "@/event-bus.js";

export default {
  name: "UpdateDeleteInvoiceDialog",
  props: ["franchiseId"],
  data() {
    return {
      paymenyAmountRules: [
        (v) => this.isPaymentAmountRequired(v) || "Payment Amount is required",
        (v) => this.isPaymentAmountValid(v) || "Payment Amount is invalid",
      ],
      paymenyDateRules: [
        (v) => this.isPaymentDateRequired(v) || "Payment Date is required",
      ],
      commentRules: [
        (v) => !!v || "Comment is required",
        (v) =>
          (v && this.isCommentValid(v)) || "Please enter a meaningful comment",
      ],
      mode: "Update",
      waiting: false,
      statusText: "Please wait",
      dialog: false,
      showSuccessMessages: false,
      successMessages: [],
      showErrorMessages: false,
      errorMessages: [],
      invoiceItem: null,
      datePickerModal: false,
      paymentDate: null,
      paymentAmount: null,
      comment: null,
      isInvoiceDeleted: false,
      accountId: "",
    };
  },
  computed: {
    isUpdateMode() {
      return this.mode == "Update";
    },
    isDeleteMode() {
      return this.mode == "Delete";
    },
    computedDateFormatted() {
      return this.formatDate(this.paymentDate);
    },
  },
  methods: {
    formatDate(date) {
     if (!date) return null
      if (date instanceof Date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${month}/${day}/${year}`
      }
      if (typeof date === 'string') {
        const [year, month, day] = date.split('-')
        return `${month}/${day}/${year.substr(0,4)}`
      }
      
      return null
    },
    cleanup() {
      this.waiting = false;
      this.showSuccessMessages = false;
      this.successMessages = [];
      this.showErrorMessages = false;
      this.errorMessages = [];
      this.paymentDate = null;
      this.paymentAmount = null;
      this.comment = null;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
    open(mode, franchiseId, invoiceItem) {
      this.mode = mode;
      this.accountId = franchiseId;
      this.isInvoiceDeleted = false;
      this.invoiceItem = invoiceItem;
      this.paymentDate = invoiceItem.paymentDate
        ? new Date(invoiceItem.paymentDate).toISOString().substr(0, 10)
        : null;
      this.paymentAmount = (invoiceItem.paymentAmount) ? invoiceItem.paymentAmount.toFixed(2) : null;
      this.comment = null;
      this.dialog = true;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
    submit() {
      if (this.validate()) {
        if (this.isDeleteMode) {
          this.deleteFranchiseInvoice();
        }
        if (this.isUpdateMode) {
          this.updateFranchiseInvoice();
        }
      }
    },
    isPaymentAmountRequired(v) {
      if (this.isUpdateMode) {
        if (v == null) {
          return false;
        }
        if (v.length == 0) {
          return false;
        }
      }
      return true;
    },
    isPaymentAmountValid(v) {
      if (this.isUpdateMode) {
        if (!/^(\d{1,3}(,\d{3})*|(\d+))(\.\d{2})?$/.test(v)) {
          return false;
        }
      }
      return true;
    },
    isPaymentDateRequired(v) {
      if (this.isUpdateMode) {
        if (v == null) {
          return false;
        }
        if (v.length == 0) {
          return false;
        }
      }
      return true;
    },
    isCommentValid(v) {
      if (v && v.length <= 15) {
        return false;
      }
      return true;
    },
    validate() {
      return this.$refs.form.validate();
    },
    close() {
      this.cleanup();
      this.dialog = false;
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
    deleteFranchiseInvoice() {
      this.waiting = true;
      this.showSuccessMessages = false;
      this.successMessages = [];
      this.showErrorMessages = false;
      this.errorMessages = [];

      let request = {};
      request.userId = this.$store.state.currentUser.user;
      request.franchiseId = this.franchiseId;
      request.invoiceId = this.invoiceItem.invoiceId;
      request.userComment = this.comment;

      dataService.deleteFranchiseInvoice(request).then((response) => {
        this.waiting = false;
        let responseData = response.data;
        if (responseData.statusCode == 200) {
          this.isInvoiceDeleted = true;
          this.setSuccessMessages("Invoice has been deleted successfully.");
          eventBus.emit(
            "invoiceDeleted",
            responseData.franchiseInvoiceDetails[0]
          );
        } else {
          this.isInvoiceDeleted = false;
          this.setErrorMessages(
            "There was an error, please contact your administrator."
          );
        }
      });
    },
    updateFranchiseInvoice() {
      this.waiting = true;
      this.showSuccessMessages = false;
      this.successMessages = [];
      this.showErrorMessages = false;
      this.errorMessages = [];

      let request = {};
      request.userId = this.$store.state.currentUser.user;
      request.franchiseId = this.franchiseId;
      request.invoiceId = this.invoiceItem.invoiceId;
      request.paymentDate = this.paymentDate;
      request.paymentAmount = this.paymentAmount;
      request.userComment = this.comment;

      dataService.updateFranchiseInvoice(request).then((response) => {
        this.waiting = false;
        let responseData = response.data;
        if (responseData.statusCode == 200) {
          this.setSuccessMessages("Invoice has been updated successfully.");
          eventBus.emit(
            "invoiceUpdated",
            responseData.franchiseInvoiceDetails[0]
          );
        } else {
          this.setErrorMessages(
            "There was an error, please contact your administrator."
          );
        }
      });
    },
  },
};
</script>