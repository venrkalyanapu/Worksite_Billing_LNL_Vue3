<template>
  <span id="invoiceHistory">
    <v-form ref="form" v-model="valid">
      <v-row>
        <v-layout style="margin-left:50px !important;"
          align-content="center"
          align="center"
          justify="center"
          v-if="$vuetify.display.mdAndUp"
        >
          <v-col lg="3" xl="3" md="4" sm="4">
            <v-text-field
  v-model="search"
  label="Search Invoices for..."
  class="roundedTextBox"
  variant="solo"
  rounded

  :rules="searchRules"
  append-inner-icon="mdi-magnify"
  @keyup.enter="gotoSearchBy('searchBy')"
  
/>
          </v-col>
          <v-col lg="1" xl="1" md="1" sm="1" align="center">
            <span class="searchHeader">by</span>
          </v-col>
          <v-col lg="3" xl="3" md="3" sm="4">
            <v-select
              :items="searchByItems"
              v-model="searchBy"
              :rules="searchByRules"
              class="roundedTextBox"
              ref="searchBy"
              @change.passive="$refs['searchRef'].$el.focus()"
              v-on:keyup.enter="$refs['searchRef'].$el.focus()"
              variant="solo"
                    rounded
            ></v-select>
          </v-col>
          <v-col lg="2" xl="1" md="2" sm="2" align="center">
            <v-btn
              class="menuBtn bottomMargin"
              large
              color="#319B42"
              ref="searchRef"
              @click.stop="searchPolicies"
              dark
              >Search</v-btn
            >
          </v-col>
          <v-col lg="1" xl="1" md="2" sm="2">
            <v-btn
              class="menuBtn bottomMargin"
              large
              color="#d1d1d1"
              dark
              v-show="search == ''"
              >Reset</v-btn
            >
            <v-btn
              v-show="search != ''"
              class="menuBtn bottomMargin"
              large
              color="#319B42"
              @click.stop="resetPolicies"
              dark
              >Reset</v-btn
            >
          </v-col>
        </v-layout>
        <v-layout
          align-content="center"
          align="center"
          justify="center"
          v-if="$vuetify.display.smAndDown"
        >
          <v-container>
            <v-row>
              <v-col :cols="12" align="center">
                <v-text-field
                  solo
                  label="Search Invoices for..."
                  class="roundedTextBox"
                  :rules="searchRules"
                  append-icon="search"
                  v-model="search"
                  v-on:keyup.enter="gotoSearchBy('searchBy')"
                  variant="solo"
                  rounded
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col :cols="12" align="center">
                <span class="searchHeader">by</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col :cols="12" align="center">
                <v-select
                  :items="searchByItems"
                  v-model="searchBy"
                  :rules="searchByRules"
                  variant="solo"
                  rounded
                  class="roundedTextBox"
                  ref="searchBy"
                  @change.passive="$refs['searchRef'].$el.focus()"
                  v-on:keyup.enter="$refs['searchRef'].$el.focus()"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col align="center" :cols="6">
                <v-btn
                  class="menuBtn bottomMargin"
                  large
                  color="#319B42"
                  @click.stop="searchPolicies"
                  ref="searchRef"
                  dark
                  >Search</v-btn
                >
              </v-col>
              <v-col align="center" :cols="6">
                <v-btn
                  class="menuBtn bottomMargin"
                  large
                  color="#d1d1d1"
                  dark
                  v-show="search == ''"
                  >Reset</v-btn
                >
                <v-btn
                  v-show="search != ''"
                  class="menuBtn bottomMargin"
                  large
                  color="#319B42"
                  @click.stop="resetPolicies"
                  dark
                  >Reset</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-layout>
      </v-row>
    </v-form>
    <v-row justify="center" align-content="center" style="margin-left: 20px !important;margin-right:30px !important;">
      <span class="introText" style="color:#474c55 !important;">
        Past invoices are listed below. Payment dates, billed amounts, and
        invoice statuses are available in the table. You can view or export
        copies of previous invoices and view remittance notices.
      </span>
    </v-row>
    <br />
    <v-layout
      align="end"
      align-content="end"
      justify="end"
      v-if="$store.state.testFeatures"
    >
      <v-layout justify="left" align-content="left">
        <span class="discrepancyNote" v-if="hasDiscrepancy">
          <i>{{ discrepancyNote }}</i>
        </span>
      </v-layout>
      <span class="exportText">
        <i>
          Download Invoice History
          <v-icon x-small>mdi-arrow-right</v-icon>&nbsp;
        </i>
      </span>
      <v-tooltip top :color="mainColor">
        <template #activator="{ props }">
          <v-icon @click="generateExcel()" color="#319B42" dark v-bind="props"
            >mdi-file-excel</v-icon
          >
        </template>
        <span>Excel</span>
      </v-tooltip>
      <v-tooltip top :color="mainColor">
        <template #activator="{ props }">
          <v-icon @click="generatePDF()" color="#ED722F" dark v-bind="props" 
            >mdi-file-pdf-box</v-icon
          >
        </template>
        <span>PDF</span>
      </v-tooltip>
    </v-layout>
    <v-layout v-else>
      <br />
    </v-layout>

    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="filteredItems"
      class="elevation-3"
      :loading="searching"
      item-key="item.index"
      :items-per-page.sync="itemsPerPage"
      :page.sync="page"
    
      no-data-text="No invoices found."
      id="invoiceHistoryTable"
    
      :sort-desc="true"
      must-sort
     
    >
      <!-- <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }">
        <div
          :class="
            $vuetify.display.smAndDown
              ? 'v-data-footer__select smallFooter'
              : 'v-data-footer__select'
          "
        >
          <span v-if="$vuetify.display.mdAndUp"
            >Viewing items: {{ pageStart }}-{{ pageStop }} of
            {{ itemsLength }}</span
          >
          <span style="margin-left: 10px">Page:&nbsp;</span>
          <v-select
            :items="pages"
            v-model="page"
            item-text="page"
            item-value="page"
            menu-props="auto"
            hide-details
            style="width: 75px; font-size: 0.75rem; margin-right: 20px"
          ></v-select>
          &nbsp;of&nbsp;{{ maxPages }}
        </div>
      </template> -->

      <template v-slot:header.dueDate="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Invoice Due Date</span>
        </v-tooltip>
      </template>

      <template v-slot:header.amountBilled="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title  }}</span>
          </template>
          <span>Amount Billed</span>
        </v-tooltip>
      </template>

      <!-- <template v-slot:header.adjustmentAmount="{ header }">
        <v-tooltip top color="#00558b">
          <template v-slot:activator="{ on }">
            <span v-on="on">{{ header.text }}</span>
          </template>
          <span>Total Adjustments</span>
        </v-tooltip>
      </template> -->

      <template v-slot:header.displayAdjustmentAmount="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Total Adjustments</span>
        </v-tooltip>
      </template>

      <template v-slot:header.amountPaid="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Amount Paid</span>
        </v-tooltip>
      </template>

      <template v-slot:header.paymentDate="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Date Paid</span>
        </v-tooltip>
      </template>

      <template v-slot:header.invoiceStatus="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Invoice Status</span>
        </v-tooltip>
      </template>

      <template v-slot:header.link="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>View &amp; Export Invoice</span>
          <!-- <span>View Remittance Notice</span> -->
        </v-tooltip>
      </template>

      <template v-slot:item.link="{ item }">
        <!-- <span class="viewLink" @click="getDetail(item)">View Invoice</span>
        <v-icon
          color="#319B42"
          small
          class="viewLink"
          style="margin-left:3px;margin-bottom:3px;"
          @click="getDetail(item)"
        >mdi-chevron-double-right</v-icon>-->

        <v-tooltip top :color="mainColor">
          <template #activator="{ props }">
            <v-icon
              @click="getDetail(item)"
              color="#00558c"
              dark
              v-bind="props"
              class="padRightIcon"
              >mdi-page-next-outline</v-icon
            >
          </template>
          <span>View Invoice</span>
        </v-tooltip>

        <v-tooltip top :color="mainColor">
          <template #activator="{ props }">
            <v-icon
              @click="exportInvoiceExcel(item)"
              color="#319B42"
              dark
              v-bind="props"
              class="iconColumn"
              >mdi-file-excel</v-icon
            >
          </template>
          <span>Download Invoice as Excel</span>
        </v-tooltip>
        <v-tooltip top :color="mainColor">
          <template #activator="{ props }">
            <v-icon
              @click="exportInvoicePDF(item)"
              color="#ED722F"
              dark 
              
              v-bind="props"
              class="iconColumn"
              >mdi-file-pdf-box</v-icon
            >
          </template>
          <span>Download Invoice as PDF</span>
        </v-tooltip>
      </template>
      <template v-slot:item.amountPaid="{ item }"> {{ 
        $filters.money(item.amountPaid) 
      }}</template>
      <template v-slot:item.amountBilled="{ item }">{{
        $filters.money(item.amountBilled)
      }}</template>
      <!-- <template v-slot:item.adjustmentAmount="{ item }">{{ item.adjustmentAmount | money }}</template> -->
      <template v-slot:item.displayAdjustmentAmount="{ item }">{{
        $filters.money(item.displayAdjustmentAmount)
      }}</template>
      <template v-slot:item.dueDate="{ item }">{{
        $filters.mdyyyy(item.dueDate) 
      }}</template>
      <template v-slot:item.paymentDate="{ item }">{{
        
        $filters.mdyyyy(item.paymentDate)
      }}</template>
    </v-data-table>

    <v-dialog
      v-model="waitDialog"
      persistent
      width="350"
      attach="#invoiceHistoryTable"
    >
      <v-card color="#44aba8" dark>
        <v-card-text>
          <v-row>
            <v-col>
              Saving to xlsx format...
              <v-progress-linear
                indeterminate
                color="white"
                class="mb-0"
              ></v-progress-linear>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-progress-circular
      v-if="waiting"
      :class="$vuetify.display.smAndDown ? 'waitCircleSm' : 'waitCircle'"
      indeterminate
      color="#319B42"
      :size="70"
      width="10"
    ></v-progress-circular>

    <v-dialog v-model="errDialog" persistent width="325">
      <v-card>
        <v-card-text>
          <br />
          <v-row>
            <v-col>Something went wrong. Please try again.</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn bottomMargin"
            @click="errDialog = false"
            >OK</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>
