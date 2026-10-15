import { createApp } from "vue";
import { Quasar } from "quasar";
import "quasar/src/css/index.sass";
import "@quasar/extras/material-icons/material-icons.css";
import App from "./App.vue";

createApp(App).use(Quasar, { config: { brand: { primary: "#6d5dfc", secondary: "#19c6a3" } } }).mount("#app");
