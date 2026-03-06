/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
//import { registerPlugins } from '@/plugins'

// Components


// Composables
import { createApp } from 'vue'
import App from './App.vue'
import {vuetify} from "./plugins/vuetify";
import { store } from './store';
import { router } from './router'
import Log  from "@/log.js";
import { useCookies } from "vue3-cookies";
import { VueMaskDirective } from 'v-mask'
import '@mdi/font/css/materialdesignicons.css' 
import dateFormat from "dateformat";
import 'vuetify/styles'
 
// Styles

import "./styles/global.css";

import { HTTP } from "./HTTP-common.js"
import { HTTP_Excel } from "./HTTP-common.js"
import { HTTP_SA } from "./HTTP-common.js"
import { HTTP_Log } from "./HTTP-common.js"
import { HTTP_HATS } from "./HTTP-common.js"
import { HTTP_Notify } from "./HTTP-common.js"
import { HTTP_Account } from "./HTTP-common.js"
import { format } from 'date-fns';

const app = createApp(App);
app.use(store);
app.use(router);
app.use(vuetify);
app.directive('mask', VueMaskDirective); 
app.mount('#app');
const { cookies } = useCookies();
export const globalProperties = app.config.globalProperties;
//createApp(App).use(store).mount('#app')

app.config.globalProperties.$filters = {
  boolYesNo(value) {
    try {
    if (value == null || value == undefined || value == "") return "";

    if (value.toString().toLowerCase() === "true") return "Yes";

    return "No";
  } catch (e) {
    Log.logError(e, "main.js boolYesNo filter");
    return value;
  }
  },
  money(value) {
    try {
      
    let amt = "";
    let negative = false;

    if (value === 0) return "$0.00";

    if (value == null || value == undefined || value == "") return "";

    amt = parseFloat(value).toFixed(2);

    if (amt < 0) {
      negative = true;
      amt = (amt * -1).toFixed(2);
    }

    var parts = amt.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let ret = "$" + parts.join(".");

    if (negative) {
      ret = "(" + ret + ")";
    }

    return ret;
  } catch (e) {
    Log.logError(e, "main.js money filter");

    return value;
  }
},
   mmddyyyy(value) {
  try {

    let newDate = format(value, 'MM/dd/yyyy');
if(newDate == "12/31/1969") newDate = format(new Date(),'MM/dd/yyyy');
    if (newDate == "01/01/1900") newDate = "";
    return newDate;
  } catch (e) {
    Log.logError(e, "main.js mmddyyyy filter");
    return value;
  }
   },
   dateTime(value) {
    try {
   
 let newDate = format(value, 'MM/dd/yyyy hh:mm aa');
    if (newDate == "01/01/1900") newDate = "";

    return newDate;
  } catch (e) {
    Log.logError(e, "main.js mmddyyyy filter");
    return value;
  }
   },
   mdyyyy(value) {
     try {
let newDate = format(value, 'M/d/yyyy');
    if (newDate == "1/1/1900") newDate = "";

    return newDate;
  } catch (e) {
    Log.logError(e, "main.js mdyyyy filter");
    return value;
  }
   },
    toCurrency(value) {
        try {
    if (!value) return '';
      var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    });
    return formatter.format(value);
  } catch (e) {
    Log.logError(e, "main.js toCurrency filter");

    return value;
  }
    }
}



HTTP.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    if (store.state.tok && store.state.tok != '') {
      config.headers.Verify = store.state.tok;
    }
    // if (store.state.session && store.state.session != '') {
    //   config.headers.Session = store.state.session;
    // }
    resolve(config);
  });

});


HTTP_Excel.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    if (store.state.tok && store.state.tok != '')     
        config.headers.Verify = store.state.tok;
      resolve(config);
  });

});

HTTP_SA.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    if (store.state.tok && store.state.tok != '')     
         config.headers.Verify = store.state.tok;
      resolve(config);
  });

});