<script>
// import store from "@/store";
import glLnlSmBlue from '@/assets/glLnlSmBlue.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { applyPlugin } from 'jspdf-autotable';
import dateFormat from "dateformat";

import { HTTP } from "@/HTTP-common.js";
import { HTTP_Excel } from "@/HTTP-common.js";

import exportInvoice from "@/export-invoice.js";

import Log from "@/log.js";
import eventBus from "@/event-bus.js";
applyPlugin(jsPDF);
export default {
  name: "InvoiceHistory",

  mounted() {
    eventBus.on(
      "errDialog",
      function () {
        this.errDialog = true;
      }.bind(this)
    );

    eventBus.on(
      "excelWait",
      function () {
        this.waitDialog = true;
      }.bind(this)
    );

    eventBus.on(
      "excelDone",
      function () {
        this.waitDialog = false;
      }.bind(this)
    );
  },
  beforeDestroy() {
    eventBus.off("errDialog");
    eventBus.off("excelWait");
    eventBus.off("excelDone");
  },

  created() {
    try {
      let userType = window.sessionStorage.getItem("type");

      if (userType == "homeoffice") {
        if (this.$store.state.currentFranchise.franchiseNumber == "") {
          return router.push("hoSearchCompanies?dialog=true");
        }
      } else {
        if (this.$store.state.currentFranchise.franchiseNumber == "") {
          return router.push("/search?dialog=true");
        }
      }

      this.searching = true;

      HTTP.get("InvoiceHistory/GetInvoiceHistory", {
        params: {
          franchiseId: this.currentFranchise,
        },
        //withCredentials: true,
      })
        .then((response) => {
          try {
            if (response.status != 200) {
              Log.logError(
                response.statusText,
                "InvoiceHistoryPage.vue created InvoiceHistory/GetInvoiceHistory response"
              );
              this.searching = false;
              this.errDialog = true;
            } else {
              
              //this.listHistItems = response.data.invoices;
              //this.fullListHistItems = response.data.invoices;
              let formattedInvoices = this.formatInvoiceData(
                response.data.invoices
              );
              this.listHistItems = formattedInvoices;
              this.fullListHistItems = formattedInvoices;
              this.searching = false;
          
            }
          } catch (e) {
            Log.logError(
              e,
              "InvoiceHistoryPage.vue created InvoiceHistory/GetInvoiceHistory response"
            );
            this.errDialog = true;
            this.searching = false;
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "InvoiceHistoryPage.vue created InvoiceHistory/GetInvoiceHistory"
          );
          this.errDialog = true;
          this.errors.push(e);
        });
    } catch (e) {
      Log.logError(e, "InvoiceHistoryPage.vue created");

      this.errDialog = true;
    }
  },
  data() {
    return {
      sortBy: [{key :'dueDate'}],
      errDialog: false,
      searchClicked: false,
      searchActive: false,
      waitDialog: false,
      selected: [],
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      search: "",
      searchBy: "",
      valid: true,
      searchByItems: ["Policy Number", "Employee Name", "Employee ID"],
      searching: false,
      searchRules: [
        (v) => !!v || !this.searchClicked || "Please enter a search term.",
      ],
      searchByRules: [
        (v) => !!v || !this.searchClicked || "Please select a search field.",
      ],
      pagination: { totalItems: 200, rowsPerPage: 10, page: 1 },
      headers: [
        { title: "Invoice Due Date", key: "dueDate", dataType: "string" },
        { title: "Amount Billed", key: "amountBilled", dataType: "number" },
        // { text: "Total Adjustments", value: "adjustmentAmount" },
        {
          title: "Total Adjustments",
          key: "displayAdjustmentAmount",
          dataType: "number",
        },
        { title: "Amount Paid", key: "amountPaid", dataType: "number" },
        { title: "Date Paid", key: "paymentDate", dataType: "string" },
        { title: "Invoice Status", key: "invoiceStatus", dataType: "string" },
        {
          title: "View & Export",
          key: "link",
          align: "center",
          sortable: false,
        },
        // {
        //   text: "Remittance Notice",
        //   value: "link",
        //   align: "center",
        //   sortable: false
        // }
      ],
      excelheaders: [
        { text: "Invoice Due Date", value: "dueDate", dataType: "string" },
        { text: "Amount Billed", value: "amountBilled", dataType: "number" },
        // { text: "Total Adjustments", value: "adjustmentAmount" },
        {
          text: "Total Adjustments",
          key: "displayAdjustmentAmount",
          dataType: "number",
        },
        { text: "Amount Paid", value: "amountPaid", dataType: "number" },
        { text: "Date Paid", value: "paymentDate", dataType: "string" },
        { text: "Invoice Status", value: "invoiceStatus", dataType: "string" },
        {
          text: "View & Export",
          value: "link",
          align: "center",
          sortable: false,
        },
        // {
        //   text: "Remittance Notice",
        //   value: "link",
        //   align: "center",
        //   sortable: false
        // }
      ],
      listHistItems: [],
      fullListHistItems: [],
      errors: [],
      hasDiscrepancy: false,
      discrepancyNote:
        "Note: - Adjustment details are only available for online payments",
    };
  },
  computed: {
    filteredItems() {
      return this.formatDataTable(this.headers, this.listHistItems);
    },
    maxPages() {
      if (this.itemsPerPage === -1) return 1;

      var itemsLength = this.filteredItems.length;

      return (
        Math.floor(itemsLength / this.itemsPerPage) +
        (itemsLength % this.itemsPerPage > 0 ? 1 : 0)
      );
    },
    pages() {
      // get max pages:

      let ret = [];

      let maxPages = this.maxPages;

      for (let i = 1; i <= maxPages; i++) {
        ret.push(i);
      }

      return ret;
    },
    waiting() {
      return this.searching;
    },
    currentFranchise() {
      return this.$store.state.currentFranchise.franchiseNumber;
    },
    invoiceHistory() {
      return this.$store.state.invoiceHistory;
    },
    mainColor() {
      return this.$store.state.mainColor;
    },
  },
  methods: {
    exportInvoiceExcel(invoice) {
      exportInvoice.generateInvoiceExcel(invoice);
    },
    exportInvoicePDF(invoice) {
      //console.log(invoice);
      exportInvoice.generateInvoicePDF(invoice);
    },

    gotoSearchBy(refName) {
      this.$refs[refName].activateMenu();
      this.$refs[refName].focus();
    },
    searchPolicies() {
      this.searchClicked = true;
      this.searchActive = true;

      try {
        if (this.$refs.form.validate()) {
          this.listHistItems = [];
          this.searching = true;

          let polNum = null;
          let empId = null;
          let empName = null;

          if (this.searchBy == "Employee Name") empName = this.search;
          else if (this.searchBy == "Employee ID") empId = this.search;
          else if (this.searchBy == "Policy Number") polNum = this.search;

          HTTP.get("InvoiceHistory/GetInvoiceHistorySearch", {
            params: {
              franchiseId: this.currentFranchise,
              policyNumber: polNum,
              employeeId: empId,
              employeeName: empName,
            },
            //withCredentials: true,
          })
            .then((response) => {
              this.listHistItems = response.data.invoices;
              this.searching = false;
            })
            .catch((e) => {
              this.errors.push(e);
              this.searching = false;
              Log.logError(
                e,
                "InvoiceHistoryPage.vue searchPolicies InvoiceHistory/GetInvoiceHistorySearch"
              );
            });
        }
      } catch (e) {
        this.searching = false;
        Log.logError(e, "InvoiceHistoryPage.vue searchPolicies");
      }
      this.searchClicked = false;
    },
    resetPolicies() {
      this.searchActive = false;
      this.searchClicked = false;
      this.search = "";
      this.seachyBy = "";
      this.$refs.form.resetValidation();
      this.listHistItems = this.fullListHistItems;
    },
    getDetail(item) {
      this.$store.commit("setCurrentInvoice", item);
      this.$router.push({ name: "Invoice View" });
    },
    formatInvoiceData(invoices) {
      
      invoices.forEach((invoice) => {
        invoice.displayAdjustmentAmount = invoice.totalAdjustedAmount;
        if (
          invoice.amountBilled != invoice.amountPaid &&
          invoice.invoiceStatus == "P"
        ) {
          if (
            !invoice.totalAdjustedAmount ||
            invoice.totalAdjustedAmount == 0
          ) {
            invoice.displayAdjustmentAmount =
              invoice.amountPaid - invoice.amountBilled;
            //Per QA, don't show this note on history page
            //this.hasDiscrepancy = true;
          }
        }
      
        
      });
    
      return invoices;
    },
    generateData(headers, pdfdata) {
      var result = [];

      try {
        for (let i = 0; i < pdfdata.length; i++) {
          let dataArray = [];

          for (let j = 0; j < headers.length; j++) {
            dataArray.push(pdfdata[i][headers[j].key]);
          }

          result.push(dataArray);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue generateData");
      }

      return result;
    },
    createHeaders(headers) {
      var result = [];
      try {
        for (var i = 0; i < headers.length - 1; i += 1) {
          result.push(headers[i].title);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue createHeaders");
      }
      return [result];
    },
    getHeadersExcel(excelheaders) {
      let result = [];

      try {
        for (let j = 0; j < excelheaders.length - 1; j++) {
          result.push(excelheaders[j]);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue getHeadersExcel");
      }

      return result;
    },
    formatDataExcel(headers, items) {
      let dataArray = [];
      try {
        for (let i = 0; i < items.length; i++) {
          let newItem = {};

          for (let j = 0; j < headers.length - 1; j++) {
            let value = items[i][headers[j].key];

            switch (headers[j].key) {
              case "dueDate":
              case "paymentDate":
                value = this.$filters.mdyyyy(value);
                if (value == "1/1/1900") value = "";
                break;

              case "adjustmentAmount":
              case "amountBilled":
              case "amountPaid":
              case "displayAdjustmentAmount":
                value = this.$filters.money(value);
                break;

              case "invoiceStatus":
                if (value.toUpperCase() == "C") value = "Changed";
                else if (value.toUpperCase() == "F") value = "Past Due";
                else if (value.toUpperCase() == "P") value = "Paid";
                else if (value.toUpperCase() == "S") value = "Submitted";
                else if (value.toUpperCase() == "A")
                  value = "Ready for Reconciliation";
                break;
            }

            value = value ? value : "";
            newItem[headers[j].key] = value;
          }

          newItem.link = "";

          dataArray.push(newItem);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue formatDataExcel");
      }
      return dataArray;
    },
    formatDataTable(headers, items) {
      let dataArray = [];
      try {
        for (let i = 0; i < items.length; i++) {
          let newItem = {};

          for (let j = 0; j < headers.length; j++) {
            let value = items[i][headers[j].key];


            switch (headers[j].key) {
              case "invoiceStatus":
                if (value.toUpperCase() == "C") value = "Changed";
                else if (value.toUpperCase() == "F") value = "Past Due";
                else if (value.toUpperCase() == "P") value = "Paid";
                else if (value.toUpperCase() == "S") value = "Submitted";
                else if (value.toUpperCase() == "A")
                  value = "Ready for Reconciliation";

                break;
            }

            newItem[headers[j].key] = value;
          }

          newItem.invoiceId = items[i].invoiceId;

          dataArray.push(newItem);
        
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue formatDataTable");
      }

      return dataArray;
    },
    formatDataPDF(headers, items) {
      let dataArray = [];
      try {
        for (let i = 0; i < items.length; i++) {
          let newItem = {};

          for (let j = 0; j < headers.length; j++) {
            let value = items[i][headers[j].key];

            switch (headers[j].key) {
              case "dueDate":
              case "paymentDate":
                value = this.$filters.mdyyyy(value);

                if (value == "1/1/1900") value = "";

                break;

              case "adjustmentAmount":
              case "amountBilled":
              case "amountPaid":
              case "displayAdjustmentAmount":
                value = this.$filters.money(value);
                break;

              case "invoiceStatus":
                if (value.toUpperCase() == "C") value = "Changed";
                else if (value.toUpperCase() == "F") value = "Past Due";
                else if (value.toUpperCase() == "P") value = "Paid";
                else if (value.toUpperCase() == "S") value = "Submitted";
                else if (value.toUpperCase() == "A")
                  value = "Ready for Reconciliation";

                break;
            }

            newItem[headers[j].key] = value;
          }

          newItem.invoiceId = items[i].invoiceId;

          dataArray.push(newItem);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue formatDataPDF");
      }

      return dataArray;
    },
    s2ab(s) {
      try {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue s2ab");
        try {
          if (s != null) return new ArrayBuffer(s.length);
        } catch (e) {
          Log.logError(e, "InvoiceHistoryPage.vue s2ab catch");
          throw e;
        }
      }
    },
    generateExcel() {
      try {
        this.waitDialog = true;
        let excel_body = {
          fileName:
            "invoiceHistory_" +
            this.$store.state.currentFranchise.franchiseNumber +
            "_" +
            dateFormat(Date.now(), "mmddyyyy") +
            "_" +
            dateFormat(Date.now(), "hhMMss"),
          titleLines: [],
          headers: this.getHeadersExcel(this.excelheaders),
          items: this.formatDataExcel(this.headers, this.listHistItems),
        };
        if (this.hasDiscrepancy) {
          excel_body.titleLines.push(this.discrepancyNote);
        }

        this.downloadExcelFile(excel_body);
      } catch (e) {
        this.waitDialog = false;
        this.errDialog = true;
        Log.logError(e, "InvoiceHistoryPage.vue generateExcel");
      }
    },
    downloadExcelFile(body) {
      HTTP_Excel.post("Export/exportInvoiceHistory", body).then((response) => {
        try {
          var blob = new Blob([this.s2ab(atob(response.data))], {
            type: "",
          });

          var fileURL = window.URL.createObjectURL(blob);
          var fileLink = document.createElement("a");

          fileLink.href = fileURL;
          fileLink.setAttribute("download", body.fileName + ".xlsx");
          document.body.appendChild(fileLink);

          this.waitDialog = false;

          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, body.fileName + ".xlsx");
          } else {
            fileLink.click();
          }
        } catch (e) {
          Log.logError(e, "CompanySearch.vue export/exportCompany response");
          this.waitDialog = false;
          this.errDialog = true;
        }
      });
    },
    // generateExcel() {
    //   try {
    //     this.waitDialog = true;

    //     let history_body = {
    //       fileName:
    //         "invoiceHistory_" +
    //         this.$store.state.currentFranchise.franchiseNumber +
    //         "_" +
    //         dateFormat(Date.now(), "mmddyyyy") +
    //         "_" +
    //         dateFormat(Date.now(), "hhMMss"),
    //       headers: this.getHeadersExcel(this.headers),
    //       history: this.formatDataExcel(this.headers, this.listHistItems),
    //       summaryData: {
    //         rows: [],
    //       },
    //     };

    //     HTTP_Excel.post("export/history", history_body)
    //       .then((response) => {
    //         try {
    //           var blob = new Blob([this.s2ab(atob(response.data))], {
    //             type: "",
    //           });

    //           var fileURL = window.URL.createObjectURL(blob);
    //           var fileLink = document.createElement("a");

    //           fileLink.href = fileURL;
    //           fileLink.setAttribute(
    //             "download",
    //             history_body.fileName + ".xlsx"
    //           );
    //           document.body.appendChild(fileLink);

    //           this.waitDialog = false;

    //           if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    //             window.navigator.msSaveOrOpenBlob(
    //               blob,
    //               history_body.fileName + ".xlsx"
    //             );
    //           } else {
    //             fileLink.click();
    //           }
    //         } catch (e) {
    //           Log.logError(e, "InvoiceHistoryPage.vue export/history response");
    //           this.waitDialog = false;
    //           this.errDialog = true;
    //         }
    //       })
    //       .catch((e) => {
    //         this.errors.push(e);
    //         this.waitDialog = false;
    //         this.errDialog = true;
    //         Log.logError(
    //           e,
    //           "InvoiceHistoryPage.vue generateExcel export/history POST"
    //         );
    //         throw e;
    //       });
    //   } catch (e) {
    //     this.waitDialog = false;
    //     this.errDialog = true;
    //     Log.logError(e, "InvoiceHistoryPage.vue generateExcel");
    //   }
    // },
    generatePDF() {
      try {
        var doc = new jsPDF("l", "pt", "a4");

        let formattedData = this.formatDataPDF(
          this.headers,
          this.listHistItems
        );
        let pdfData = this.generateData(this.headers, formattedData);
        let pdfHeaders = this.createHeaders(this.headers);
        let logo = new Image();
        logo.src = glLnlSmBlue;
        // logo.src = require("@/assets/globe_logo_new.png");

        doc.addImage(logo, "PNG", 50, 50, 200, 40);

        doc.setFont("helvetica", "normal");
        doc.setFontSize("10");

        doc.text(
          "ACCOUNT NUMBER: " +
            this.$store.state.currentFranchise.franchiseNumber,
          525,
          70
        );
        doc.text(this.$store.state.currentFranchise.franchiseName, 525, 80);
        doc.text(this.$store.state.currentFranchise.franchiseAddr1, 525, 90);
        doc.text(this.$store.state.currentFranchise.franchiseAddr2, 525, 100);
        if (
          this.$store.state.currentFranchise.franchiseAddr2 &&
          this.$store.state.currentFranchise.franchiseAddr2.trim() != ""
        )
          doc.text(this.$store.state.currentFranchise.franchiseCSZ, 525, 110);
        else
          doc.text(this.$store.state.currentFranchise.franchiseCSZ, 525, 100);

        // doc.text(
        //   this.$store.state.currentFranchise.franchiseNumber +
        //     " - " +
        //     this.$store.state.currentFranchise.franchiseName,
        //   550,
        //   60
        // );
        // doc.text(this.$store.state.currentFranchise.franchiseAddr, 550, 70);
        // doc.text(this.$store.state.currentFranchise.franchiseCSZ, 550, 80);

        let pageNumber = 1;
        let chunkSize = 18;

        let numPages =
          Math.floor(pdfData.length / chunkSize) +
          (pdfData.length % chunkSize > 0 ? 1 : 0);

        for (pageNumber = 1; pageNumber <= numPages; pageNumber++) {
          let chunkedPdfData = exportInvoice.getChunkedData(
            pdfData,
            pageNumber,
            chunkSize
          );
          if (chunkedPdfData.length == 0) {
            break;
          }
          if (pageNumber > 1) doc.addPage("a4", "landscape");

          // finalY = 0;

          doc.setFont("helvetica", "normal");
          doc.setFontSize("10");

          doc.text("Account Number: ", 40, pageNumber == 1 ? 120 : 80, {
            align: "left",
          });

          doc.text(
            this.$store.state.currentFranchise.franchiseNumber +
              " " +
              this.$store.state.currentFranchise.franchiseName,
            125,
            pageNumber == 1 ? 120 : 80,
            { align: "left" }
          );

          // doc.text(
          //   this.$store.state.currentFranchise.franchiseNumber +
          //     " - " +
          //     this.$store.state.currentFranchise.franchiseName,
          //   40,
          //   pageNumber == 1 ? 120 : 80
          // );
          // doc.text(
          //   "As of Date: " + this.$options.filters.mdyyyy(Date.now()),
          //   40,
          //   pageNumber == 1 ? 130 : 90
          // );

          doc.text("As of Date: ", 40, pageNumber == 1 ? 130 : 90, {
            align: "left",
          });

          doc.text(
            this.$filters.mdyyyy(Date.now()),
            125,
            pageNumber == 1 ? 130 : 90,
            { align: "left" }
          );

          if (this.hasDiscrepancy) {
            doc.text(this.discrepancyNote, 425, pageNumber == 1 ? 130 : 90, {
              align: "center",
            });
          }

          doc.text(
            "Page " + pageNumber.toString() + " of " + numPages.toString(),
            735,
            pageNumber == 1 ? 130 : 90
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize("12");
          doc.autoTable({
            theme: "striped",
            head: pdfHeaders,
            body: chunkedPdfData,
            startY: pageNumber == 1 ? 140 : 100,
            headStyles: { fillColor: "#64CCC9" },
          });
        }
        // doc.setFont("helvetica", "italic");
        // doc.setFontSize("10");

        // let finalY = doc.lastAutoTable.finalY;

        // doc.autoTable({
        //   theme: "striped",
        //   head: pdfHeaders,
        //   body: pdfData,
        //   startY: 150,
        //   headStyles: { fillColor: "#64CCC9" }
        // });
        doc.save(
          "invoiceHistory_" +
            this.$store.state.currentFranchise.franchiseNumber +
            "_" +
            dateFormat(Date.now(), "mmddyyyy") +
            "_" +
            dateFormat(Date.now(), "hhMMss") +
            ".pdf"
        );
      } catch (e) {
        Log.logError(e, "InvoiceHistoryPage.vue generatePDF");
      }
    },
  },
};
</script>
<style scoped>
.introText {
  font-size: 0.9rem;
}
.discrepancyNote {
  font-size: 0.75rem;
  font-weight: bold;
}
.exportText {
  font-size: 0.75rem;
}
.viewLink {
  color: #319b42;
  text-decoration: none;
  font-weight: normal;
  cursor: pointer;
  font-size: 1rem;
}
.bottomMargin {
  margin-bottom: 30px;
}
table .theme--dark.v-icon {
  display: inline;
  margin: 0;
}
.padRightIcon {
  padding-right: 4px;
}

.custom-tooltip {
    background: rgb(0, 85, 150) !important;
    opacity: 1 !important;
}
</style>
