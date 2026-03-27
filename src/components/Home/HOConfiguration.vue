<template>
    <span>
        <v-breadcrumbs :items="breadcrumbItems" style="color:#1976d2"></v-breadcrumbs>

        <v-row justify="center" align="center" align-content="center">
        <v-col cols="11">
            <v-data-table
            :headers="headers"
            :items="items"
            class="elevation-1"
            :loading="waiting"
            item-key="item.index"
            :items-per-page.sync="itemsPerPage"
            dark
            must-sort
            :page.sync="page"
            no-data-text="No configurations found."
            page-text="Viewing items: {0}-{1} of {2}"
            :items-per-page="10"
            items-per-page-text="Display records per page:"
            :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, 200,-1] ,
                'show-current-page': true,
                'show-first-last-page': true,
                'items-per-page-text': 'Display records per page: ' }"
            >
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

    </span>
</template>
<script>
import dataService from '@/services/dataService';

export default {
    name: "HOSettings",
    data() {
        return {
            breadcrumbItems: [
                {
                    title: 'Home Office',
                    disabled: false,
                    to: 'HOLanding',
                },
                {
                title: "Account Maintenance",
                disabled: false,
                to: "HOSystemTools"
                },        
                {
                    title: 'Settings',
                    disabled: true
                },
            ],
          noItemsFlag: false,
          waiting: false,
          items: [],
          page: 1,
          itemsPerPage: 10,
        }
    },
    methods: {
      getAllConfigurations() {
          this.waiting = true;
          this.items = [];
          dataService.getAllConfigurations().then(response => {
              this.waiting = false;
              if (response.status == "200"){
                this.items = response.data.configurationDetails;
              } else {
                //alert("show error!");
              }
          });
      },
    },    
    created: function () {
        this.getAllConfigurations();
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
            { title: "Id", key: "configurationId" },
            { title: "Key", key: "configurationKey" },
            { title: "Value", key: "configurationValue" },
            ];
        }

    }
}
</script>