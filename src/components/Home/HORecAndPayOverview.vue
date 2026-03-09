<template>
  <span>
    <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2"></v-breadcrumbs>
    <br />

    <br />
    <v-form
      ref="form"
      v-model="valid"
      style="padding-bottom:0px !important; margin-bottom:0px !important;"
    >
      <v-row
         justify="center" 
          align="center" 
          align-content="center"
        v-if="$vuetify.display.mdAndUp"
        row
      >
        <v-col
          lg="4"
          xl="4"
          md="4"
          sm="4"
          style="padding-bottom:0px !important; margin-bottom:0px !important;"
        >
          <v-text-field
            solo
            v-model="search"
            label="Search Invoices For..."
            class="roundedTextBox"
            :rules="searchRules"
            append-icon="search"
            v-on:keyup.enter="gotoSearchBy('searchBy')"
            style="padding-bottom:0px !important; margin-bottom:0px !important;"
          ></v-text-field>
        </v-col>
        <span class="searchHeader">by</span>
        <span style="margin-left: 5px; margin-right: 5px;">
          <v-select
            ref="searchBy"
            :items="searchByItems"
            v-model="searchBy"
            :rules="searchByRules"
            class="roundedTextBox"
            style="min-width: 200px;max-width:300px;margin-bottom:0px;padding-bottom:0px;margin-top: 10px;"
            @change.passive="$refs['searchRef'].$el.focus()"
            v-on:keyup.enter="$refs['searchRef'].$el.focus()"
            solo
          ></v-select>
        </span>
        <v-btn
          class="menuBtn"
          large
          color="#319B42"
          dark
          style="margin-left:10px;"
          ref="searchRef"
          @click.stop="searchInvoices"
        >Search</v-btn>
        <v-btn class="menuBtn" large color='#d1d1d1' style="margin-left:10px;" dark v-show="search==''">Reset</v-btn>                    
        <v-btn v-show="search!=''"
          class="menuBtn"
          large
          dark
          style="margin-left:10px;"
          color='#319B42'
          @click.stop="resetInvoices"
        >Reset</v-btn>
      </v-row>
      <v-row
        align-content="center"
        align="center"
        justify="center"
        v-if="$vuetify.display.smAndDown"
      >
        <v-container>
          <v-row>
            <v-col :cols="12" align="center">
              <!-- <span class="searchHeader">Search Invoices for:</span> -->
              <v-text-field
                solo
                v-model="search"
                label="Search Invoices for..."
                class="roundedTextBox"
                :rules="searchRules"
                append-icon="search"
                v-on:keyup.enter="gotoSearchBy('searchBy')"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="12" align="center">
              <span class="searchHeader">by:</span>
              <v-select
                ref="searchBy"
                :items="searchByItems"
                v-model="searchBy"
                :rules="searchByRules"
                class="roundedTextBox"
                @change.passive="$refs['searchRef'].$el.focus()"
                v-on:keyup.enter="$refs['searchRef'].$el.focus()"
                solo
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col align="center" :cols="6">
              <v-btn class="menuBtn" large color="#319B42" dark @click.stop="searchInvoices">Search</v-btn>
            </v-col>
            <v-col align="center" :cols="6">
              <v-btn class="menuBtn" large color='#d1d1d1' dark v-show="search==''">Reset</v-btn>                                  
              <v-btn v-show="search!=''"
                class="menuBtn"
                large
                dark
                color='#319B42'
                @click.stop="resetInvoices"
              >Reset</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-row>
    </v-form>
    <v-row justify="center" align="center" align-content="center">
      <v-col cols="11">
        <v-data-table
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="filteredItems"
          class="elevation-1"
          :loading="waitCircle"
          item-value="index"
          :items-per-page.sync="itemsPerPage"
          dark
          sort-by="invoiceLockStart"
          must-sort
          :page.sync="page"
          no-data-text="No invoices found with specified criteria."
          :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, 200,-1] ,
                'show-current-page': true,
                'show-first-last-page': true,
                'items-per-page-text': 'Display records per page: ' }"
        >
          <template v-slot:item.unlock="{item}">
            <v-icon :color="mainColor" @click="confirmUnlock(item)">mdi-lock</v-icon>
          </template>

          <template v-slot:item.invoiceLockStart="{item}">{{ $filters.dateTime(item.invoiceLockStart)}}</template>
          <template v-slot:item.dueDate="{item}">{{ $filters.dateTime(item.dueDate) }}</template>
          <template v-slot:item.delinquentDate="{item}">{{ $filters.dateTime(item.delinquentDate) }}</template>

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
    <br />
    <br />
    <br />
    <v-dialog v-model="unlockDialog" persistent width="500" id="unlockDialog">
      <v-card>
        <v-card-title class="text-h5" :style="{ color: $store.state.mainColor }">
          <v-icon :color="$store.state.mainColor" size="x-large">mdi-lock-open</v-icon>
          <span class="ms-2">Unlock Invoice</span>
        </v-card-title>

        <v-row align="center"  justify="center">
          <hr width="90%" />
        </v-row>
        <br />
        <v-card-text>You are about to unlock invoice {{ selected.invoiceId }} for account {{ selected.franchiseId }}. Do you want to clear all adjustments for the invoice or retain them?</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            theme="dark"
            variant="flat"
            class="menuBtn"
            @click="
              unlockDialog = false; ClearAndUnlock();       
            "
          >Clear</v-btn>
          <v-btn
            color="#319B42"
            theme="dark"
            variant="flat"
            class="menuBtn"
            @click="
              unlockDialog = false;  Unlock();        
            "
          >Retain</v-btn>
          <v-btn
            color="#319B42"
            theme="dark"
            variant="flat"
            class="menuBtn"
            @click="
              unlockDialog = false;        
            "
          >Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="unlockedDialog" persistent width="500" id="unlockedDialog">
      <v-card>
        <v-card-title class="headline" :color="$store.state.mainColor">
          <v-icon :color="$store.state.mainColor" x-large>mdi-lock-open</v-icon>
          <span>Invoice Unlocked</span>
        </v-card-title>

        <v-row align="center"  justify="center">
          <hr width="90%" />
        </v-row>
        <br />
        <v-card-text>Invoice {{ selected.invoiceId }} for account {{ selected.franchiseId }} is now unlocked.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="#319B42"
            theme="dark"
            variant="flat"
            class="menuBtn"
            @click="
              unlockedDialog = false;        
            "
          >OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
          <v-btn color="#319B42" dark class="menuBtn bottomMargin" @click="errDialog = false">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-progress-circular
    v-if="waitCircle"
    :class="$vuetify.display.smAndDown ? 'waitCircleSm' : 'waitCircle'"
    indeterminate
    color="#319B42"
    :size="70"
    :width="10"
    ></v-progress-circular>
  </span>
