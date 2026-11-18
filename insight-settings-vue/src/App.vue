<script setup lang="ts">
import {onMounted, ref} from "vue";
import MainMenu from "./views/MainMenu.vue";
import ExplorerMenu from "./views/ExplorerMenu.vue";
import SettingsMenu from "./views/SettingsMenu.vue";
import Loading from "./views/Loading.vue";
import {Views} from "./statics/views";
import "./App.css";

const currentView = ref(Views.Loading);

function changeView(view: Views) {
  currentView.value = view;
  window.scrollTo(0, 0);
}

onMounted(() => {
  const interval = window.setInterval(() => {
    if (window.HomeyReady) {
      currentView.value = Views.MainMenu;
      window.clearInterval(interval);
    }
  }, 100);
});
</script>

<template>
  <!-- KeepAlive keeps the selected insight when the user opens the settings and comes back. -->
  <KeepAlive include="ExplorerMenu">
    <ExplorerMenu
      v-if="currentView === Views.Explorer"
      :change-view="changeView"
    />
    <SettingsMenu
      v-else-if="currentView === Views.Settings"
      :change-view="changeView"
    />
    <MainMenu
      v-else-if="currentView === Views.MainMenu"
      :change-view="changeView"
    />
    <Loading
      v-else
      :fullscreen="true"
    />
  </KeepAlive>
</template>
