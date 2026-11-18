import {createApp} from "vue";
import App from "./App.vue";
import "./index.css";

if (import.meta.env.DEV && !window.Homey) {
  const {installHomeyMock} = await import("./devMock");
  installHomeyMock();
}

createApp(App).mount("#app");
