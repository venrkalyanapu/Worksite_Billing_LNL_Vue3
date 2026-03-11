<template>
  <span>
    <v-dialog v-model="selectDialog" persistent width="350">
      <v-card>
        <br />
        <br />
        <v-card-text>Please search for and select a company.</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#319B42" dark class="menuBtn" @click="selectDialog=false">OK</v-btn>
        </v-card-actions>
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
      <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2">
         <template v-slot:title="{ item }">
      {{ item.text }}
    </template>
      </v-breadcrumbs>
    <v-form ref="form" style="position:sticky !important;margin-left: 40px !important;">
      <v-row>
        <v-layout style="position:sticky !important;"
          align ="center"
          align-content="center"
         
          justify="center"
        >
          <v-col cols="12" sm="3">
            <v-text-field
              v-model="searchFor"
               variant="solo"
                rounded
              label="Search for..."
              :rules="searchRules"
              class="roundedTextBox search-text-box"
              append-icon="search"
              append-inner-icon="mdi-magnify"
              v-on:keyup.enter="gotoSearchBy('searchBy')"
            />
          </v-col>
          <v-col cols="12" sm="1" align="right" style="margin-top:40px !important;">
            <span>by</span>
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              class="roundedTextBox search-text-box"
               variant="solo"
                rounded
              :items="searchByItems"
              v-model="searchBy"
              :rules="searchByRules"
              ref="searchBy"
              @change.passive="$refs['searchRef'].$el.focus()"
              v-on:keyup.enter="$refs['searchRef'].$el.focus()"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="2" align="center" style="margin-top:40px !important;">
            <v-btn
              class="menuBtn"
              large
              color="#319B42"
              dark
              @click.stop="search"
              ref="searchRef"
            >Search</v-btn>
          </v-col>
          <v-col cols="12" sm="2" style="margin-top:40px !important;">
            <v-btn class="menuBtn" large v-show="searchFor == '' && searchBy == 'Account Number'">Reset</v-btn>
            <v-btn
              class="menuBtn"
              large
              color="#319B42"
              dark
              v-show="searchFor != '' || searchBy != 'Account Number'"
              @click="reset"
            >Reset</v-btn>
          </v-col>
        </v-layout>
      </v-row>
    </v-form>

    <v-layout justify="center" align-content="center" align="center" style="position:unset !important;margin-left:20px !important;">
      <v-col cols="11">
        <v-data-table
          v-if="isSearched"
          :headers="headers"
          :items="items"
          class="elevation-1"
          item-key="item.index"
          :items-per-page.sync="itemsPerPage"
          dark
          must-sort
          :page.sync="page"
          no-data-text="No company found."
          items-per-page-text="Display records per page:"
          :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, 200,-1] ,
                'show-current-page': true,
                'show-first-last-page': true,
                'items-per-page-text': 'Display records per page: ' }"
        >
          <template v-slot:item.action="{ item }">
            <!-- <v-tooltip top :color="mainColor">
              <template v-slot:activator="{ on }">
                <v-icon color="#00558c" @click="viewCompany(item)" v-on="on">mdi-page-next-outline</v-icon>
              </template>
              <span>View Details</span>
            </v-tooltip>-->
            <span class="viewLink" @click="selectCompany(item)">select</span>
            <v-icon
              color="#319B42"
              small
              class="viewLink"
              style="margin-left:3px;margin-bottom:3px;"
              @click="selectCompany(item)"
            >mdi-chevron-double-right</v-icon>
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
    </v-layout>

    <v-dialog v-model="showCompanyDetails" persistent width="600">
      <v-card>
        <v-card-title class="headline">{{ selectedCompany.companyName }}</v-card-title>

        <v-layout align-center justify-center>
          <hr width="90%" />
        </v-layout>

        <v-card-text>
          <h3>Address:</h3>
          <div class="details" v-if="selectedCompany.address1">{{selectedCompany.address1}}</div>
          <div class="details" v-if="selectedCompany.address2">{{selectedCompany.address2}}</div>
          <div
            class="details"
          >{{ selectedCompany.city }}, {{ selectedCompany.state }} {{ selectedCompany.zipCode }}</div>
          <h3>Contact:</h3>
          <div class="details" v-if="selectedCompany.billContact">{{selectedCompany.billContact}}</div>
          <h3>Phone:</h3>
          <div class="details" v-if="selectedCompany.phone">{{selectedCompany.phone}}</div>
        </v-card-text>

        <v-card-actions>
          <v-btn color="#319B42" dark class="menuBtn" @click="showCompanyDetails = false;">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>
<script>
import dataService from "@/services/dataService";
import eventBus from "@/event-bus.js";

import Log from "@/log.js";
import { HTTP_HATS } from "@/HTTP-common.js";

