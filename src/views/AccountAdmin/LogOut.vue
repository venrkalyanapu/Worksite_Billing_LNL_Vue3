<template>
  <div></div>
</template>
<script>
import Log from "@/log.js";
import eventBus from "@/event-bus.js";

export default {
  created() {
    try {
      eventBus.emit("cancelTokenRefresh");

      let curUserType = window.sessionStorage.getItem("type");
      let displayForbiddenMsg = false;
      console.log("enter");
      if (
        this.$store.state.currentUser.user != "" &&
        this.$route.query.status == "401"
      ) {
        displayForbiddenMsg = true;
      }

      this.$store.commit("clearCurrentUser");
      window.sessionStorage.setItem("user", "");
      window.sessionStorage.setItem("role", "");
      window.sessionStorage.setItem("type", "");
      window.sessionStorage.setItem("name", "");
      window.sessionStorage.setItem("franchises", "");

      this.$store.commit("setDisplayName", "");
      this.$store.commit("resetCurrentFranchise");
      this.$store.commit("setJWT", null);

      if (displayForbiddenMsg) {
        console.log("enter");
        this.$router.push("/login?login=" + curUserType + "&status=401");
      } else if (this.$route.query.timedOut == "true") {
        this.$router.push("/login?login=" + curUserType + "&timedOut=true");
      } else {
        this.$router.push("/?login=" + curUserType);
      }
    } catch (e) {
      Log.logError(e, "LogOut.vue created");
    }
  },
};
</script>