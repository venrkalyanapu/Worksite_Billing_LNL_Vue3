<template>
  <div>
    <v-row justify="center" align-content="center">
      <v-container>
        <v-col cols="10">
        <v-card class="mx-auto">
          <header class="px-2 py-3 v-sheet v-sheet--tile theme--dark v-toolbar v-toolbar--flat tbBackground">
            <v-container style="padding-top: 10px; padding-left: 10px;">
              <span class="title">Worksite Online Billing Training</span>
              <br />
              <span class="text-subtitle-2">
              </span>
            </v-container>
          </header>
          <br />
          <br />
          <v-row justify="center" align-content="center" >
            <v-container>
             <v-col cols="10">
              <div class='embed-container'>
                <iframe src='https://player.vimeo.com/video/499388277' frameborder='0' 
                webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen="true">
                </iframe>
              </div>
             </v-col>
            </v-container>
          </v-row>
          <br />
        </v-card>
        </v-col>
      </v-container>
    </v-row>
</div>
</template>
<style scoped>
.embed-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  max-width: 100%;
}

.embed-container iframe,
.embed-container object,
.embed-container embed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.title {
    font-size: 1.25rem !important;
    font-weight: 500;
    letter-spacing: .0125em !important;
    line-height: 2rem;
    font-family: Roboto, sans-serif !important;   
    border-color: #1e1e1e;
    color: #fff;
}
</style>