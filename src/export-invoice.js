import jsPDF from "jspdf";
import "../ocr-aregular-normal.js";
import "jspdf-autotable";
import { applyPlugin } from 'jspdf-autotable'

import dateFormat from "dateformat";

import Log from "@/log.js";

import { HTTP } from "@/HTTP-common.js";
import { HTTP_Excel } from "@/HTTP-common.js";
// import { ContactUsURL } from "@/HTTP-common.js";

import {store} from "@/store.js";
import eventBus from "@/event-bus.js";
import {createApp} from "vue";
import { globalProperties } from './main.js'; 
import glLnlSmBlue from '@/assets/glLnlSmBlue.png';
applyPlugin(jsPDF);

export default {
  listHistDetailItems: [],
  additionalDetails: [],
  invoiceId: 0,
  invoiceStatus: "",

  headers: [
    {
      text: "Policy Number",
      value: "policyNumber",
      filterable: false,
      width: 50,
    },
    {
      text: "Policy Type",
      value: "policyType",
      filterable: false,
      width: 50,
    },
    {
      text: "Policy Description",
      value: "policyShortDescription",
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
      text: "Emp ID",
      value: "employeeId",
      filterable: false,
      width: 50,
    },
    {
      text: "Employee Name",
      value: "name",
      filterable: false,
      width: 135,
    },
    {
      text: "Insured Name",
      value: "insuredName",
      filterable: false,
      width: 135,
    },
    { text: "Due Date", value: "dueDate", filterable: false, width: 50 },
    {
      text: "Premium Deducted",
      value: "premiumDeducted",
      filterable: false,
      width: 50,
    },
    {
      text: "Total Premium",
      value: "totalPremium",
      filterable: false,
      width: 40,
    },

    {
      text: "Change Reason",
      value: "changeCode",
      filterable: false,
      width: 50,
    },
    {
      text: "Adjusted Amount",
      value: "adjustedAmount",
      filterable: false,
      width: 50,
    },
    {
      text: "Total After Adjustment",
      value: "totalAfterAdjustment",
      filterable: false,
      width: 75,
    },
  ],

  invoiceHistory: store.state.invoiceHistory,
  mainColor: store.state.mainColor,
  dueDate: "",

  discrepancyNote : "Note: - Adjustment details are only available for online payments",
  adjustmentCodes : [
    { changeCode : `C`, description : `Cancel` },
    { changeCode : `D`, description : `Deceased` },
    { changeCode : `E`, description : `Never our Employee` },
    { changeCode : `F`, description : `Family Medical Leave` },
    { changeCode : `L`, description : `Leave of Absence` },
    { changeCode : `M`, description : `Missed Deduction` },
    { changeCode : `R`, description : `Retired` },
    { changeCode : `T`, description : `Employee Terminated` },
    { changeCode : `CSW`, description : `Cancel Still Working` },
    { changeCode : `COE`, description : `Cancel Open Enrollment` },
    { changeCode : `TMP`, description : `Temporary` },
    { changeCode : `CSW-M`, description : `Marriage` },
    { changeCode : `CSW-DIV`, description : `"Divorce, legal separation, or annulment of marriage"` },
    { changeCode : `CSW-DTH`, description : `Death of spouse or dependent` },
    { changeCode : `CSW-BTH`, description : `Birth or adoption or placement for adoption of a child` },
    { changeCode : `CSW-ESTS`, description : `Change in employee?s employment status` },
    { changeCode : `CSW-SSTS`, description : `Change in spouse?s employment status` },
    { changeCode : `CSW-DSTS`, description : `Change in dependent?s employment status` },
    { changeCode : `CSW-DELG`, description : `"Dependent is no longer eligible for coverage because of age, student status, or similar change"` },
    { changeCode : `CSW-CRT`, description : `"Court order connected to a domestic relations case (e.g., a divorce or custody change) requiring coverage for a dependent child under your plan or another person?s plan, and the child is actually enrolled in your plan or the other plan as a result of the order"` },
    { changeCode : `CSW-MEDC`, description : `"Employee/spouse/dependent becomes entitled to coverage under Medicare or Medicaid, or loses coverage under Medicare or Medicaid, and increases or decreases the premium paid under employee?s health plan"` },
    { changeCode : `CSW-CFE`, description : `"Spouse or dependent, if employed, makes a change in coverage under his or her cafeteria plan and employee makes a corresponding change under this plan that is on account of the change under spouse?s or dependent?s cafeteria plan"` },
    { changeCode : `CSW-FMLA`, description : `Employee revokes existing group health coverage while on leave under the Family and Medical Leave Act of 1993 (FMLA)` },
    { changeCode : `CSW-ESTS-RH`, description : `Recently hired` },
    { changeCode : `CSW-ESTS-RT`, description : `Recently terminated` },
    { changeCode : `CSW-ESTS-BULA`, description : `Begins unpaid leave of absence` },
    { changeCode : `CSW-ESTS-EULA`, description : `Ends unpaid leave of absence` },
    { changeCode : `CSW-ESTS-PS`, description : `Participates in a strike` },
    { changeCode : `CSW-ESTS-PL`, description : `Participates in a lockout` },
    { changeCode : `CSW-ESTS-SDELG`, description : `"Change in the employee?s/spouse?s/dependent?s eligibility for employer-provided coverage (e.g., goes from part-time to full-time or from hourly to salaried)"` },
    { changeCode : `CSW-SSTS-RH`, description : `Recently hired` },
    { changeCode : `CSW-SSTS-RT`, description : `Recently terminated` },
    { changeCode : `CSW-SSTS-BULA`, description : `Begins unpaid leave of absence` },
    { changeCode : `CSW-SSTS-EULA`, description : `Ends unpaid leave of absence` },
    { changeCode : `CSW-SSTS-PS`, description : `Participates in a strike` },
    { changeCode : `CSW-SSTS-PL`, description : `Participates in a lockout` },
    { changeCode : `CSW-SSTS-SDELG`, description : `"Change in the employee?s/spouse?s/dependent?s eligibility for employer-provided coverage (e.g., goes from part-time to full-time or from hourly to salaried)"` },
    { changeCode : `CSW-DSTS-RH`, description : `Recently hired` },
    { changeCode : `CSW-DSTS-RT`, description : `Recently terminated` },
    { changeCode : `CSW-DSTS-BULA`, description : `Begins unpaid leave of absence` },
    { changeCode : `CSW-DSTS-EULA`, description : `Ends unpaid leave of absence` },
    { changeCode : `CSW-DSTS-PS`, description : `Participates in a strike` },
    { changeCode : `CSW-DSTS-PL`, description : `Participates in a lockout` },
    { changeCode : `CSW-DSTS-SDELG`, description : `"Change in the employee?s/spouse?s/dependent?s eligibility for employer-provided coverage (e.g., goes from part-time to full-time or from hourly to salaried)"` },
    { changeCode : `TMP-N`, description : `No Paycheck` },
    { changeCode : `TMP-O`, description : `Other` },
    { changeCode : `TMP-L`, description : `Leave of Absence` },
    { changeCode : `TMP-M`, description : `Missed Deduction` }
  ],

  totalBilled() {
    let ret = 0;
    try {
      for (let item of this.listHistDetailItems) {
        if (item.totalPremium) ret += parseFloat(item.totalPremium);
      }
    } catch (e) {
      Log.logError(e, "export-invoice.js totalBilled");
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
      Log.logError(e, "export-invoice.js totalAdjusted");
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
      Log.logError(e, "export-invoice.js totalDue");
    }

    return ret;
  },

  crosswalkChangeCode(value) {
    if (!value) {
      return;
    }
    //TODO: move adjCode to store
    let changeCodeItem = this.adjustmentCodes.find(e => e.changeCode.toUpperCase() == value.toUpperCase());
    if (changeCodeItem) {
      value = changeCodeItem.description;
    }
    return value;
  },
  generateInvoiceExcel(invoice) {
    this.dueDate = invoice.dueDate;
    this.generateInvoice(invoice, 1);
  },
  generateInvoicePDF(invoice) {
    this.dueDate = invoice.dueDate;
    this.generateInvoice(invoice, 2);
  },
  generateInvoice(invoice, exportForm) {
    this.invoiceId = invoice.invoiceId;
    this.invoiceStatus = invoice.invoiceStatus;
    HTTP.get("InvoiceHistory/GetInvoiceHistoryDetails", {
      params: {
        invoiceId: this.invoiceId,
      }
    })
      .then((response) => {
        if (response.status != 200) {
          Log.logError(
            response.statusText,

            "export-invoice.js generateInvoice InvoiceHistory/GetInvoiceHistoryDetails response"
          );
          eventBus.emit("errDialog");
        } else {
          try {
           
            this.listHistDetailItems = response.data.invoicesDetails;

            HTTP.get("InvoiceHistory/GetInvoiceAdditionalDetails", {
              params: {
                invoiceId: this.invoiceId,
              },
            })
              .then((response) => {
                if (response.status != 200) {
                  Log.logError(
                    response.statusText,
                    "export-invoice.js generateInvoice InvoiceHistory/GetInvoiceAdditionalDetails response"
                  );
                  eventBus.emit("errDialog");
                } else {
                  try {
                    this.additionalDetails = response.data.additionalDetails[0];

                    if (exportForm === 1) this.generateExcel();
                    else this.generatePDF(); 
                  } catch (e) {
                    eventBus.emit("errDialog");
                    Log.logError(
                      e,
                      "export-invoice.js generateInvoice InvoiceHistory/GetInvoiceAdditionalDetails response"
                    );
                  }
                }
              })
              .catch((e) => {
                Log.logError(
                  e,
                  "export-invoice.js generateInvoice InvoiceHistory/GetInvoiceAdditionalDetails"
                );
                eventBus.emit("errDialog");
              });
          } catch (e) {
            eventBus.emit("errDialog");
            Log.logError(
              e,
              "export-invoice.js generateInvoice InvoiceHistroy/GetInvoiceHistoryDetails"
            );
          }
        }
      })
      .catch((e) => {
        eventBus.emit("errDialog");

        Log.logError(e, "export-invoice.js generateInvoice");
      });
  },
  generateData(headers, pdfdata) {
    var result = [];

    try {
      let curEmployee = "";
      let adjAmt = 0.0;

      for (let i = 0; i < pdfdata.length; i++) {
        let dataArray = [];

        for (let j = 0; j < headers.length; j++) {
          dataArray.push(pdfdata[i][headers[j].value]);
        }

        dataArray.push(""); // Totals column

        if (curEmployee != pdfdata[i]["name"]) {
          if (curEmployee != "") {
            let totalsArray = [];
            for (let x = 0; x < headers.length; x++) {
              totalsArray.push("");
            }

            totalsArray.push(globalProperties.$filters.money(adjAmt.toString()));
            result.push(totalsArray);
          }

          curEmployee = pdfdata[i]["name"];
          adjAmt = parseFloat(
            pdfdata[i]["totalAfterAdjustment"].replace("$", "").replace(",", "")
          );
        } else {
          adjAmt += parseFloat(
            pdfdata[i]["totalAfterAdjustment"].replace("$", "").replace(",", "")
          );
        }

        result.push(dataArray);
      }

      let totalsArray = [];
      for (let x = 0; x < headers.length; x++) {
        totalsArray.push("");
      }

      totalsArray.push(globalProperties.$filters.money(adjAmt.toString()));
      result.push(totalsArray);
    } catch (e) {
      Log.logError(e, "export-invoice.js generateData");
    }

    return result;
  },
  createHeaders(headers) {
    var result = [];

    try {
      for (var i = 0; i < headers.length; i += 1) {
        let shortenedName = headers[i].text;
        let dataKey = headers[i].text.replace(" ", "").toLowerCase();

        switch (headers[i].text) {
          case "Policy Number":
            shortenedName = "Policy";
            break;
          case "Policy Type":
            shortenedName = "Type - Description";
            break;
          case "Emp ID":
            shortenedName = "Emp ID";
            break;
          case "Total Premium":
            shortenedName = "Total Premium";
            break;
          case "Policy Description":
            shortenedName = "Desc";
            break;
          case "Total After Adjustment":
            shortenedName = "Total After Adjustment";
            dataKey = "totalafteradjustment";
            break;
        }

        result.push({
          header: shortenedName,
          dataKey: dataKey,
        });
      }
      result.push({
        header: "Total By Employee",
        dataKey: "total",
      });
    } catch (e) {
      Log.logError(e, "export-invoice.js createHeaders");
    }

    return result;
  },
  formatDataPDF(headers, items) {
    let dataArray = [];
    try {
      for (let i = 0; i < items.length; i++) {
        let newItem = {};

        for (let j = 0; j < headers.length; j++) {
          let value = items[i][headers[j].value];

          if (value === undefined) value = "";

          switch (headers[j].value) {
            case "dueDate":
              value = globalProperties.$filters.mdyyyy(value);
              break;

            case "changeCode":
              value = this.crosswalkChangeCode(value);
              break;

            case "adjustedAmount":
            case "totalPremium":
            case "totalAfterAdjustment":
            case "premiumDeducted":
              value = globalProperties.$filters.money(value);
              break;           

            // case "employeeId":
            //   value =
            //     value.toString() == store.state.currentFranchise.franchiseNumber
            //       ? ""
            //       : value;
            //   break;
          }

          newItem[headers[j].value] = value;
        }

        dataArray.push(newItem);
      }
    } catch (e) {
      Log.logError(e, "export-invoice.js formatDataPDF");
    }
    return dataArray;
  },
  generatePDF() {
    try {
      var doc = new jsPDF("l", "pt", "a4");
let finalY = 0;
      let formattedData = this.formatDataPDF(
        this.headers,
        this.listHistDetailItems
      );
      let pdfData = this.generateData(this.headers, formattedData);
     
      let pdfHeaders = this.createHeaders(this.headers);
      
      let newPdfData = this.filterPdfHeader(pdfHeaders, pdfData);
    
      pdfData = newPdfData;

      let logo = new Image();
      logo.src = glLnlSmBlue;

      doc.addImage(logo, "PNG", 50, 50, 200, 40);

      doc.setTextColor("#474c55");

      doc.setFont("helvetica");
      doc.setFontSize("12");

      let paidOrDue = "Total Amount Paid: ";

      let paidOrDueAmt = globalProperties.$filters.money(
        this.additionalDetails.paymentAmount
      );

      let totalDue = this.totalDue();

      if (this.invoiceStatus.toLowerCase() != "paid") {
        paidOrDue = "Total Amount Due: ";
        paidOrDueAmt = globalProperties.$filters.money(totalDue);
      }

      let totalBilled = this.totalBilled();
      let totalAdjusted = this.totalAdjusted();
     
      //PCR #11
      let displayTotalAdjusted = totalAdjusted;
      let detailsAdjustSum = 0;
      if (this.listHistDetailItems) {
        this.listHistDetailItems.forEach(e=> { 
          if (e.adjustedAmount) {
            detailsAdjustSum += e.adjustedAmount;
          }
        });
      }      
      let hasDiscrepancy = false;
      if (this.additionalDetails.paymentAmount > 0) {
        if (this.additionalDetails.paymentAmount != this.additionalDetails.totalAmountBilled) {
          if ((!this.additionalDetails.totalAdjustedAmount || this.additionalDetails.totalAdjustedAmount == 0) && detailsAdjustSum == 0) {
            displayTotalAdjusted = (this.additionalDetails.paymentAmount - this.additionalDetails.totalAmountBilled);
            hasDiscrepancy = true;
          }
        }      
      }

      doc.text(["Due Date: ", "Delinquent Date: "], 50, 175, { align: "left" });

      doc.text(
        [
          globalProperties.$filters.mdyyyy(this.dueDate),
          globalProperties.$filters.mdyyyy(this.additionalDetails.delinquentDate),
        ],
        150,
        175,
        { align: "left" }
      );

      doc.text(["Total Amount Billed: ", "Total Amount Adjusted: "], 300, 175, {
        align: "left",
      });

      doc.text(
        [
          globalProperties.$filters.money(totalBilled),
          //createApp.options.filters.money(totalAdjusted),
          globalProperties.$filters.money(displayTotalAdjusted),
        ],
        450,
        175,
        { align: "left" }
      );

      if (paidOrDue.startsWith("Total Amount Due")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize("16");
        doc.text(paidOrDue, 550, 175, { align: "left" });
        doc.text(paidOrDueAmt, 695, 175, { align: "left" });
      } else {
        doc.text(paidOrDue, 550, 175, { align: "left" });
        doc.text(paidOrDueAmt, 695, 175, { align: "left" });
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize("12");

      doc.setFontSize("10");
      doc.text(
        "ACCOUNT NUMBER: " + store.state.currentFranchise.franchiseNumber,
        550,
        70
      );
      doc.text(store.state.currentFranchise.franchiseName, 550, 80);
      doc.text(store.state.currentFranchise.franchiseAddr1, 550, 90);
      doc.text(store.state.currentFranchise.franchiseAddr2, 550, 100);
      if (!this.hasAddressLine2(store.state.currentFranchise.franchiseAddr2))
      {
        doc.text(store.state.currentFranchise.franchiseCSZ, 550, 100);
      } else {
        doc.text(store.state.currentFranchise.franchiseCSZ, 550, 110);
      }

      if (hasDiscrepancy) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize("10");
        doc.text(
          this.discrepancyNote,
          50,
          220
        );
      }

    finalY = 250;

      // begin tear-away

      // if (store.state.currentFranchise.printBillMode != "W")
      {

        doc.setFont("helvetica", "bold");
        doc.setFontSize("10");
        doc.text(
          "Paying by Mail? Return with Your Payment & Adjustments. Paying Online? Keep for Your Records.",
          150,
          finalY + 10
        );
        doc.setLineDash([10, 10], 0);
        doc.line(20, finalY + 20, 820, finalY + 20);
        doc.setLineDash(0);

        finalY += 15;

        doc.setFont("times", "bold");
        doc.setFontSize("16");

        doc.text("PAYROLL DEDUCTION NOTICE", 450, finalY + 50);

        doc.setFont("helvetica", "bold");
        doc.setFontSize("12");

        doc.text("AGENCY", 475, finalY + 100);
        doc.text("ACCOUNT NUMBER", 570, finalY + 100);

        doc.text("DUE DATE", 475, finalY + 150);
        doc.text("DELINQUENT AFTER", 575, finalY + 150);

        doc.setFont("helvetica", "bold");
        doc.setFontSize("14");
        doc.text("TOTAL AMOUNT DUE", 475, finalY + 210);

        doc.setFont("helvetica", "normal");
        doc.setFontSize("12");

        doc.text(
          globalProperties.$filters.mdyyyy(this.additionalDetails.delinquentDate),
          605,
          finalY + 170
        );
        doc.text(globalProperties.$filters.mdyyyy(this.dueDate), 480, finalY + 170);

        doc.setFont("helvetica", "bold");
        doc.setFontSize("14");
        doc.text(globalProperties.$filters.money(totalDue), 640, finalY + 210);
        doc.setFont("helvetica", "normal");
        doc.setFontSize("12");

        doc.text(
          store.state.currentFranchise.franchiseNumber,
          610,
          finalY + 115
        );
        if (this.additionalDetails.branchID)
          doc.text(this.additionalDetails.branchID.trim(), 495, finalY + 115);

        doc.setFont("helvetica", "bold");
        doc.setFontSize("12");

        doc.text("Globe Life Liberty National Division", 75, finalY + 170);

        doc.setFont("helvetica", "bold");
        doc.setFontSize("10");

        doc.text("Attn: Worksite Billing Department", 75, finalY + 180);
        doc.text("P.O. Box 248889-73124", 75, finalY + 190);
        doc.text("Oklahoma City, OK 73124-8889", 75, finalY + 200);

        doc.setFont("times", "normal");
        doc.setFontSize("10");
        doc.text(
          "ACCOUNT NUMBER: " + store.state.currentFranchise.franchiseNumber,
          75,
          finalY + 80
        );
        doc.text(store.state.currentFranchise.franchiseName, 75, finalY + 90);
        doc.text(store.state.currentFranchise.franchiseAddr1, 75, finalY + 100);
        doc.text(store.state.currentFranchise.franchiseAddr2, 75, finalY + 110);
        if (!this.hasAddressLine2(store.state.currentFranchise.franchiseAddr2))
        {
          doc.text(store.state.currentFranchise.franchiseCSZ, 75, finalY + 110);
        } else {
          doc.text(store.state.currentFranchise.franchiseCSZ, 75, finalY + 120);
        }
        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 0);
        doc.rect(420, finalY + 240, 347, 20, "F");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(
          "RETURN THIS STUB WITH PAYMENT AND ADJUSTMENTS",
          425,
          finalY + 255
        );
        doc.setTextColor("#474c55");

        doc.setFont("ocr-aregular", "normal");
        doc.setFontSize(14);
        if (
          this.additionalDetails.pdfMICRLine &&
          this.additionalDetails.pdfMICRLine != ""
        )
          doc.text(this.additionalDetails.pdfMICRLine, 450, finalY + 285);

        finalY += 285;
      }

      // end tear away
      let pageNumber = 1;
      let chunkSize = 11;

      let numPages =
        Math.floor(pdfData.length / chunkSize) +
        (pdfData.length % chunkSize > 0 ? 1 : 0);

      for (pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        let chunkedPdfData = this.getChunkedData(
          pdfData,
          pageNumber,
          chunkSize
        );

        if (chunkedPdfData.length == 0) {
          break;
        }

        doc.addPage("a4", "landscape");

        finalY = 0;

        doc.setFont("helvetica", "normal");
        doc.setFontSize("10");

        doc.text("Account Number: ", 40, 55, { align: "left" });

        doc.text(
          store.state.currentFranchise.franchiseNumber +
            " " +
            store.state.currentFranchise.franchiseName,
          125,
          55,
          { align: "left" }
        );
        doc.text("Due Date: ", 40, 65);
        doc.text(globalProperties.$filters.mdyyyy(this.dueDate), 125, 65, {
          align: "left",
        });

        doc.text(
          "Page " + pageNumber.toString() + " of " + numPages.toString(),
          735,
          65
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize("11");
        doc.autoTable({
          theme: "striped",
          styles: { fontSize: 9 },
          columns: pdfHeaders,
          body: chunkedPdfData,
          startY: 70,
          headStyles: { fillColor: "#64CCC9" },
          columnStyles: {
            policynumber: { cellWidth: 70 },
            policytype: { cellWidth: 90 },
            //policydescription: { cellWidth: 60 },
            empid: { cellWidth: 40 },
            employeename: { cellWidth: 85 },
            insuredname: { cellWidth: 85 },
            duedate: { cellWidth: 60 },
            premiumdeducted: { cellWidth: 55 },            
            totalpremium: { cellWidth: 55},
            //changereason: { cellWidth: 70 },
            adjustedamount: { cellWidth: 50 },            
            totalafteradjustment: { cellWidth: 60 },            
            total: { cellWidth: 55 },
          },
        });
      }

       finalY = doc.lastAutoTable.finalY;

      doc.save(
        "InvoiceView_" +
          store.state.currentFranchise.franchiseNumber +
          "_" +
          dateFormat(Date.now(), "mmddyyyy") +
          "_" +
          dateFormat(Date.now(), "hhMMss") +
          ".pdf"
      );
    } catch (e) {
      Log.logError(e, "export-invoice.js generatePDF");
    }
  },
  filterPdfHeader(pdfHeaders, pdfData){
    let newPdfData = this.combineTypeDesc(pdfHeaders, pdfData);
    newPdfData = this.moveChangeReason(pdfHeaders, pdfData);
    return newPdfData;
  }, 
  combineTypeDesc(pdfHeaders, pdfData){
    var typeIndex = pdfHeaders.findIndex(function(h) {
      return h.dataKey == 'policytype';
    });
    var descIndex = pdfHeaders.findIndex(function(h) {
      return h.dataKey == 'policydescription';
    });
    if (typeIndex < 0 || descIndex < 0) {
      return;
    }
    for (let row of pdfData) {
      let type = row[typeIndex] ? row[typeIndex] : '';
      let desc = row[descIndex] ? row[descIndex] : '';  
      let combined = (desc.length > 0) ? (type + ' -\n' + desc) : type;
      row[typeIndex] = combined;
    }    
    //remove desc column
    pdfHeaders.splice(descIndex, 1);
    pdfData.forEach(function(row) {
      row.splice(descIndex, 1);
    });
    return pdfData;
  },
  moveChangeReason(pdfHeaders, pdfData) {

    var index = pdfHeaders.findIndex(function(h) {
      return h.dataKey == 'changereason';
    });
    if (index < 0) {
      return;
    }
    let newPdfData = [];
    for (let row of pdfData) {
      let newRow = [];
      for (let cell of row) {
        newRow.push(cell ? cell.trim() : '');
      }
      newPdfData.push(newRow);
      //push reason in new row
      let changeReason = row[index] ? row[index].trim() : '';
      if (changeReason.length > 0) {
        newPdfData.push([{ "content" : 'Change Reason: ' + changeReason, "colSpan" : row.length - 1, styles: { fontSize: 8.5 } } ]);
      }
    }    
    //remove column
    pdfHeaders.splice(index, 1);
    newPdfData.forEach(function(row) {
      row.splice(index, 1);
    });
    return newPdfData;
  },
  hasAddressLine2(addr2){
    return (addr2 && addr2.trim().length > 0);
  },
  getChunkedData(pdfData, pageNumber, chunkSize) {
    let page = 0;

    for (let idx = 0; idx < pdfData.length; idx += chunkSize) {
      let subArray = [];

      page++;
      for (let cntr = idx; cntr < idx + chunkSize; cntr++) {
        if (pdfData[cntr]) subArray.push(pdfData[cntr]);
      }

      if (page == pageNumber) {
        return subArray;
      }
    }

    return [];
  },
  getHeadersExcel(headers) {
    let result = [];

    try {
      for (let j = 0; j < headers.length; j++) {
        result.push(headers[j]);
      }
      result.push({
        text: "Total By Employee",
        value: "totalByEmployee",
        filterable: false,
        width: 75,
      });
    } catch (e) {
      Log.logError(e, "export-invoice.js getHeadersExcel");
    }

    return result;
  },
  formatDataExcel(headers, items) {
    let dataArray = [];

    let curEmployee = "";
    let adjAmt = 0.0;

    try {
      for (let i = 0; i < items.length; i++) {
        let newItem = {};

        for (let j = 0; j < headers.length; j++) {
          let value = items[i][headers[j].value];

          if (value === undefined) value = "";

          switch (headers[j].value) {
            case "dueDate":
              value = globalProperties.$filters.mdyyyy(value);
              break;

            case "changeCode":
              value = this.crosswalkChangeCode(value);
              break;

            case "adjustedAmount":
            case "premiumDeducted":
            case "totalAfterAdjustment":
            case "totalPremium":
              value = globalProperties.$filters.money(value);
              break;
            // case "isSection125":
            //   value = createApp.options.filters.boolYesNo(value);
            //   break;

            // case "employeeId":
            //   value =
            //     value.toString() == store.state.currentFranchise.franchiseNumber
            //       ? ""
            //       : value;
            //   break;
          }

          value = value ? value : "";
          newItem[headers[j].value] = value;
        }

        newItem["totalByEmployee"] = ""; // Totals column

        if (curEmployee != items[i]["name"]) {
          // console.log(curEmployee);
          // console.log(adjAmt);

          if (curEmployee != "") {
            let totalsItem = {};
            for (let x = 0; x < headers.length; x++) {
              totalsItem[headers[x].value] = "";
            }

            totalsItem["totalByEmployee"] = globalProperties.$filters.money(
              adjAmt.toString()
            );
            dataArray.push(totalsItem);
          }
          // console.log(items[i]);
          curEmployee = items[i]["name"];
          adjAmt = items[i]["totalAfterAdjustment"];
        } else {
          adjAmt += items[i]["totalAfterAdjustment"];
        }

        dataArray.push(newItem);
      }

      let totalsItem = {};
      for (let x = 0; x < headers.length; x++) {
        totalsItem[headers[x].value] = "";
      }

      totalsItem["totalByEmployee"] = globalProperties.$filters.money(
        adjAmt.toString()
      );

      dataArray.push(totalsItem);
    } catch (e) {
      Log.logError(e, "export-invoice.js formatDataExcel");
    }

      //PCR 12, add total line
      let lastTotalsItem = this.getLastTotalsItem();
      dataArray.push(lastTotalsItem);

    return dataArray;
  },
  getLastTotalsItem() {
    let lastTotalsItem = {};
    for (let x = 0; x < this.headers.length; x++) {
      lastTotalsItem[this.headers[x].value] = "";
    }
    let totalDeducted = 0;
    let totalPremium = 0;
    let totalAfterAdjustment = 0;
    for (let item of this.listHistDetailItems) {
      if (item.premiumDeducted) totalDeducted += parseFloat(item.premiumDeducted);
      if (item.totalPremium) totalPremium += parseFloat(item.totalPremium);
      if (item.totalAfterAdjustment) totalAfterAdjustment += parseFloat(item.totalAfterAdjustment);
    }    
    lastTotalsItem["policyNumber"] = "Totals";    
    lastTotalsItem["premiumDeducted"] = globalProperties.$filters.money(totalDeducted.toString());
    lastTotalsItem["totalPremium"] = globalProperties.$filters.money(totalPremium.toString());
    lastTotalsItem["totalAfterAdjustment"] = globalProperties.$filters.money(totalAfterAdjustment.toString());
    lastTotalsItem["totalByEmployee"] = "";
  return lastTotalsItem;
  },
  s2ab(s) {
    try {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    } catch (e) {
      Log.logError(e, "export-invoice.js s2ab");
      try {
        if (s != null) return new ArrayBuffer(s.length);
      } catch (e) {
        Log.logError(e, "export-invoice.js s2ab catch");
        throw e;
      }
    }
  },
  generateExcel() {
    try {
      eventBus.emit("excelWait");

      let paidOrDelinquent =
        "Invoice Paid Date: " +
        globalProperties.$filters.mdyyyy(this.additionalDetails.paymentDate);

      let paidOrDue =
        "Total Amount Paid: " +
        globalProperties.$filters.money(this.additionalDetails.paymentAmount);

      let totalDue = this.totalDue();

      if (this.invoiceStatus.toLowerCase() != "paid") {
        paidOrDelinquent =
          "Invoice Delinquent Date: " +
          globalProperties.$filters.mdyyyy(this.additionalDetails.delinquentDate);

        paidOrDue = "Total Amount Due: " + globalProperties.$filters.money(totalDue);
      }

      let totalBilled = this.totalBilled();
      let totalAdjusted = this.totalAdjusted();

      //PCR #11
      let displayTotalAdjusted = totalAdjusted;
      let detailsAdjustSum = 0;
      if (this.listHistDetailItems) {
        this.listHistDetailItems.forEach(e=> { 
          if (e.adjustedAmount) {
            detailsAdjustSum += e.adjustedAmount;
          }
        });
      }      
      let hasDiscrepancy = false;
      if (this.additionalDetails.paymentAmount > 0) {
        if (this.additionalDetails.paymentAmount != this.additionalDetails.totalAmountBilled) {
          if ((!this.additionalDetails.totalAdjustedAmount || this.additionalDetails.totalAdjustedAmount == 0)  
              && detailsAdjustSum == 0) {
            displayTotalAdjusted = (this.additionalDetails.paymentAmount - this.additionalDetails.totalAmountBilled);
            hasDiscrepancy = true;
          }
        }      
      }

      let invoice_body = {
        fileName:
          "invoice_" +
          store.state.currentFranchise.franchiseNumber +
          "_" +
          dateFormat(Date.now(), "mmddyyyy") +
          "_" +
          dateFormat(Date.now(), "hhMMss"),
        headers: this.getHeadersExcel(this.headers),
        invoices: this.formatDataExcel(this.headers, this.listHistDetailItems),
        footerData: {
          rows: [
            // {
            //   row:
            //     "*Total premium or a portion of the premium for these policies may be eligible for pretax.",
            //   style: "italic"
            // }
          ],
        },
        summaryData: {
          rows: [
            {
              row:
                "Company: " +
                store.state.currentFranchise.franchiseNumber +
                " " +
                store.state.currentFranchise.franchiseName,
              style: "bold",
            },
            {
              row:
                "Invoice Due Date: " + globalProperties.$filters.mdyyyy(this.dueDate),
              style: "bold",
            },
            {
              row: paidOrDelinquent,
              style: "bold",
            },
            // { row: "Current Status: " + this.status, style: "bold" },
            {
              row:
                "Total Amount Billed: " +
                globalProperties.$filters.money(totalBilled),
              style: "bold",
            },
            {
              row:
                "Total Amount Adjusted: " +
                globalProperties.$filters.money(displayTotalAdjusted),
              style: "bold",
            },
            { row: paidOrDue, style: "bold" },
            // { row: "", style: "" },
            // {
            //   row:
            //     "Adjusted Statement of Employee Payroll Deduction Insurance After Account Reconciliation",
            //   style: "italic"
            // },

            { row: "", style: "" },
          ],
        },
      };

      //PCR 11
      if (hasDiscrepancy) {
        invoice_body.summaryData.rows.push(
          {
            row: this.discrepancyNote, style: "bold",
          },
        );
      }

      HTTP_Excel.post("Export/invoice", invoice_body)
        .then((response) => {
          try {
            var blob = new Blob([this.s2ab(atob(response.data))], {
              type: "",
            });

            var fileURL = window.URL.createObjectURL(blob);
            var fileLink = document.createElement("a");

            fileLink.href = fileURL;
            fileLink.setAttribute("download", invoice_body.fileName + ".xlsx");
            document.body.appendChild(fileLink);

            eventBus.emit("excelDone");

            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(
                blob,
                invoice_body.fileName + ".xlsx"
              );
            } else {
              fileLink.click();
            }
          } catch (e) {
            eventBus.emit("excelDone");
            eventBus.emit("errDialog");

            Log.logError(
              e,
              "export-invoice.js generateExcel export/invoice response"
            );
            throw e;
          }
        })
        .catch((e) => {
          eventBus.emit("excelDone");
          eventBus.emit("errDialog");

          Log.logError(e, "export-invoice.js generateExcel export/invoice");
        });
    } catch (e) {
      eventBus.emit("excelDone");
      eventBus.emit("errDialog");

      Log.logError(e, "export-invoice.js generateExcel");
    }
  },
};
