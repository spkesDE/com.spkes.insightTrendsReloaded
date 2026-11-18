<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import Homey, {showError} from "../Homey";
import {Views} from "../statics/views";
import Loading from "./Loading.vue";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import MenuItemGroup from "../components/UIComps/MenuItemGroup.vue";
import MenuItemWrapper from "../components/UIComps/MenuItemWrapper.vue";
import Switch from "../components/UIComps/Switch.vue";

defineProps<{
  changeView: (view: Views) => void
}>();

// Keys and defaults match app.ts. Every change is saved at once.
const settings = reactive({
  significantFigures: false,
  significantFiguresValue: 5,
  ignoreTrendValue: false,
  filterNullValues: false,
  roundPercentage: false,
  useHumanizedTrend: false
});
type SettingKey = keyof typeof settings;

const gotData = ref(false);

onMounted(async () => {
  for (const key of Object.keys(settings) as SettingKey[]) {
    const value = await Homey.get(key);
    if (value !== undefined && value !== null) (settings as Record<SettingKey, unknown>)[key] = value;
  }
  gotData.value = true;
});

function save<K extends SettingKey>(key: K, value: (typeof settings)[K]) {
  settings[key] = value;
  Homey.set(key, value).catch(showError);
}
</script>

<template>
  <Loading
    v-if="!gotData"
    :fullscreen="true"
  />
  <MenuWrapper
    v-else
    :title="Homey.__('settings.settings')"
    :on-back="() => changeView(Views.MainMenu)"
  >
    <MenuItemGroup>
      <p class="itemGroupTitle">
        {{ Homey.__('settings.significantFiguresHeader') }}
      </p>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.significantFigures') }}</h2>
        <Switch
          :model-value="settings.significantFigures"
          @update:model-value="save('significantFigures', $event)"
        />
      </MenuItemWrapper>
      <template v-if="settings.significantFigures">
        <MenuItemWrapper>
          <h2>{{ Homey.__('settings.significantFiguresValue') }}</h2>
          <input
            v-model.number="settings.significantFiguresValue"
            class="rangeSlider"
            type="range"
            min="1"
            max="20"
            @change="save('significantFiguresValue', settings.significantFiguresValue)"
          />
          <span class="itemValue">{{ settings.significantFiguresValue }}</span>
        </MenuItemWrapper>
        <MenuItemWrapper>
          <h2>{{ Homey.__('settings.significantFiguresTrendValue') }}</h2>
          <Switch
            :model-value="settings.ignoreTrendValue"
            @update:model-value="save('ignoreTrendValue', $event)"
          />
        </MenuItemWrapper>
      </template>
    </MenuItemGroup>

    <MenuItemGroup>
      <p class="itemGroupTitle">
        {{ Homey.__('settings.miscSettings') }}
      </p>
      <MenuItemWrapper>
        <h2 v-html="Homey.__('settings.removeNullValues')"></h2>
        <Switch
          :model-value="settings.filterNullValues"
          @update:model-value="save('filterNullValues', $event)"
        />
      </MenuItemWrapper>
      <p class="itemGroupHint">
        <i class="fas fa-info-circle"></i>
        {{ Homey.__('settings.removeNullValuesInfo') }}
      </p>
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.humanizedTrend') }}</h2>
        <Switch
          :model-value="settings.useHumanizedTrend"
          @update:model-value="save('useHumanizedTrend', $event)"
        />
      </MenuItemWrapper>
      <p class="itemGroupHint">
        <i class="fas fa-info-circle"></i>
        {{ Homey.__('settings.humanizedTrendInfo') }}
      </p>
    </MenuItemGroup>

    <MenuItemGroup>
      <MenuItemWrapper>
        <h2>{{ Homey.__('settings.roundPercentage') }}</h2>
        <Switch
          :model-value="settings.roundPercentage"
          @update:model-value="save('roundPercentage', $event)"
        />
      </MenuItemWrapper>
    </MenuItemGroup>
  </MenuWrapper>
</template>