</template>
<script>
import { HTTP } from "@/HTTP-common.js";
import Log from "@/log.js";
export default {
  data() {
    return {
      errDialog: false,
      waitCircle: false,
      unlockDialog: false,
      unlockedDialog: false,
      selected: {},
      breadcrumbItems: [
        {
          title: "Home Office",
          disabled: false,
          to: "HOLanding",
        },
        {
          title: "Account Maintenance",
          disabled: false,
          to: "HOSystemTools",
        },        
        {
          title: "Reconcile & Pay Lock Settings",
          disabled: true,
        },
      ],
      valid: true,
      headers: [
        {
          title: "Account Number",
          key: "franchiseId",
          sortable: true,
          width: 75,
        },
        { title: "Company Name", key: "franchiseName", sortable: true },
        { title: "Invoice Id", key: "invoiceId", sortable: true },
        { title: "Due Date", key: "dueDate", sortable: true },
        {
          title: "Delinquent Date",
          key: "delinquentDate",
          sortable: true,
          width: 100,
        },
        { title: "Locked By", key: "lockedBy", sortable: true },
        { title: "Locked On", key: "invoiceLockStart", sortable: true },
        { title: "Unlock", key: "unlock", width: 75, sortable: false },
      ],
       sortBy: [
       { key: 'franchiseName', order: 'asc' },     
       { key: 'invoiceLockStart', order: 'desc' }  
      ],
      items: [],
      noItemsFlag: false,
      page: 1,
      itemsPerPage: 10,
      searchFilter: undefined,
      searchByFilter: undefined,
      searchClicked: false,
      search: "",
      searchBy: "",
      searching: false,

      searchRules: [
        (v) => !!v || !this.searchClicked || "Please enter a search term.",
      ],
      searchByRules: [
        (v) => !!v || !this.searchClicked || "Please select a search field.",
      ],
      searchByItems: [
        "Account Number",
        "Company Name",
        "Invoice Id",
        "Locked By",
      ],
    };
  },
  created() {
    this.load();
  },
  computed: {
    filteredItems() {
      try {
        let baseList = this.items;

        try {
          return baseList.filter((i) => {
            return (
              !this.searchFilter ||
              !this.searchByFilter ||
              (this.searchByFilter === "Account Number" &&
                (i.franchiseId ? i.franchiseId : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
              (this.searchByFilter === "Company Name" &&
                (i.franchiseName ? i.franchiseName : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
              (this.searchByFilter === "Invoice Id" &&
                (i.invoiceId ? i.invoiceId : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
              (this.searchByFilter === "Locked By" &&
                (i.lockedBy ? i.lockedBy : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0)
            );
          });
        } catch (e) {
          Log.logError(e, "ReconcileWizard.vue filteredItems (inner catch)");
          return baseList;
        }
      } catch (e) {
        Log.logError(e, "ReconcileWizard.vue filteredItems (outer catch)");
        return this.listItems;
      }
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
  },
  methods: {
     async load() {
      this.waitCircle = true;
      await HTTP.get("ReconcilePay/GetLockedInvoices", {
        params: {},
        //withCredentials: true,
      })
        .then((response) => {
          if (
            response.status == 200 &&
            response.data &&
            response.data.statusCode == 200
          ) {
            // {"invoiceId":"1642491",
            // "franchiseId":"74490",
            // "franchiseName":"D & D TRASH SERVICE",
            // "dueDate":"2020-04-01T00:00:00",
            // "delinquentDate":"2020-04-16T00:00:00",
            // "invoiceLocked":true,
            // "invoiceLockStart":"2020-07-06T15:46:04.17",
            // "invoiceLockedBy":"TSTNBSUPERVISOR3",
            // "lockByFirstName":"Test",
            // "lockByLastName":"NBSUPERVISOR3"}

            //             {
            //   franchiseId: "25622",
            //   franchiseName: "Test Company One",
            //   invoiceId: "12345",
            //   lockedBy: "WSBTester",
            //   lockedOn: new Date(),
            // },

            this.items = [];

            for (let item of response.data.invoices) {
              let node = JSON.parse(JSON.stringify(item));
              node.lockedBy = (
                (node.lockByFirstName ? node.lockByFirstName : "") +
                " " +
                (node.lockByLastName ? node.lockByLastName : "")
              ).trim();

              this.items.push(node);
            }

            this.waitCircle = false;
          } else {
            Log.logError(
              new Error(
                JSON.stringify(response),
                "HORecAndPayOverview.vue load get"
              )
            );
            this.waitCircle = false;
            this.errDialog = true;
          }
        })
        .catch((e) => {
          Log.logError(e, "HORecAndPayOverview.vue load get");
          this.waitCircle = false;
          this.errDialog = true;
        });
    },

    async Unlock() {
      this.waitCircle = true;
      await HTTP.get("ReconcilePay/UnlockInvoice", {
        params: {
          franchiseId: this.selected.franchiseId,
          invoiceId: this.selected.invoiceId,
          userId: window.sessionStorage.getItem("user"),
        },
        //withCredentials: true,
      })
        .then((response) => {
          if (
            response.status != 200 ||
            (response.data && response.data.statusCode != 200)
          ) {
            Log.logError(
              JSON.stringify(response),
              "HORecAndPayOverview.vue UnLock ReconcilePay/UnlockInvoice response"
            );
            this.waitCircle = false;
            this.errDialog = true;
          } else {
            this.waitCircle = false;
            if (
              response.data &&
              response.data.invoiceDetails &&
              response.data.invoiceDetails.length &&
              (response.data.invoiceDetails[0].saveLockSuccess == true ||
                response.data.invoiceDetails[0].isLocked == false)
            ) {
              this.unlockedDialog = true;
              this.waitCircle = false;
              this.load();
            }
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "HORecAndPayOverview.vue Unlock get ReconcilePay/UnlockInvoice"
          );
          this.waitCircle = false;
          this.errDialog = true;
        });
    },
    async ClearAndUnlock() {
      this.waitCircle = true;

      await HTTP.get("ReconcilePay/ClearInvoiceDetails", {
        params: {
          franchiseId: this.selected.franchiseId,
          invoiceId: this.selected.invoiceId,
        },
      })
        .then(async (response) => {
          if (response.status == 200 && response.data.statusCode == 200) {
            await this.Unlock();
          } else {
            Log.logError(
              JSON.stringify(response),
              "HORecAndPayOverview.vue ClearAndUnlock get ReconcilePay/ClearInvoiceDetails"
            );
            this.waitCircle = false;
            this.errDialog = true;
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "HORecAndPayOverview.vue ClearAndUnlock get ReconcilePay/ClearInvoiceDetails"
          );
          this.waitCircle = false;
          this.errDialog = true;
        });
    },
    confirmUnlock(item) {
      this.selected = item;
      this.unlockDialog = true;
    },
    searchInvoices() {
      this.searchClicked = true;

      if (this.$refs.form.validate()) {
        this.searchFilter = this.search.trim();
        this.searchByFilter = this.searchBy.trim();
        this.page = 1;
      }
    },
    resetInvoices() {
      this.searchFilter = undefined;
      this.searchByFilter = undefined;
      this.searchClicked = false;
      this.search = "";
      this.searchyBy = "";
      if (this.$refs.form) this.$refs.form.resetValidation();
    },
  },
};
</script>
<style scoped>
.searchBox {
  max-width: 300px;
  min-width: 200px;
}
.theme--light.v-text-field--outlined fieldset {
  border-width: 3px !important;
}
.searchHeader {
  font-size: 1.1rem;
  font-weight: bold;
}
.menuBtn {
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
  margin-top: -10px;
}
</style>