<template>
  <span>
    <v-form ref="form" v-model="valid" style="position:sticky !important;">
      <v-row>
        <v-layout
          align-content="center"
          align="center"
          justify="center"
          v-if="$vuetify.display.mdAndUp"
        >
          <v-col lg="3" xl="3" md="4" sm="4" style="margin-left:40px !important;">
            <v-text-field
              variant="solo" rounded
              v-model="search"
              label="Search for..."
              class="roundedTextBox"
              :rules="searchRules"
             append-inner-icon="mdi-magnify"
              v-on:keyup.enter="gotoSearchBy('searchBy')"
            ></v-text-field>
          </v-col>
          <v-col lg="1" xl="1" md="1" sm="1" align="center" style="margin-top:20px !important;">
            <span class="searchHeader" >by</span>
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
              variant="solo" rounded
              
            ></v-select>
          </v-col>
          <v-col lg="2" xl="1" md="2" sm="2" align="center">
            <v-btn
              class="menuBtn"
              large
              color="#319B42"
              ref="searchRef"
              @click.stop="searchFranchises"
              dark
              >Search</v-btn
            >
          </v-col>
          <v-col lg="1" xl="1" md="2" sm="2" style="margin-left:-20px !important">
            <v-btn
              class="menuBtn"
              large
              color="#d1d1d1"
              dark
              v-show="search == ''"
              >Reset</v-btn
            >
            <v-btn
              v-show="search != ''"
              class="menuBtn"
              large
              color="#319B42"
              @click.stop="resetFranchises"
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
                 variant="solo" rounded
                  label="Search for..."
                  class="roundedTextBox"
                  :rules="searchRules"
                  append-inner-icon="mdi-magnify"
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
                  :items="searchByItems"
                  v-model="searchBy"
                  :rules="searchByRules"
                  variant="solo" rounded
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
                  class="menuBtn"
                  large
                  color="#319B42"
                  @click.stop="searchFranchises"
                  ref="searchRef"
                  dark
                  >Search</v-btn
                >
              </v-col>
              <v-col align="center" :cols="6">
                <v-btn
                  class="menuBtn"
                  large
                  color="#d1d1d1"
                  dark
                  v-show="search == ''"
                  >Reset</v-btn
                >
                <v-btn
                  v-show="search != ''"
                  class="menuBtn"
                  large
                  color="#319B42"
                  @click.stop="resetFranchises"
                  dark
                  >Reset</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-layout>
      </v-row>
    </v-form>
    <CompanySearchTable
      :headers="headers"
      :filteredItems="filteredItems"
      :itemsPerPage="itemsPerPage"
      :sortBy="sortBy"
      :pages="pages"
      :page="page"
      :maxPages="maxPages"
      :selectedItem="selectedItem"
    ></CompanySearchTable>
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
          <v-btn color="#319B42" dark class="menuBtn" @click="errDialog = false"
            >OK</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>
<script>
import Log from "@/log.js";
import eventBus from "@/event-bus.js";
import CompanySearchTable from "@/components/Company/CompanySearchTable.vue";

export default {
  components: {
  CompanySearchTable,
  },
  data() {
    return {
      errDialog: false,
      sortBy: ["branch", "number", "month"],
      noItemsFlag: false,
      waiting: false,
      search: "",
      searchBy: "",
      searchFilter: "",
      searchByFilter: "",
      searchClicked: false,
      valid: true,
      page: 1,
      itemsPerPage: 10,
      franchiseDetails: {},
      searchByItems: ["Company Name", "Account Number", "Enrollment Month"],
      searching: false,
      searchRules: [
        (v) => !this.searchClicked || !!v || "Please enter a search term.",
      ],
      searchByRules: [
        (v) => !!v || !this.searchClicked || "Please select a search field.",
      ],
      items: [],
      selectedItem: null,
      headers: [
        {
          title: "Company Name",
          key: "name",
          filterable: false,
        },
        {
          title: "Account Number",
          key: "number",
          filterable: false,
        },
        {
          title: "Enrollment Month",
          key: "month",
          filterable: false,
          sortable: false,
        },
        {
          title: "Invoice Home",
          key: "link",
          filterable: false,
          sortable: false,
        },
      ],
    };
  },
  created() {
    let type = window.sessionStorage.getItem("type");

    if (type.toLowerCase() === "ext") {
      try {
        let franchises = window.sessionStorage.getItem("franchises");

        if (franchises != null && franchises != "" && franchises != []) {
          let companies = JSON.parse(franchises);

          for (let company of companies) {
            this.items.push({
              name: company.franchiseName,
              number: company.franchiseID,
              month: company.enrollmentString
            });
           //onsole.log("Testing Franchases",company.franchiseName);
          }
        }

        if (this.items.length === 0) {
          this.noItemsFlag = true;
          eventBus.emit("noFranchises");
        }

        if (this.items.length === 1) {
          let item = this.items[0];
          if (item != null) {
            //this.selectedItem = item;
          }
        }
      } catch (e) {
        this.errDialog = true;
        Log.logError(e, "CompanySearch.vue created");
      }
    }

    this.$store.commit(
      "setSwitchCompanies",
      this.items.length > 1 ? true : false
    );

    window.sessionStorage.setItem(
      "switchCompanies",
      this.items.length > 1 ? true : false
    );
  },
  methods: {
    gotoSearchBy(refName) {
      this.$refs[refName].activateMenu();
      this.$refs[refName].focus();
    },
    searchFranchises() {
      this.searchClicked = true;

      if (this.$refs.form.validate()) {
        this.page = 1;
        this.searchFilter = this.search;
        this.searchByFilter = this.searchBy;
      }

      this.$refs.searchRef.$el.blur();
    },
    resetFranchises() {
      this.searchFilter = "";
      this.searchByFilter = "";
      this.searchClicked = false;
      this.search = "";
      this.seachyBy = "";
      this.$refs.form.resetValidation();
    },
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
    filteredItems() {
      try {
        return this.items.filter((i) => {
          return (
            !this.searchFilter ||
            !this.searchByFilter ||
            (this.searchByFilter === "Company Name" &&
              (i.name ? i.name : "")
                .toLowerCase()
                .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
            (this.searchByFilter === "Account Number" &&
              (i.number ? i.number : "")
                .toLowerCase()
                .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
            (this.searchByFilter === "Agency" &&
              (i.branch ? i.branch : "")
                .toLowerCase()
                .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
            (this.searchByFilter === "Enrollment Month" &&
              (i.month ? i.month : "")
                .toLowerCase()
                .indexOf(this.searchFilter.toLowerCase()) >= 0)
          );
        });
      } catch (e) {
        Log.logError(e, "CompanySearch.vue filteredItems");
        return this.items;
      }
    },
  },
};
</script>
<style scoped>
.menuBtn {
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
  margin-bottom: 30px;
}
.roundedTextBox {
  border-radius: 15px !important;
  -moz-border-radius: 15px !important;
  -webkit-border-radius: 15px !important;
}
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
</style>
