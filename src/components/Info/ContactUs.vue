<template>
  <span id="contactUs">
    <div>
      <v-row justify="center" align-content="center" style="position:sticky !important;">
        <v-col cols="10">
          <v-card class="mx-auto">
             <v-toolbar density="compact" flat color="secondary"class="tbBackground px-4 py-3">
              <v-col class="d-flex align-center">
                <span class="font-weight-bold" style="font-size: 25px;">
                  Contact Us
                </span>
              </v-col>
              </v-toolbar>
          
            <br />
            <v-alert text color="success" v-if="showSuccessMessages">
              <v-row class="success-message">
                <ul id="successMessage">
                  <li v-for="message in successMessages" v-bind:key="message">
                    {{ message }}
                  </li>
                </ul>
              </v-row>
            </v-alert>

          

           <v-alert overlap transition="fade-transition" text color="warning" variant="tonal" v-if="showErrorMessages">
                <!-- <v-row class="error-message" > -->
                    <ul id="errorMessage" style="padding-left:20px;color:red;font-size:16px;">
                        <li v-for="message in errorMessages" v-bind:key="message">
                            {{ message }}
                        </li>
                    </ul>
                <!-- </v-row> -->
            </v-alert>
            
            <v-row justify="center" align-content="center"  >
              <v-col cols="10" sm="10" md="10" class="mx-auto mt-6 px-8" >
                <v-form ref="form" v-model="valid" lazy-validation style="margin-left:60px !important;; margin-right:60px !important;">
                  <v-row  style="padding-bottom: 5px;">
                    <v-text-field
                   
                      v-model="companyName"
                      :rules="companyNameRules"
                      label="*Company Name"
                      density="compact"
                       variant="outlined"
                     color="primary"
                      autocomplete="companyName"
                      ref=""
                      style="padding-bottom: 5px;"
                      class="custom-validation"
                    ></v-text-field>
                  </v-row>

                  <v-row>
                    <v-text-field style="padding-bottom: 5px;"
                      v-model="companyNumber"
                      :rules="companyNumberRules"
                      label="*Account Number"
                      density="compact"
                       variant="outlined"
                     color="primary"
                      autocomplete="companyNumber"
                      ref=""
                    ></v-text-field>
                  </v-row>

                  <v-row>
                    <v-mask-input
                      v-model="phone"
                      :rules="phoneRules"
                      mask="(###) ###-####"
                      label="*Telephone"
                      density="compact"
                       variant="outlined"
                     color="primary"
                      autocomplete="phone"
                      persistent-placeholder
                    ></v-mask-input>
                    
                  </v-row>

                  <v-row>
                    <v-text-field style="padding-bottom: 5px;"
                      v-model="emailAddress"
                      :rules="emailAddressRules"
                      label="*Email Address"
                      density="compact"
                       variant="outlined"
                     color="primary"
                      autocomplete="emailAddress"
                      ref=""
                    ></v-text-field>
                  </v-row>

                  <v-row>
                    <v-select style="padding-bottom: 5px;"
                      v-model="subject"
                      :items="comments"
                      label="*Subject"
                      :rules="subjectRules"
                      density="compact"
                       variant="outlined"
                     color="primary"
                      required
                    ></v-select>
                  </v-row>
                  <v-row>
                    <v-textarea style="padding-bottom: 5px;"
                      multi-line
                      v-model="question"
                      :rules="questionRules"
                      label="*Question/Comments"
                      density="compact"
                       variant="outlined"
                     color="primary"
                      rows="5"
                      autocomplete="question"
                      ref=""
                    ></v-textarea>
                  </v-row>

                  <v-col cols="9">
                    <v-row justify="center" class="mb-12">
                      <v-btn
                        color="#319B42"
                        dark
                        class="menuBtn"
                        ref=""
                        @click.stop="validate"
                        >Submit</v-btn
                      >
                    </v-row>
                  </v-col>
                </v-form>
              </v-col>
            </v-row>
            <br />
            <br />
            
          </v-card>
         <div class="py-8"></div>
        </v-col>
        
      </v-row>
    </div>
    <div>
      <span
        :class="
          $vuetify.display.smAndDown
            ? 'waitCircleLoginSm'
            : 'waitCircleLogin'
        "
        :style="
          $vuetify.display.smAndDown
            ? 'width:100%; color: #319B42;'
            : 'width: 25%; color: #319B42;'
        "
      >
        <v-row justify="center" align-content="center" align="center" column>
          <v-progress-circular
            v-if="waiting"
            indeterminate
            color="#319B42"
            :size="70"
            width="10"
          ></v-progress-circular>
          <br />
          <span class="status" v-if="waiting">{{ statusText }}</span>
        </v-row>
      </span>
    </div>
  </span>
</template>


<script>
import commentsList from "@/comments.js";
import { HTTP_Notify } from "@/HTTP-common.js";
import Log from "@/log.js";
import dataService from "@/services/dataService";
//import permissions from "@/permissions.js";

