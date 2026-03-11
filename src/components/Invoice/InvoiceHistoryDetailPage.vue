<template>
  <v-col cols="12">
    <v-layout justify="start" align-content="start">
      <v-row>
        <v-col>
          <span class="introText">
            Invoice Due Date:
            <span class="bolded">{{ $filters.mdyyyy(dueDate) }}</span>
            <br />
            <span v-if="status && status.toLowerCase() == 'paid'">
              Invoice Paid Date:
              <span class="bolded">{{ $filters.mdyyyy(paidDate) }}</span>
            </span>
            <span v-else>
              Invoice Delinquent Date:
              <span class="bolded">{{ $filters.mdyyyy(delinquentDate) }}</span>
            </span>
            <br />Current Status:
            <span :class="isPastDue ? 'pastDue' : 'paid'">{{ status }}</span>
            <br />
            <br />
          </span>
        </v-col>
        <v-spacer />
        <v-col>
          <span class="introText">
            Total Amount Billed:
            <span class="bolded">{{ $filters.money(totalBilled) }}</span>
            <br />
            Total Amount Adjusted:
            <span>{{ $filters.money(displayTotalAdjusted) }}</span>
            <br />
            <span v-if="status && status.toLowerCase() == 'paid'">
              Total Amount Paid:
              <span class="bolded">{{ $filters.money(paymentAmount) }}</span>
            </span>
            <span v-else>
              Total Amount Due:
              <span class="bolded">{{ $filters.money(totalDue) }}</span>
            </span>
            <br />
            <br />
          </span>
        </v-col>
      </v-row>
    </v-layout>

    <v-form ref="form" v-model="valid">
      <v-row>
        <v-layout style="margin-left:50px"; 
          align-content="center"
          align="center"
          justify="center"
          v-if="$vuetify.display.mdAndUp"
        >
          <v-col lg="3" xl="3" md="4" sm="4">
            <v-text-field
                variant="solo"
                rounded
              v-model="search"
              label="Search Policies for..."
              class="roundedTextBox"
              :rules="searchRules"
              append-icon="search"
               append-inner-icon="mdi-magnify"
              v-on:keyup.enter="gotoSearchBy('searchBy')"
            ></v-text-field>
          </v-col>
          <v-col lg="1" xl="1" md="1" sm="1" align="center">
            <span class="searchHeader">by</span>
          </v-col>
          <v-col lg="3" xl="3" md="3" sm="4">
            <v-select
              ref="searchBy"
              :items="searchByItems"
              v-model="searchBy"
              :rules="searchByRules"
              class="roundedTextBox"
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
                    variant="solo"
                  rounded
                  label="Search Policies for..."
                  class="roundedTextBox"
                  :rules="searchRules"
                  append-icon="search"
                  v-model="search"
                  v-on:keyup.enter="gotoSearchBy('searchBy')"
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
                  ref="searchBy"
                  :items="searchByItems"
                  v-model="searchBy"
                  :rules="searchByRules"
                    variant="solo"
                  rounded
                  class="roundedTextBox"
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
                  :color="searchClicked ? '#319B42' : '#d1d1d1'"
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

    <v-row>
      <v-col :cols="9" v-if="hasDiscrepancy">
        <v-layout justify="left" align-content="left">
          <span class="discrepancyNote" v-if="hasDiscrepancy">
            <i>{{ discrepancyNote }}</i>
          </span>
        </v-layout>
      </v-col>
      <v-col v-if="$store.state.testFeatures">
        <v-layout align="end" align-content="end" justify="end" style="margin-left:95% !important;">
          <v-tooltip top :color="mainColor">
            <template #activator="{ props }">
              <v-icon
                @click="exportInvoiceExcel()"
                color="#319B42"
                dark
                v-bind="props"
                >mdi-file-excel</v-icon
              >
            </template>
            <span>Download as Excel</span>
          </v-tooltip>
          <v-tooltip top :color="mainColor">
            <template #activator="{ props }">
              <v-icon @click="exportInvoicePDF()" color="#ED722F" dark v-bind="props"
                >mdi-file-pdf-box</v-icon
              >
            </template>
            <span>Download as PDF</span>
          </v-tooltip>
        </v-layout>
      </v-col>
    </v-row>
    <v-data-table 
    id ="histortdb"
      :headers="headers"
      :items="filteredItems"
      class="elevation-3"
      :loading="
        listHistDetailItems === undefined ||
        listHistDetailItems[0] === undefined
      "
      item-key="item.index"
      :items-per-page.sync="itemsPerPage"
      :sort-by="sortBy"
      :sort-desc.sync="descending"
      :page.sync="page"
      dark
      must-sort
      no-data-text="No policies found."
      items-per-page-text="Display records per page:"
      :footer-props="{
        'items-per-page-options': [10, 25, 50, 100, 200, -1],
        'show-current-page': true,
        'show-first-last-page': true,
        'items-per-page-text': 'Display records per page: ',
      }"
    >
      <template v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }">
        <div
          :class="
            $vuetify.breakpoint.smAndDown
              ? 'v-data-footer__select smallFooter'
              : 'v-data-footer__select'
          "
        >
          <span v-if="$vuetify.breakpoint.mdAndUp">
            Viewing items: {{ pageStart }}-{{ pageStop }} of
            {{ itemsLength }}
          </span>
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
      </template>

      <!-- <template v-slot:header.isSection125="{ header }">
        <v-tooltip top color="#00558b">
          <template v-slot:activator="{ on }">
            <span v-on="on">{{ header.text }}</span>
          </template>
          <span>Pre-Tax Deduction (Section 125)</span>
        </v-tooltip>
      </template>-->

      <template v-slot:header.employeeId="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Employee ID</span>
        </v-tooltip>
      </template>

      <template v-slot:header.policyNumber="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Policy Number</span>
        </v-tooltip>
      </template>

      <template v-slot:header.policyType="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Policy Type</span>
        </v-tooltip>
      </template>

      <template v-slot:header.name="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Employee Name</span>
        </v-tooltip>
      </template>

      <template v-slot:header.insuredName="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Insured Name</span>
        </v-tooltip>
      </template>

      <template v-slot:header.dueDate="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Due Date</span>
        </v-tooltip>
      </template>

      <template v-slot:header.premiumDeducted="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Premium Deducted</span>
        </v-tooltip>
      </template>

      <template v-slot:header.totalPremium="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Total Premium</span>
        </v-tooltip>
      </template>

      <template v-slot:header.changeCode="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Change Reason</span>
        </v-tooltip>
      </template>

      <template v-slot:header.adjustedAmount="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Adjusted Amount</span>
        </v-tooltip>
      </template>

      <template v-slot:header.totalAfterAdjustment="{ header,column }">
        <v-tooltip top color="#00558b">
          <template #activator="{ props }">
            <span v-bind="props">{{ column.title }}</span>
          </template>
          <span>Total After Adjustment</span>
        </v-tooltip>
      </template>

      <template v-slot:item.premiumDeducted="{ item }">{{
        $filters.money(item.premiumDeducted)
      }}</template>
      <template v-slot:item.totalPremium="{ item }">{{
        $filters.money(item.totalPremium)
      }}</template>
      <template v-slot:item.adjustedAmount="{ item }">{{
        $filters.money(item.adjustedAmount)
      }}</template>
      <template v-slot:item.totalAfterAdjustment="{ item }">{{
        $filters.money(item.totalAfterAdjustment)
      }}</template>
      <template v-slot:item.dueDate="{ item }">{{
        $filters.mdyyyy(item.dueDate) 
      }}</template>
      <!-- <template v-slot:item.isSection125="{ item }">
        {{
        item.isSection125 | boolYesNo
        }}
      </template>-->
  <template
        v-slot:body.append
        v-if="!searchFilter && !searchByFilter && !$vuetify.display.xs"
      >
        <tr>
          <!-- Change this to 8 for section125 / pre-tax -->
          <td colspan="7">
            <strong>TOTALS</strong>
          </td>
          <td>
            <strong>{{ $filters.money(totalPremDeducted) }}</strong>
          </td>
          <td>
            <strong>{{ $filters.money(totalBilled) }}</strong>
          </td>
          <td colspan="1"></td>
          <td>
            <strong>{{ $filters.money(totalAdjusted) }}</strong>
          </td>
          <td>
            <strong>{{ $filters.money(totalDue) }}</strong>
          </td>
        </tr>
      </template>
      <template v-slot:body.append v-else-if="!searchFilter && !searchByFilter">
        <tr>
          <td>
            <strong>TOTALS</strong>
            <br />Premiums Deducted:&nbsp;
            <strong>{{ $filters.money(totalPremDeducted) }}</strong>
            <br />Premiums:&nbsp;
            <strong>{{ $filters.money(totalBilled) }}</strong>
            <br />Adjusted Amounts:&nbsp;
            <strong>{{ $filters.money(totalAdjusted) }}</strong>
            <br />Total After Adjustments:&nbsp;
            <strong>{{ $filters.money(totalDue) }}</strong>
            <br />
          </td>
        </tr>
      </template>
    
    </v-data-table>

    <v-dialog v-model="waitDialog" persistent width="350">
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

    <br />

    <v-layout align-start align-content-start justify-start>
      <router-link to="/invoicehistory" class="backLink">
        <v-icon>mdi-chevron-double-left</v-icon>&nbsp;Back to History
      </router-link>
    </v-layout>
  </v-col>
