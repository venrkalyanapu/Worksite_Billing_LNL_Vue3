import '@mdi/font/css/materialdesignicons.css'
import "material-design-icons-iconfont/dist/material-design-icons.css";
import 'vuetify/styles'
import "vuetify/dist/vuetify.min.css";
// Composables
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VMaskInput } from 'vuetify/labs/VMaskInput'

export const vuetify = createVuetify({
  components: {
    VMaskInput,    
  },
  directives,
})