export default {
  name: "contactUs",
  data: () => ({
    waiting: false,
    showSuccessMessages: false,
    successMessages: [],
    showErrorMessages: false,
    errorMessages: [],
    modal: false,
    menu2: false,
    menu2small: false,
    valid: true,
    NA: false,
    rules: {},
    companyName: "",
    companyNameRules: [(v) => !!v || "Company Name is required."],
    companyNumber: "",
    companyNumberRules: [(v) => !!v || "Account Number is required."],
    phone: "",
    phoneRules: [
      (v) => !!v || "Primary phone number is required",

      (v) =>
        /^[\d{1}]?[ ]?[.\-( ]?[ ]?\d{3}[ ]?[.\-) ]?[ ]?\d{3}[.\- ]?\d{4}[ ]*$/.test(
          v
        ) || "Please enter a valid phone number with area code.",
    ],
    emailAddress: "",
    emailAddressRules: [
      (v) => !!v || "Email Address is required",
      (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Email address must be valid",
    ],
    subject: "",
    comments: commentsList,
    subjectRules: [(v) => !!v || "Please select a subject."],
    question: "",
    questionRules: [(v) => !!v || "Please enter Question/Comments."],

    uniqueId: -1,
  }),
  computed: {
    franchiseInfo() {
      try {
        return this.$store.state.currentFranchise;
      } catch (e) {
        Log.logError(e, "ContactUs.vue franchiseInfo");
        return "";
      }
    },
    franchisePhone() {
      try {
        return this.franchiseInfo.franchisePhone != null
          ? this.franchiseInfo.franchisePhone
          : "";
      } catch (e) {
        Log.logError(e, "ContactUs.vue franchisePhone");
        return "";
      }
    },
    franchiseName() {
      try {
        return this.franchiseInfo.franchiseName != "" &&
          this.franchiseInfo.franchiseName != null
          ? this.franchiseInfo.franchiseName
          : "UNKNOWN";
      } catch (e) {
        Log.logError(e, "ContactUs.vue franchiseName");
        return "UNKNOWN";
      }
    },
    userInfo() {
      try {
        return this.$store.state.currentUser.user;
      } catch (e) {
        Log.logError(e, "CompanyInfoPage.vue userInfo");
        return "";
      }
    },
  },

  methods: {
    setErrorMessages(errors) {
      this.waiting = false;
      if (Array.isArray(errors)) {
        this.errorMessages = errors;
      } else {
        this.errorMessages.push(errors);
      }
      if (this.errorMessages.length > 0) {
        this.showErrorMessages = true;
      }
    },
    setSuccessMessages(messages) {
      this.waiting = false;
      if (Array.isArray(messages)) {
        this.successMessages = messages;
      } else {
        this.successMessages.push(messages);
      }
      if (this.successMessages.length > 0) {
        this.showSuccessMessages = true;
      }
    },

    close() {
      this.cleanup();
      this.dialog = false;
    },

    getContactUsSubjects() {
      dataService.getContactUsSubjects().then((response) => {
        let responseData = response.data;
        if (responseData.statusCode == 200) {
          this.subject = responseData.backOfficeDetails[0].subject;
        }
      });
    },
  async validate() {
  try {
    const { valid } = await this.$refs.form.validate();

    if (!valid) {
      
      return; 
    }
          this.statusText = "submitting...";
          this.waiting = true;
          this.showSuccessMessages = false;
          this.showErrorMessages = false;
          this.successMessages = [];

    HTTP_Notify.get("NonCCMNotification/WorkSiteContactUSEmail", {
      params: {
              companyName: this.companyName,
              companyId: this.companyNumber,
              phone: this.phone.replace(/[{()}]/g, '').replace(/\s/g, '').replace(/-/g, '').trim(),
              emailAddress: this.emailAddress,
              subject: this.subject,
              comments: this.question,
            },
    })
    .then((response) => {
      if (response.data === "Successfully submitted") {
        this.setSuccessMessages("Information has been submitted successfully.");
      } else {
        // ONLY show this if the server actually rejects the data
        this.setErrorMessages("Company Information was not submitted, please check with administrator.");
      }
    })
    .catch((e) => {
      Log.logError(e, "ContactUs.vue validate (1)");
      this.setErrorMessages("Company Information was not submitted, please check with administrator.");
    })
    .finally(() => {
      this.waiting = false;
    });

  } catch (e) {
    Log.logError(e, "ContactUs.vue validate (2)");
    this.waiting = false;
  }
}
,
  },

  created() {
    this.statusText = "Getting...";
    this.waiting = true;
    this.companyName = this.franchiseInfo.franchiseName;
    this.companyNumber = this.franchiseInfo.franchiseNumber;
    if (this.franchiseInfo.franchisePhone) 
    {
    this.phone = this.franchiseInfo.franchisePhone.replace(/\D/g, '');
    }
    //this.emailAddress = this.userInfo;
    this.waiting = false;
  },
};
</script>
<style scoped>
.menuBtn {
  margin-top: 10px;
  text-transform: none !important;
  letter-spacing: normal;
  border-radius: 20px;
}
.title {
  color: #fafafa;
  line-height: 1.2;
  margin-bottom: 2px;
}
.subtitle {
  color: #fafafa;
  font-size: 0.875rem;
  line-height: 1.2;
}
.tbBackground {
  background-color: #44aba8;
  /* background-color: #00558c; */
}
.waitCircleLogin {
  position: fixed;
  top: 40%;
  left: 25%;
}
.waitCircleLoginSm {
  position: fixed;
  top: 25%;
  left: 0%;
}
:deep(.v-messages__message) {
  text-align: left; 
}

:deep(.v-input__details) {
  padding-inline-start: 10px !important; 
  margin-inline-start: 0px !important;
}
</style>

