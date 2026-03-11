<template>  
  <v-col
    :class="$vuetify.display.mdAndUp ? 'padRightSide padLeftSide' : ''"
    style="
      padding-top: 0px;
      padding-bottom: 0px;
      margin-top: 0px;
      margin-bottom: 0px;
    "
  >
    <!-- <v-container> -->
    <v-row style="padding-bottom: 0px; margin-bottom: 0px">
      <v-col xl="8" lg="8" md="8" sm="12">
        <v-row
          style="padding-bottom: 0px !important; margin-bottom: 0px !important;position:sticky !important;"
        >
          <reconcile-stepper
            id="recStepper"
            :step="stepperPage"
            :stepperDefs="stepperDefs"
          />
        </v-row>

        <!-- start stepper page one or page two header rows -->

        <v-row
          style="padding-bottom: 0px !important; margin-bottom: 0px !important"
          v-if="
            stepperPage == stepperDefs.invoiceAdjustments ||
            stepperPage == stepperDefs.reviewChanges
          "
        >
          <v-col align="center">
            <span class="headers">Amount Billed:</span>
            <br />
            <span class="headerAmounts">{{ $filters.money(amountBilled) }}</span>
          </v-col>
          <v-col align="center">
            <span class="headers">Adjustments:</span>
            <br />
            <span class="headerAmounts">{{  $filters.money(adjustments) }}</span>
          </v-col>
          <v-col align="center">
            <span class="headers">Adjusted Total:</span>
            <br />
            <span class="headerAmounts">{{ $filters.money(adjustedTotal) }}</span>
          </v-col>
        </v-row>
        <v-row
          v-if="stepperPage == stepperDefs.reviewChanges"
          style="margin-top: 25px"
        ></v-row>

        <span
          v-if="
            stepperPage == stepperDefs.invoiceAdjustments ||
            stepperPage == stepperDefs.reviewChanges
          "
        >
          <v-row
            id="notesRow"
            :style="
              stepperPage == stepperDefs.reviewChanges
                ? 'margin-bottom: 25px;'
                : ''
            "
          >
            <v-col :cols="12" align="center">
              <span
                v-if="
                  stepperPage == stepperDefs.invoiceAdjustments &&
                  lockedBy != 'scheduled'
                "
                class="note"
                >Make any necessary adjustments below for invoice due
                {{  $filters.mmddyyyy(dueDate) }}</span
              >

              <span
                v-if="
                  stepperPage == stepperDefs.invoiceAdjustments &&
                  lockedBy == 'scheduled'
                "
                class="note"
                style="color: #00558c"
                >Currently viewing scheduled invoice for due date
                {{ $filters.mmddyyyy(invoiceToLoad.dueDate) }}.</span
              >

              <span
                v-if="stepperPage == stepperDefs.reviewChanges"
                class="note"
              >
                Review all policy changes and adjustments below for invoice due
                {{ $filters.mmddyyyy(dueDate) }} <br />Return to the previous page to
                correct any errors or continue to process your payment
              </span>
            </v-col>
          </v-row>
          <v-divider style="margin-bottom:20px"></v-divider>
          <v-form
            ref="form"
            v-model="valid"
            style="
              padding-bottom: 0px !important;
              margin-bottom: 0px !important;
            "
          >
            <v-row
              v-if="stepperPage == stepperDefs.invoiceAdjustments"
              style="
                padding-bottom: 0px !important;
                margin-bottom: 0px !important;
                padding-top: 0px;
                margin-top: 0px;
              "
            >
              <v-row
                align="start"
                justify="start"
                align-content="start"
                
                v-if="$vuetify.display.smAndUp"
              >
                <v-tooltip location="right" color="green" v-if="!isLocked" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="large" color="green" style="font-size: 40px;">mdi-lock-open</v-icon>
                  </template>
                  <span>Ready for Reconciliation</span>
                </v-tooltip>

                <v-tooltip location="right"  color="#00558c" v-if="isLocked" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="large" color="#00558C" style="font-size: 40px;">mdi-lock</v-icon>
                  </template>
                  <span v-if="lockedBy != 'scheduled' && !hasLock"
                    >Reconcile and Pay process locked by user '{{
                      lockUser
                    }}'.</span
                  >
                  <span v-else-if="lockedBy != 'scheduled' && hasLock"
                    >The Reconcile and Pay process is locked by you.</span
                  >
                  <span v-else
                    >Payment for this invoice is scheduled. The invoice cannot
                    be edited.</span
                  >
                </v-tooltip>
              </v-row>
              <v-row
                align-content="center"
                align="center"
                justify="center"
                v-if="$vuetify.display.smAndUp"
                row
              >
                <v-col
                  lg="4"
                  xl="4"
                  md="4"
                  sm="4"
                  style="
                    padding-bottom: 0px !important;
                    margin-bottom: 0px !important;
                  "
                >
                  <!-- <span class="searchHeader">Search Policies for:</span> -->

                  <v-text-field
                    variant="solo"
                    rounded
                    v-model="search"
                    label="Search Policies for..."
                    class="roundedTextBox"
                    :rules="searchRules"
                    append-inner-icon="mdi-magnify"
                    v-on:keyup.enter="gotoSearchBy('searchBy')"
                    style="
                      padding-bottom: 0px !important;
                      margin-bottom: 0px !important;
                    "
                  ></v-text-field>
                </v-col>
               <v-col> <span class="searchHeader">by</span></v-col>
               <v-col
                  lg="4"
                  xl="4"
                  md="4"
                  sm="4"
                  style="
                    padding-bottom: 0px !important;
                    margin-bottom: 0px !important;
                  "
                >
                <!-- <span style="margin-left: 5px; margin-right: 5px"> -->
                  <v-select
                    ref="searchBy"
                    :items="searchByItems"
                    v-model="searchBy"
                    :rules="searchByRules"
                    class="roundedTextBox"
                    style="
                      min-width: 200px;
                      max-width: 300px;
                      margin-bottom: 0px;
                      padding-bottom: 0px;
                      margin-top: 0px;
                    "
                    @change.passive="$refs['searchRef'].$el.focus()"
                    v-on:keyup.enter="$refs['searchRef'].$el.focus()"
                    variant="solo"
                    rounded
                  ></v-select>
                <!-- </span> -->
                </v-col>
                <v-btn
                  class="menuBtn"
                  large
                  color="#319B42"
                  dark
                  style="margin-left: 10px;margin-bottom: 20px !important;"
                  ref="searchRef"
                  @click.stop="searchPolicies"
                  >Search</v-btn
                >
                <v-btn
                  class="menuBtn"
                  large
                  color="#d1d1d1"
                  style="margin-left: 10px;margin-bottom: 20px !important;"
                  dark
                  v-show="search == ''"
                  >Reset</v-btn
                >
                <v-btn
                  v-show="search != ''"
                  class="menuBtn"
                  large
                  dark
                  style="margin-left: 10px;margin-bottom: 20px !important;"
                  color="#319B42"
                  @click.stop="resetPolicies"
                  >Reset</v-btn
                >
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
                      <span class="searchHeader">Search Policies for:</span>
                      <v-text-field
                        solo
                        v-model="search"
                        label="Search Policies for..."
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
                      <v-btn
                        class="menuBtn"
                        large
                        color="#319B42"
                        dark
                        @click.stop="searchPolicies"
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
                        dark
                        color="#319B42"
                        @click.stop="resetPolicies"
                        >Reset</v-btn
                      >
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col align="start" :cols="12">
                      <v-tooltip location="right" color="green" v-if="!isLocked" content-class="custom-tooltip">
                        <template #activator="{ props }">
                          <v-icon v-bind="props" size="large" color="green"
                            >mdi-lock-open</v-icon
                          >
                        </template>
                        <span>Ready for Reconciliation</span>
                      </v-tooltip>

                      <v-tooltip location="right" color="#00558c" v-if="isLocked" content-class="custom-tooltip">
                        <template #activator="{ props }">
                          <v-icon v-bind="props" size="large" color="#00558C"
                            >mdi-lock</v-icon
                          >
                        </template>
                        <span
                          >Reconcile and Pay process locked by user '{{
                            lockUser
                          }}'.</span
                        >
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-container>
              </v-row>
            </v-row>
          </v-form>
        </span>
        <!-- end stepper page one or page two header rows-->
        <!-- begin process payment section -->
        <v-row v-if="stepperPage == stepperDefs.processPayment">
          <v-col>
            <v-card>
              <v-form ref="paymentForm">
                <v-app-bar color="#44aba8" dark>
                  <v-card-title
                    class="process-payment-title"
                    v-if="!isScheduledInvoice"
                  >
                    <v-row v-if="$vuetify.display.mdAndUp">
                      <v-col>Process Payment</v-col>
                      <v-col class="process-payment-dueDate"
                        >Invoice Due Date {{ $filters.mmddyyyy(dueDate) }}</v-col
                      >
                    </v-row>
                    <div v-else>
                      <v-row class="process-payment-dueDate"
                        >Invoice Due Date {{ $filters.mmddyyyy(dueDate) }}</v-row
                      >
                    </div>
                  </v-card-title>
                  <v-card-title
                    class="process-payment-title"
                    v-if="isScheduledInvoice"
                  >
                    <v-row>
                      <v-col>Scheduled Payment</v-col>
                      <v-col class="process-payment-dueDate"
                        >Invoice Due Date
                        {{  $filters.mmddyyyy(scheduledInvoiceDueDate) }}</v-col
                      >
                    </v-row>
                  </v-card-title>
                </v-app-bar>
                <v-card-text>
                  <v-card-title style="color: #00558c;margin-top:50px !important" 
                    >Enter Payment Information</v-card-title
                  >
                  <v-row v-if="isHomeOfficeUser">
                    <v-col></v-col>
                    <v-col :cols="$vuetify.display.mdAndUp ? 6 : 10">
                      <v-checkbox
                        color="#00558C"
                        label="I have a check to be deposited."
                        v-model="depositCheck"
                        :disabled="
                          !hasStepperPermission('processPayment', 'update') ||
                          (isLocked && !hasLock)
                        "
                        :readonly="
                          !hasStepperPermission('processPayment', 'update') ||
                          (isLocked && !hasLock)
                        "
                      ></v-checkbox>
                    </v-col>
                    <v-col></v-col>
                  </v-row>

                  <v-row>
                    <v-col v-if="$vuetify.display.mdAndUp"></v-col>
                    <v-col :cols="$vuetify.display.mdAndUp ? 6 : 10">
                      <v-text-field
                        :disabled="true"
                        v-model="routingNumber"
                        label="*Routing Number"
                        maxlength="9" 
                        variant="outlined"
                        :rules="routingNumberBasicRules"
                        autocomplete="routingNumber"
                        dense
                        id="routingNumberMainScreen"
                        :readonly="
                          !hasStepperPermission('processPayment', 'update')
                        "
                      ></v-text-field>
                      <div
                        v-if="validBank"
                        style="margin-top: 0px; margin-bottom: 20px"
                      >
                        {{ bankName }}
                      </div>
                      <v-text-field
                        :disabled="true"
                        v-model="bankAccount"
                        label="*Checking Account Number"
                        maxlength="20" 
                        variant="outlined"
                        dense
                        :rules="bankAccountBasicRules"
                        id="bankAccountMainScreen"
                        :readonly="
                          !hasStepperPermission('processPayment', 'update')
                        "
                      ></v-text-field>
                    </v-col>
                    <v-col
                      v-if="
                        hasStepperPermission('processPayment', 'update') &&
                        (!isLocked || hasLock)
                      "
                    >
                      <v-tooltip location="top" color="#00558c" content-class="custom-tooltip">
                        <template #activator="{ props }">
                          <v-icon
                            color="#00558C"
                            size ="large"
                            v-bind="props"
                            @click="bankAcctDialog = true"
                            >mdi-lead-pencil</v-icon
                          >
                        </template>
                        <span>Edit Bank Account Information</span>
                      </v-tooltip>
                    </v-col>
                    <v-col
                      v-if="
                        !hasStepperPermission('processPayment', 'update') ||
                        (isLocked && !hasLock)
                      "
                    >
                      <v-tooltip location="top" color="gray" content-class="custom-tooltip">
                        <template #activator="{ props }">
                          <v-icon color="gray" size="large" v-bind="props"
                            >mdi-lead-pencil</v-icon
                          >
                        </template>
                        <span>Edit Bank Account Information</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col align="center">
                      <span class="headers">Amount Billed:</span>
                      <br />
                      <span class="headerAmounts">{{
                         $filters.money(amountBilled)
                      }}</span>
                    </v-col>
                    <v-col align="center">
                      <span class="headers">Adjustments:</span>
                      <br />
                      <span class="headerAmounts">{{
                         $filters.money(adjustments)
                      }}</span>
                    </v-col>
                    <v-col align="center">
                      <span class="headers">Adjusted Total:</span>
                      <br />
                      <span class="headerAmounts">{{
                         $filters.money(adjustedTotal)
                      }}</span>
                    </v-col>
                  </v-row>
                  <v-card-title style="color: #00558c"
                    >Enter Payment Amount</v-card-title
                  >
                  <v-row>
                    <v-col></v-col>
                    <v-col :cols="$vuetify.display.mdAndUp ? 6 : 10">
                      <v-text-field color="primary"
                        v-model="finalPayment"
                        :rules="finalPaymentRules"
                        label="*Payment Amount"
                        variant="outlined"
                        autocomplete="finalPayment"
                        dense
                        prefix="$"
                        :disabled="
                          !hasStepperPermission('processPayment', 'update') ||
                          (isLocked && !hasLock)
                        "
                      ></v-text-field>
                    </v-col>
                    <v-col v-if="$vuetify.display.mdAndUp"></v-col>
                  </v-row>
                </v-card-text>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
        <!-- end process payment section -->
        <!-- begin post-payment section -->
        <v-row v-if="stepperPage == stepperDefs.complete">
          <!-- marker -->
          <v-col>
            <br />
            <v-card-title>
              <strong>
                Payment for invoice due
                <br v-if="$vuetify.display.smAndDown" />
                {{ $filters.mmddyyyy(dueDate) }} has been scheduled.
              </strong>
            </v-card-title>
            <v-card-subtitle
              >View invoices scheduled for payment below. To make additional
              modifications, scheduled payment must be deleted prior to the
              process time.</v-card-subtitle
            >
            <br />
            <br />
          </v-col>
        </v-row>
        <!-- end post-payment section -->
      </v-col>
      <v-col v-if="$vuetify.display.mdAndUp">
        <side-bar :narrow="true" />
      </v-col>
    </v-row>
   
    <v-row
      id="stepperRow"
      style="padding-top: 0px !important; margin-top: 1px !important"
    >
      <v-col :cols="12" style="padding: 0px !important; margin: 0px !important;max-width:97% !important"> 
            <!-- begin stepper page one data table section "groupCriteria[0].key == 'name' ? headers : headersAlt" -->

        <span v-if="stepperPage == stepperDefs.invoiceAdjustments">
          <v-form ref="stepperOneForm">
            <v-data-table
              id="stepperOne"
              ref="stepperOne"
              v-model="selected"
               v-model:page="currentPage"
              :headers= "groupCriteria[0].key == 'name' ? headers : headersAlt" 
              density="compact"
              :group-by="groupCriteria" 
              :group-desc="!sortNameAsc"
              :items="filteredItems"
              
              :itemsPerPage="showitemsPerPage"
          fixed-header
              class="elevation-1 ext-caption"
              style="
                margin-left: 0px;
                margin-right: 0px;
                padding-left: 0px;
                padding-right: 0px;
               
              "
              :loading="searching"
              
              item-key="item.index"
              item-value ="item.name"
              :items-per-page.sync="itemsPerPage"
           group-expand
          show-group-by = true
              height="500"
              :sort-by="sortBy"
              :sort-desc.sync="descending"
              :page.sync="page"
              must-sort
              :no-data-text="
                pastDue
                  ? 'Please contact Worksite Customer Service at 1-888-488-0134, select Option #2.'
                  : 'No policies found.'
              "
              :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, 200, -1],
                'show-current-page': true,
                'show-first-last-page': true,
                'items-per-page-text': 'Display records per page: ',
        
              }"
            >
                   
  
            <template v-slot:group-summary="{ item, columns,group }">
             
      <tr class="no-border-row" style="border:0px !important;">
        <td  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                    text-wrap-mode: nowrap !important;
                  "
         v-if="
                  searchByFilter != 'Policy Number' &&
                  $vuetify.display.mdAndUp
                "
         v-for="c in columns"
          :key="c.key"
          :class="['v-data-table__td', c.align ? `v-data-table-column--align-${c.align}` : '']"
        >
          <span colspan="2" v-if="c.key === 'policyNumber'" style="margin-left:15px">Totals by employee</span>
           <span v-if="c.key === 'premiumDeducted'" style="margin-left:15px"
            >{{ $filters.money(sumPremiumsPerPayPeriod(item.items)) }}</span
          >
          <span v-if="c.key === 'totalPremium'" style="margin-left:15px"
            >{{  $filters.money(sumPremiums(item.items)) }}</span
          >
          <span v-if="c.key === 'calculatedAdjustmentAmount'" style="margin-left:15px"
            >{{   $filters.money(sumAdjustments(item.items)) }}</span
          >
            <span v-if="c.key === 'calculatedPremDue'" style="margin-left:15px"
            >{{ $filters.money(sumCalcPrem(item.items)) }}</span
          > 
        </td>
      </tr>
    </template>

              <template
                v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }"
              >
                <div
                  :class="
                    $vuetify.display.smAndDown
                      ? 'v-data-footer__select smallFooter'
                      : 'v-data-footer__select'
                  "
                >
                  <span v-if="$vuetify.display.mdAndUp">
                    Viewing items: {{ pageStart }}-{{ pageStop }} of
                    {{ itemsLength }}
                  </span>
                  <span style="margin-left: 10px">Page:&nbsp;</span>
                  <v-select
                    :items="pages"
                    v-model="page"
                    item-text="page"
                    item-value="page"
                    :menu-props="{ auto: true }"
                    hide-details
                    style="width: 75px; font-size: 0.75rem; margin-right: 20px"
                  ></v-select>
                  &nbsp;of&nbsp;{{ maxPages }}
                </div>
              </template>
            <template #group-header="{ item, columns, toggleGroup, isGroupOpen }">
         <template :ref="(el) => { groupHeaders[item.value] = { item, toggleGroup, isGroupOpen } }" />
        <tr >  
        <td :colspan="columns.length" style="background-color: #00558c !important;color:white!important">
      
          <!-- Toggle button using an icon -->
           <v-tooltip content-class="custom-tooltip" location="top">
           <template #activator="{ props }">
           <v-btn
        
          v-bind="props"
            :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'"
            :data-open ="isGroupOpen(item)" 
            size="small"
            variant="text"
            @click="toggleGroup(item)"
          /> 
         
          </template>
           <span>{{ isGroupOpen(item) ? 'Collapse' : 'Expand' }}</span>
          </v-tooltip>
           <v-tooltip location="top" color="#00558c" v-if="hasEmployeeIds" content-class="custom-tooltip">
           
                       <template #activator="{ props }">
                      <span v-bind="props"
                        v-if="groupCriteria[0].key == 'empId'"
                        @click="groupCriteria[0].key = 'name'; openAllgroupby(false)"
                       
                        style="cursor: pointer;"
                        >{{
                            item.value != ""
                            ? item.value
                            : "(No Employee ID)"
                        }}</span
                      >
                      <span v-bind="props"
                       
                        style="cursor: pointer;"
                        @click="groupCriteria[0].key = 'empId'; openAllgroupby(false)"
                        v-else
                        >{{  item.value }}</span
                      >
                    </template>
                    <span>{{
                      groupCriteria[0].key == "name"
                        ? "Switch to Employee ID Grouping"
                        : "Switch to Name Grouping"
                    }}</span>
                  </v-tooltip>
                  <span v-if="!hasEmployeeIds">{{item.value }}</span>

                  <v-tooltip location="top" color="#00558c" content-class="custom-tooltip">
                    <template #activator="{ props }">
                      <v-icon
                       v-bind="props"
                        @click="{{ groupCriteria[0].order == 'asc' ?  groupCriteria[0].order = 'desc' :
                      groupCriteria[0].order = 'asc';  currentPage=1; }}"
                     
                        
                        style="margin-right: 10px"
                      >
                        {{ sortNameAsc ? "mdi-arrow-up" : "mdi-arrow-down" }}
                      </v-icon>
                    </template>
                    <span>Reverse Sort Order</span>
                  </v-tooltip>
        
        
        </td>
      </tr>
    </template>
               

              <!-- <template v-slot:group.header="{ items, isOpen, toggle }">
                <td
                  :colspan="14"
                  justify="start"
                  style="
                    background-color: #00558c !important;
                    color: white !important;
                  "
                >
                  <v-tooltip top color="#00558c">
                    <template v-slot:activator="{ on }">
                      <v-icon
                        v-on="on"
                        @click="toggle"
                        style="margin-right: 10px"
                        >{{ isOpen ? "mdi-minus" : "mdi-plus" }}</v-icon
                      >
                    </template>
                    <span>{{ isOpen ? "Collapse" : "Expand" }}</span>
                  </v-tooltip>

                  <v-tooltip top color="#00558c" v-if="hasEmployeeIds">
                    <template v-slot:activator="{ on }">
                      <span
                        v-if="groupCriteria[0].key == 'empId'"
                        @click="groupCriteria[0].key = 'name'"
                        v-on="on"
                        style="cursor: pointer"
                        >{{
                          items[0].employeeId != ""
                            ? items[0].employeeId
                            : "(No Employee ID)"
                        }}</span
                      >
                      <span
                        v-on="on"
                        style="cursor: pointer"
                        @click="groupCriteria = 'empId'"
                        v-else
                        >{{ items[0].name }}</span
                      >
                    </template>
                    <span>{{
                      groupCriteria == "name"
                        ? "Switch to Employee ID Grouping"
                        : "Switch to Name Grouping"
                    }}</span>
                  </v-tooltip>

                  <span v-if="!hasEmployeeIds">{{ items[0].name }}</span>

                  <v-tooltip top color="#00558c">
                    <template v-slot:activator="{ on }">
                      <v-icon
                        v-on="on"
                        @click="
                          sortNameAsc = !sortNameAsc;
                          page = 1;
                        "
                        style="margin-right: 10px"
                      >
                        {{ sortNameAsc ? "mdi-arrow-up" : "mdi-arrow-down" }}
                      </v-icon>
                    </template>
                    <span>Reverse Sort Order</span>
                  </v-tooltip>
                </td>
              </template> -->

              <template
                v-slot:group.summary="{ items}"
                v-if="
                  searchByFilter != 'Policy Number' &&
                  $vuetify.display.mdAndUp
                "
              >
               <tr class="font-weight-bold text-red">
                <td
                  colspan="6"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                >
                  <v-row justify-start>
                    <span style="margin-left: 20px">Totals By Employee:</span>
                  </v-row>
                </td>
                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                ></td>
                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                >
                  <v-row justify="start">
                    <span style="margin-left: 5px">{{
                       $filters.money(sumPremiumsPerPayPeriod(items))
                    }}</span>
                  </v-row>
                </td>

                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                >
                  <v-row justify-start>
                    <span style="margin-left: 5px">{{
                       $filters.money(sumPremiums(items))
                    }}</span>
                  </v-row>
                </td>
                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                ></td>
                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                ></td>
                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                >
                  <!-- <v-row justify-start>
                    <span style="margin-left: 5px;">{{ sumAdjusted(items) | money }}</span>
                  </v-row>-->
                </td>
                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                >
                  <v-row justify="start">
                    <span style="margin-left: 5px">{{
                       $filters.money(sumAdjustments(items))
                    }}</span>
                  </v-row>
                </td>
                <td
                  colspan="1"
                  style="
                    background-color: darkgrey !important;
                    color: white !important;
                    border: none !important;
                  "
                >
                  <v-row justify="start">
                    <span style="margin-left: 5px">{{
                      $filters.money(sumCalcPrem(items))
                    }}</span>
                  </v-row>
                </td>
              </tr>
              </template>

              <template v-slot:item.requestedChange="{ item }">
                <!-- marker -->
                <treeselect
                
                  :options="
                    item.section125Indicator == 'Yes' ? options125 : options
                  "
                  :disable-branch-nodes="true"
                  :show-count="true"
                  v-model="item.requestedChange"
                  placeholder
                  :rules="billingChangeRules"
                  :flatten-search-results="true"
                  search-nested
                  :append-to-body="true"
                  :max-height="150"
                  v-if="
                    (!isLocked || hasLock) &&
                    hasStepperPermission('invoiceAdjustments', 'update') &&
                    !isReadonlyRow(item)
                  "
                  style="min-width: 250px; max-width: 550px"
                  @update:model-value="onTreeSelectInput(item)"
                >
                  <label slot="option-label" slot-scope="{ node }">
                    <span v-if="node.isBranch">{{ node.label }}</span>
                    <span
                      v-else-if="
                        ['R', 'D', 'T', 'E', 'CSW', 'COE'].find(
                          (text) => text == node.id
                        )
                      "
                      >{{ node.label }}</span
                    >
                    <span v-else>
                      <v-icon color="#ccc" style="margin-left: 0px"
                        >mdi-circle-medium</v-icon
                      >
                      {{ node.label }}
                    </span>
                  </label>
                </treeselect>
                <treeselect
              
                  :options="
                    item.section125Indicator == 'Yes' ? options125 : options
                  "
                  :disable-branch-nodes="true"
                  :show-count="true"
                  v-model="item.requestedChange"
                  placeholder
                  :flatten-search-results="true"
                  search-nested
                  :append-to-body="true"
                  :max-height="150"
                  v-if="
                    (isLocked == true && !hasLock) ||
                    !hasStepperPermission('invoiceAdjustments', 'update') ||
                    isReadonlyRow(item)
                  "
                  disabled
                  style="max-width: 450px"
                  @click="lockedDialog = true"
                ></treeselect>
                <template
                  v-if="
                    isNotValidSelection(item) && (isLocked == false || hasLock)
                  "
                >
                  <span style="color: red"
                    >Please select a billing change reason.</span
                  >
                </template>
                <template
                  v-if="
                    item.requestedChange == 'TMP-O' && item.otherReason != ''
                  "
                >
                  <v-icon
                    color="#00558c"
                    @click="
                      currentItem = item;
                      clearOnCancel = false;
                      otherReason = item.otherReason;
                      otherDialog = true;
                    "
                    small
                    style="margin-left: 0px; padding-left: 0px"
                    >mdi-lead-pencil</v-icon
                  >
                  {{ item.otherReason }}
                </template>

                <!-- <v-select
                dense
                v-model="item.changeReason"
                :items="ChangeReasonsList"
                light
                style="margin-left:20px; margin-right: 20px;margin-top:0px;margin-bottom:0px;font-size:14px;"
                clearable
                ></v-select>-->
              </template>

              <template v-slot:item.calculatedAdjustmentAmount="{ item }">{{
                 $filters.money(item.calculatedAdjustmentAmount)
              }}</template>

              <template v-slot:item.calculatedPremDue="{ item }">{{
                 $filters.money(item.calculatedPremDue)
              }}</template>

              <template v-slot:item.adjustmentAmount="{ item }">
                <v-text-field
                  clearable
                  prepend-inner-icon="mdi-currency-usd"
                  style="
                    width: 110px;
                    padding: 0px;
                    margin-bottom: 0px;
                    margin-top: 0px;
                    font-size: 13px;
                  "
                  light
                  v-model="item.adjustmentAmount"
                  :rules="adjustmentAmtRules"
                  :disabled="
                    (isLocked == true && !hasLock) ||
                    item.requestedChange == 'E' ||
                    !hasStepperPermission('invoiceAdjustments', 'update') ||
                    isReadonlyRow(item)
                  "
                  @input="onInputAdjustmentAmount(item)"
                ></v-text-field>
                <span
                  style="
                    color: red;
                    width: 110px;
                    padding: 0px;
                    margin-bottom: 0px;
                    margin-top: 0px;
                    font-size: 13px;
                  "
                  v-if="
                    isAmountRequired(item) && (isLocked == false || hasLock)
                  "
                  >Amount is required.
                </span>
              </template>

              <template v-slot:header.dueDate="{ header,column  }">
                <v-tooltip color="#00558c" location="top" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <span v-bind="props">{{ column.title  }}</span>
                  </template>
                  <span>Date that the policy is currently paid through.</span>
                </v-tooltip>
              </template>

              <template v-slot:header.premiumDeducted="{ header,column }">
                <v-tooltip color="#00558c" location="top" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <span v-bind="props">{{ column.title }}</span>
                  </template>
                  <span
                    >Amount deducted every pay period from the employee payroll
                    for each policy.</span
                  >
                </v-tooltip>
              </template>

              <template v-slot:header.totalPremium="{ header,column }">
                <v-tooltip color="#00558c" location="top" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <span v-bind="props">{{ column.title }}</span>
                  </template>
                  <span
                    >Total premium due for the policy per invoice based on the
                    account billing frequency.</span
                  >
                </v-tooltip>
              </template>

              <template v-slot:header.requestedChange="{ header,column }">
                <v-tooltip color="#00558c" location="top"  content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <span v-bind="props">{{ column.title }}</span>
                  </template>
                  <span
                    >Select the employee reason for the premium
                    adjustment.</span
                  >
                </v-tooltip>
              </template>

              <template v-slot:header.adjustmentAmount="{ header,column }">
                <v-tooltip color="#00558c" location="top" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <span v-bind="props">{{ column.title }}</span>
                  </template>
                  <span>Enter any premium payment adjustments.</span>
                </v-tooltip>
              </template>

              <template v-slot:header.calculatedAdjustmentAmount="{ header,column }">
                <v-tooltip color="#00558c" location="top" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <span v-bind="props">{{ column.title }}</span>
                  </template>
                  <span
                    >Amount of premium that is deducted/added to your bill due
                    to an employee status change or missed deduction. This
                    amount is calculated automatically when an “Adjusted Premium
                    Amount” is entered.</span
                  >
                </v-tooltip>
              </template>

              <template v-slot:header.calculatedPremDue="{ header,column }">
                <v-tooltip color="#00558c" location="top" content-class="custom-tooltip"top>
                  <template #activator="{ props }">
                    <span v-bind="props">{{ column.title }}</span>
                  </template>
                  <span
                    >Final premium amount due after all premium
                    adjustments.</span
                  >
                </v-tooltip>
              </template>
            </v-data-table>
          </v-form>
        </span>
        <!-- end stepper page one data table section -->

        <!-- begin review changes data table section -->
        <span v-if="stepperPage == stepperDefs.reviewChanges">
          <v-data-table
            id="stepperTwo"
            v-model="selected"
            :headers="headers"
            density="compact"
            :group-by= "groupCriteria"
            :group-desc="!sortNameAsc"
            :items="adjustedItems"
            class="elevation-1"
            style="margin-left: 0px; margin-right: 0px"
            :loading="searching"
            item-key="item.index"
            :items-per-page.sync="itemsPerPage"
            dark
             
            :sort-by="sortBy"
            :sort-desc.sync="descending"
            :page.sync="page"
            must-sort
            no-data-text="No adjustments found."
             :items-per-page="10"
    items-per-page-text="Items per page:"
    :items-per-page-options="[5, 10, 25, 50]"
    :show-first-last-page="true"
    first-icon="mdi-arrow-collapse-left"
    last-icon="mdi-arrow-collapse-right"
            :footer-props="{
              'items-per-page-options': [10, 25, 50, 100, 200, -1],
              'show-current-page': true,
              'show-first-last-page': true,
              'items-per-page-text': 'Display records per page: ',
            }"
          >
            <template
              v-slot:footer.page-text="{ pageStart, pageStop, itemsLength }"
            >
              <div
                :class="
                  $vuetify.display.smAndDown
                    ? 'v-data-footer__select smallFooter'
                    : 'v-data-footer__select'
                "
              >
                <span v-if="$vuetify.display.mdAndUp">
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

             <template #group-header="{ item, columns, toggleGroup, isGroupOpen }">
               <template :ref="(el) => { reviewgroupHeaders[item.value] = { item, toggleGroup, isGroupOpen } }" />
               <tr>
        <td :colspan="columns.length" style="background-color: #00558c !important;color:white!important">
        
          <!-- Toggle button using an icon -->
           
            <v-tooltip location="top" color="#00558c" content-class="custom-tooltip">
                  <template #activator="{  props }">
                    <v-icon
                      v-bind="props"
                      @click="toggleGroup(item)"
                      style="margin-right: 10px"
                      >{{ isGroupOpen(item) ? "mdi-minus" : "mdi-plus" }}</v-icon
                    >
                  </template>
                  <span>{{ isGroupOpen(item) ? "Collapse" : "Expand" }}</span>
                </v-tooltip>
           <!-- <v-btn
            :icon="isGroupOpen(item) ? 'mdi-minus' : 'mdi-plus'"
            size="small"
            variant="text"
            @click="toggleGroup(item)"
          />  -->
            {{ item.value }}
          <v-tooltip location="top" color="#00558c" content-class="custom-tooltip">
                    <template #activator="{  props }">
                      <v-icon v-bind="props"
                        
                        @click="{{ groupCriteria[0].order == 'asc' ?  groupCriteria[0].order = 'desc' :
                      groupCriteria[0].order = 'asc';  currentPage=1}}"
                        
                        style="margin-right: 10px"
                      >
                        {{ sortNameAsc ? "mdi-arrow-up" : "mdi-arrow-down" }}
                      </v-icon>
                       
                    </template>
                   <span color="#00558c">Reverse Sort Order</span>
                  </v-tooltip>
        </td>
      </tr>

             </template>

            <!-- <template v-slot:group.header="{ items, isOpen, toggle }">
              <td
                colspan="14"
                justify="start"
                style="
                  background-color: #00558c !important;
                  color: white !important;
                "
              >
                <v-tooltip top color="#00558c">
                  <template v-slot:activator="{ on }">
                    <v-icon
                      v-on="on"
                      @click="toggle"
                      style="margin-right: 10px"
                      >{{ isOpen ? "mdi-minus" : "mdi-plus" }}</v-icon
                    >
                  </template>
                  <span>{{ isOpen ? "Collapse" : "Expand" }}</span>
                </v-tooltip>
                {{ items[0].name }}
                <v-tooltip top color="#00558c">
                  <template v-slot:activator="{ on }">
                    <v-icon
                      v-on="on"
                      @click="
                        sortNameAsc = !sortNameAsc;
                        page = 1;
                      "
                      style="margin-right: 10px"
                    >
                      {{ sortNameAsc ? "mdi-arrow-up" : "mdi-arrow-down" }}
                    </v-icon>
                  </template>
                  <span>Reverse Sort Order</span>
                </v-tooltip>
              </td>
            </template> -->
            <template v-slot:item.requestedChange="{ item }">
              {{
                getRequestedChange(
                  item.requestedChange,
                  item.section125Indicator == "Yes" ? options125 : options
                )
              }}
              <template
                v-if="item.requestedChange == 'TMP-O' && item.otherReason != ''"
              >
                - &nbsp;
                {{ item.otherReason }}
              </template>
            </template>
            <template v-slot:item.calculatedAdjustmentAmount="{ item }">{{
               $filters.money(item.calculatedAdjustmentAmount)
            }}</template>
            <template v-slot:item.calculatedPremDue="{ item }">{{
               $filters.money(item.calculatedPremDue)
            }}</template>
            <template v-slot:item.adjustmentAmount="{ item }">
              <span>{{ $filters.money(item.adjustmentAmount) }}</span>
            </template>
          </v-data-table>
        </span>
        <!-- end review changes data table section -->

        <!-- begin completed data table section -->
        <span v-if="stepperPage == stepperDefs.complete">
          <v-row align="start" justify="start" align-content="start">
            <v-data-table
              id="scheduledInvoicesTable"
              ref="scheduledInvoicesTable"
              :headers="si_headers"
             density="compact"
              :items="si_items"
              class="elevation-1"
              item-key="item.index"
              dark
              style="margin-left: 20px; margin-right: 20px; width: 100%"
                v-model:sort-by="sortBydueDate"
              no-data-text="No scheduled invoices found."
              :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, 200, -1],
                'show-current-page': true,
                'show-first-last-page': true,
                'items-per-page-text': 'Display records per page: ',
              }"
            >
              <template v-slot:item.dueDate="{ item }">{{
                $filters.mmddyyyy(item.dueDate)
              }}</template>
              <template v-slot:item.scheduledTime="{ item }">{{
              
                 $filters.dateTime(item.scheduledTime)
              }}</template>
              <template v-slot:item.processTime="{ item }"
                >{{ $filters.dateTime(item.processTime) }} CST</template
              >
              <template v-slot:item.view="{ item }">
                <v-icon
                  color="#00558c"
                  style="margin-left: 5px"
                  @click.stop="viewInvoice(item)"
                  >mdi-magnify</v-icon
                >
              </template>

              <template v-slot:item.delete="{ item }">
                <v-icon
                  v-if="
                    hasStepperPermission('processPayment', 'delete') &&
                    !isProcessedItem(item)
                  "
                  color="#00558c"
                  style="margin-left: 5px"
                  @click.stop="deleteInvoice(item)"
                  >mdi-delete
                </v-icon>
                <v-icon
                  v-if="
                    !hasStepperPermission('processPayment', 'delete') ||
                    isProcessedItem(item)
                  "
                  color="#808080"
                  style="margin-left: 5px"
                  >mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-row>
        </span>

        <!-- end completed data table section -->
      </v-col>
    </v-row>
    <v-row
      v-if="
        stepperPage == stepperDefs.invoiceAdjustments ||
        stepperPage == stepperDefs.reviewChanges
      "
      style="margin-bottom: 20px"
    >
      <v-row align-content="center" align="center" justify="center" style="margin-top:10px">
        <span style="color: #00558c">{{ addPolicyNotice }}</span>
      </v-row>
    </v-row>
    <v-row
      v-if="stepperPage == stepperDefs.processPayment"
      style="margin-bottom: 20px; margin-top: 20px;"
    >
      <v-row
        align-content="center"
        align="center"
        justify="center"
        v-if="!isScheduledInvoice"
      >
        <span style="color: #00558c">
          Clicking
          <strong>Submit Payment</strong> will result in a bank draft charged to
          the account shown above.
        </span>
      </v-row>
    </v-row>
    <v-row
      v-if="stepperPage == stepperDefs.complete"
      style="margin-bottom: 20px"
    >
      <v-col>
        <v-card-subtitle v-if="additionalInvoices">
          <v-icon color="#00558c">mdi-alert</v-icon>You have additional unpaid
          invoices. Please click
          <a
            @click="
              stepperPage = 1;
              load();
            "
            >here</a
          >
          to review the next invoice.
        </v-card-subtitle>
      </v-col>
    </v-row>

    <v-row style="margin-top: 40px">
      <v-row align-content="start" align="start">
        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="moveToStep(stepperPage - 1); openAllgroupby();"
          v-if="
            stepperPage != stepperDefs.invoiceAdjustments &&
            stepperPage != stepperDefs.complete
          "
          v-show="
            !hasStepperPermission('invoiceAdjustments', 'update') || isLocked
          "
        >
          <v-icon>mdi-chevron-double-left</v-icon>Previous
        </v-btn>
        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="switchStep(stepperPage - 1);"
          v-if="
            stepperPage != stepperDefs.invoiceAdjustments &&
            stepperPage != stepperDefs.complete
          "
          v-show="
            hasStepperPermission('invoiceAdjustments', 'update') && !isLocked
          "
        >
          <v-icon>mdi-chevron-double-left</v-icon>Previous
        </v-btn>
        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          style="margin-right: 10px;"
          @click.stop="loadScheduledInvoices(); openAllgroupby()"
          v-if="
            (!isLocked ||
              (isLocked == true && hasLock) ||
              lockedBy == 'scheduled') &&
            stepperPage == stepperDefs.invoiceAdjustments &&
            (invoicesScheduled ||
              si_items.length ||
              lockedBy == 'scheduled')
          "
          >Scheduled Invoices</v-btn
        >
      </v-row>

      <v-row
        align-content="end"
        justify="end" style="margin-bottom:30px !important; margin-right:20px !important;"
      >
        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="checkUnlock"
          style="margin-right: 10px"
          v-if="
            isLocked == true &&
            hasLock &&
            stepperPage == stepperDefs.invoiceAdjustments
          "
          v-show="hasStepperPermission('invoiceAdjustments', 'update')"
          >Unlock</v-btn
        >

        <v-btn
          class="menuBtn shrink wrap-button"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="skipToPayment"
          style="margin-right: 10px"
          v-if="
            (!isLocked || (isLocked == true && hasLock)) &&
            showSkip() == true &&
            stepperPage == stepperDefs.invoiceAdjustments
          "
          v-show="
            hasStepperPermission('invoiceAdjustments', 'update') &&
            canProcessPayment
          "
          >Skip To Payment</v-btn
        >

        <v-btn
          class="menuBtn shrink wrap-button"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="checkClear"
          style="margin-right: 10px"
          v-if="
            (!isLocked || hasLock) &&
            stepperPage == stepperDefs.invoiceAdjustments &&
            listItems.length
          "
          v-show="hasStepperPermission('invoiceAdjustments', 'update')"
          >Clear</v-btn
        >

        <v-btn
          class="menuBtn shrink wrap-button"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="saveBtnMethod"
          style="margin-right: 10px"
          v-if="
            (!isLocked || hasLock) &&
            stepperPage == stepperDefs.invoiceAdjustments &&
            listItems.length
          "
          v-show="hasStepperPermission('invoiceAdjustments', 'update')"
          >Save</v-btn
        >
        <v-btn
          class="menuBtn shrink wrap-button"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="saveContinueBtnMethod(stepperPage);openAllgroupby(true);"
          v-if="
            (!isLocked || hasLock) &&
            stepperPage == stepperDefs.invoiceAdjustments &&
            listItems.length
          "
          v-show="hasStepperPermission('invoiceAdjustments', 'update')"
        >
          <span>Save &amp; Continue</span>
          <v-icon>mdi-chevron-double-right</v-icon>
        </v-btn>
        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="saveContinueBtnMethod(stepperPage)"
          v-if="
            (!isLocked || hasLock) &&
            stepperPage == stepperDefs.reviewChanges &&
            listItems.length &&
            reviewItemsMatch == true
          "
          v-show="
            hasStepperPermission('invoiceAdjustments', 'update') &&
            canProcessPayment
          "
        >
          <span>Continue</span>
          <v-icon>mdi-chevron-double-right</v-icon>
        </v-btn>
        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="saveContinueBtnMethod(stepperPage)"
          v-if="
            (!isLocked || hasLock) &&
            stepperPage == stepperDefs.processPayment &&
            listItems.length &&
            !disablePayment
          "
          v-show="hasStepperPermission('processPayment', 'update')"
        >
          <span>Submit Payment</span>
          <v-icon>mdi-chevron-double-right</v-icon>
        </v-btn>

        <v-btn
          class="menuBtn shrink"
          large
          color="grey"
          dark
          v-if="
            stepperPage == stepperDefs.processPayment && disablePayment == true
          "
        >
          <span>Submit Payment</span>
          <v-icon>mdi-chevron-double-right</v-icon>
        </v-btn>

        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="reloadCurrentInvoice"
          style="margin-right: 10px;"
          v-if="
            lockedBy == 'scheduled' &&
            stepperPage == stepperDefs.invoiceAdjustments
          "
          >Reload Current Invoice</v-btn
        >

        <v-btn
          class="menuBtn shrink"
          large
          :color="$store.state.mainColor"
          dark
          @click.stop="moveToStep(stepperPage + 1);"
          v-if="
            stepperPage == stepperDefs.invoiceAdjustments ||
            (stepperPage == stepperDefs.reviewChanges && canProcessPayment)
          "
          v-show="
            !hasStepperPermission('invoiceAdjustments', 'update') ||
            (isLocked && !showSaveAndContinue)
          "
        >
          Continue<v-icon>mdi-chevron-double-right</v-icon>
        </v-btn>
      </v-row>
    </v-row>

    <v-dialog
      v-model="alertToScheduledDialog"
      persistent
      width="500"
      id="alertToScheduledDialog"
    >
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <v-icon color="green" x-large>mdi-information-outline</v-icon>
          <span style="margin-left: 15px">All Invoices Scheduled</span>
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" style="margin-top:2px !important"/>
        </v-row>
        <br />
        <v-card-text class="alerttext">
          All outstanding invoices have been scheduled for payment. Click the
          <strong>Scheduled Invoices</strong> button at the bottom of the screen
          to view or delete previously scheduled invoices.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="alertToScheduledDialog = false"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="pastDueDialog" persistent width="500" id="pastDueDialog">
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <v-icon color="red" x-large>mdi-alert-outline</v-icon>
          <span style="margin-left: 15px">Past Maximum Date</span>
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" style="margin-top:20px !important"/>
        </v-row>
        <br />
        <v-card-text class="alerttext"
          >Invoice Due Date is past the maximum allowed date.</v-card-text
        >
        <v-card-text class="alerttext"
          >Please contact Worksite Customer Service at 1-888-488-0134, select
          option #2.</v-card-text
        >

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="pastDueDialog = false"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="paymentScheduledNextDialog"
      persistent
      width="500"
      id="paymentScheduledNextDialog"
    >
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <span>Review Next Invoice?</span>
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" style="margin-top:20px !important"/>
        </v-row>
        <br />
        <v-card-text class="alerttext"
          >Your payment for invoice due {{ $filters.mmddyyyy(dueDate) }} has been
          scheduled.</v-card-text
        >
        <v-card-text class="alerttext"
          >Would you like to review the next invoice due
          {{  $filters.mmddyyyy(nextInvoiceDueDate) }}?</v-card-text
        >

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="
              paymentScheduledNextDialog = false;
              stepperPage = 1;
              load();
            "
            >Yes</v-btn
          >
          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="
              paymentScheduledNextDialog = false;
              paymentReminderDialog = true;
            "
            >No</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="paymentScheduledDialog"
      persistent
      width="500"
      id="paymentScheduledDialog"
    >
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <span>Payment Scheduled</span>
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" style="margin-top:20px !important" />
        </v-row>
        <br />
        <v-card-text class="alerttext"
          >Your payment for invoice due {{ $filters.mmddyyyy(dueDate) }} has been
          scheduled.</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="paymentScheduledDialog = false"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="paymentReminderDialog"
      persistent
      width="500"
      id="paymentReminderDialog"
    >
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <v-icon :color="$store.state.mainColor" large
            >mdi-information-outline</v-icon
          >
          <span style="margin-left: 20px">Reminder: Invoice Pending</span>
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" style="margin-top:20px !important" />
        </v-row>
        <br />
        <v-card-text class="alerttext">
          Due Date: {{  $filters.mmddyyyy(nextInvoiceDueDate) }}
          <br />
          Delinquent Date: {{ $filters.mmddyyyy(nextInvoiceDelinquentDate) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="paymentReminderDialog = false"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="bankAcctSavedDialog"
      persistent
      width="500"
      id="bankAcctSavedDialog"
    >
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <v-icon :color="$store.state.mainColor" large>mdi-bank</v-icon>
          <span style="margin-left: 20px">Account Information Saved</span>
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%" style="margin-top:20px !important" />
        </v-row>
        <br />
        <v-card-text class="alerttext"
          >Your bank account information has been saved for future
          use.</v-card-text
        >

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="bankAcctSavedDialog = false"
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div
      v-if="
        lockedDialog && lockUser != '' && lockUser != 'scheduled' && !hasLock
      "
    >
      <v-dialog v-model="lockedDialog" persistent width="400" id="lockedDialog">
        <v-card>
          <v-card-title class="headline" color="$store.state.mainColor">
            <v-icon :color="$store.state.mainColor" large>mdi-lock</v-icon
            >&nbsp;Locked For Reconciliation
          </v-card-title>

          <v-row align="center" justify="center">
            <hr width="90%" style="margin-top:20px !important"/>
          </v-row>
          <br />
          <v-card-text class="alerttext"
            >Reconcile and Pay process locked by user '{{
              lockUser
            }}'.</v-card-text
          >

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="lockedDialog = false"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="clearDialog">
      <v-dialog v-model="clearDialog" persistent width="400" id="clearDialog">
        <v-card>
          <v-card-title class="headline alertheadline" color="$store.state.mainColor">
            <v-icon :color="$store.state.mainColor" large>mdi-alert</v-icon
            >&nbsp;Clear Reconciliations
          </v-card-title>

          <v-row align="center" justify="center">
            <hr width="90%" style="margin-top:2px !important" />
          </v-row>

          <v-card-text class="alerttext"
            >Are you sure you want to clear all reconciliations?</v-card-text
          >

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="clearDialog = false"
              >No</v-btn
            >
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="
                clearDialog = false;
                clear();
              "
              >Yes</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="unlockDialog">
      <v-dialog v-model="unlockDialog" persistent width="400" id="unlockDialog">
        <v-card>
          <v-card-title class="headline" color="$store.state.mainColor">
            <v-icon :color="$store.state.mainColor" large>mdi-lock-open</v-icon
            >&nbsp;Unlock
          </v-card-title>

          <v-row align="center" justify="center">
            <hr width="90%" style="margin-top:10px !important;" />
          </v-row>

          <v-card-text class="alerttext"
            >Are you sure you want to unlock this invoice? Any unsaved
            adjustments will be lost.</v-card-text
          >

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="unlockDialog = false"
              >No</v-btn
            >
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="
                unlockDialog = false;
                unLock();
              "
              >Yes</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="!otherDialog">
      <v-dialog v-model="reasonDialog" persistent width="500" id="reasonDialog">
        <v-card>
          <v-card-title class="headline" color="$store.state.mainColor">
            <v-icon :color="$store.state.mainColor" large>{{
              reasonIcon
            }}</v-icon>
            <span style="margin-left: 10px">{{ reasonHeader }}</span>
          </v-card-title>

          <v-row align="center" justify="center">
            <hr width="90%" style="margin-top:10px" />
          </v-row>
          <v-card-text class="alerttext">{{ reasonNotice }}</v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="reasonDialog = false"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="otherDialog">
      <v-dialog v-model="otherDialog" persistent width="450" id="otherDialog">
        <v-card>
          <v-card-title class="headline" color="$store.state.mainColor">
            <v-icon :color="$store.state.mainColor" large
              >mdi-help-rhombus-outline</v-icon
            >
            <span style="margin-left: 10px"> Enter "Other" Reason </span>
          </v-card-title>

          <!-- <v-layout align-center justify-center>
          <hr width="90%" />
          </v-layout>-->

          <!-- <v-card-text>Please enter the reason for the adjustment.</v-card-text> -->

          <v-form ref="otherReasonForm" v-on:submit.prevent="submitOtherReason">
            <v-row justify="center" align-content="center" align="center">
              <v-text-field
                v-model="otherReason"
                :rules="[otherReasonRules.required, otherReasonRules.counter]"
                label="Please enter the reason for the adjustment."
                counter
                solo
                maxlength="240"
                style="margin-right: 10px; margin-left: 10px"
              ></v-text-field>
            </v-row>
            <br />
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="#00558c"
                dark
                class="menuBtn"
                @click="
                  if (clearOnCancel) resetCurrent = true;
                  otherDialog = false;
                  reasonDialog = false;
                "
                >Cancel</v-btn
              >
              <v-btn color="#319B42" dark class="menuBtn" @click="saveReason"
                >Submit</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </div>

    <v-progress-circular
      v-if="waitCircle"
      :class="$vuetify.display.smAndDown ? 'waitCircleSm' : 'waitCircle'"
      indeterminate
      color="#319B42"
      :size="70"
      width="10"
    ></v-progress-circular>
    <v-dialog v-model="pleaseSaveDialog" persistent width="475">
      <v-card>
        <v-card-text>
          <br />
          <v-row>
            <v-col
              >Please save your adjustments and continue to Review
              Changes.</v-col
            >
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn bottomMargin"
            @click="pleaseSaveDialog = false"
            >OK</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="errDialog" persistent width="475">
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
    <v-dialog v-model="reviewErrDialog" persistent width="475">
      <v-card>
        <v-card-text>
          <br />
          <v-row>
            <v-col
              >An error occurred while attempting to save adjustments. Please
              return to the previous invoice adjustments screen to review your
              adjustments and retry. If this error persists, please contact
              Customer Service at 1-888-488-0134.</v-col
            >
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn bottomMargin"
            @click="reviewErrDialog = false"
            >OK</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="viewScheduledInvoiceDialog" persistent width="400">
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <v-icon color="#00558c" x-large>mdi-magnify</v-icon>View the
          reconciled invoice?
        </v-card-title>

        <v-card-text class="alerttext"
          >To make modifications, the scheduled payment must be deleted.
          Continue to invoice view?</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn bottomMargin alertbtn"
            @click="viewScheduledInvoiceDialog = false"
            >No</v-btn
          >
          <v-btn
            color="#319B42"
            dark
            class="menuBtn bottomMargin alertbtn"
            @click="loadScheduledInvoice(); openAllgroupby(false);"
            >Yes</v-btn
          >

          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div v-if="deleteScheduledInvoiceDialog">
      <v-dialog v-model="deleteScheduledInvoiceDialog" persistent width="400">
        <v-card>
          <v-card-title class="headline" color="$store.state.mainColor">
            <v-icon color="#00558c" x-large>mdi-delete</v-icon>Delete Scheduled
            Payment?
          </v-card-title>

          <v-card-text class="alerttext">{{ deleteScheduledPaymnetText }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn bottomMargin alertbtn"
              @click="deleteScheduledInvoiceDialog = false"
              >No</v-btn
            >
            <v-btn
              color="#319B42"
              dark
              class="menuBtn bottomMargin alertbtn"
              @click="
                deleteScheduledInvoice();
                deleteScheduledInvoiceDialog = false;
                openAllgroupby();
              "
              >Yes</v-btn
            >

            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="scheduledInvoicesDialog">
      <v-dialog
        max-width="900"
        v-model="scheduledInvoicesDialog"
        persistent
        id="scheduledInvoicesDialog"
      >
        <v-card>
          <v-app-bar color="#00558C" dark>
            <v-card-title class="headline" color="$store.state.mainColor"
              >Scheduled Invoices</v-card-title
            >
          </v-app-bar>
          <br />
          <v-row align="center" justify="center" align-content="center" style="margin-top:50px !important;">
            <v-data-table
              id="scheduledInvoicesTable"
              ref="scheduledInvoicesTable"
              :headers="si_headers"
              density="compact"
              :items="si_items"
              class="elevation-1"
              item-key="item.index"
              dark
              v-model:sort-by="sortBydueDate"
              
              no-data-text="No scheduled invoices found."
              :footer-props="{
                'items-per-page-options': [10, 25, 50, 100, 200, -1],
                'show-current-page': true,
                'show-first-last-page': true,
                'items-per-page-text': 'Display records per page: ',
              }"
              style="margin-left: 40px; margin-right: 40px"
            >
              <template v-slot:item.dueDate="{ item }">{{
                  $filters.mmddyyyy(item.dueDate)
              }}</template>
              <template v-slot:item.scheduledTime="{ item }">{{
                $filters.dateTime(item.scheduledTime) 
              }}</template>
              <template v-slot:item.processTime="{ item }"
                >{{  $filters.dateTime(item.processTime) }} CST</template
              >
              <template v-slot:item.view="{ item }">
                <v-icon
                  color="#00558c"
                  style="margin-left: 5px"
                  @click.stop="viewInvoice(item)"
                  >mdi-magnify</v-icon
                >
              </template>

              <template v-slot:item.delete="{ item }">
                <v-icon
                  v-if="
                    hasStepperPermission('processPayment', 'delete') &&
                    !isProcessedItem(item)
                  "
                  color="#00558c"
                  style="margin-left: 5px"
                  @click.stop="deleteInvoice(item)"
                  >mdi-delete</v-icon
                >
                <v-icon
                  v-if="
                    !hasStepperPermission('processPayment', 'delete') ||
                    isProcessedItem(item)
                  "
                  color="#808080"
                  style="margin-left: 5px"
                  >mdi-delete</v-icon
                >
              </template>
            </v-data-table>
          </v-row>
          <br />

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#00558c"
              dark
              class="menuBtn alertbtnclose"
              @click="scheduledInvoicesDialog = false"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="displayMainframeChanges">
      <v-dialog
        max-width="900"
        v-model="displayMainframeChanges"
        persistent
        id="displayMainframeChanges"
      >
        <v-card>
          <v-app-bar color="#00558C" dark>
            <v-card-title class="headline" color="$store.state.mainColor">
              <v-icon dark x-large>mdi-refresh</v-icon>
              <span style="margin-left: 20px">Invoice Updates</span>
            </v-card-title>
          </v-app-bar>
          <br />
          <v-card-subtitle
            >If you called us to add/delete/update a policy, it's listed in the
            table below and reflected on your invoice.</v-card-subtitle
          >
          <v-row align="center" justify="center" align-content="center">
            <v-col cols="10">
              <v-data-table
                id="mainframeChangesTable"
                ref="mainframeChangesTable"
                :headers="mfci_headers"
             density="compact"
                :items="mainframeChangeItems"
                class="elevation-1"
                item-key="item.index"
                sort-by="updFromMF"
                :max-height="520"
                dark
                style="margin-left: 20px; margin-right: 20px"
                :footer-props="{
                  'items-per-page-options': [10, 25, 50, 100, 200, -1],
                  'show-current-page': true,
                  'show-first-last-page': true,
                  'items-per-page-text': 'Display records per page: ',
                }"
              >
                <template v-slot:item.dueDate="{ item }">{{
                   $filters.mmddyyyy(item.dueDate)
                }}</template>
                <!-- <template v-slot:item.scheduledTime="{ item }">{{ item.scheduledTime | dateTime}}</template>
              <template v-slot:item.processTime="{ item }">{{ item.processTime | dateTime}}</template>
                -->

                <template v-slot:item.changeCode="{ item }">
                  {{
                    getRequestedChange(
                      item.changeCode,
                      item.section125Indicator == "Yes" ? options125 : options
                    )
                  }}
                  <template
                    v-if="item.changeCode == 'TMP-O' && item.notes != ''"
                  >
                    - &nbsp;
                    {{ item.notes }}
                  </template>
                </template>
                <template v-slot:item.premiumDeducted="{ item }">{{
                    $filters.money(item.premiumDeducted)
                }}</template>
                <template v-slot:item.totalPremium="{ item }">{{
                    $filters.money(item.totalPremium)
                }}</template>
                <template v-slot:item.updFromMF="{ item }">
                  {{
                    item.updFromMF && item.updFromMF.trim() == "DEL"
                      ? "Policy Deleted"
                      : item.updFromMF && item.updFromMF.trim() == "ADD"
                      ? "Policy Added"
                      : item.updFromMF && item.updFromMF.trim() == "UPD"
                      ? "Policy Updated"
                      : item.updFromMF
                  }}
                </template>

                <template v-slot:item.calculatedAdjustmentAmount="{ item }">{{
                    $filters.money(item.calculatedAdjustmentAmount)
                }}</template>
                <template v-slot:item.calculatedPremDue="{ item }">{{
                   $filters.money(item.calculatedPremDue)
                }}</template>
                <template v-slot:item.adjustmentAmount="{ item }">
                  <span>{{ $filters.money(item.adjustmentAmount) }}</span>
                </template>
              </v-data-table>
            </v-col>
          </v-row>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#00558c"
              dark
              class="menuBtn"
              @click="
                displayMainframeChanges = false;
                updateMFFlags();
              "
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="bankAcctDialog">
      <v-dialog
        v-model="bankAcctDialog"
        persistent
        width="500"
        id="bankAcctDialog"
        style="height:550px !important"
      >
        <v-card>
          <v-card-title class="headline" color="$store.state.mainColor">
            <v-icon :color="$store.state.mainColor" large
              >mdi-lead-pencil</v-icon
            >
            <span style="margin-left: 10px" v-if="$vuetify.display.mdAndUp"
              >Edit Bank Account Information</span
            >
            <span style="margin-left: 10px" v-else>Edit Bank Account Info</span>
          </v-card-title>

          <v-row align="center" justify="center">
            <hr width="90%" style="margin-top:2px !important" />
          </v-row>
          <v-card-text>
            <br />
            <br />
            <v-form ref="bankAccntForm" v-on:submit.prevent="FormsubmitBankAcctChanges">
              <v-row style="margin-left:2px; margin-right:2px">
                <v-text-field color="primary" 
                  v-model="dialogRoutingNumber"
                  :rules="routingNumberRules"
                  label="*Routing Number"
                  maxlength="9" 
                 variant ="outlined"
                  autocomplete="dialog-routing-number"
                  density="compact"
                  dense
                  @keyup="getBankName('keyup')"
                  @blur="getBankName('blur')"
                ></v-text-field>
              </br>
              </v-row>
              <v-row>
                <div class="banknametext" v-if="dialogBankName">
                  {{ dialogBankName }}
                </div>
              </v-row>
              <v-row style="margin-top:20px !important;margin-left:2px; margin-right:2px">
                <v-text-field color="primary" 
                @click.right.prevent @paste.prevent                
                  v-model="dialogVerifyRoutingNumber"
                  :rules="confirmRoutingNumberRules"
                  label="*Verify Routing Number"
                  ref="confirmRoutingNumber"
                  variant="outlined"
                  density="compact"
                  dense
                  maxlength="9" 
                ></v-text-field>
          </v-row>
          <v-row style="margin-top:20px !important;margin-left:2px; margin-right:2px">
                <v-text-field color="primary" 
                  v-model="dialogBankAccount"
                  maxlength="20" 
                  id="dialogBankAccount"
                  ref="dialogBankAccount"
                  :rules="bankAccountRules"
                  label="*Checking Account Number"
                  variant="outlined"
                  density="compact"
                  dense
                  autocomplete="no_autocomplete"
                ></v-text-field>
        </v-row>
        <v-row style="margin-top:20px !important;margin-left:2px; margin-right:2px">
                <v-text-field color="primary" 
                  @click.right.prevent @paste.prevent                
                  v-model="dialogVerifyBankAccount"
                  id="dialogVerifyBankAccount"
                  :rules="verifyBankAccountRules"
                  label="*Verify Checking Account Number"
                  variant="outlined"
                  density="compact"
                  dense
                  autocomplete="no_autocomplete"
                  maxlength="20" 
                ></v-text-field>
             </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-switch
              style="margin-left: 20px;color:rgba(0,0,0,.6)!important"
              v-model="saveAcct"
              label="Save For Future Use"
            ></v-switch>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="
                bankAcctDialog = false;
                dialogVerifyBankAccount = '';
                dialogBankAccount = '';
                dialogRoutingNumber = routingNumber;
                dialogBankName = bankName;
                bankNotFound = false;
                dialogAcctType = 'C';
                saveAcct = false;
              "
              >Cancel</v-btn
            >
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="submitBankAcctChanges()"
              >Submit</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div v-if="stepperPage == stepperDefs.invoiceAdjustments">
      <v-dialog v-model="savedDialog" persistent width="400" id="savedDialog">
        <v-card>
          <v-card-title class="headline alertheadline" color="$store.state.mainColor">
            <v-icon :color="$store.state.mainColor" large>mdi-check-bold</v-icon
            >&nbsp;Saved
          </v-card-title>

          <v-row align="center" justify="center">
            <hr width="90%" style="margin-left:2px !important" />
          </v-row>

          <v-card-text class="alerttext"
            >Your reconciliation updates have been saved.</v-card-text
          >

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="#319B42"
              dark
              class="menuBtn alertbtn"
              @click="savedDialog = false"
              >OK</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-dialog
      v-model="savedContinueDialog"
      persistent
      width="400"
      id="savedContinueDialog"
    >
      <v-card>
        <v-card-title class="headline" color="$store.state.mainColor">
          <v-icon :color="$store.state.mainColor" large>mdi-check-bold</v-icon
          >&nbsp;Saved
        </v-card-title>

        <v-row align="center" justify="center">
          <hr width="90%"  style="margin-top:20px !important"/>
        </v-row>

        <v-card-text class="alerttext">Your reconciliation updates have been saved.</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#319B42"
            dark
            class="menuBtn alertbtn"
            @click="
              savedContinueDialog = false;
              switchStep(stepperPage + 1);
            "
            >OK</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-col>
