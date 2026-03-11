<template>
  <span>
    <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2"></v-breadcrumbs>
    <v-form ref="form">
      <v-row
        align="center"
        align-content="center"
        justify="center"
      >
        <v-col lg="3" xl="3" md="4" sm="4" style="margin-left:20px !important;">
          <v-row>
            <v-text-field
              variant="solo"
              rounded
              label="*Account Number"
              v-model="franchiseId"
               append-inner-icon="mdi-magnify"
              class="roundedTextBox search-text-box"
              :rules="franchiseIdRules"
              required
              maxlength="5"
              v-on:keyup="onChange"
              ref="franchiseId"
            ></v-text-field>
          </v-row>
          <v-row v-if="companyName">
            <div class="company-name">{{ companyName }}</div>
          </v-row>
        </v-col>
        <v-col lg="1" xl="1" md="1" sm="1" align="right">
          <span>Due Date</span>
        </v-col>
        <v-col lg="1" xl="1" md="2" sm="2">
          <v-row>
            <v-dialog
              ref="dueDateDialog"
              v-model="dueDatePickerModal"
              :return-value.sync="dueDate"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  variant="solo"
                  rounded
                  class="roundedTextBox search-text-box"
                  v-model="dueDateFormatted"
                  label="Due Date"
                  readonly
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker v-model="dueDate" scrollable color="#00558c"  >
                <v-spacer></v-spacer>
                 <template v-slot:actions>
                      <v-btn variant="text" color="#00558c" @click="dueDatePickerModal = false">Cancel</v-btn>
                      <v-btn variant="text" color="#00558c"  @click="dueDatePickerModal = false">OK</v-btn>
                 </template>
                
              </v-date-picker>
            </v-dialog>
          </v-row>
        </v-col>
        <v-col lg="2" xl="2" md="3" sm="3" align="right">
          <span>Payment Date</span>
        </v-col>
        <v-col lg="1" xl="1" md="2" sm="2">
          <v-row>
            <v-dialog
              ref="startDateDialog"
              v-model="startDatePickerModal"
              :return-value.sync="startDate"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  variant="solo"
                  rounded
                  class="roundedTextBox search-text-box pad-right"
                  v-model="startDateFormatted"
                  label="From"
                  readonly
                  v-bind="props"
                  :rules="startDateRules"
                ></v-text-field>
              </template>
              <v-date-picker v-model="startDate" scrollable color="#00558c"  >
                <v-spacer></v-spacer>
                 <template v-slot:actions>
                      <v-btn text color="#00558c" @click="startDatePickerModal = false">Cancel</v-btn>
                     <v-btn text color="#00558c" @click="startDatePickerModal = false">OK</v-btn>
                 </template>
              </v-date-picker>
            </v-dialog>
          </v-row>
        </v-col>
        <v-col lg="1" xl="1" md="1" sm="1">
          <v-row>
            <v-dialog
              ref="endDateDialog"
              v-model="endDatePickerModal"
              :return-value.sync="endDate"
              persistent
              width="290px"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  variant="solo"
                  rounded
                  class="roundedTextBox search-text-box"
                  v-model="endDateFormatted"
                  label="To"
                  readonly
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker v-model="endDate" scrollable color="#00558c"  >
                <v-spacer></v-spacer>
                <template v-slot:actions>
                <v-btn text color="#00558c" @click="endDatePickerModal = false">Cancel</v-btn>
                <v-btn text color="#00558c" @click="endDatePickerModal = false">OK</v-btn>
                 </template>
              </v-date-picker>
            </v-dialog>
          </v-row>
        </v-col>
        <v-col lg="1" xl="1" md="1" sm="1" align="right">
          <v-btn color="#319B42" class="menuBtn" large dark @click.stop="getInvoices()">Filter</v-btn>
        </v-col>
        <v-col lg="1" xl="1" md="1" sm="1">
          <v-btn class="menuBtn" large v-show="!canReset">Reset</v-btn>
          <v-btn class="menuBtn" large color="#319B42" dark v-show="canReset" @click="reset">Reset</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-row justify="center" align="center" align-content="center" v-if="!waiting && isSearched">
      <v-col cols="11">
        <v-data-table
          ref="dataTable"
          :headers="headers"
          :items="items"
          class="elevation-1"
          :loading="waiting"
          item-key="item.index"
          :items-per-page.sync="itemsPerPage"
          dark
          must-sort
          :page.sync="page"
          no-data-text="No invoice found."
          items-per-page-text="Display records per page:"
          :footer-props="{
                    'items-per-page-options': [10, 25, 50, 100, 200,-1] ,
                    'show-current-page': true,
                    'show-first-last-page': true,
                    'items-per-page-text': 'Display records per page: ' }"
        >
          <template v-slot:item.action="{ item }">
            <v-tooltip location="top"  content-class="bg-blue-darken-4 text-white opacity-100" >
              <template v-slot:activator="{ props }">
                <v-icon
                  color="blue"
                  @click="updateInvoice(item)"
                  v-bind="props"
                >mdi-file-document-edit-outline</v-icon>
              </template>
              <span>Update Invoice</span>
            </v-tooltip>
            <v-tooltip location="top"  content-class="bg-blue-darken-4 text-white opacity-100">
              <template v-slot:activator="{ props }">
                <v-icon color="orange" @click="deleteInvoice(item)" v-bind="props">mdi-trash-can-outline</v-icon>
              </template>
              <span>Delete Invoice</span>
            </v-tooltip>
          </template>
          <template v-slot:footer.page-text="{pageStart, pageStop, itemsLength}">
            <div
              :class="$vuetify.display.smAndDown?'v-data-footer__select smallFooter':'v-data-footer__select'"
            >
              <span
                v-if="$vuetify.display.mdAndUp"
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

    <v-row>
      <v-row align="center" justify="center" align-content="center">
        <UpdateDeleteDialog ref="editDialog" :franchiseId="franchiseId" />
      </v-row>
    </v-row>
  </span>