HTTP_Log.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    if (store.state.tok && store.state.tok != '')     
         config.headers.Verify = store.state.tok;
      resolve(config);
  });

});

HTTP_HATS.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    if (store.state.tok && store.state.tok != '')     
         config.headers.Verify = store.state.tok;
      resolve(config);
  });

});

HTTP_Notify.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    if (store.state.tok && store.state.tok != '')     
         config.headers.Verify = store.state.tok;
      resolve(config);
  });

});

HTTP_Account.interceptors.request.use(function (config) {
  return new Promise((resolve) => {
    if (store.state.tok && store.state.tok != '')     
         config.headers.Verify = store.state.tok;
      resolve(config);
  });

});
//------

HTTP.interceptors.response.use(function(response){
  
  

  return new Promise((resolve)=>{
    try{  
    if (response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
          router.push("/logout?status=401");
      }
      resolve(response);
    }
    catch{
      resolve(response);
    }
  });
}
, function(error){
  
  

    try{
    if (error.response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
      router.push("/logout?status=401");
    }
    return Promise.reject(error);
  }
  catch{ return Promise.reject(error);}
  }
  
  );

HTTP_HATS.interceptors.response.use(function(response){
  
  

  return new Promise((resolve)=>{
    try{  
    if (response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
          router.push("/logout?status=401");
      }
      resolve(response);
    }
    catch{
      resolve(response);
    }
  });
}
, function(error){
  
  

    try{
    if (error.response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
      router.push("/logout?status=401");
    }
    return Promise.reject(error);
  }
  catch{ return Promise.reject(error);}
  }
  
  );

HTTP_Log.interceptors.response.use(function(response){
  
  

  return new Promise((resolve)=>{
    try{  
    if (response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
          router.push("/logout?status=401");
      }
      resolve(response);
    }
    catch{
      resolve(response);
    }
  });
}
, function(error){
  
  

    try{
    if (error.response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
      router.push("/logout?status=401");
    }
    return Promise.reject(error);
  }
  catch{ return Promise.reject(error);}
  }
  
  );

HTTP_SA.interceptors.response.use(function(response){
  
  

  return new Promise((resolve)=>{
    try{  
    if (response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
          router.push("/logout?status=401");
      }
      resolve(response);
    }
    catch{
      resolve(response);
    }
  });
}
, function(error){
  
  

    try{
    if (error.response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
      router.push("/logout?status=401");
    }
    return Promise.reject(error);
  }
  catch{ return Promise.reject(error);}
  }
  
  );

HTTP_Notify.interceptors.response.use(function(response){
  
  

  return new Promise((resolve)=>{
    try{  
    if (response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
          router.push("/logout?status=401");
      }
      resolve(response);
    }
    catch{
      resolve(response);
    }
  });
}
, function(error){
  
  

    try{
    if (error.response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
      router.push("/logout?status=401");
    }
    return Promise.reject(error);
  }
  catch{ return Promise.reject(error);}
  }
  
  );

HTTP_Account.interceptors.response.use(function(response){
  
  

  return new Promise((resolve)=>{
    try{  
    if (response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
          router.push("/logout?status=401");
      }
      resolve(response);
    }
    catch{
      resolve(response);
    }
  });
}
, function(error){
  
  

    try{
    if (error.response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
      router.push("/logout?status=401");
    }
    return Promise.reject(error);
  }
  catch{ return Promise.reject(error);}
  }
  
  );

HTTP_Excel.interceptors.response.use(function(response){
  
  

  return new Promise((resolve)=>{
    try{  
    if (response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
          router.push("/logout?status=401");
      }
      resolve(response);
    }
    catch{
      resolve(response);
    }
  });
}
, function(error){
  
  

    try{
    if (error.response.status == 401 && router.currentRoute.path.toLowerCase() != "/login"){
      router.push("/logout?status=401");
    }
    return Promise.reject(error);
  }
  catch{ return Promise.reject(error);}
  }
  
  );