</template>
<script setup>
import { onMounted, ref , nextTick} from 'vue';


  const groupHeaders = ref({})
  const reviewgroupHeaders = ref({})
  const groupedItems = [];
  const groupRefs = [];
   let showitemsPerPage = 10;
   let isgroupshow = false;
   let isreviewdatatable = false;
 onMounted(() => {
  openAllgroupby(false);
});

 const openAllgroupby = (isreviewdatatable) => {
  setTimeout(() => {
    //console.log("groupHeaders.value" + groupHeaders.value);
    if(!isreviewdatatable){
 Object.values(groupHeaders.value).forEach(header => {
  header.toggleGroup(header.item);
  })
 }
  if(isreviewdatatable || reviewgroupHeaders.value != null)
 {
  //console.log("reviewgroupHeaders.value" + reviewgroupHeaders.value);
 Object.values(reviewgroupHeaders.value).forEach(header => {
  header.toggleGroup(header.item);
  })
 }


 
  }, 1000)
  //showitemsPerPage =10;
 }
const loadItems = async ({ page, itemsPerPage, sortBy }) => {
  openAllgroupby(false);
};
</script>
<script>
import emitter from "@/event-bus.js";

import sideBar from "@/components/SideBar/SideBar.vue";
import reconcileStepper from "@/components/Reconcile/ReconcileStepper.vue";
import Log from "@/log.js";
import permissions from "@/permissions.js";

