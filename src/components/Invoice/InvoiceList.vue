<template>
  <v-container grid-list-md text-xs-center class="recon">
    <v-row align="center" justify="center"  wrap>
      <v-col cols="12">
        <v-data-table :headers="headers" :items="invoiceList" class="elevation-1">
          <template slot="items" slot-scope="props">
            <td class="text-xs-right">{{ props.item.dueDate }}</td>
            <td class="text-xs-right">{{ props.item.statusCode }}</td>
            <td class="text-xs-right">{{ props.item.amountBilled }}</td>
            <td class="text-xs-right">{{ props.item.adjustments }}</td>
            <td class="text-xs-right">{{ props.item.adjustedTotal }}</td>
            <td>
              <v-checkbox primary hide-details :input-value="props.selected"></v-checkbox>
            </td>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  created() {},
  data() {
    return {
      headers: [
        {
          title: "Due Date",
          align: "left",
          sortable: true,
          key: "dueDate"
        },
        // { text: "Due Date", value: "dueDate" },
        { title: "Status", key: "statusCode" },
        { title: "Amount Billed", key: "amountBilled" },
        { title: "Adjustmnts", key: "adjustments" },
        { title: "Adjusted Total", key: "adjustedTotal" }

        //{ type: "checkbox", class: "checkbox-class" }
        //,
        // { text: "Adjusted Amount", value: "AdjustmentAmount" }
      ],
      //this.invoicePolicies
      listItems: this.$store.state.invoiceList
      //listItems: []
    };
  },
  computed: {
    invoiceList() {
      // return this.$store.state.parts;
      return this.$store.state.invoiceList;
    }
  }
  //   created() {
  //     //this.$http.get(http://localhost:3000/products)
  //     //this.$store.dispatch("getInvoiceDetails");
  //     this.$store.dispatch("getInvoiceDetails");
  //   }
};
</script>
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.recon {
  background-color: yellow;
}
</style>