export default {
  name: "HOSearchCompanies",
  created() {
    try {
      this.selectDialog = this.$route.query.dialog
        ? this.$route.query.dialog
        : false;
    } catch (e) {
      Log.logError(e, "SearchCompanies created");
      this.selectDialog = false;
    }
    //default searhcBy
    this.searchBy = "Account Number";
  },
  data() {
    return {
      breadcrumbItems: [
        {
          text: "Home Office",
          disabled: false,
          href: "hoLanding",
        },
        {
          text: "Search Companies",
          disabled: true,
        },
      ],
      waiting: false,
      selectDialog: false,
      showCompanyDetails: false,
      searchRules: [(v) => !!v || "Please enter a search term."],
      searchByRules: [(v) => !!v || "Please select a search field."],
      selectedCompany: {},
      isSearched: false,
      searchFor: "",
      searchBy: "",
      searchByItems: [
        { title: "Account Number", key: "@companyId" },
        { title: "Company Name", key: "@companyName" },
        // { text: "Agency", value: "@agency" }
      ],
      items: [],
      page: 1,
      itemsPerPage: 10,
    };
  },
  methods: {
    selectCompany(item) {
      try {
        this.waiting = true;

        HTTP_HATS.get("CompanyInfo/GetCompanyInfo", {
          params: {
            companyId: item.franchiseId,
          },
        })
          .then((response) => {
            if (response.status != 200) {
              Log.logError(
                response.statusText,
                "CompanySearch.vue CompanyInfo/GetCompanyInfo response"
              );
              this.waiting = false;
              this.errDialog = true;
            } else {
              if (
                response.data.companyDetails &&
                response.data.companyDetails.length > 0
              ) {
                let franchise = response.data.companyDetails[0];

                this.franchiseDetails = {
                  franchiseNumber: franchise.companyID,
                  frequency: "UNKNOWN",
                  billingCycle: "UNKNOWN",
                  paidToDate: "",
                  franchiseName: franchise.companyName,
                  billContact: franchise.billContact, 
                  franchiseAddr: (
                    franchise.billAddressLine1 +
                    " " +
                    franchise.billAddressLine2
                  ).trim(),
                  franchiseAddr1: franchise.billAddressLine1,
                  franchiseAddr2: franchise.billAddressLine2,
                  franchiseCSZ:
                    franchise.city || franchise.state || franchise.zip
                      ? (franchise.city != null && franchise.city != ""
                          ? franchise.city
                          : "UNKNOWN") +
                        ", " +
                        (franchise.state != null && franchise.state != ""
                          ? franchise.state
                          : "UN") +
                        "  " +
                        (franchise.zip != null && franchise.zip != ""
                          ? franchise.zip
                          : "99999-0000")
                      : "",
                  franchisePhone: franchise.phone,
                  printBillMode: item.printBillMode,
                  branchNumber: item.branchNumber,
                  agencyNumber: item.agencyNumber,
                };

                this.$store.commit(
                  "setCurrentFranchise",
                  this.franchiseDetails
                );
              }

              HTTP_HATS.get("BillingInfo/GetBillingInfo", {
                params: {
                  companyId: item.franchiseId,
                },
              })
                .then((response) => {
                  if (response.status != 200) {
                    Log.logError(
                      response.statusText,
                      "CompanySearch.vue BillingInfo/GetBillingInfo response"
                    );
                    this.waiting = false;
                    this.errDialog = true;
                  } else {
                    if (
                      response.data.billingDetails &&
                      response.data.billingDetails.length > 0
                    ) {
                      let billing = response.data.billingDetails[0];

                      this.franchiseDetails.frequency = billing.employesDed;
                      this.franchiseDetails.billingCycle = billing.paymentToLNL;

                      this.$store.commit(
                        "setCurrentFranchiseBillingFrequency",
                        this.franchiseDetails.frequency
                      );

                      this.$store.commit(
                        "setCurrentFranchiseBillingCycle",
                        this.franchiseDetails.billingCycle
                      );
                    }

                    HTTP_HATS.get("BillingInfo/GetBillingPaidTo", {
                      params: {
                        franchiseId: item.franchiseId,
                      },
                    })
                      .then((response) => {
                        if (response.status != 200) {
                          Log.logError(
                            response.statusText,
                            "CompanySearch.vue BillingInfo/GetBillingPaidTo response"
                          );

                          this.$store.commit(
                            "setCurrentFranchiseBillingPaidToDate",
                            ""
                          );

                          this.waiting = false;
                          this.errDialog = true;
                        } else {
                          if (
                            response.data.billingPaidToDetails &&
                            response.data.billingPaidToDetails.length > 0
                          ) {
                            let billing = response.data.billingPaidToDetails[0];
                            this.franchiseDetails.paidToDate = billing.paidToDate ? this.$options.filters.mmddyyyy(billing.paidToDate) : '';
                            this.$store.commit(
                              "setCurrentFranchiseBillingPaidToDate",
                              this.franchiseDetails.paidToDate
                            );
                          } else {
                            this.$store.commit(
                              "setCurrentFranchiseBillingPaidToDate",
                              ""
                            );
                          }

                          window.sessionStorage.setItem(
                            "currentFranchise",
                            JSON.stringify(this.franchiseDetails)
                          );

                          HTTP_HATS.get(
                            "CompanyInfo/GetCompanyAdditionalInfo",
                            {
                              params: {
                                companyId: item.franchiseId,
                              },
                            }
                          ).then((response) => {
                            if (response.status != 200) {
                              Log.logError(
                                response.statusText,
                                "CompanySearch.vue CompanyInfo/GetCompanyAdditionalInfo response"
                              );

                              this.$store.commit(
                                "setCurrentFranchiseBrokerNumber",
                                ""
                              );

                              this.waiting = false;
                              this.errDialog = true;
                            } else {
                              if (
                                response.data &&
                                response.data.companyAdditionalDetails &&
                                response.data.companyAdditionalDetails.length
                              ) {
                                this.$store.commit(
                                  "setCurrentFranchiseBrokerNumber",
                                  response.data.companyAdditionalDetails[0]
                                    .brokerNumber
                                );

                                this.franchiseDetails.brokerNumber =
                                  response.data.companyAdditionalDetails[0].brokerNumber;

                                window.sessionStorage.setItem(
                                  "currentFranchise",
                                  JSON.stringify(this.franchiseDetails)
                                );
                              } else {
                                this.$store.commit(
                                  "setCurrentFranchiseBrokerNumber",
                                  ""
                                );
                              }

                              this.waiting = false;
                              this.$router.push("/invoicehome");
                            }
                          });
                        }
                      })
                      .catch((e) => {
                        Log.logError(
                          e,
                          "CompanySearch.vue selectCompany BillingInfo/GetBillingPaidTo"
                        );
                        this.waiting = false;
                        this.errDialog = true;
                      });
                  }
                })
                .catch((e) => {
                  Log.logError(
                    e,
                    "CompanySearch.vue selectCompany BillingInfo/GetBillingInfo"
                  );
                  this.waiting = false;
                  this.errDialog = true;
                });
            }
          })
          .catch((e) => {
            Log.logError(
              e,
              "CompanySearch.vue selectCompany CompanyInfo/GetCompanyInfo"
            );
            this.waiting = false;
            this.errDialog = true;
          });
      } catch (e) {
        this.errDialog = true;
        Log.logError(e, "CompanySearch.vue selectCompany");
      }
    },

    reset() {
      this.waiting = false;
      this.isSearched = false;
      this.searchFor = "";
      this.searchBy = "Account Number";
      this.$refs.form.resetValidation();
    },
    gotoSearchBy(refName) {
      this.$refs[refName].activateMenu();
      this.$refs[refName].focus();
    },
    search() {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.isSearched = false;
      this.waiting = true;
      this.items = [];
      
         
      let searchingbyid = "";
          if(this.searchBy == "Company Name") this.searchingbyid = "@companyName";
          if(this.searchBy == "Account Number") this.searchingbyid = "@CompanyId";
      dataService
  
        .searchCompanies(this.searchFor, this.searchingbyid)
        .then((response) => {
          this.isSearched = true;
          this.waiting = false;
          if (response.status == "200") {
            this.items = response.data.franchiseDetails;
          } else {
            //eslint-disable-next-line no-console
            // console.log(response);
            //alert("show error!");
          }
        })
        .catch(function (error) {
          this.isSearched = true;
          eventBus.emit("appError", error);
        });
    },
    viewCompany(item) {
      this.selectedCompany = item;
      this.showCompanyDetails = true;
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
        { title: "Account Number", key: "franchiseId" },
        { title: "Company Name", key: "franchiseName" },
        // { text: "Agency", value: "agency" },
        // { text: "District", value: "district" },
        // { text: "Contact", value: "billContact" },
        // { text: "Phone", value: "phone" },
        { title: "Actions", key: "action", sortable: false },
      ];
    },
  },
};
</script>

<style scoped>
.search-text-box {
  margin-top: 30px;
}
.details {
  margin-left: 20px;
}
.mdi-page-next-outline::before {
  margin-left: 20px;
}
.viewLink {
  margin-left: 30px;
  color: #319b42;
  text-decoration: none;
  font-weight: normal;
  cursor: pointer;
  font-size: 1rem;
}
.waitCircle {
  z-index: 20;
  position: absolute;
  top: 30%;
  left: 40%;
}
.waitCircleSm {
  z-index: 20;
  position: absolute;
  top: 30%;
  left: 50%;
}
</style>