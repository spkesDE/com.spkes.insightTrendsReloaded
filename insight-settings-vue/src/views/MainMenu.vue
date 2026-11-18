<script setup lang="ts">
import MenuItem from "../components/UIComps/MenuItem.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import Homey from "../Homey";
import {Views} from "../statics/views";

defineProps<{
  changeView: (view: Views) => void
}>();
</script>

<template>
  <div class="spacer"></div>
  <MenuItemGroup>
    <MenuItem
      :title="Homey.__('settings.mainMenu.explorer')"
      icon="fa-chart-line"
      class-name="bg-color-blue"
      @click="changeView(Views.Explorer)"
    />
    <MenuItem
      :title="Homey.__('settings.settings')"
      icon="fa-cog"
      class-name="bg-color-orange"
      @click="changeView(Views.Settings)"
    />
  </MenuItemGroup>
</template>