</template>
<script>
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import dateFormat from "dateformat";

import Log from "@/log.js";

import { HTTP } from "@/HTTP-common.js";
// import { HTTP_Excel } from "@/HTTP-common.js";

import exportInvoice from "@/export-invoice.js";
import eventBus from "@/event-bus.js";

export default {
  name: "InvoiceHistory",
  props: {},
  beforeDestroy() {
    eventBus.off("errDialog");
  },
  mounted() {
    eventBus.on(
      "errDialog",
      function () {
        this.errDialog = true;
      }.bind(this)
    );
  },
  created() {
    try {
      if (
        !this.$store.state.currentInvoice ||
        !this.$store.state.currentInvoice.invoiceId
      ) {
        router.push("/invoicehome");
      }

      HTTP.get("InvoiceHistory/GetInvoiceHistoryDetails", {
        params: {
          invoiceId: this.$store.state.currentInvoice.invoiceId,
        },
        //withCredentials: true,
      })
        .then((response) => {
          if (response.status != 200) {
            Log.logError(
              response.statusText,

              "InvoiceHistoryDetailPage.vue InvoiceHistory/GetInvoiceHistoryDetails response"
            );
            this.errDialog = true;
          } else {
            try {
              this.listHistDetailItems = response.data.invoicesDetails;

              HTTP.get("InvoiceHistory/GetInvoiceAdditionalDetails", {
                params: {
                  invoiceId: this.$store.state.currentInvoice.invoiceId,
                },
                //withCredentials: true,
              })
                .then((response) => {
                  
                  if (response.status != 200) {
                    Log.logError(
                      response.statusText,
                      "InvoiceHistoryDetailPage.vue created InvoiceHistory/GetInvoiceAdditionalDetails response"
                    );
                    this.errDialog = true;
                  } else {
                    try {
                      this.additionalDetails =
                        response.data.additionalDetails[0];

                      //PCR #11
                      this.displayTotalAdjusted = this.additionalDetails.totalAdjustedAmount;
                      if (!this.displayTotalAdjusted) {
                        this.displayTotalAdjusted = 0;
                      }
                      let detailsAdjustSum = 0;
                      if (this.listHistDetailItems) {
                        this.listHistDetailItems.forEach((e) => {
                          if (e.adjustedAmount) {
                            detailsAdjustSum += e.adjustedAmount;
                          }
                        });
                      }
                      this.hasDiscrepancy = false;
                      if (this.status) {
                        if (this.status.toLowerCase() == "paid") {
                          if (
                            this.additionalDetails.paymentAmount !=
                            this.additionalDetails.totalAmountBilled
                          ) {
                            if (
                              (!this.additionalDetails.totalAdjustedAmount ||
                                this.additionalDetails.totalAdjustedAmount ==
                                  0) &&
                              detailsAdjustSum == 0
                            ) {
                              this.displayTotalAdjusted =
                                this.additionalDetails.paymentAmount -
                                this.additionalDetails.totalAmountBilled;
                              this.hasDiscrepancy = true;
                            }
                          }
                        }
                      }
                    } catch (e) {
                      this.errDialog = true;
                      Log.logError(
                        e,
                        "InvoiceHistoryDetailPage.vue created InvoiceHistory/GetInvoiceAdditionalDetails response"
                      );
                    }
                  }
                })
                .catch((e) => {
                  Log.logError(
                    e,
                    "InvoiceHistoryDetailPage.vue created InvoiceHistory/GetInvoiceAdditionalDetails"
                  );
                  this.errDialog = true;
                  this.errors.push(e);
                });
            } catch (e) {
              this.errDialog = true;
              Log.logError(
                e,
                "InvoiceHistoryDetailPage.vue created InvoiceHistroy/GetInvoiceHistoryDetails"
              );
            }
          }
        })
        .catch((e) => {
          this.errDialog = true;
          this.errors.push(e);
          Log.logError(e, "InvoiceHistoryDetailPage.vue created");
        });
    } catch (e) {
      Log.logError(e, "InvoiceHistoryDetailPage.vue created");
      this.errDialog = true;
    }
  },
  data() {
    return {
      searchClicked: false,
      errDialog: false,
      search: "",
      searchBy: "",
      searchFilter: "",
      searchByFilter: "",
      sortBy: [],
      valid: true,
      descending: false,
      waitDialog: false,
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      searching: false,
      searchRules: [
        (v) => !!v || !this.searchClicked || "Please enter a search term.",
      ],
      searchByRules: [
        (v) => !!v || !this.searchClicked || "Please select a search field.",
      ],
      searchByItems: ["Policy Number", "Employee Name", "Employee ID"],

      listHistDetailItems: [],
      additionalDetails: [],
      errors: [],
      displayTotalAdjusted: 0,
      hasDiscrepancy: false,
      discrepancyNote:
        "Note: - Adjustment details are only available for online payments",
    };
  },
  computed: {
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
      return (
        this.listHistDetailItems === undefined ||
        this.listHistDetailItems[0] === undefined
      );
    },
    filteredItems() {
      try {
        let baseList = this.formatDataTable(
          this.headers,
          this.listHistDetailItems
        );

        try {
          return baseList.filter((i) => {
            return (
              !this.searchFilter ||
              !this.searchByFilter ||
              (this.searchByFilter === "Policy Number" &&
                (i.policyNumber ? i.policyNumber : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
              (this.searchByFilter === "Employee Name" &&
                (i.name ? i.name : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
              (this.searchByFilter === "Employee ID" &&
                (i.employeeId ? i.employeeId : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0)
            );
          });
        } catch (e) {
          Log.logError(
            e,
            "InvoiceHistoryDetailPage.vue filteredItems (inner catch)"
          );
          return baseList;
        }
      } catch (e) {
        Log.logError(
          e,
          "InvoiceHistoryDetailPage.vue filteredItems (outer catch)"
        );
        return this.listHistDetailItems;
      }
    },
    headers() {
      return [
        {
          title: "Policy Number",
          key: "policyNumber",
          filterable: false,
          width: 50,
        },
        {
          title: "Policy Type",
          key: "policyType",
          filterable: false,
          width: 50,
        },
        {
          title: "Policy Description",
          key: "policyShortDescription",
          filterable: false,
          width: 75,
        },
        // {
        //   text: "Pre Tax Ded",
        //   value: "isSection125",
        //   filterable: false,
        //   width: 40
        // },
        {
          title: "Emp ID",
          key: "employeeId",
          filterable: false,
          width: 50,
        },
        {
          title: "Employee Name",
          key: "name",
          filterable: false,
          width: 115,
        },
        {
          title: "Insured Name",
          key: "insuredName",
          filterable: false,
          width: 115,
        },
        { title: "Due Date", key: "dueDate", filterable: false, width: 50 },
        {
          title: "Premium Deducted",
          key: "premiumDeducted",
          filterable: false,
          width: 50,
        },
        {
          title: "Total Premium",
          key: "totalPremium",
          filterable: false,
          width: 50,
        },

        {
          title: "Change Reason",
          key: "changeCode",
          filterable: false,
          width: 50,
        },
        {
          title: "Adjusted Amount",
          key: "adjustedAmount",
          filterable: false,
          width: 50,
        },
        {
          title: "Total After Adjustment",
          key: "totalAfterAdjustment",
          filterable: false,
          width: 75,
        },
      ];
    },
    invoice() {
      return this.$store.state.currentInvoice;
    },
    isPastDue() {
      if (this.status != null && this.status.toUpperCase() === "PAST DUE")
        return true;

      return false;
    },
    invoiceHistory() {
      return this.$store.state.invoiceHistory;
    },
    mainColor() {
      return this.$store.state.mainColor;
    },
    status() {
      return this.invoice.invoiceStatus;
    },
    paidDate() {
      return this.additionalDetails.paymentDate;
    },
    paymentAmount() {
      return this.additionalDetails.paymentAmount;
    },
    dueDate() {
      return this.invoice.dueDate;
    },
    delinquentDate() {
      return this.additionalDetails.delinquentDate;
    },
    totalPremDeducted() {
      let ret = 0;

      try {
        for (let item of this.listHistDetailItems) {
          if (item.premiumDeducted) ret += parseFloat(item.premiumDeducted);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryDetailPage.vue totalPremDeducted");
      }

      return ret;
    },
    totalBilled() {
      let ret = 0;
      try {
        for (let item of this.listHistDetailItems) {
          if (item.totalPremium) ret += parseFloat(item.totalPremium);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryDetailPage.vue totalBilled");
      }

      return ret;
    },
    totalAdjusted() {
      let ret = 0;
      try {
        for (let item of this.listHistDetailItems) {
          if (item.adjustedAmount) ret += parseFloat(item.adjustedAmount);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryDetailPage.vue totalAdjusted");
      }

      return ret;
    },
    totalDue() {
      let ret = 0;
      try {
        for (let item of this.listHistDetailItems) {
          if (item.totalAfterAdjustment)
            ret += parseFloat(item.totalAfterAdjustment);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryDetailPage.vue totalDue");
      }

      return ret;
    },
  },
  methods: {
    exportInvoiceExcel() {
      let invoice = this.$store.state.currentInvoice;
      exportInvoice.generateInvoiceExcel(invoice);
    },
    exportInvoicePDF() {
      let invoice = this.$store.state.currentInvoice;
      exportInvoice.generateInvoicePDF(invoice);
    },
    formatDataTable(headers, items) {
      let dataArray = [];

      try {
        for (let i = 0; i < items.length; i++) {
          let newItem = {};

          for (let j = 0; j < headers.length; j++) {
            let value = items[i][headers[j].key];

            switch (headers[j].key) {
              case "changeCode":
                value = exportInvoice.crosswalkChangeCode(value);
                break;
              // case "employeeId":
              //   value =
              //     value.toString() ==
              //     this.$store.state.currentFranchise.franchiseNumber
              //       ? ""
              //       : value;
              //   break;
            }

            newItem[headers[j].key] = value;
          }

          newItem.invoiceId = items[i].invoiceId;

          dataArray.push(newItem);
        }
      } catch (e) {
        Log.logError(e, "InvoiceHistoryDetailPage.vue formatDataTable");
      }
      return dataArray;
    },
    gotoSearchBy(refName) {
      try {
        this.$refs[refName].activateMenu();
        this.$refs[refName].focus();
      } catch (e) {
        Log.logError(e, "InvoiceHistoryDetailPage.vue gotoSearchBy");
      }
    },
    searchPolicies() {
      this.searchClicked = true;

      if (this.$refs.form.validate()) {
        this.searchFilter = this.search;
        this.searchByFilter = this.searchBy;
        this.page = 1;
      }
    },
    resetPolicies() {
      this.searchFilter = "";
      this.searchByFilter = "";
      this.searchClicked = false;
      this.search = "";
      this.searchBy = "";
      this.$refs.form.resetValidation();
    },
  },
};
</script>
<style scoped>
.adjustedStatement {
  font-style: italic;
  font-size: 0.9rem;
}
.discrepancyNote {
  font-size: 0.75rem;
  font-weight: bold;
}
.bold {
  font-weight: bold;
}
.pastDue {
  color: #b25271;
}
.paid {
  color: #319b42;
}
.backLink .v-icon,
.backLink {
  text-decoration: none;
  color: #319b42;
  font-size: 0.85rem;
}
.bottomMargin {
  margin-bottom: 30px;
}

</style>