</template>
<script>
import dataService from "@/services/dataService";
import UpdateDeleteDialog from "./UpdateDeleteInvoiceDialog";
import eventBus from "@/event-bus.js";
import * as Vue from 'vue'

export default {
  name: "HomeOfficeInvoiceTool",
  components: {
    UpdateDeleteDialog,
  },
  data() {
    return {
      breadcrumbItems: [
        {
          title: "Home Office",
          disabled: false,
          to: "hoLanding",
        },
        {
          title: "Account Maintenance",
          disabled: false,
          to: "HOSystemTools",
        },
        {
          title: "Invoice Maintenance",
          disabled: true,
        },
      ],
      franchiseIdRules: [
        (v) => !!v || "Account Number is required",
        (v) => v.length == 5 || "Account Number is invalid",
        (v) => /\d{5}/.test(v) || "Account Number is invalid",
      ],
      startDateRules: [(v) => this.validateStartDate(v) || "Required"],
      isSearched: false,
      waiting: false,
      franchiseId: "",
      companyName: "",
      dueDatePickerModal: false,
      dueDate: null,
      startDatePickerModal: false,
      startDate: null,
      endDatePickerModal: false,
      endDate: null,
      invoiceStatusCodes : [
          { "code" : "A", "shortDesc" : "Ready"},
          { "code" : "C", "shortDesc" : "Changed"},
          { "code" : "F", "shortDesc" : "Past Due"},
          { "code" : "P", "shortDesc" : "Paid"},
          { "code" : "RA", "shortDesc" : "Previous Policy"},
          { "code" : "S", "shortDesc" : "Submitted"},
      ],
      items: [],
      page: 1,
      itemsPerPage: 10,
    };
  },
  created() {
    eventBus.on("invoiceUpdated", (item) => {
      if (item) {
        var index = this.items.findIndex(function (elem) {
          return elem.invoiceId == item.invoiceId;
        });
        if (index >= 0) {
          let displayItem = this.formatDisplayItem(item);
          this.items.splice(index, 1, displayItem);
        }
      }
    });

    eventBus.on("invoiceDeleted", (item) => {
      if (item) {
        var index = this.items.findIndex(function (elem) {
          return elem.invoiceId == item.invoiceId;
        });
        if (index >= 0) {
          this.items.splice(index, 1);
        }
      }
    });
  },
  methods: {
    formatDatePicker(date) {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null; 
      
      return d.toLocaleDateString('en-US')
    },
    reset() {
      this.franchiseId = "";
      this.dueDate = null;
      this.startDate = null;
      this.endDate = null;
      this.companyName = "";
      this.isSearched = false;
    },
    cleanup() {
      this.waiting = false;
      this.showSuccessMessages = false;
      this.successMessages = [];
      this.showErrorMessages = false;
      this.errorMessages = [];
    },
    onChange() {
      if (this.$refs.franchiseId.validate()) {
        setTimeout(this.getCompanyName(), 200);
      } else {
        this.companyName = "";
      }
    },
    getCompanyName() {
      dataService.getCompanyInfo(this.franchiseId).then((response) => {
        let responseData = response.data;
        if (responseData.statusCode == 200 || responseData.companyName) {
          this.companyName = responseData.companyName;
        }
      });
    },
    validateStartDate() {
      if (this.endDate && !this.startDate) {
        return false;
      }
      return true;
    },
    validate() {
      return this.$refs.form.validate();
    },
    getInvoices() {
      if (!this.validate()) {
        return;
      }

      this.items = [];
      this.waiting = true;
      this.getInvoicesByFranchiseId().then((response) => {
        this.isSearched = true;
        this.waiting = false;
        if (response.status == 200) {
          let responseData = response.data;
          if (responseData.franchiseInvoiceDetails) {
            responseData.franchiseInvoiceDetails.forEach((element) => {
              let item = this.formatDisplayItem(element);
              this.items.push(item);
            });
          }
        }
      });
    },
   money(value) {
       if (!value) return '$0.00';
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
   },
    formatDisplayItem(elem) {
      let item = {};
      item.invoiceId = elem.invoiceId ? elem.invoiceId : null;
      item.dueDate = elem.dueDate
        ? this.formatDate(new Date(elem.dueDate))
        : null;
      item.paymentAmount = elem.paymentAmount ? elem.paymentAmount : null;
      item.displayPaymentAmount = elem.paymentAmount
         ? this.money(elem.paymentAmount) 
         : null;
      item.paymentDate = elem.paymentDate
        ? this.formatDate(new Date(elem.paymentDate))
        : null;
      item.statusCode = elem.statusCode;
      item.shortDesc = this.getInvoiceStatusDesc(elem.statusCode);
      return item;
    },
    getInvoiceStatusDesc(code){
      if (code) {
        var elem = this.invoiceStatusCodes.find(c => c.code == code);
        if (elem) {
          return elem.shortDesc;
        }
      }
      return code;
    },
    formatDate(date) {
      var year = date.getFullYear();
      if (year < 1900) return "";
      var month = (1 + date.getMonth()).toString();
      month = month.length > 1 ? month : "0" + month;
      var day = date.getDate().toString();
      day = day.length > 1 ? day : "0" + day;
      return month + "/" + day + "/" + year;
    },
    getInvoicesByFranchiseId() {
      let req = {};
      req.franchiseId = this.franchiseId;
      req.dueDate = this.dueDate;
      req.startDate = this.startDate;
      req.endDate = this.endDate;
      return dataService.getInvoicesByFranchiseId(req);
    },
    updateInvoice(item) {
      this.cleanup();
      this.$refs.editDialog.open("Update", this.franchiseId, item);
    },
    deleteInvoice(item) {
      this.cleanup();
      this.$refs.editDialog.open("Delete", this.franchiseId, item);
    },
  },
  computed: {
    canReset() {
      let hasInput =
        this.franchiseId || this.dueDate || this.startDate || this.endDate;
      return hasInput;
    },
    dueDateFormatted() {
      return this.formatDatePicker(this.dueDate);
    },
    startDateFormatted() {
      return this.formatDatePicker(this.startDate);
    },
    endDateFormatted() {
      return this.formatDatePicker(this.endDate);
    },
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
        { title: "Invoice Number", key: "invoiceId", align: "center" },
        { title: "Invoice Due Date", key: "dueDate", align: "center" },
        { title: "Amount Paid", key: "displayPaymentAmount", align: "center" },
        { title: "Date Paid", key: "paymentDate", align: "center" },
        //{ text: "Status Code", value: "statusCode", align: "center" },
        { title: "Status", key: "shortDesc", align: "center" },
        { title: "Actions", key: "action", sortable: false, align: "center" },
      ];
    },
  },
};
</script>
<style scoped>
.company-name {
  margin-left: 10px;
  margin-top: -25px;
  margin-bottom: 10px;
  height: 20px;
  font-size: 14px;
}
.pad-right {
  margin-right: 10px;
}
</style>