<template>
  <v-layout justify="center" align-content="center" align="center" style="position:unset !important;">
    <v-col cols="11">
      <v-layout align="end" align-content="end" justify="end" v-if="showExportOptions">
      <span class="exportText">
        <i>
          Download Company List
          <v-icon x-small>mdi-arrow-right</v-icon>&nbsp;
        </i>
      </span>        
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon @click="exportCompany('Excel')" color="#319B42" dark v-on="on">mdi-file-excel</v-icon>
        </template>
        <span>Download as Excel</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon
            @click="exportCompany('PDF')"
            color="#ED722F"
            dark
            v-on="on"
          >mdi-file-pdf-outline</v-icon>
        </template>
        <span>Download as PDF</span>
      </v-tooltip>
    </v-layout>

      <v-data-table
        :headers="headers"
        :items="filteredItems"
        class="elevation-3"
        item-key="item.index"
        :items-per-page.sync="itemsPerPage"
        @pagination="updatePagination"
        
        dark
        :sort-by.sync="sortBy"
        must-sort
        :page.sync="page"
        :no-data-text="noDataDisplayText"
        page-text="Viewing items: {0}-{1} of {2}"
        :items-per-page="10"
         items-per-page-text="Display records per page:"
        :footer-props="{
            'items-per-page-options': [10, 25, 50, 100, 200,-1] ,
            'show-current-page': true,
            'show-first-last-page': true,
            'items-per-page-text': 'Display records per page: ' }"
      >
        <template v-slot:item.link="{ item }">
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
              v-bind="page"
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
    <v-progress-circular
      v-if="waiting"
      :class="$vuetify.display.smAndDown ? 'waitCircleSm' : 'waitCircle'"
      indeterminate
      color="#319B42"
      :size="70"
      width="10"
    ></v-progress-circular>
  </v-layout>
</template>


<script>
import Log from "@/log.js";
import { HTTP_HATS } from "@/HTTP-common.js";
import { HTTP_SA, HTTP } from "@/HTTP-common.js";
import { Role } from "@/role.js";
import encryption from "@/encryption.js";
import eventBus from "@/event-bus.js";


export default {
  props: [
    "headers",
    "filteredItems",
    "itemsPerPage",
    "sortBy",
    "pages",
    "page",
    "maxPages",
    "selectedItem",
    "noDataText",
    "showExportOptions"
  ],
  mounted() {
    if (this.selectedItem && this.selectedItem.number.length > 0) {
      this.selectCompany(this.selectedItem);
    }
  },
  data() {
    return {
      waiting: false,
      items: [],
      noItemsFlag: false,
      userType: window.sessionStorage.getItem("type"),
    };
  },
  computed: {
    noDataDisplayText() {
      if (this.noDataText) {
        return this.noDataText;
      }
      return "No companies found.";
    }
  },
  methods: {
    updatePagination(){
      eventBus.emit('itemsPerPage', this.itemsPerPage);
    },
    exportCompany(exportFormat){
      eventBus.emit("exportCompany", exportFormat);
    },
    setRoles(franchiseId) {
      try {
        let franchisesAndRoles = JSON.parse(
          window.sessionStorage.getItem("franchises")
        );

        let userRoles = [];

        for (let franchiseAndRole of franchisesAndRoles) {
          if (franchiseAndRole.franchiseID == franchiseId.toString()) {
            HTTP_SA.get("UserRolePermissions/GetRolePermissionsByRole", {
              params: {
                role: franchiseAndRole.roleName,
              },
            }).then((response) => {
              if (response.status == 200 && response.data.statusCode == "200") {
                for (let det of response.data.rolePermissionDetails) {
                  if (userRoles.indexOf(det.uiRoleName) <= 0)
                    userRoles.push(det.uiRoleName);
                }

                userRoles.push(Role.FranchiseUser);

                let role = userRoles.join();
                let encryptedRole = encryption.encrypt(role);
                window.sessionStorage.setItem("role", encryptedRole);
              }
            });
          }
        }
      } catch (e) {
        Log.logError(e, "CompanySearchTable setRoles");
      }
    },

    selectCompany(item) {

      try {
        this.waiting = true;

        if (this.userType == "ext") {
          this.setRoles(item.number);
        }       
        HTTP_HATS.get("CompanyInfo/GetCompanyInfo", {
          params: {
            companyId: item.number,
            
          },
        })
          .then((response) => {
             console.log(JSON.stringify(response.data));
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
                  printBillMode: item.printBillModeOriginal,
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
                  companyId: item.number,
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
                        franchiseId: item.number,
                      },
                    })
                      .then((response) => {
                        if (response.status != 200) {
                          Log.logError(
                            response.statusText,
                            "CompanySearch.vue BillingInfo/GetBillingPaidTo response"
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
                          }

                          window.sessionStorage.setItem(
                            "currentFranchise",
                            JSON.stringify(this.franchiseDetails)
                          );

                          if (this.userType == "agency") {
                            this.waiting = false;
                            this.$router.push("/invoicehistory");
                          } else if (this.userType == "ext") {
                            HTTP.get("Company/SearchCompanies", {
                              params: {
                                searchFor: item.number,
                                searchBy: "@companyId",
                                searchType: "EXT",                                
                              },
                            })
                              .then((response) => {
                                if (response.status == "200") {
                                  if (
                                    response.data.franchiseDetails &&
                                    response.data.franchiseDetails.length
                                  ) {
                                    let current =
                                      response.data.franchiseDetails[0];

                                    if (current) {
                                      this.franchiseDetails.printBillMode =
                                        current.printBillMode;

                                      this.franchiseDetails.printBillModeOriginal =
                                        current.printBillMode;

                                      window.sessionStorage.setItem(
                                        "currentFranchise",
                                        JSON.stringify(this.franchiseDetails)
                                      );
                                      this.$store.commit(
                                        "setCurrentFranchise",
                                        this.franchiseDetails
                                      );
                                      this.waiting = false;
                                      this.$nextTick(() => {
                                        this.$router.push("/invoicehome");
                                      });
                                    }
                                  }
                                } else {
                                  this.waiting = false;
                                  this.$router.push("/invoicehome");
                                }
                              })
                              .catch((e) =>
                                Log.logError(
                                  e,
                                  "CompanySearch.vue selectCompany (ext) Company/SearchCompanies"
                                )
                              );
                          } else {
                            this.waiting = false;
                            this.$router.push("/invoicehome");
                          }
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
  },
};
</script>
<style scoped>
.viewLink {
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
.exportText {
  font-size: 0.75rem;
}

</style>