import { HTTP } from "@/HTTP-common.js";
import { HTTP_Account } from "@/HTTP-common.js";

 import Treeselect from "@zanmato/vue3-treeselect";
  import '@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css';
import dataService from "@/services/dataService";

const currentPage = ref(1);
const bankAccntForm = ref();
 const groupHeaders = ref({})
 let isgroupedbyempid = false;

export default {
  name: "ReconcilePage",
  components: {
    reconcileStepper,
    sideBar,
    Treeselect,
  },
  mixins: [permissions],
  props: {
    mainColor: {
      type: String,
      required: false,
    },
    FranchiseId: {
      type: String,
      required: false,
    },
  },
  created() {
    this.searchBy = "Policy Number";
    this.setupPermissionView();
    this.load();
  },

  mounted() {
    emitter.on(
      "updateStep",
      function (newStep) {
        this.switchStep(newStep, true);
      }.bind(this)
    );

    HTTP_Account.get("Payment/GetPaymentInfo", {
      params: {
        franchiseId: this.$store.state.currentFranchise.franchiseNumber,
      },
      //withCredentials: true,
    })
      .then((response) => {
        if (response.status != 200) {
          this.errDialog = true;
          Log.logError(
            JSON.stringify(response),
            "ReconcileWizard.vue mounted Payment/GetPaymentInfo non-200 response"
          );
        } else {
          try {
            if (
              response &&
              response.data &&
              response.data.paymentDetails &&
              response.data.paymentDetails.length > 0
            ) {
              this.depositCheck = false;
              let acct = response.data.paymentDetails[0].accountNumber;
              this.fullAcctNum = acct;
              this.originalFullAcctNum = acct;

              this.routingNumber =
                response.data.paymentDetails[0].routingNumber;
              this.dialogRoutingNumber = this.routingNumber;
              this.originalRoutingNumber = this.routingNumber;
              this.acctType = response.data.paymentDetails[0].accountType;
              //this.dialogAcctType = this.acctType;    //all production account has "Checking"
              this.dialogAcctType = "C";
              this.originalAcctType = this.acctType;

              if (acct.length >= 4)
                this.bankAccount =
                  acct.substring(0, acct.length - 4).replace(/\d/g, "•") +
                  acct.substring(acct.length - 4);
              else this.bankAccount = acct.replace(/\d/g, "•");

              if (this.routingNumber && this.routingNumber != "") {
                HTTP_Account.get("Payment/GetRoutingPaymentInfo", {
                  params: {
                    routingNumber: this.routingNumber,
                  },
                  //withCredentials: true,
                })
                  .then((response) => {
                    if (response.status != 200) {
                      this.errDialog = true;
                      Log.logError(
                        JSON.stringify(response),
                        "ReconcileWizard.vue mounted Payment/GetPaymentInfo non-200 response"
                      );
                    } else {
                      if (
                        response.data &&
                        response.data.routingDetails &&
                        response.data.routingDetails.length
                      ) {
                        this.bankName =
                          response.data.routingDetails[0].bankName;
                        this.dialogBankName = this.bankName;
                        this.originalBankName = this.bankName;
                        this.bankNotFound = false;
                      } else {
                        this.bankName = "BANK NOT FOUND";
                        this.dialogBankName = this.bankName;
                        this.originalBankName = this.bankName;
                        this.bankNotFound = true;
                      }
                    }
                  })
                  .catch((e) => {
                    Log.logError(
                      e,
                      "ReconcileWizard mounted Payment/GetRoutingPaymentInfo"
                    );
                  });
              }

              //   this.verifyBankAccount = response.data.bankDetails[0].accountNumber;
              //   this.accountType = response.data.bankDetails[0].accountType;
            }
          } catch (e) {
            Log.logError(
              e,
              "ReconcileWizard.vue mounted Payment/GetPaymentInfo response"
            );
          }
        }
      })
      .catch((e) => {
        Log.logError(e, "ReconcileWizard.vue mounted Payment/GetPaymentInfo");
      });
  },
  // beforeRouteLeave(to, from, next) {
  //   const response = confirm(" are you sure you want to leave?");
  //   next(response);
  // },
  beforeDestroy() {
    emitter.off("updateStep");
  },
  watch: {
    depositCheck() {
      if (this.depositCheck == true) {
        this.routingNumberBasicRules = [];
        this.bankAccountBasicRules = [];
      } else {
        this.routingNumberBasicRules = [
          (v) =>
            !!v ||
            this.depositCheckComputed == true ||
            "Routing Number is required.",
        ];
        this.bankAccountBasicRules = [
          (v) =>
            !!v ||
            this.depositCheckComputed == true ||
            "Bank Account Number is required.",
        ];
      }
    },
    listItems() {
      document.getElementById("recStepper").scrollIntoView();
      // window.scrollTo(0, 0);
    },
    resetCurrent() {
      if (this.resetCurrent == true && this.currentItem) {
        for (let idx = 0; idx < this.listItems.length; idx++) {
          if (
            this.currentItem.name == this.listItems[idx].name &&
            this.currentItem.policyNumber == this.listItems[idx].policyNumber
          ) {
            this.listItems[idx].requestedChange = null;
            this.updateListItem(this.currentItem);
          }
        }

        this.resetCurrent = false;
      }
    },
    stepperPage() {
      window.scrollTo(0, 0);
      if (this.stepperPage == this.stepperDefs.complete) {
        this.finalPayment = "";
      }
      if (this.stepperPage == this.stepperDefs.invoiceAdjustments) {
        this.disablePayment = false;
      }
      if (this.stepperPage == this.stepperDefs.reviewChanges) {
        this.reviewItemsMatch = false;
        this.callGetInvoiceDetails(1);
      }
    },
  },
  data() {
    return {
      pleaseSaveDialog: false,
      reviewErrDialog: false,
      reviewItems: [],
      reviewItemsMatch: false,
      lockCallInProgress: false,
      alertToScheduledDialog: false,
      pastDueDialog: false,
      pastDue: false,
      disablePayment: false,
      dueDate: null,
      nextInvoice: null,
      nextInvoiceDueDate: null,
      nextInvoiceDelinquentDate: null,
      paymentScheduledDialog: false,
      paymentScheduledNextDialog: false,
      paymentReminderDialog: false,
      bankAcctSavedDialog: false,
      groupCriteria:  [{ key :'name' , order : 'asc'}],
      displayMainframeChanges: false,
      savedDialog: false,
      savedContinueDialog: false,
      acctType: "",
      dialogAcctType: "C",
      saveAcct: false,
      fullAcctNum: "",
      bankName: "",
      bankNotFound: false,
      dialogBankName: "",
      originalBankName: "",
      originalFullAcctNum: "",
      originalRoutingNumber: "",
      originalAcctType: "",
      bankAcctDialog: false,
      depositCheck: false,
      routingNumber: "",
      dialogRoutingNumber: "",
      dialogVerifyRoutingNumber: "",      
      dialogBankAccount: "",
      dialogVerifyBankAccount: "",
      routingNumberBasicRules: [
        (v) =>
          !!v ||
          this.depositCheckComputed == true ||
          "Routing Number is required.",
      ],
      routingNumberRules: [
        (v) => !!v || "Routing Number is required",
        (v) => v.length == 9 || "Routing Number is invalid",
        (v) => /\d{9}/.test(v) || "Routing Number is invalid",
        () => !this.bankNotFound || "Bank not found, enter valid Routing Number",
      ],
      confirmRoutingNumberRules: [
        (v) => !!v || "Verify Routing Number is required",
        (v) =>
          v == this.dialogRoutingNumber || "The Verify Routing Number must match the Routing Number.",
      ],
      bankAccount: "",
      acctRegex: /^\d+$/,
      bankAccountRules: [
        (v) => !!v || "Bank Account Number is required.",
        (v) =>
          (!!v && this.acctRegex.test(v)) ||
          "Bank Account Number must be numeric.",
        (v) =>
          v.length > 4 || "Account Number must be longer than 4 characters",
        (v) => /^(?=.*\d)(?=.*[1-9]).{1,20}$/.test(v) || "Account Number cannot be all zeros"
      ],
      bankAccountBasicRules: [
        (v) =>
          !!v ||
          this.depositCheckComputed == true ||
          "Bank Account Number is required.",
      ],
      accountType: "",
      finalPayment: "",
      finalPaymentRegExOne: /^\d+$/,
      finalPaymentRegEx: /^\d+\.\d{2}$/,
      finalPaymentCommaCheck: /.*,.*/,
      finalPaymentRules: [
        (v) => !!v || "Payment Amount is required.",
        (v) =>
          (!!v && !this.finalPaymentCommaCheck.test(v)) ||
          "Please enter the amount without commas.",
        (v) =>
          (!!v && this.finalPaymentRegEx.test(v)) ||
          "Please enter a valid amount with cents.",
        (v) =>
          (!!v &&
            this.$filters.money(v) ==
              this.$filters.money(this.adjustedTotal)) ||
          "Payment Amount must equal Adjusted Total.",
      ],
      verifyRoutingNumberRules: [
        (v) => !!v || "Verify Routing Number is required.",
        (v) =>
          (!!v && v == this.dialogRoutingNumber) ||
          "The Verify Routing Number must match the Routing Number.",
      ],
      verifyBankAccountRules: [
        (v) => !!v || "Verify Bank Account Number is required.",
        (v) =>
          (!!v && this.acctRegex.test(v)) ||
          "Bank Account Number must be numeric.",
        (v) =>
          (!!v && v == this.dialogBankAccount) ||
          "The Verify Bank Account Number must match the Bank Account Number.",
      ],

      invoiceToLoad: null,
      invoiceToDelete: null,
      viewScheduledInvoiceDialog: false,
      deleteScheduledInvoiceDialog: false,
      scheduledInvoicesDialog: false,
      isScheduledInvoice: false,
      scheduledInvoiceDueDate: null,
      invoicesScheduled: false,
      waitCircle: false,
      errDialog: false,
      skipUsed: false,
      otherReasonRules: {
        required: (value) => !!value || "Please enter a reason.",
        counter: (value) =>
          (value.trim().length >= 15 && value.length <= 240) ||
          "Please enter 15-240 characters.",
      },
      currentItem: null,
      resetCurrent: false,
      reasonNotice: "",
      reasonHeader: "",
      otherReason: "",
      reasonIcon: "",
      reasonDialog: false,
      otherDialog: false,
      clearOnCancel: true,
      addPolicyNotice:
        "To add a policy to the bill, please contact Worksite Customer Service at 1-888-488-0134, select Option #2.",
      locked: false,
      lockUser: "",
      lockedBy: "",
      lockStartTime: "",
      lockedDialog: false,
      clearDialog: false,
      unlockDialog: false,
      totalAdjusted: 0.0,
      valid: false,
      sortBy: [],
      descending: false,
      page: 1,
      searchFilter: undefined,
      searchByFilter: undefined,
      searchClicked: false,
      sortNameAsc: true,
      stepperDefs: {
        invoiceAdjustments: 1,
        reviewChanges: 2,
        processPayment: 3,
        complete: 4,
      },
      stepperPage: 1,
      stepperPagePermissions: null,
      maxPageViewed: 1,
      search: "",
      itemsPerPage: 10,
      selected: [],
      searchBy: "",
      searching: false,
      billingChangeRules: [(v) => !!v || "Select"],
      adjustmentAmtRules: [
        (value) => {
          const pattern = /^(\d{1,3}(,\d{3})*|(\d+))(\.\d{2})?$/;
          return (
            !value || pattern.test(value) || "Please enter a valid amount."
          );
        },
      ],
      searchRules: [
        (v) => !!v || !this.searchClicked || "Please enter a search term.",
      ],
      searchByRules: [
        (v) => !!v || !this.searchClicked || "Please select a search field.",
      ],

      searchByItems: ["Policy Number", "Employee ID", "Name"],
      sortBydueDate  : [{ key: 'dueDate', order: 'asc' }], 
      si_items: [],
      si_headers: [
        { title: "Account Number", key: "franchiseId", sortable: false },
        { title: "Invoice ID", key: "invoiceId", sortable: false },
        { title: "Due Date", key: "dueDate", sortable: false },
        { title: "Scheduled Time", key: "scheduledTime", sortable: false },
        { title: "Process Time", key: "processTime", sortable: false },
        { title: "View", key: "view", sortable: false },
        { title: "Delete", key: "delete", sortable: false },
      ],

      mfci_headers: [
        {
          title: "External Change",
          key: "updFromMF",
          sortable: false,
        },
        { title: "Policy Number", key: "policyNumber", sortable: false },
        { title: "Policy Type", key: "policyType", sortable: false },
        {
          title: "Policy Description",
          key: "policyShortDescription",
          sortable: false,
        },
        //{ text: "Employee ID", value: "employeeId", sortable: false },
        { title: "Name", key: "name", sortable: false },
        { title: "Insured Name", key: "insuredName", sortable: false },
        { title: "Policy Due Date", key: "dueDate", sortable: false },
        {
          title: "Premium Deducted Per Pay Period",
          key: "premiumDeducted",
          sortable: false,
        },
        { title: "Total Premium Due", key: "totalPremium", sortable: false },
        {
          title: "Section 125",
          key: "section125Indicator",
          sortable: false,
        },
        {
          title: "Premium Adjustment Reason",
          key: "changeCode",
          sortable: false,
        },
        {
          title: "Adjusted Premium Amount",
          key: "adjustmentAmount",

          sortable: false,
        },
        // {
        //   text: "Premium Adjustment Amount",
        //   value: "calculatedAdjustmentAmount",
        //   sortable: false
        // },
        // {
        //   text: "Final Premium Amount Due",
        //   value: "calculatedPremDue",
        //   sortable: false
        // }
      ],

      headers: [
        { title: "Policy Number", key: "policyNumber", sortable: true },
        { title: "Policy Type", key: "policyType", sortable: true },
        {
          title: "Policy Description",
          key: "policyShortDescription",
          sortable: false,
        },
        { title: "Employee ID", key: "employeeId", sortable: false },
         { 
   title: "", key: "data-table-group", align: ' d-none' 
  },
        //  { title: "Name", key: "data-table-group", sortable: true },
         { title: "Name", key: "employeeName", sortable: false },
        { title: "Insured Name", key: "insuredName", sortable: true },
        { title: "Policy Due Date", key: "dueDate", sortable: true },
        {
          title: "Premium Deducted Per Pay Period",
          key: "premiumDeducted",
          sortable: false,
        },
        { title: "Total Premium Due", key: "totalPremium", sortable: false },
        {
          title: "Section 125",
          key: "section125Indicator",
          sortable: false,
        },
        {
          title: "Premium Adjustment Reason",
          key: "requestedChange",
          sortable: false,
        },
        {
          title: "Adjusted Premium Amount",
          key: "adjustmentAmount",
          sortable: false,
        },
        {
          title: "Premium Adjustment Amount",
          key: "calculatedAdjustmentAmount",
          sortable: false,
        },
        {
          title: "Final Premium Amount Due",
          key: "calculatedPremDue",
          sortable: false,
        },
      ],


 
      headersAlt: [
        { title: "Policy Number", key: "policyNumber", sortable: true },
        { title: "Policy Type", key: "policyType", sortable: true },
        {
          title: "Policy Description",
          key: "policyShortDescription",
          sortable: false,
        },
        { title: "Employee ID", key: "employeeId", sortable: false },
        { 
   title: "", key: "data-table-group", align: ' d-none' 
  },
        { title: "Name", key: "employeeName", sortable: false },
        { title: "Insured Name", key: "insuredName", sortable: true },
        { title: "Policy Due Date", key: "dueDate", sortable: true },
        {
          title: "Premium Deducted Per Pay Period",
          key: "premiumDeducted",
          sortable: false,
        },
        { title: "Total Premium Due", key: "totalPremium", sortable: false },
        {
          title: "Section 125",
          key: "section125Indicator",
          sortable: false,
        },
        {
          title: "Premium Adjustment Reason",
          key: "requestedChange",
          sortable: false,
        },
        {
          title: "Adjusted Premium Amount",
          key: "adjustmentAmount",

          sortable: false,
        },
        {
          title: "Premium Adjustment Amount",
          key: "calculatedAdjustmentAmount",
          sortable: false,
        },
        {
          title: "Final Premium Amount Due",
          key: "calculatedPremDue",
          sortable: false,
        },
      ],
      listItems: [],
      mainframeChangeItems: [],
      originals: [],

      options: [
        {
          id: "R",
          label: "Retired",
        },
        {
          id: "T",
          label: "Employee Terminated",
        },
        {
          id: "D",
          label: "Deceased",
        },
        {
          id: "E",
          label: "Never Our Employee",
        },
        {
          id: "CSW",
          label: "Cancel, Still Working",
        },
        {
          id: "COE",
          label: "Cancel - Open Enrollment",
        },
        {
          id: "TMP",
          label: "Temporary",
          children: [
            {
              id: "TMP-L",
              label: "Leave of Absence",
            },
            {
              id: "TMP-N",
              label: "No Paycheck",
            },
            {
              id: "TMP-M",
              label: "Missed Deduction",
            },
            {
              id: "TMP-O",
              label: "Other",
            },
          ],
        },
      ],
      options125: [
        {
          id: "R",
          label: "Retired",
        },
        {
          id: "T",
          label: "Employee Terminated",
        },
        {
          id: "D",
          label: "Deceased",
        },
        {
          id: "E",
          label: "Never Our Employee",
        },
        {
          id: "COE",
          label: "Cancel - Open Enrollment",
        },
        {
          id: "CSW",
          label: "Cancel, Still Working",
          children: [
            {
              id: "CSW-M",
              label: "Marriage",
            },
            {
              id: "CSW-DIV",
              label: "Divorce, legal separation, or annulment of marriage",
            },

            {
              id: "CSW-DTH",
              label: "Death of spouse or dependent",
            },

            {
              id: "CSW-BTH",
              label: "Birth or adoption or placement for adoption of a child ",
            },

            {
              id: "CSW-ESTS",
              label: "Change in employee’s employment status",
              children: [
                {
                  id: "CSW-ESTS-RH",
                  label: "recently hired",
                },
                {
                  id: "CSW-ESTS-RT",
                  label: "recently terminated",
                },
                {
                  id: "CSW-ESTS-BULA",
                  label: "begins unpaid leave of absence",
                },
                {
                  id: "CSW-ESTS-EULA",
                  label: "ends unpaid leave of absence",
                },
                {
                  id: "CSW-ESTS-PS",
                  label: "participates in a strike",
                },
                {
                  id: "CSW-ESTS-PL",
                  label: "participates in a lockout",
                },
                {
                  id: "CSW-ESTS-SDELG",
                  label:
                    "causing change in the employee’s eligibility for employer-provided coverage (e.g., goes from part-time to full-time or from hourly to salaried)",
                },
              ],
            },

            {
              id: "CSW-SSTS",
              label: "Change in spouse’s employment status",
              children: [
                {
                  id: "CSW-SSTS-RH",
                  label: "recently hired",
                },
                {
                  id: "CSW-SSTS-RT",
                  label: "recently terminated",
                },
                {
                  id: "CSW-SSTS-BULA",
                  label: "begins unpaid leave of absence",
                },
                {
                  id: "CSW-SSTS-EULA",
                  label: "ends unpaid leave of absence",
                },
                {
                  id: "CSW-SSTS-PS",
                  label: "participates in a strike",
                },
                {
                  id: "CSW-SSTS-PL",
                  label: "participates in a lockout",
                },
                {
                  id: "CSW-SSTS-SDELG",
                  label:
                    "causing change in the spouse’s eligibility for employer-provided coverage (e.g., goes from part-time to full-time or from hourly to salaried)",
                },
              ],
            },

            {
              id: "CSW-DSTS",
              label: "Change in dependent’s employment status",
              children: [
                {
                  id: "CSW-DSTS-RH",
                  label: "recently hired",
                },
                {
                  id: "CSW-DSTS-RT",
                  label: "recently terminated",
                },
                {
                  id: "CSW-DSTS-BULA",
                  label: "begins unpaid leave of absence",
                },
                {
                  id: "CSW-DSTS-EULA",
                  label: "ends unpaid leave of absence",
                },
                {
                  id: "CSW-DSTS-PS",
                  label: "participates in a strike",
                },
                {
                  id: "CSW-DSTS-PL",
                  label: "participates in a lockout",
                },
                {
                  id: "CSW-DSTS-SDELG",
                  label:
                    "causing change in the dependent’s eligibility for employer-provided coverage (e.g., goes from part-time to full-time or from hourly to salaried)",
                },
              ],
            },

            {
              id: "CSW-DELG",
              label:
                "Dependent is no longer eligible for coverage because of age, student status, or similar change ",
            },
            {
              id: "CSW-CRT",
              label:
                "Court order connected to a domestic relations case (e.g., a divorce or custody change) requiring coverage for a dependent child under your plan or another person’s plan, and the child is actually enrolled in your plan or the other plan as a result of the order ",
            },
            {
              id: "CSW-MEDC",
              label:
                "Employee / spouse / dependent becomes entitled to coverage under Medicare or Medicaid, or loses coverage under Medicare or Medicaid, and increases or decreases the premium paid under employee’s health plan",
            },
            {
              id: "CSW-CFE",
              label:
                "Spouse or dependent, if employed, makes a change in coverage under his or her cafeteria plan and employee makes a corresponding change under this plan that is on account of the change under spouse’s or dependent’s cafeteria plan ",
            },
            {
              id: "CSW-FMLA",
              label:
                "Employee revokes existing group health coverage while on leave under the Family and Medical Leave Act of 1993 (FMLA)",
            },
          ],
        },
        {
          id: "TMP",
          label: "Temporary",
          children: [
            {
              id: "TMP-L",
              label: "Leave of Absence",
            },
            {
              id: "TMP-N",
              label: "No Paycheck",
            },
            {
              id: "TMP-M",
              label: "Missed Deduction",
            },
          ],
        },
      ],
    };
  },
  computed: {
    validBank() { 
      return this.bankName != '' && this.bankName != 'BANK NOT FOUND' && !this.bankNotFound;
    },
    
    adjustedItems() {
      try {
        let baseList = this.reviewItems;

        return baseList.filter((b) => {
          return b.adjustmentAmount || b.requestedChange;
        });
      } catch (e) {
        Log.logError(e, "ReconcileWizard.vue adjustedItems");
        return this.listItems;
      }
    },
    
    canProcessPayment() {
      let result = this.hasStepperPermission("processPayment", "read");
      
      return result;
    },
    showSaveAndContinue() {
      let rendered =
        (!this.isLocked || this.hasLock) &&
        this.stepperPage != this.stepperDefs.complete &&
        this.listItems.length;
      let showed = this.hasStepperPermission("invoiceAdjustments", "update");
 
      return rendered && showed;
    },
    depositCheckComputed() {
      return this.depositCheck;
    },
    additionalInvoices() {
      if (this.nextInvoice != null && this.nextInvoiceDueDate != null)
        return true;

      return false;
    },
    hasEmployeeIds() {
      for (let item of this.listItems) {
        if (item.empId && item.empId != "") {
          return true;
        }
      }

      return false;
    },
    unsavedChanges() {
      for (let listItem of this.listItems) {
        // if (listItem.adjustmentAmount || listItem.requestedChange) {
        let orig = this.originals.find(
          (o) => o.policyNumber == listItem.policyNumber
        );

        if (orig) {
          if (
            listItem.adjustmentAmount != orig.adjustmentAmount ||
            listItem.requestedChange != orig.requestedChange
          ) {
            emitter.emit("unsavedChanges", true);
            return true;
          }
        }
        // }
      }
      emitter.emit("unsavedChanges", false);
      return false;
    },
    isHomeOfficeUser() {
      let type = window.sessionStorage.getItem("type");

      if (type == "homeoffice") return true;

      return false;
    },
    isLocked() {
      return this.locked;
    },
    hasLock() {
      let lockedByLower = "";
      let sessionUser = "";
      let sessionUserLower = "";

      lockedByLower = this.lockedBy
        ? this.lockedBy.trim().toLowerCase()
        : this.lockedBy;
      sessionUser = window.sessionStorage.getItem("user");
      sessionUserLower = sessionUser
        ? sessionUser.trim().toLowerCase()
        : sessionUser;

      return lockedByLower == sessionUserLower;
      // return this.lockedBy == window.sessionStorage.getItem("user");
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
      let ret = [];

      let maxPages = this.maxPages;

      for (let i = 1; i <= maxPages; i++) {
        ret.push(i);
      }

      return ret;
    },

    filteredItems() {
      try {
        let baseList = this.listItems;

        try {
          return baseList.filter((i) => {
            return (
              !this.searchFilter ||
              !this.searchByFilter ||
              (this.searchByFilter === "Policy Number" &&
                (i.policyNumber ? i.policyNumber : "")
                  .toLowerCase()
                  .indexOf(this.searchFilter.toLowerCase()) >= 0) ||
              (this.searchByFilter === "Name" &&
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
          Log.logError(e, "ReconcileWizard.vue filteredItems (inner catch)");
          return baseList;
        }
      } catch (e) {
        Log.logError(e, "ReconcileWizard.vue filteredItems (outer catch)");
        return this.listItems;
      }
    },

    invoicePolicies() {
      return this.$store.state.invoicePolicies;
    },
    amountBilled() {
      let amt = 0.0;

      for (let item of this.listItems) {
        if (item.totalPremium)
          amt += parseFloat(
            item.totalPremium.replace("$", "").replace(",", "")
          );
      }

      return amt.toFixed(2);
    },
    adjustments() {
      let amt = 0.0;
      amt = this.adjustedTotal - this.amountBilled;
      return amt.toFixed(2);
    },
    adjustedTotal() {
      return this.totalAdjusted;
    },
    deleteScheduledPaymnetText() {
      let currentFranchise = this.$store.state.currentFranchise;
      if (currentFranchise.billingCycle.toUpperCase() == "MONTHLY") {
        return `Deleting this payment will also delete scheduled payments for subsequent invoices and reset the invoices for Reconcile & Pay processing. Are you sure you want to continue?`;
      }
      return `Deleting this payment will reset the invoice for Reconcile & Pay processing.  Are you sure you want to continue?`;
    },
  },
  methods: {
   
     callGetInvoiceDetails(firstCall) {
      this.searching = true;
      this.waitCircle = true;
      this.reviewItems = [];

      HTTP.get("ReconcilePay/GetInvoiceDetails", {
        params: {
          franchiseId: this.$store.state.currentFranchise.franchiseNumber,
        },
        //withCredentials: true,
      })
        .then((response) => {
          // console.log(response);
      

          if (
            response.status != 200 ||
            (response.data && response.data.statusCode != 200)
          ) {
            if (
              response.data.errorMessage &&
              response.data.errorMessage.toLowerCase().startsWith("no records")
            ) {
              this.searching = false;
              this.waitCircle = false;
              this.reviewItems = [];
            } else {
              Log.logError(
                response.statusText,
                "ReconcileWizard.vue load ReconcilePay/GetInvoiceDetails response"
              );
              this.errDialog = true;
              this.searching = false;
              this.waitCircle = false;

              this.reviewItems = [];
            }
          } else {
            if (this.hasStepperPermission("invoiceAdjustments", "update")) {
              this.originals = [];

              for (let original of response.data.invoiceDetails) {
                let newItem = JSON.parse(JSON.stringify(original));

                newItem.adjustmentAmount =
                  newItem.adjustmentAmount == null
                    ? undefined
                    : newItem.adjustmentAmount;

                newItem.adjustmentAmount =
                  newItem.adjustmentAmount == 0 &&
                  (!newItem.changeCode || newItem.changeCode == "")
                    ? undefined
                    : newItem.adjustmentAmount;

                newItem.requestedChange =
                  newItem.changeCode == "" || newItem.changeCode == null
                    ? undefined
                    : newItem.changeCode;

                this.originals.push(newItem);
              }
            }

            let items = [];

            let invoiceDetailsCopy = JSON.parse(
              JSON.stringify(response.data.invoiceDetails)
            );

            for (let item of invoiceDetailsCopy) {
              item.adjustmentAmount =
                item.adjustmentAmount == null
                  ? undefined
                  : item.adjustmentAmount;

              item.section125Indicator =
                item.isSection125 == 1 &&
                item.cafeQualifiedindicator.toUpperCase() == "Y"
                  ? "Yes"
                  : "";

              if (item.employeeId == "0") item.employeeId = "";
              if (item.policyType) item.policyType = item.policyType.trim();

              if (item.markedDelete == true) {
                //continue;
              }

              if (item.updFromMF && item.updFromMF.trim() == "DEL") {
                continue;
              }

              // ----
               item.dueDate = this.$filters.mdyyyy(item.dueDate);
              item.premiumDeducted = this.$filters.money(
                item.premiumDeducted
              );
              item.totalPremium = this.$filters.money(
                item.totalPremium
              );
             
              item.empId = item.employeeId;
              item.employeeName = item.name;
              item.requestedChange =
                item.changeCode == "" || item.changeCode == null
                  ? undefined
                  : item.changeCode;
              if (["C", "F", "L", "M"].indexOf(item.requestedChange) >= 0)
                item.requestedChange = undefined;
              item.otherReason = item.notes;

              if (item.adjustmentAmount == 0.0 && !item.requestedChange)
                item.adjustmentAmount = undefined;

              item.calculatedAdjustmentAmount =
                item.adjustmentAmount != undefined &&
                item.adjustmentAmount != null &&
                !isNaN(item.adjustmentAmount)
                  ? item.adjustmentAmount -
                    parseFloat(
                      item.totalPremium.replace("$", "").replace(",", "")
                    )
                  : // : item.requestedChange && item.requestedChange != ""
                    // ? parseFloat(item.totalPremium.replace("$", "").replace(",", "")) *
                    //   -1
                    0.0;

              if (
                item.adjustmentAmount != undefined &&
                item.adjustmentAmount != null
              ) {
                if (!isNaN(item.adjustmentAmount))
                  item.adjustmentAmount = item.adjustmentAmount.toFixed(2);
              }
 
              item.calculatedPremDue =
                parseFloat(
                  item.totalPremium.replace("$", "").replace(",", "")
                ) + item.calculatedAdjustmentAmount;

              item.previousReqChg = item.requestedChange;

              items.push(item);
            }
         

            if (this.hasStepperPermission("invoiceAdjustments", "update")) {

              
              let baseList = [];
              baseList.push(...items);

              let origList = [];
              origList.push(...this.listItems);

              let filteredItems = baseList.filter((b) => {
                return b.adjustmentAmount || b.requestedChange;
              });

              let origFiltered = origList.filter((b) => {
                return b.adjustmentAmount || b.requestedChange;
              });

              if (filteredItems.length != origFiltered.length) {
                Log.logError(
                  "Adjustments were made that were not saved: " +
                    JSON.stringify(origFiltered),
                  "ReconcileWizard.vue adjustedItems"
                );

                // console.log(
                //   "Adjustments were made that were not saved: " +
                //     JSON.stringify(origFiltered)
                // );

                if (firstCall == true) {
                  return this.save(true, this.stepperDefs.reviewChanges);
                } else {
                  this.searching = false;
                  this.waitCircle = false;
                  this.reviewItems.push(...items);
                  this.reviewErrDialog = true;
                  return;
                }
              }
            }
       
            // this.reviewErrDialog = true;
            this.searching = false;
            this.waitCircle = false;
            if (!this.hasStepperPermission("invoiceAdjustments", "update")) {
              this.listItems = [];
              this.listItems.push(...items);
            }
            this.reviewItems.push(...items);
            this.reviewItemsMatch = true;
          }
        })
        .catch((e) => {
          // console.log(e);
	  Log.logError(e, "ReconcileWizard.vue adjustedItemes");
          this.errDialog = true;
          this.searching = false;
          this.waitCircle = false;
          this.reviewItems = [];
        });

      // try {
      //   let baseList = this.listItems;

      //   return baseList.filter((b) => {
      //     return b.adjustmentAmount || b.requestedChange;
      //   });

      // } catch (e) {
      //   Log.logError(e, "ReconcileWizard.vue adjustedItems");
      //   return this.listItems;
      // }
    },
    setupPermissionView() {
      //default permission, readonly on all pages
      this.stepperPagePermissions = {
        //|none|read|add|update|delete|
        invoiceAdjustments: "|read|",
        reviewChanges: "|read|",
        processPayment: "|read|",
        complete: "|read|",
      };

      let currentUser = this.$store.state.currentUser;
      //ext user
      if (currentUser.type == "ext") {
        this.setupExtUserPermissions();
      }

      //homeoffice user
      if (currentUser.type == "homeoffice") {
        this.setupHomeOfficeUserPermissions();
      }
    },
    setupExtUserPermissions() {
      this.stepperPagePermissions.invoiceAdjustments = "|read|update|";

      let paymentPermissionString = "|none|";
      let currentFranchiseId =
        this.$store.state.currentFranchise.franchiseNumber;
      let franchises = window.sessionStorage.getItem("franchises");
      if (franchises != null && franchises != "" && franchises != []) {
        let companies = JSON.parse(franchises);
        if (companies) {
          let company = companies.find(
            (e) => e.franchiseID == currentFranchiseId
          );
          if (company) {
            if (
              company.roleName.toLowerCase() == "administrator" ||
              company.roleName.toLowerCase() == "payment remitter" ||
              company.roleName.toLowerCase() == "owner"
            ) {
              paymentPermissionString = "|read|update|delete|";
            }
          }
        }
      }
      this.stepperPagePermissions.processPayment = paymentPermissionString;
    },
    setupHomeOfficeUserPermissions() {
      let adjUpdateRoles = ["ReconcileAdjUpdate", "ReconcileAdjUpdDel"];
      let canAdjUpdate = this.checkSpecificPermission(adjUpdateRoles);
      if (canAdjUpdate) {
        this.stepperPagePermissions.invoiceAdjustments = "|read|update|";
      }

      let paymentUpdateRoles = ["ReconcilePayUpdate"];
      let paymentDeleteRoles = ["ReconcilePayUpdDel"];
      let canPaymentUpdate = this.checkSpecificPermission(paymentUpdateRoles);
      let canPaymentDelete = this.checkSpecificPermission(paymentDeleteRoles);
      let paymentPermissionString = "|read|";
      if (canPaymentUpdate) {
        paymentPermissionString += "update|";
      }
      if (canPaymentDelete) {
        paymentPermissionString += "update|delete|";
      }
      this.stepperPagePermissions.processPayment = paymentPermissionString;
    },
    hasStepperPermission(step, perm) {
      if (this.stepperPagePermissions[step]) {
        if (this.stepperPagePermissions[step].indexOf(perm) >= 0) {
          return true;
        }
      }
      return false;
    },
    isReadonlyRow(item) {
      if (item && item.markedDelete) {
        return true;
      }
      return false;
    },
    isProcessedItem(item) {
      if (item) {
        if (item.processTime) {
          let processTime = Date.parse(item.processTime);
          var d = new Date().getTime();
          if (d > processTime) {
            return true;
          }
        }
      }
      return false;
    },
    updateMFFlags() {
      HTTP.get("ReconcilePay/UpdateMainFrameChanges", {
        params: {
          franchiseId: this.$store.state.currentFranchise.franchiseNumber,
          invoiceId: this.listItems[0].invoiceId,
        },
      })
        .then((response) => {
          // console.log(response);
          if (
            response.status != 200 ||
            !response.data ||
            response.data.status != 200
          ) {
            Log.logError(
              JSON.stringify(response),
              "ReconcileWizard.vue updateMFFlags ReconcilePay/UpdateMainFrameChanges"
            );
          }
        })
        .catch((e) => {
          Log.logError(
            e.message ? e.message : e,
            "ReconcileWizard.vue updateMFFlags ReconcilePay/UpdateMainFrameChanges"
          );
        });
    },
    onInputAdjustmentAmount(item) {
      this.checkLock().then((v) => {
        if (v == true) {
          if (this.unsavedChanges) emitter.emit("unsavedChanges", true);
          this.updateListItem(item);
        } else if (v == false) {
          emitter.emit("unsavedChanges", false);
          this.load();
        }
      });
    },
    onTreeSelectInput(item) {
     
      this.checkLock().then((v) => {
        if (v == true) {
           
          if (this.unsavedChanges) emitter.emit("unsavedChanges", true);
          if (item.section125Indicator == "Yes") this.processSelection125(item);
          else this.processSelection(item);
        } else if (v == false) {
          emitter.emit("unsavedChanges", false);
          this.load();
        }
      });
    },
    buildListItems(invoiceDetails) {
    
      this.listItems = [];

      let invoiceDetailsCopy = JSON.parse(JSON.stringify(invoiceDetails));

      for (let item of invoiceDetailsCopy) {
        item.adjustmentAmount =
          item.adjustmentAmount == null ? undefined : item.adjustmentAmount;

        item.section125Indicator =
          item.isSection125 == 1 &&
          item.cafeQualifiedindicator.toUpperCase() == "Y"
            ? "Yes"
            : "";

        if (item.employeeId == "0") item.employeeId = "";
        if (item.policyType) item.policyType = item.policyType.trim();

        if (item.markedDelete == true) {
          //continue;
        }

        if (item.updFromMF && item.updFromMF.trim() == "DEL") {
          continue;
        }

        // ----
        item.dueDate = this.$filters.mdyyyy(item.dueDate);
       
        item.premiumDeducted = this.$filters.money(
          item.premiumDeducted
        );
        item.totalPremium = this.$filters.money(item.totalPremium);
        item.empId = item.employeeId;
        item.employeeName = item.name;
        item.requestedChange =
          item.changeCode == "" || item.changeCode == null
            ? undefined
            : item.changeCode;
        if (["C", "F", "L", "M"].indexOf(item.requestedChange) >= 0)
          item.requestedChange = undefined;
        item.otherReason = item.notes;

        if (item.adjustmentAmount == 0.0 && !item.requestedChange)
          item.adjustmentAmount = undefined;

        item.calculatedAdjustmentAmount =
          item.adjustmentAmount != undefined &&
          item.adjustmentAmount != null &&
          !isNaN(item.adjustmentAmount)
            ? item.adjustmentAmount -
              parseFloat(item.totalPremium.replace("$", "").replace(",", ""))
            : // : item.requestedChange && item.requestedChange != ""
              // ? parseFloat(item.totalPremium.replace("$", "").replace(",", "")) *
              //   -1
              0.0;

        if (
          item.adjustmentAmount != undefined &&
          item.adjustmentAmount != null
        ) {
          if (!isNaN(item.adjustmentAmount))
            item.adjustmentAmount = item.adjustmentAmount.toFixed(2);
        }

        item.calculatedPremDue =
          parseFloat(item.totalPremium.replace("$", "").replace(",", "")) +
          item.calculatedAdjustmentAmount;

        item.previousReqChg = item.requestedChange;

        this.listItems.push(item);
      }
    },
    async skipToPayment() {
      // Log.logInfo(
      //   "skipToPayment called for franchise " +
      //     this.$store.state.currentFranchise.franchiseNumber,
      //   "ReconcileWizard.vue skipToPayment"
      // );

      if (this.isLocked == false) {
        let username = window.sessionStorage.getItem("user");
        let name = window.sessionStorage.getItem("name");

        let nameArray = name.split(" ");
        let fn = "";
        let ln = "";

        if (nameArray.length) {
          for (let idx = 0; idx < nameArray.length; idx++) {
            if (idx < nameArray.length - 1) fn += nameArray[idx] + " ";
            else ln += nameArray[idx];
          }

          fn = fn.trim();
        }
        if (!fn) {
          fn = username;
          ln = username;
        }

        if (this.listItems.length) {
          this.waitCircle = true;
          await HTTP.get("ReconcilePay/SetLockOnInvoice", {
            params: {
              franchiseId: this.$store.state.currentFranchise.franchiseNumber,
              invoiceId: this.listItems[0].invoiceId,
              userid: username,
              firstName: fn,
              lastName: ln,
            },
            //withCredentials: true,
          })
            .then((response) => {
              // console.log(response);
              try {
                if (
                  response.status != 200 ||
                  (response.data && response.data.statusCode != 200)
                ) {
                  Log.logError(
                    response.statusText,
                    "ReconcileWizard.vue checkLock ReconcilePay/SetLockOnInvoice response"
                  );
                  this.waitCircle = false;
                  this.errDialog = true;
                  return false;
                } else {
                  //#224881
                  //when two user SetLockOnInvoice at same time
                  //check if invoice is locked by other user
                  if (this.isLockedByOhterUser(response.data)) {
                    this.setLockedByInfo(response.data);
                    this.waitCircle = false;
                    //when user switch step, we need show dialog
                    this.load();
                    return false;
                  }

                  if (
                    response.data &&
                    response.data.invoiceDetails &&
                    response.data.invoiceDetails.length &&
                    response.data.invoiceDetails[0].isLocked == true &&
                    response.data.invoiceDetails[0].lockedUserId == username
                  ) {
                    this.locked = response.data.invoiceDetails[0].isLocked;
                    this.lockedBy =
                      response.data.invoiceDetails[0].lockedUserId;
                    this.lockUser = (
                      (response.data.invoiceDetails[0].lockFirstName
                        ? response.data.invoiceDetails[0].lockFirstName
                        : "") +
                      " " +
                      (response.data.invoiceDetails[0].lockLastName
                        ? response.data.invoiceDetails[0].lockLastName
                        : "")
                    ).trim();
                    this.lockStartTime =
                      response.data.invoiceDetails[0].lockStartTime;
                    this.waitCircle = false;

                    this.skipUsed = true;                  
                    this.save(true, this.stepperDefs.processPayment);
                    return true;
                  } else {
                    this.waitCircle = false;
                    this.errDialog = true;
                    this.load();
                    return false;
                  }
                }
              } catch (e) {
                Log.logError(
                  e,
                  "ReconcileWizard.vue load ReconcilePay/SetLockOnInvoice response"
                );
                this.waitCircle = false;
                this.errDialog = true;
                return false;
              }
            })
            .catch((e) => {
              Log.logError(
                e,
                "ReconcileWizard.vue load ReconcilePay/SetLockOnInvoice"
              );
              this.waitCircle = false;
              this.errDialog = true;
              return false;
            });
        }
      } else if (this.isLocked == true) {
        if (!this.hasLock) {
          this.lockedDialog = true;
          return false;
        } else {
          this.skipUsed = true;
          this.save(true, this.stepperDefs.processPayment);
          return true;
        }
      }
    },
    getRequestedChange(rq, options) {
      for (let option of options) {
        if (option.id == rq) return option.label;

        if (option.children) {
          for (let opt of option.children) {
            if (opt.id == rq) return option.label + ": " + opt.label;

            if (opt.children) {
              for (let op of opt.children) {
                if (op.id == rq)
                  return option.label + ": " + opt.label + ": " + op.label;

                if (op.children) {
                  for (let o of op.children) {
                    if (o.id == rq)
                      return (
                        option.label +
                        ": " +
                        opt.label +
                        ": " +
                        op.label +
                        ": " +
                        o.label
                      );
                  }
                }
              }
            }
          }
        }
      }
      return "";
    },
    reloadCurrentInvoice() {
      this.locked = false;
      this.lockUser = "";
      this.lockedBy = "";
      this.waitCircle = true;
      this.searching = true;
      this.listItems = [];
      this.load();
    },
    getBankName(eventType) {
      if (
        (eventType == "keyup" && this.dialogRoutingNumber.length < 8) ||
        this.dialogRoutingNumber.length > 9
      ) {
        this.dialogBankName = "BANK NOT FOUND";
        this.bankNotFound = true;
        return;
      }

      if (this.dialogRoutingNumber && this.dialogRoutingNumber != "") {
        HTTP_Account.get("Payment/GetRoutingPaymentInfo", {
          params: {
            routingNumber: this.dialogRoutingNumber,
          },
          //withCredentials: true,
        })
          .then((response) => {
            if (response.status != 200) {
              this.errDialog = true;
              Log.logError(
                JSON.stringify(response),
                "ReconcileWizard.vue mounted Payment/GetPaymentInfo non-200 response"
              );
            } else {
              if (
                response.data &&
                response.data.routingDetails &&
                response.data.routingDetails.length
              )
              {
                this.dialogBankName = response.data.routingDetails[0].bankName;
                this.bankNotFound = false;
              }
              else
              {
                this.dialogBankName = "BANK NOT FOUND";
                this.bankNotFound = true;
              }
              this.$refs.bankAccntForm.validate();
            }
          })
          .catch((e) => {
            Log.logError(
              e,
              "ReconcileWizard mounted Payment/GetRoutingPaymentInfo"
            );
          });
      }
    },
    FormsubmitBankAcctChanges()
    {
      this.submitBankAcctChanges();
    },
    //submitBankAcctChanges() {
    async submitBankAcctChanges(){
  const { valid } = await bankAccntForm.value?.validate();
  if (valid) {
   
        this.fullAcctNum = this.dialogBankAccount;

        let acct = this.fullAcctNum;
        if (acct.length >= 4)
          this.bankAccount =
            acct.substring(0, acct.length - 4).replace(/\d/g, "•") +
            acct.substring(acct.length - 4);
        else this.bankAccount = acct.replace(/\d/g, "•");

        this.routingNumber = this.dialogRoutingNumber;
	
        if (this.saveAcct) {
          let username = window.sessionStorage.getItem("user");

          HTTP_Account.post("Payment/SetPaymentInfo", {
            routingNumber: this.dialogRoutingNumber,
            accountNumber: this.dialogBankAccount,
            franchiseID: this.$store.state.currentFranchise.franchiseNumber,
            accountType: this.dialogAcctType,
            username: username,
            isDelete: "0",
          })
            .then((response) => {
              if (response.status == 200 && response.data.statusCode == 200) {
                this.bankAcctSavedDialog = true;
              } else {
                this.errDialog = true;

                Log.logError(
                  JSON.stringify(response),
                  "ReconcileWizard.vue submitBankAcctChanges Payment/SetPaymentInfo response"
                );
              }
            })
            .catch((e) => {
              Log.logError(
                e,
                "ReconcileWizard.vue submitBankAcctChanges Payment/SetPaymentInfo response"
              );
              this.errDialog = true;
            });
        }

        this.acctType = this.dialogAcctType;
        this.bankName = this.dialogBankName;

        this.bankAcctDialog = false;
        this.dialogBankAccount = "";
        this.dialogVerifyBankAccount = "";
        this.saveAcct = false;
      }
    },
    loadScheduledInvoice() {
      // to do: load this.invoiceToLoad
      // marker
   
      this.isScheduledInvoice = true;
      this.scheduledInvoiceDueDate = null;
      this.viewScheduledInvoiceDialog = false;
      this.scheduledInvoicesDialog = false;
      this.locked = false;
      this.$nextTick(() => {
        this.stepperPage = this.stepperDefs.invoiceAdjustments;
        this.maxPageViewed = this.stepperDefs.invoiceAdjustments;
        this.waitCircle = true;

        this.searching = true;
        this.listItems = [];
        HTTP.get("ReconcilePay/GetScheduledInvoiceDetails", {
          params: {
            franchiseId: this.$store.state.currentFranchise.franchiseNumber,
            invoiceId: this.invoiceToLoad.invoiceId,
          },
          //withCredentials: true,
        })
          .then((response) => {
            try {
              if (
                response.status != 200 ||
                (response.data && response.data.statusCode != 200)
              ) {
                Log.logError(
                  response.statusText,
                  "ReconcileWizard.vue loadScheduledInvoice ReconcilePay/GetScheduledInvoices response"
                );
                this.waitCircle = false;
                this.errDialog = true;
              } else {
                this.waitCircle = false;

                this.originals = [];

                for (let original of response.data.invoiceDetails) {
                  let newItem = JSON.parse(JSON.stringify(original));

                  newItem.adjustmentAmount =
                    newItem.adjustmentAmount == null
                      ? undefined
                      : newItem.adjustmentAmount;

                  newItem.adjustmentAmount =
                    newItem.adjustmentAmount == 0 &&
                    (!newItem.changeCode || newItem.changeCode == "")
                      ? undefined
                      : newItem.adjustmentAmount;

                  newItem.requestedChange =
                    newItem.changeCode == "" || newItem.changeCode == null
                      ? undefined
                      : newItem.changeCode;

                  this.originals.push(newItem);
                }

                this.invoicesScheduled = response.data.invoicesScheduled;
                this.locked = true;
                this.lockedBy = "scheduled";
                this.lockUser = "scheduled";
                this.lockStartTime = response.data.lockStartTime;

                //Get Scheduled Invoice Payment Info

                this.getScheduledInvoicePaymentInfo(
                  this.invoiceToLoad.invoiceId
                );

                this.buildListItems(response.data.invoiceDetails);

                // for (let item of response.data.invoiceDetails) {
                //   item.section125Indicator =
                //     item.isSection125 == 1 &&
                //     item.cafeQualifiedindicator.toUpperCase() == "Y"
                //       ? "Yes"
                //       : "";

                //   if (item.employeeId == "0") item.employeeId = "";
                //   if (item.policyType) item.policyType = item.policyType.trim();

                //   if (item.markedDelete == true) {
                //     continue;
                //   }

                //   if (item.updFromMF == "DEL") {
                //     continue;
                //   }

                //   this.listItems.push(item);
                // }

                this.searching = false;
                this.totalAdjusted = this.calculateTotalAdjusted();
              }
            } catch (e) {
              Log.logError(
                e,
                "ReconcileWizard.vue loadScheduledInvoice ReconcilePay/GetScheduledInvoices response"
              );
              this.waitCircle = false;
              this.errDialog = true;
            }
          })
          .catch((e) => {
            Log.logError(
              e,
              "ReconcileWizard.vue loadScheduledInvoice ReconcilePay/GetScheduledInvoices"
            );
            this.waitCircle = false;
            this.errDialog = true;
          });
      });
    },
    getScheduledInvoicePaymentInfo(invoiceId) {
      dataService.getScheduledInvoicePaymentInfo(invoiceId).then((response) => {
        if (response.status == 200) {
          let responseData = response.data;
          if (responseData.statusCode == 200) {
            let paymentInfo = responseData.paymentDetails[0];

            this.depositCheck = paymentInfo.paidByCheck;
            this.routingNumber = paymentInfo.routingNumber;
            let acct = paymentInfo.accountNumber;
            if (acct.length >= 4) {
              this.bankAccount =
                acct.substring(0, acct.length - 4).replace(/\d/g, "•") +
                acct.substring(acct.length - 4);
            } else this.bankAccount = acct.replace(/\d/g, "•");
            this.finalPayment = paymentInfo.paymentAmount;
            this.scheduledInvoiceDueDate = paymentInfo.dueDate;
          }
        }
      });
    },
    deleteScheduledInvoice() {
      //cleanup
      this.depositCheck = false;
      // this.routingNumber = "";
      // this.bankAccount = "";
      this.finalPayment = "";

      this.deleteScheduledInvoiceDialog = false;
      this.scheduledInvoicesDialog = false;
      this.$nextTick(() => {
        this.stepperPage = this.stepperDefs.invoiceAdjustments;
        this.waitCircle = true;
        this.searching = true;

        HTTP.get("ReconcilePay/DeleteSchedule", {
          params: {
            franchiseId: this.$store.state.currentFranchise.franchiseNumber,
            invoiceId: this.invoiceToDelete.invoiceId,
            scheduleId: this.invoiceToDelete.scheduleId,
            userId: this.$store.state.currentUser.user,
          },
          //withCredentials: true,
        })
          .then((response) => {
            // console.log(response);
            try {
              let OK = false;
              if (response.data && response.data.scheduledInvoiceDetails) {
                let deleted = response.data.scheduledInvoiceDetails.find(
                  (d) => d.scheduleId == this.invoiceToDelete.scheduleId
                );
                if (deleted && deleted.statusCode == "SCAN") OK = true;
              }

              if (
                response.status != 200 ||
                !response.data ||
                (response.data && response.data.statusCode != 200) ||
                !response.data.scheduledInvoiceDetails ||
                !OK
              ) {
                Log.logError(
                  response.statusText,
                  "ReconcileWizard.vue deleteScheduledInvoice ReconcilePay/DeleteSchedule response"
                );
                this.waitCircle = false;
                this.errDialog = true;
                this.listItems = [];
                this.load();
              } else {
                this.waitCircle = true;
                this.searching = true;
                this.listItems = [];
                this.load();
              }
            } catch (e) {
              Log.logError(
                e,
                "ReconcileWizard.vue deleteScheduledInvoice ReconcilePay/DeleteSchedule response"
              );
              this.waitCircle = false;
              this.errDialog = true;
            }
          })
          .catch((e) => {
            Log.logError(
              e,
              "ReconcileWizard.vue deleteScheduledInvoice ReconcilePay/DeleteSchedule"
            );
            this.waitCircle = false;
            this.errDialog = true;
          });
      });
    },
    viewInvoice(invoice) {
      this.invoiceToLoad = invoice;
      this.viewScheduledInvoiceDialog = true;
    },
    deleteInvoice(invoice) {
      let isProcessed = this.isProcessedItem(invoice);
      if (isProcessed) {
        return;
      }
      this.invoiceToDelete = invoice;
      this.deleteScheduledInvoiceDialog = true;
    },
    loadNewScheduledInvoices() {
      
      this.waitCircle = true;
      HTTP.get("ReconcilePay/GetScheduledInvoices", {
        params: {
          franchiseId: this.$store.state.currentFranchise.franchiseNumber,
        },
        //withCredentials: true,
      })
        .then((response) => {
          // console.log(response);
        
          try {
            this.waitCircle = false;
            let dets = [];
            if (response.data && response.data.scheduledInvoiceDetails)
              dets = response.data.scheduledInvoiceDetails;
            this.si_items = [];
            this.si_items.push(...dets);
          } catch (e) {
            Log.logError(
              e,
              "ReconcileWizard.vue loadScheduledInvoices ReconcilePay/GetScheduledInvoices response"
            );
            this.waitCircle = false;
            this.errDialog = true;
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "ReconcileWizard.vue loadScheduledInvoices ReconcilePay/GetScheduledInvoices"
          );
          this.waitCircle = false;
          this.errDialog = true;
        });
    },

    loadScheduledInvoices() {
      this.waitCircle = true;
      HTTP.get("ReconcilePay/GetScheduledInvoices", {
        params: {
          franchiseId: this.$store.state.currentFranchise.franchiseNumber,
        },
        //withCredentials: true,
      })
        .then((response) => {
          try {
            if (
              response.status != 200 ||
              (response.data && response.data.statusCode != 200)
            ) {
              Log.logError(
                response.statusText,
                "ReconcileWizard.vue loadScheduledInvoices ReconcilePay/GetScheduledInvoices response"
              );
              this.waitCircle = false;
              this.errDialog = true;
            } else {
              this.waitCircle = false;
              let dets = response.data.scheduledInvoiceDetails;
              this.si_items = [];
              this.si_items.push(...dets);
              this.scheduledInvoicesDialog = true;
            }
          } catch (e) {
            Log.logError(
              e,
              "ReconcileWizard.vue loadScheduledInvoices ReconcilePay/GetScheduledInvoices response"
            );
            this.waitCircle = false;
            this.errDialog = true;
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "ReconcileWizard.vue loadScheduledInvoices ReconcilePay/GetScheduledInvoices"
          );
          this.waitCircle = false;
          this.errDialog = true;
        });
    },
    showSkip() {
      if (this.listItems.length < 1) return false;

      for (let listItem of this.listItems) {
        if (listItem.adjustmentAmount || listItem.requestedChange) {
          return false;
        }
      }

      return true;
    },
    isNotValidSelection(item) {
      if (
        item.adjustmentAmount != null &&
        item.adjustmentAmount != undefined &&
        !item.requestedChange
      ) {
        if (
          item.adjustmentAmount >=
          parseFloat(item.totalPremium.replace("$", "").replace(",", ""))
        )
          return false;
        else {
          return true;
        }
      }

      return false;
    },
    isAmountRequired(item) {
      if (item.requestedChange) {
        if (item.adjustmentAmount == null) {
          return true;
        }
        if (item.adjustmentAmount.toString().length == 0) {
          return true;
        }
      }
      return false;
    },
    saveBtnMethod() {
      // Log.logDebug(
      //   "saveBtnMethod called for franchise " +
      //     this.$store.state.currentFranchise.franchiseNumber,
      //   "ReconcileWizard.vue saveBtnMethod"
      // );

      this.checkLock().then((v) => {
        if (v == true) {
          this.save(false, this.stepperDefs.invoiceAdjustments);
        } else if (v == false) {
          this.load();
        }
      });
    },
    async  pay() {
       const { valid } = await this.$refs.paymentForm.validate();
      if (!valid) return;

      this.disablePayment = true;
      this.waitCircle = true;

      let username = window.sessionStorage.getItem("user");

      let paymentDets = {
        FranchiseId: this.$store.state.currentFranchise.franchiseNumber,
        InvoiceId: this.listItems[0].invoiceId,
        BankRoutingNo: this.routingNumber,
        BankAccountNo: this.fullAcctNum,
        BilledAmount: this.amountBilled,
        PaymentAmount: this.finalPayment,
        UserName: username,
        PaidByCheck: this.depositCheck,
      };

      HTTP.post("ReconcilePay/ScheduleInvoice", paymentDets)
        .then((response) => {
          if (
            response.status == 200 &&
            response.data &&
            response.data.statusCode == 200
          ) {
            // console.log(response);

            if (
              response.status == 200 &&
              response.data &&
              response.data.statusCode == 200
            ) {
              emitter.emit("unsavedChanges", false);

              HTTP.get("ReconcilePay/GetNextInvoice", {
                params: {
                  franchiseId:
                    this.$store.state.currentFranchise.franchiseNumber,
                },
                //withCredentials: true,
              })
                .then((response) => {
                  this.waitCircle = false;
                  if (
                    response.status != 200 ||
                    !response.data ||
                    response.data.statusCode != 200
                  ) {
                    Log.logError(
                      response.ErrorMessage,
                      "ReconcileWizard.vue Pay ReconcilePay/GetNextInvoice post "
                    );

                    this.errDialog = true;
                  }

                  this.nextInvoice = response.data.invoiceId;
                  this.nextInvoiceDueDate = response.data.dueDate;

                  if (this.nextInvoice != null)
                    this.paymentScheduledNextDialog = true;
                  else this.paymentScheduledDialog = true;

                  this.loadNewScheduledInvoices();
                  this.switchStep(this.stepperDefs.complete, false);
                })
                .catch((e) => {
                  Log.logError(
                    e,

                    "ReconcileWizard.vue Pay ReconcilePay/GetNextInvoice post "
                  );
                  this.waitCircle = false;
                  this.errDialog = true;
                });
            }
          } else {
            Log.logError(
              JSON.stringify(response),

              "ReconcileWizard.vue Pay ReconcilePay/ScheduledInvoice post "
            );

            this.disablePayment = false;
            this.waitCircle = false;
            this.errDialog = true;
          }
        })
        .catch((e) => {
          Log.logError(
            e,

            "ReconcileWizard.vue Pay ReconcilePay/ScheduledInvoice post "
          );
          this.waitCircle = false;
          this.errDialog = true;
        });
    },
    saveContinueBtnMethod(stepperPage) {
      // Log.logDebug(
      //   "saveContinueBtnMethod called for franchise " +
      //     this.$store.state.currentFranchise.franchiseNumber,
      //   "ReconcileWizard.vue saveContinueBtnMethod"
      // );

      // skip to payment screen if no adjustments
      if (
        this.showSkip() == true &&
        stepperPage == this.stepperDefs.invoiceAdjustments
      ) {
       
        this.skipUsed = true;
        if (this.canProcessPayment) {
          
          this.save(true, this.stepperDefs.processPayment);
        } else {
         
          this.save(true, this.stepperDefs.reviewChanges);
        }
        return;
      }

      if (stepperPage == this.stepperDefs.invoiceAdjustments) {
      
        this.save(true, this.stepperDefs.reviewChanges);
      } else if (stepperPage == this.stepperDefs.processPayment) {
       
        this.pay();
      } else {
       
        this.switchStep(stepperPage + 1, false);
      }
    },
    save(andContinue, toPage) {
      // Log.logInfo(
      //     "save called for franchise " +
      //       this.$store.state.currentFranchise.franchiseNumber + " with parameters andContinue " + andContinue + " and toPage " + toPage,
      //     "ReconcileWizard.vue save"
      //   );

      this.waitCircle = true;
      let secondCheck = true;

      for (let listItem of this.listItems) {
        if (
          this.isNotValidSelection(listItem) ||
          this.isAmountRequired(listItem)
        ) {
          secondCheck = false;
        }
      }

      if (
        this.stepperPage != this.stepperDefs.invoiceAdjustments ||
        (this.$refs.stepperOneForm.validate() && secondCheck)
      ) {
        let changedItems = [];

        for (let item of this.listItems) {
          let origPolicyLine = this.originals.find(
            (o) => o.policyNumber == item.policyNumber
          );

          if (origPolicyLine) {
            if (
              origPolicyLine.requestedChange != item.requestedChange ||
              origPolicyLine.adjustmentAmount != item.adjustmentAmount ||
              this.isItemOtherReasonChanged(origPolicyLine, item)
            ) {
              let detail = JSON.parse(JSON.stringify(origPolicyLine));
              detail.adjustmentAmount = item.adjustmentAmount;
              detail.changeCode = item.requestedChange;
              if (item.requestedChange != "TMP-O") {
                item.otherReason = "";
              }
              detail.notes = item.otherReason;

              changedItems.push(detail);
            }
          }
        }

        let username = window.sessionStorage.getItem("user");
        let name = window.sessionStorage.getItem("name");

        let nameArray = name.split(" ");
        let fn = "";
        let ln = "";

        if (nameArray && nameArray.length) {
          for (let idx = 0; idx < nameArray.length; idx++) {
            if (idx < nameArray.length - 1) fn += nameArray[idx] + " ";
            else ln += nameArray[idx];
          }

          fn = fn.trim();
        }
        if (!fn) {
          fn = username;
          ln = username;
        }

        let saveItem = {
          InvoiceDetails: [],
          IsLocked: true,
          LockStartTime: this.lockStartTime,
          LockUserId: username,
          LockFirstName: fn,
          LockLastName: ln,
        };

        for (let item of changedItems) {
          let detail = {
            AdjustedAmount: item.adjustedAmount,
            AdjustmentAmount:
              item.adjustmentAmount != null &&
              item.adjustmentAmount != undefined
                ? item.adjustmentAmount
                : null, //  0.0,
            CafeQualifiedindicator: item.cafeQualifiedindicator,
            ChangeCode: item.changeCode ? item.changeCode : "",
            DueDate: item.dueDate,
            EmployeeId: item.employeeId,
            FaceAmount: item.faceAmount,
            FranchiseID: item.franchiseID,
            InsuredName: item.insuredName,
            InvoiceDetailId: item.invoiceDetailId,
            InvoiceId: item.invoiceId,
            IsSection125: item.isSection125,
            Name: item.name,
            Notes: item.notes,
            PolicyNumber: item.policyNumber,
            PolicyShortDescription: item.policyShortDescription,
            PolicyType: item.policyType,
            PremiumDeducted: item.premiumDeducted,
            Section125Indicator: item.section125Indicator,
            TotalPremium: item.totalPremium,
            UpdateSuccess: item.updateSuccess,
          };

          saveItem.InvoiceDetails.push(detail);
        }

        if (changedItems.length == 0) {
          this.waitCircle = false;
          if (andContinue) this.switchStep(toPage, false);
          else this.savedDialog = true;
        } else {
          HTTP.post("ReconcilePay/UpdateInvoiceDetails", saveItem)
            .then((response) => {
              // console.log(response);

              this.waitCircle = false;
              if (
                response.status == 200 &&
                response.data &&
                response.data.statusCode == 200
              ) {
                if (response.data.invoiceDetails) {
                  let success = true;

                  for (let det of response.data.invoiceDetails) {
                    if (det.updateSucess == false) success = false;
                    else {
                      let origPolicyLineIndex = this.originals.findIndex(
                        (o) => o.policyNumber == det.policyNumber
                      );

                      if (origPolicyLineIndex >= 0) {
                        this.originals[origPolicyLineIndex].requestedChange =
                          det.changeCode == "" || det.changeCode == null
                            ? undefined
                            : det.changeCode;

                        this.originals[origPolicyLineIndex].changeCode =
                          this.originals[origPolicyLineIndex].requestedChange;

                        det.adjustmentAmount =
                          det.adjustmentAmount == null
                            ? undefined
                            : det.adjustmentAmount;

                        this.originals[origPolicyLineIndex].adjustmentAmount =
                          det.adjustmentAmount == 0 &&
                          (!det.changeCode || det.changeCode == "")
                            ? undefined
                            : det.adjustmentAmount;

                        this.originals[origPolicyLineIndex].notes = det.notes;
                        this.originals[origPolicyLineIndex].otherReason =
                          det.notes;
                      }
                    }
                  }

                  if (success == false) {
                    this.errDialog = true;
                    Log.logError(
                      JSON.stringify(response),
                      "ReconcileWizard.vue Save ReconcilePay/UpdateInvoiceDetails Save Failed"
                    );
                  } else {
                    emitter.emit("unsavedChanges", false);
                    if (andContinue) {
                      if (
                        this.stepperPage == toPage &&
                        this.stepperPage == this.stepperDefs.reviewChanges
                      ) {
                        this.callGetInvoiceDetails(0);
                      } else this.switchStep(toPage, false);
                    } else this.savedDialog = true;
                    return true;
                  }
                }
              } else {
                this.errDialog = true;
                Log.logError(
                  JSON.stringify(response),
                  "ReconcileWizard.vue Save ReconcilePay/UpdateInvoiceDetails"
                );
              }
            })
            .catch((e) => {
              Log.logError(
                e,
                "ReconcileWizard.vue Save ReconcilePay/UpdateInvoiceDetails"
              );
              this.errDialog = true;
            });
        }

        return true;
      }

      this.waitCircle = false;
      return false;
    },
    isItemOtherReasonChanged(origPolicyLine, item) {
      let result = false;
      let detail = JSON.parse(JSON.stringify(origPolicyLine));
      if (item.requestedChange == "TMP-O" && detail.notes != item.otherReason) {
        result = true;
      }
      return result;
    },
    checkClear() {
      this.clearDialog = true;
    },
    clear() {
      for (let idx = 0; idx < this.listItems.length; idx++) {
        if (!this.listItems[idx].markedDelete) {
          this.listItems[idx].adjustmentAmount = undefined;
          this.listItems[idx].requestedChange = undefined;
          this.listItems[idx].notes = undefined;
          this.listItems[idx].otherReason = undefined;
          this.listItems[idx].calculatedAdjustmentAmount = 0.0;

          this.listItems[idx].calculatedPremDue =
            parseFloat(
              this.listItems[idx].totalPremium.replace("$", "").replace(",", "")
            ) + this.listItems[idx].calculatedAdjustmentAmount;
        }
      }

      emitter.emit("unsavedChanges", true);
    },
    unLock() {
      this.waitCircle = true;
      HTTP.get("ReconcilePay/UnlockInvoice", {
        params: {
          franchiseId: this.$store.state.currentFranchise.franchiseNumber,
          invoiceId: this.listItems[0].invoiceId,
          userId: window.sessionStorage.getItem("user"),
        },
        //withCredentials: true,
      })
        .then((response) => {
          try {
            if (
              response.status != 200 ||
              (response.data && response.data.statusCode != 200)
            ) {
              Log.logError(
                response.statusText,
                "ReconcileWizard.vue UnLock ReconcilePay/UnlockInvoice response"
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
                this.locked = false;
                this.lockStartTime = null;
                this.lockedUser = "";
                this.lockedBy = "";

                this.load();
              }
            }
          } catch (e) {
            Log.logError(
              e,
              "ReconcileWizard.vue Unlock ReconcilePay/UnlockInvoice response"
            );
            this.waitCircle = false;
            this.errDialog = true;
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "ReconcileWizard.vue Unlock ReconcilePay/UnlockInvoice"
          );
          this.waitCircle = false;
          this.errDialog = true;
        });
    },
    checkUnlock() {
      this.unlockDialog = true;
    },
    submitOtherReason() {
      this.saveReason();
    },
    saveReason() {
      if (this.$refs.otherReasonForm.validate()) {
        this.otherDialog = false;

        if (this.currentItem) {
          for (let idx = 0; idx < this.listItems.length; idx++) {
            if (
              this.currentItem.name == this.listItems[idx].name &&
              this.currentItem.policyNumber == this.listItems[idx].policyNumber
            ) {
              this.listItems[idx].otherReason = this.otherReason;
            }
          }
        }
      }
    },
    processSelection(item) {
      
      if (item.previousReqChg == item.requestedChange) return;

      this.setAdjustmentAmountInput(item);
      this.currentItem = item;
      this.updateListItem(item);

      if (item.requestedChange == "R") {
        // retired
        this.reasonHeader = "Reminder";
        this.reasonIcon = "mdi-information-outline";
        this.reasonNotice =
          "Our policies are portable. Coverage can be continued by direct bill.  Please have the employee contact your agent for more details.";

        let count = 0;
        for (let listItem of this.listItems.filter(
          (b) => b.name == item.name
        )) {
          if (listItem.requestedChange == "R") count++;
        }

        if (count == 1 && !this.isHomeOfficeUser) this.reasonDialog = true;
      } else if (item.requestedChange == "T") {
        // Employee Terminated
        this.reasonHeader = "Reminder";
        this.reasonIcon = "mdi-information-outline";
        this.reasonNotice =
          "Premiums deducted from employee’s paycheck prior to termination should be remitted to Liberty National.";

        let count = 0;
        for (let listItem of this.listItems.filter(
          (b) => b.name == item.name
        )) {
          if (listItem.requestedChange == "T") count++;
        }

        if (count == 1 && !this.isHomeOfficeUser) this.reasonDialog = true;
      } else {
        try {
          let tempOption = this.options.find((o) => o.id == "TMP");
          let tempOptionChildren = tempOption ? tempOption.children : [];
          if (tempOptionChildren && tempOptionChildren.length) {
            let reqOption = tempOptionChildren.find(
              (toc) => toc.id == item.requestedChange
            );

            if (reqOption) {
              this.reasonHeader = "Reminder";
              this.reasonIcon = "mdi-information-outline";
              this.reasonNotice =
                "Employees whose deductions are stopped temporarily must pay missed deductions upon return or their policies may lapse.";

              let count = 0;
              for (let listItem of this.listItems.filter(
                (b) => b.name == item.name
              )) {
                if (listItem.requestedChange == reqOption.id) count++;
              }

              if (count == 1 && !this.isHomeOfficeUser)
                this.reasonDialog = true;
              if (item.requestedChange == "TMP-O") {
                // Other
                this.otherReason = item.otherReason ? item.otherReason : "";
                this.clearOnCancel = true;

                this.$nextTick(() => {
                  this.otherDialog = true;
                });
              }
            }
          }
        } catch (e) {
          Log.logError(e, "ReconcileWizard.vue processSelection");
        }
      }
    },
    setAdjustmentAmountInput(item) {
      if (item.requestedChange != "E") {
        if (item.adjustmentAmount == null || item.adjustmentAmount == "") {
          item.adjustmentAmount = 0.0;
        }
      }
    },
    processSelection125(item) {
      if (item.previousReqChg == item.requestedChange) return;

      this.setAdjustmentAmountInput(item);
      this.currentItem = item;
      this.updateListItem(item);

      if (item.requestedChange == "R") {
        // Retired
        this.reasonHeader = "Reminder";
        this.reasonIcon = "mdi-information-outline";
        this.reasonNotice =
          "Our policies are portable. Coverage can be continued by direct bill.  Please have the employee contact your agent for more details.";

        let count = 0;
        for (let listItem of this.listItems.filter(
          (b) => b.name == item.name
        )) {
          if (listItem.requestedChange == "R") count++;
        }

        if (count == 1 && !this.isHomeOfficeUser) this.reasonDialog = true;
      } else if (item.requestedChange == "T") {
        //employee terminated
        this.reasonHeader = "Reminder";
        this.reasonIcon = "mdi-information-outline";
        this.reasonNotice =
          "Premiums deducted from employee’s paycheck prior to termination should be remitted to Liberty National.";

        let count = 0;
        for (let listItem of this.listItems.filter(
          (b) => b.name == item.name
        )) {
          if (listItem.requestedChange == "T") count++;
        }

        if (count == 1 && !this.isHomeOfficeUser) this.reasonDialog = true;
      } else {
        let tempOption = this.options125.find((o) => o.id == "CSW");

        let tempOptionChildren = tempOption ? tempOption.children : [];
        if (tempOptionChildren && tempOptionChildren.length > 0) {
          let reqOption = tempOptionChildren.find(
            (toc) => toc.id == item.requestedChange
          );

          if (!reqOption && tempOption && tempOption.children) {
            for (let child of tempOptionChildren) {
              let grandchildren = child.children;
              if (grandchildren && grandchildren.length > 0) {
                reqOption = grandchildren.find(
                  (gc) => gc.id == item.requestedChange
                );
                if (reqOption) break;
              }
            }
          }

          if (reqOption) {
            this.reasonHeader = "Section 125";
            this.reasonIcon = "mdi-information-outline";
            this.reasonNotice =
              "The Internal Revenue Service (IRS) Guidelines for Section 125-eligible products dictate that changes made during the Plan Year must be a permitted election change under the Section 125 Plan (“Qualified Status Change”). I understand that the change I have specified must be in accordance with IRS Section 125 Guidelines and with my employer’s Plan. I understand that I may be required to provide the appropriate documentation for any of the changes I have specified. I hereby elect the change(s) and attest that the change is made on account of and consistent with a Qualified Status Change.";
            let count = 0;
            for (let listItem of this.listItems.filter(
              (b) => b.name == item.name
            )) {
              if (listItem.requestedChange == reqOption.id) count++;
            }

            if (count == 1 && !this.isHomeOfficeUser) this.reasonDialog = true;
          } else {
            tempOption = this.options125.find((o) => o.id == "TMP");
            tempOptionChildren = tempOption ? tempOption.children : [];
            if (tempOptionChildren && tempOptionChildren.length) {
              let reqOption = tempOptionChildren.find(
                (toc) => toc.id == item.requestedChange
              );

              if (reqOption) {
                this.reasonHeader = "Reminder";
                this.reasonIcon = "mdi-information-outline";
                this.reasonNotice =
                  "Employees whose deductions are stopped temporarily must pay missed deductions upon return or their policies may lapse.";

                let count = 0;
                for (let listItem of this.listItems.filter(
                  (b) => b.name == item.name
                )) {
                  if (listItem.requestedChange == reqOption.id) count++;
                }

                if (count == 1 && !this.isHomeOfficeUser)
                  this.reasonDialog = true;
              }
            }
          }
        }
      }
    },
    load() {
      this.isScheduledInvoice = false;
      this.scheduledInvoiceDueDate = null;
      this.listItems = [];
      this.searching = true;
      this.maxPageViewed = this.stepperDefs.invoiceAdjustments;

      HTTP.get("ReconcilePay/GetNextInvoice", {
        params: {
          franchiseId: this.$store.state.currentFranchise.franchiseNumber,
        },
        //withCredentials: true,
      })
        .then((response) => {
          // console.log(response);
          if (
            response.status != 200 ||
            !response.data ||
            response.data.statusCode != 200
          ) {
            Log.logError(
              response.ErrorMessage,
              "ReconcileWizard.vue load ReconcilePay/ScheduledInvoice post "
            );
            this.errDialog = true;
          }
          console.log(response.data);

          this.dueDate = response.data.dueDate;
          this.delinquentDate = response.data.delinquentDate;
        })
        .catch((e) => {
          Log.logError(
            e,

            "ReconcileWizard.vue Pay ReconcilePay/ScheduledInvoice post "
          );
          // this.errDialog = true;
        });

      HTTP.get("ReconcilePay/GetInvoiceDetails", {
        params: {
          franchiseId: this.$store.state.currentFranchise.franchiseNumber,
        },
        //withCredentials: true,
      })
        .then((response) => {
          // console.log(response);

          try {
            if (
              response.status != 200 ||
              (response.data && response.data.statusCode != 200)
            ) {
              
              if (
                response.data.errorMessage &&
                response.data.errorMessage
                  .toLowerCase()
                  .startsWith("no records")
              ) {
                this.loadNewScheduledInvoices();

                this.searching = false;
                this.waitCircle = false;
              } else {
              
                Log.logError(
                  response.statusText,
                  "ReconcileWizard.vue load ReconcilePay/GetInvoiceDetails response"
                );
                this.errDialog = true;
                this.searching = false;
                this.waitCircle = false;
              }
            } else {
            
              if (response.data && response.data.canPayonWOBS == false) {
                  
                this.pastDueDialog = true;
                this.pastDue = true;

                this.searching = false;
                this.waitCircle = false;
               
                return;
              }

              if (!response.data.invoiceDetails.length) {
                if (response.data.invoicesScheduled == true) {
                  this.alertToScheduledDialog = true;
                }

                this.loadNewScheduledInvoices();

                this.searching = false;
                this.waitCircle = false;
                return;
              }

              this.originals = [];

              for (let original of response.data.invoiceDetails) {
                let newItem = JSON.parse(JSON.stringify(original));

                newItem.adjustmentAmount =
                  newItem.adjustmentAmount == null
                    ? undefined
                    : newItem.adjustmentAmount;

                newItem.adjustmentAmount =
                  newItem.adjustmentAmount == 0 &&
                  (!newItem.changeCode || newItem.changeCode == "")
                    ? undefined
                    : newItem.adjustmentAmount;

                newItem.requestedChange =
                  newItem.changeCode == "" || newItem.changeCode == null
                    ? undefined
                    : newItem.changeCode;

                this.originals.push(newItem);
              }

              this.invoicesScheduled = response.data.invoicesScheduled;

              if (this.invoicesScheduled == false) {
                this.si_items = [];
              }

              this.locked = response.data.isLocked;
              this.lockedBy = response.data.lockUserId;
              this.lockUser = (
                (response.data.lockFirstName
                  ? response.data.lockFirstName
                  : "") +
                " " +
                (response.data.lockLastName ? response.data.lockLastName : "")
              ).trim();
              this.lockStartTime = response.data.lockStartTime;

              this.buildListItems(response.data.invoiceDetails);

              this.mainframeChangeItems = [];

              for (let item of this.originals) {
                if (item.updFromMF && item.updFromMF.trim() != "") {
                  let tempChangedItem = JSON.parse(JSON.stringify(item));
                  tempChangedItem.adjustmentAmount =
                    item.adjustmentAmount == 0 &&
                    (!item.changeCode || item.changeCode == "")
                      ? undefined
                      : item.adjustmentAmount;
                  this.mainframeChangeItems.push(tempChangedItem);
                }
              }

              this.searching = false;
              this.waitCircle = false;
              this.totalAdjusted = this.calculateTotalAdjusted();

              let lockUserIdLower = "";
              let sessionUser = "";
              let sessionUserLower = "";

              lockUserIdLower = response.data.lockUserId
                ? response.data.lockUserId.trim().toLowerCase()
                : response.data.lockUserId;
              sessionUser = window.sessionStorage.getItem("user");
              sessionUserLower = sessionUser
                ? sessionUser.trim().toLowerCase()
                : sessionUser;
              // if (
              //   this.isLocked == true &&
              //   response.data.lockUserId !=
              //     window.sessionStorage.getItem("user")
              // )
              if (this.isLocked == true && lockUserIdLower != sessionUserLower)
                this.lockedDialog = true;
              else {
                if (this.mainframeChangeItems.length) {
                  this.displayMainframeChanges = true;
                }
              }
            }
          } catch (e) {
            Log.logError(
              e,
              "ReconcileWizard.vue load ReconcilePay/GetInvoiceDetails response"
            );
            this.errDialog = true;
            this.searching = false;
            this.waitCircle = false;
          }
        })
        .catch((e) => {
          Log.logError(
            e,
            "ReconcileWizard.vue load ReconcilePay/GetInvoiceDetails"
          );
          this.errDialog = true;
          this.searching = false;
          this.waitCircle = false;
        });
    },
    async checkLock(isSwitchStep) {
      if (!this.lockCallInProgress) {
        if (this.isLocked == false) {
          let username = window.sessionStorage.getItem("user");
          let name = window.sessionStorage.getItem("name");

          let nameArray = name.split(" ");
          let fn = "";
          let ln = "";

          if (nameArray.length) {
            for (let idx = 0; idx < nameArray.length; idx++) {
              if (idx < nameArray.length - 1) fn += nameArray[idx] + " ";
              else ln += nameArray[idx];
            }

            fn = fn.trim();
          }
          if (!fn)
          {
            fn = username;
            ln = username;
          }

          if (this.listItems.length) {
            this.waitCircle = true;
            this.lockCallInProgress = true;
            let asyncResult = await HTTP.get("ReconcilePay/SetLockOnInvoice", {
              params: {
                franchiseId: this.$store.state.currentFranchise.franchiseNumber,
                invoiceId: this.listItems[0].invoiceId,
                userid: username,
                firstName: fn,
                lastName: ln,
              },
              //withCredentials: true,
            })
              .then((response) => {
                // console.log(response);
                try {
                  if (
                    response.status != 200 ||
                    (response.data && response.data.statusCode != 200)
                  ) {
                    Log.logError(
                      response.statusText,
                      "ReconcileWizard.vue checkLock ReconcilePay/SetLockOnInvoice response"
                    );
                    this.waitCircle = false;
                    this.errDialog = true;
                    this.lockCallInProgress = false;

                    return false;
                  } else {
                    //#224881
                    //when two user SetLockOnInvoice at same time
                    //check if invoice is locked by other user
                    if (this.isLockedByOhterUser(response.data)) {
                      this.setLockedByInfo(response.data);
                      this.waitCircle = false;
                      this.lockCallInProgress = false;

                      //when user switch step, we need show dialog
                      if (isSwitchStep) {
                        this.load();
                      }
                      return false;
                    }

                    if (
                      response.data &&
                      response.data.invoiceDetails &&
                      response.data.invoiceDetails.length &&
                      response.data.invoiceDetails[0].isLocked == true &&
                      response.data.invoiceDetails[0].lockedUserId == username
                    ) {
                      this.setLockedByInfo(response.data);
                      this.waitCircle = false;
                      this.lockCallInProgress = false;

                      return true;
                    } else {
                      this.waitCircle = false;
                      this.errDialog = true;
                      this.lockCallInProgress = false;

                      this.load();
                      return false;
                    }
                  }
                } catch (e) {
                  Log.logError(
                    e,
                    "ReconcileWizard.vue load ReconcilePay/SetLockOnInvoice response"
                  );
                  this.waitCircle = false;
                  this.lockCallInProgess = false;
                  this.errDialog = true;
                  return false;
                }
              })
              .catch((e) => {
                Log.logError(
                  e,
                  "ReconcileWizard.vue load ReconcilePay/SetLockOnInvoice"
                );
                this.waitCircle = false;
                this.errDialog = true;
                return false;
              });

            return asyncResult;
          }
        } else if (this.isLocked == true) {
          if (!this.hasLock) {
            this.lockedDialog = true;
            return false;
          } else {
            return true;
          }
        }
      } else {
        return undefined;
      }
    },
    setLockedByInfo(responseData) {
      this.locked = responseData.invoiceDetails[0].isLocked;
      this.lockedBy = responseData.invoiceDetails[0].lockedUserId;
      let lockUser = "";
      if (responseData.invoiceDetails[0].lockedFirstName) {
        lockUser += responseData.invoiceDetails[0].lockedFirstName;
      }
      if (responseData.invoiceDetails[0].lockedLastName) {
        lockUser += " " + responseData.invoiceDetails[0].lockedLastName;
      }
      this.lockUser = lockUser.trim();
      this.lockStartTime = responseData.invoiceDetails[0].lockStartTime;
    },
    isLockedByOhterUser(responseData) {
      let responseUser = responseData.invoiceDetails[0].lockedUserId;
      let responseUserLowerCase = responseUser
        ? responseUser.trim().toLowerCase()
        : responseUser;

      let userId = this.$store.state.currentUser.user;
      let userIdLowerCase = userId ? userId.trim().toLowerCase() : userId;

      if (responseData.invoiceDetails) {
        if (responseData.invoiceDetails[0].isLocked) {
          // if (!responseData.invoiceDetails[0].saveLockSuccess
          //     || userId != responseData.invoiceDetails[0].lockedUserId
          //   )
          if (
            !responseData.invoiceDetails[0].saveLockSuccess ||
            userIdLowerCase != responseUserLowerCase
          ) {
            return true;
          }
        }
      }
      return false;
    },
    calculateTotalAdjusted() {
      let amt = 0.0;

      for (let item of this.listItems) {
        if (
          item.adjustmentAmount != undefined &&
          item.adjustmentAmount != null
        ) {
          amt += parseFloat(
            item.adjustmentAmount.toString() == ""
              ? 0
              : item.adjustmentAmount
                  .toString()
                  .replace("$", "")
                  .replace(",", "")
          );
        } else if (item.totalPremium) {
          amt += parseFloat(
            item.totalPremium.replace("$", "").replace(",", "")
          );
        }
      }

      return amt.toFixed(2);
    },
    updateListItem(item) {
      if (item.requestedChange == "E") {
        // never our employee
        item.adjustmentAmount = 0;
      }

      if (item.adjustmentAmount && isNaN(item.adjustmentAmount)) {
        return;
      }

      for (let idx = 0; idx < this.listItems.length; idx++) {
        let b = this.listItems[idx];

        if (
          b.policyNumber == item.policyNumber &&
          b.name == item.name &&
          b.totalPremium == item.totalPremium
        ) {
          if (
            (!item.requestedChange || item.requestedChange == "") &&
            this.listItems[idx].previousReqChg &&
            this.listItems[idx].previousReqChg != "" &&
            item.adjustmentAmount == 0
          ) {
            item.adjustmentAmount = undefined;
          }

          if (
            this.listItems[idx].previousReqChg == "E" &&
            item.requestedChange != "E" &&
            item.adjustmentAmount == 0
          ) {
            item.adjustmentAmount = undefined;
          }

          this.listItems[idx].previousReqChg = item.requestedChange;
          this.listItems[idx].adjustmentAmount = item.adjustmentAmount;

          this.listItems[idx].calculatedAdjustmentAmount =
            this.listItems[idx].adjustmentAmount != undefined &&
            this.listItems[idx].adjustmentAmount != null
              ? this.listItems[idx].adjustmentAmount -
                parseFloat(item.totalPremium.replace("$", "").replace(",", ""))
              : 0.0;

          this.listItems[idx].calculatedPremDue =
            parseFloat(
              this.listItems[idx].totalPremium.replace("$", "").replace(",", "")
            ) + this.listItems[idx].calculatedAdjustmentAmount;

          break;
        }
      }
      this.totalAdjusted = this.calculateTotalAdjusted();
    },
    gotoSearchBy(refName) {
      try {
        this.$refs[refName].activateMenu();
        this.$refs[refName].focus();
      } catch (e) {
        Log.logError(e, "ReconcileWizard.vue gotoSearchBy");
      }
    },
    searchPolicies() {
      this.searchClicked = true;

      if (this.$refs.form.validate()) {
        this.searchFilter = this.search.trim();
        this.searchByFilter = this.searchBy.trim();
        this.page = 1;
      }
    },
    resetPolicies() {
      this.searchFilter = undefined;
      this.searchByFilter = undefined;
      this.searchClicked = false;
      this.search = "";
      this.searchyBy = "";
      if (this.$refs.form) this.$refs.form.resetValidation();
    },
    sumAdjustments(items) {
      let amt = 0.0;
      items.forEach(item => {
      amt += parseFloat(
              item.raw.calculatedAdjustmentAmount
            );
       });
     
      // for (let listItem of this.listItems) {
      //   if (listItem.name == items[0].name) {
      //     if (listItem.calculatedAdjustmentAmount)
      //       amt += listItem.calculatedAdjustmentAmount;
      //   }
      // }
      return amt;
    },
    sumAdjusted(items) {
      let amt = 0.0;

      for (let listItem of this.listItems) {
        if (listItem.name == items[0].name) {
          if (listItem.adjustmentAmount)
            amt += parseFloat(
              listItem.adjustmentAmount.replace("$", "").replace(",", "")
            );
        }
      }
      return amt;
    },

    sumCalcPrem(items) {
      let amt = 0.0;
    items.forEach(item => {
      amt += parseFloat(
              item.raw.calculatedPremDue
            );
       });
      // for (let listItem of this.listItems) {
      //   if (listItem[this.groupCriteria] == items[0][this.groupCriteria]) {
      //     if (listItem.calculatedPremDue) amt += listItem.calculatedPremDue;
      //   }
      // }
      return amt;
    },

    sumPremiums(items) {
      let amt = 0.0;

      for (let item of items) {
        if (item.raw.totalPremium)
          amt += parseFloat(
            item.raw.totalPremium.replace("$", "").replace(",", "")
          );
      }

      return amt;
    },
    sumPremiumsListItems(items) {
      let amt = 0.0;

      for (let listItem of this.listItems) {
        if (listItem[this.groupCriteria] == items[0][this.groupCriteria]) {
          if (listItem.totalPremium)
            amt += parseFloat(
              listItem.totalPremium.replace("$", "").replace(",", "")
            );
        }
      }
      return amt;
    },
    sumPremiumsPerPayPeriod(items) {
      let amt = 0.0;
      items.forEach(item => {
      amt += parseFloat(
              item.raw.premiumDeducted.replace("$", "").replace(",", "")
            );
       });
     

      // for (let listItem of this.listItems) {
      //   if (listItem[this.groupCriteria] == items[0][this.groupCriteria]) {
      //     if (listItem.premiumDeducted)
      //       amt += parseFloat(
      //         listItem.premiumDeducted.replace("$", "").replace(",", "")
      //       );
      //   }
      // }
      return amt;
    },
    switchStep(newStep, fromStepperBtn) {
   
      if (
        this.stepperPage == this.stepperDefs.reviewChanges &&
        newStep == this.stepperDefs.processPayment &&
        this.reviewItemsMatch == false
      )
        return;

      if (
        newStep == this.stepperDefs.processPayment &&
        this.stepperPage == this.stepperDefs.invoiceAdjustments &&
        fromStepperBtn == true &&
        this.isLocked == true &&
        this.hasLock == true
      ) {
        if (this.unsavedChanges == true) {
          // Log.logDebug(
          //   "Pressed 3 button (process payment) from Invoice Adjustments page for franchise ID " +
          //     this.$store.state.currentFranchise.franchiseNumber +
          //     " with unsaved changes.",
          //   "ReconcileWizard.vue switchStep"
          // );
          this.pleaseSaveDialog = true;
          return;
        }
        // else if (this.showSkip() == false) {
        // Log.logDebug(
        //   "Pressed 3 button (process payment) from Invoice Adjustments page for franchise ID " +
        //     this.$store.state.currentFranchise.franchiseNumber +
        //     "  with saved changes.",
        //   "ReconcileWizard.vue switchStep"
        // );
        // }
      }

      if (
        this.stepperPage == this.stepperDefs.invoiceAdjustments &&
        newStep == this.stepperDefs.reviewChanges &&
        fromStepperBtn == true &&
        this.isLocked == true &&
        this.hasLock == true
      ) {
        return this.save(true, newStep);
      }

      if (
        !this.hasStepperPermission("invoiceAdjustments", "update") ||
        this.isLocked
      ) {
        this.moveToStep(newStep);
        return;
      }

      if (newStep == this.stepperDefs.processPayment) {
        if (!this.canProcessPayment) {
          return;
        }
      }

      if (this.stepperPage == this.stepperDefs.complete) return;

      if (this.lockedBy == "scheduled") return;

      if (this.isLocked == true && !this.hasLock) return;

      if (!this.isLocked) {
        if (this.checkLock(true) == false) return;
      }

      this.resetPolicies();

      try {
        if (!this.listItems.length) return;

        if (newStep > this.stepperDefs.complete) newStep = 1;

        if (newStep < this.stepperPage) {
          if (
            this.stepperPage == this.stepperDefs.processPayment &&
            !fromStepperBtn
          ) {
            if (newStep == this.stepperPage - 1 && this.skipUsed == true) {
              this.skipUsed = false;
              this.stepperPage = this.stepperDefs.invoiceAdjustments;
            } else this.stepperPage = newStep;
          } else this.stepperPage = newStep;
        } else if (newStep > this.stepperPage) {
          if (
            fromStepperBtn &&
            this.stepperPage == this.stepperDefs.invoiceAdjustments
          ) {
            this.save(true, newStep);
            return;
          }
          if (newStep - this.stepperPage === 1) this.stepperPage = newStep;
          else if (
            this.skipUsed &&
            this.stepperPage == this.stepperDefs.invoiceAdjustments &&
            newStep == this.stepperDefs.processPayment
          )
            this.stepperPage = newStep;
        }
        if (this.stepperPage > this.maxPageViewed)
          this.maxPageViewed = this.stepperPage;
      } catch (e) {
        Log.logError(e, "ReconcileWizard.vue switchStep");
      }
    },
    moveToStep(newStep) {
      if (newStep == this.stepperDefs.processPayment) {
        if (!this.canProcessPayment) {
          return;
        }
      }
      if (newStep > this.stepperDefs.complete) newStep = 1;
      this.stepperPage = newStep;
    },
  
  },
  
};
</script>
<style scoped>
td {
  padding: 0px !important;
}
.v-text-field__details {
  padding: 0px !important;
  min-height: 0px !important;
}
.headers {
  font-size: 1.1rem;
}
.headerAmounts {
  font-size: 1.1rem;
  font-weight: bold;
}
@media (max-width: 600px) {
  .headers {
    font-size: 0.875rem;
  }
  .headerAmounts {
    font-size: 0.875rem;
  }
  .col {
    padding: 3px;
  }
}
.note {
  font-size: 1rem;
  font-weight: normal;
  font-style: italic;
}
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
  margin-top: 20px;
}
.removepadding {
  margin: 0;
  padding: 0;
}
.padRightSide {
  margin-right: 25px;
}
.padLeftSide {
  margin-left: 25px;
}
.v-text-field--outlined,
.v-text-field--solo {
  transition: none;
}

.v-text-field input {
  flex: 1 1 auto !important;
}
tr.v-row-group__header > td {
  color: #fff !important;
}
.v-input__control {
  max-height: 38px;
}
</style>
<style>
/* #dialogVerifyBankAccount {
  font-family: conceal;
}
#dialogBankAccount {
  font-family: conceal;
} */
/* .concealFont {
  font-family: conceal;
}
.normalFont {
  font-family: "Lato", Helvetica, Arial, sans-serif !important;
} */
.wrap-button span:first-child {
  width: 100%;
  white-space: normal;
}
.vue-treeselect__menu {
  z-index: 99 !important;
  font-family: "Lato", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #474c55;
  font-size: 16px;
}
#stepperOne td {
  font-size: 16px !important;
  border-right:2px solid lightgray;
}
#stepperTwo td {
  font-size: 16px !important;
  border-right:2px solid lightgray;
}
#scheduledInvoicesTable td{
  font-size: 16px !important;
  border-right:2px solid lightgray; 
}
#stepperOne th {
  font-size: 16px !important;
}
#stepperTwo td {
  font-size: 16px !important;
}
#stepperTwo th {
  font-size: 16px !important;
}
.theme--dark.v-data-table.v-data-table--fixed-header thead th {
  background: #44aba8;
}
.v-table.v-table--fixed-header > .v-table__wrapper > table > thead > tr > th {
background: #44aba8 !important;
}
/* @font-face {
  font-family: "conceal";
  src: url("~@/assets/text-security-disc.ttf") format("truetype");
  font-style: normal;
  font-weight: 400;
} */
div[role="alert"] > div > div.v-messages__message {
  color: red;
}
.v-data-table__wrapper {
  background: white;
}
.process-payment-title {
  width: 700px;
}
.process-payment-dueDate {
  text-align: right;
  word-break: break-word;
}
.v-sheet {
  z-index: 0;
}
.v-card__text div {
  word-break: break-word;
}
.v-card__text span { 
  word-break: break-word;
}
.no-border-row, .no-border-row td {
  border: none !important;
}
.alertbtn{
  margin-top:0px !important;
  color:white !important;
  background : rgb(49, 155, 69) !important;
}
.alerttext{
    color: rgba(0, 0, 0, .6) !important;
    font-size: .875rem !important;
    font-weight: 400 !important;
    line-height: 1.375rem !important;
    letter-spacing: .0071428571em !important;
    padding: 0px 24px 20px !important;
    margin-top: 10px !important;
}
.alertheadline{
      font-size: 1.5rem !important;
    font-weight: 500;
    letter-spacing: normal !important;
    line-height: 2rem;
    font-family: Roboto, sans-serif !important;
}
.alertbtnclose{
   margin-top:0px !important;
  color:white !important;
  background : rgb(0, 85, 140) !important;
 
}
.custom-tooltip {
    background: rgb(0, 85, 150) !important;
    opacity: 1 !important;
}
.banknametext{
    -webkit-box-flex: 1;
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
    font-size: 12px;
    min-height: 14px;
    min-width: 1px;
    position: relative;
    color: rgba(0, 0, 0, .6);
    margin-left:20px !important;
    margin-top:-20px !important;
}
</style>
