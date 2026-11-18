<script setup lang="ts">
import {computed, onActivated, ref} from "vue";
import Homey, {showError} from "../Homey";
import {Views} from "../statics/views";
import MenuWrapper from "../components/UIComps/MenuWrapper.vue";
import InsightChart, {type Point} from "../components/InsightChart.vue";
import StatTile from "../components/Explorer/StatTile.vue";
import EmptyCard from "../components/Explorer/EmptyCard.vue";
import "./ExplorerMenu.css";

defineProps<{
  changeView: (view: Views) => void
}>();

interface Insight {
  id: string
  uri: string
  name: string
  description?: string
  icon?: string
  type?: string
  units?: string
}

interface InsightData {
  data: Point[]
  trendLine: Point[]
  min: number
  max: number
  mean: number
  median: number
  standardDeviation: number
  trend: number
  trend_direction: string
  size: number
  firstvalue: number
  firstvalue_time: string
  firstvalue_timestamp: number
  lastvalue: number
  lastvalue_time: string
  lastvalue_timestamp: number
  percentile: number
}

const MAX_RESULTS = 25;

const TRENDS: Record<string, { icon: string, label: string }> = {
  up: {icon: "fa-arrow-trend-up", label: "settings.explorer.trendUp"},
  down: {icon: "fa-arrow-trend-down", label: "settings.explorer.trendDown"},
  flat: {icon: "fa-arrow-right", label: "settings.explorer.trendFlat"}
};

const query = ref("");
const results = ref<Insight[]>();
const selected = ref<Insight>();
const range = ref(24);
const unit = ref(60);
const percent = ref(50);
const data = ref<InsightData>();
const loading = ref(false);
let searchTimer: number | undefined;
let reloadQueued = false;

const units = computed(() => selected.value?.units ?? "");

// The app returns size 0 for an empty range. Older versions returned entries with timestamp 0.
const noData = computed(() => data.value !== undefined && (!data.value.size || data.value.firstvalue_timestamp === 0));

const trend = computed(() => TRENDS[data.value?.trend_direction ?? "flat"] ?? TRENDS.flat);

// The API sorts results by description (device or app name), so groups stay in order.
const resultGroups = computed(() => {
  const groups = new Map<string, Insight[]>();
  for (const insight of results.value ?? []) {
    const key = insight.description ?? "";
    groups.set(key, [...(groups.get(key) ?? []), insight]);
  }
  return [...groups].map(([name, insights]) => ({name, insights}));
});

// The API adds " (units)" to the name. The UI shows the unit separately.
function displayName(insight: Insight) {
  const suffix = insight.units ? ` (${insight.units})` : "";
  return suffix && insight.name.endsWith(suffix) ? insight.name.slice(0, -suffix.length) : insight.name;
}

function highlight(text: string) {
  const search = query.value.trim().toLowerCase();
  const start = search ? text.toLowerCase().indexOf(search) : -1;
  if (start < 0) return [{text, match: false}];
  const end = start + search.length;
  return [
    {text: text.slice(0, start), match: false},
    {text: text.slice(start, end), match: true},
    {text: text.slice(end), match: false}
  ];
}

function onSearchInput() {
  window.clearTimeout(searchTimer);
  if (query.value.trim().length < 2) {
    results.value = undefined;
    return;
  }
  searchTimer = window.setTimeout(async () => {
    const found = await Homey.api<Insight[]>("GET", `/searchInsights?search=${encodeURIComponent(query.value)}`)
      .catch(showError);
    results.value = (found ?? []).slice(0, MAX_RESULTS);
  }, 300);
}

function select(insight: Insight) {
  selected.value = insight;
  query.value = displayName(insight);
  results.value = undefined;
  data.value = undefined;
  void load();
}

async function load() {
  const insight = selected.value;
  if (!insight) return;
  // A change during a running request loads again when the request is done.
  if (loading.value) {
    reloadQueued = true;
    return;
  }
  loading.value = true;
  const params = new URLSearchParams({
    id: insight.id,
    uri: insight.uri,
    range: String(range.value || 24),
    unit: String(unit.value),
    percentile: String(percent.value),
    type: insight.type ?? ""
  });
  const result = await Homey.api<InsightData>("GET", `/getInsightCalculated?${params}`).catch(showError);
  if (insight === selected.value) data.value = result;
  loading.value = false;
  if (reloadQueued) {
    reloadQueued = false;
    void load();
  }
}

// Settings like significant figures change the result, so reload when the user comes back.
onActivated(load);
</script>

<template>
  <MenuWrapper
    :title="Homey.__('settings.mainMenu.explorer')"
    :on-back="() => changeView(Views.MainMenu)"
  >
    <div class="explorer">
      <label class="card searchField">
        <i class="fas fa-search"></i>
        <input
          v-model="query"
          class="hy-nostyle"
          type="search"
          :placeholder="Homey.__('settings.explorer.search')"
          @input="onSearchInput"
        />
      </label>

      <div
        v-if="results"
        class="card resultList"
      >
        <p
          v-if="results.length === 0"
          class="emptyRow"
        >
          {{ Homey.__('settings.explorer.noResults') }}
        </p>
        <template
          v-for="group in resultGroups"
          :key="group.name"
        >
          <div class="groupLabel">{{ group.name }}</div>
          <button
            v-for="insight in group.insights"
            :key="`${insight.uri}-${insight.id}`"
            type="button"
            class="resultItem hy-nostyle"
            @click="select(insight)"
          >
            <span class="iconTile">
              <img
                v-if="insight.icon"
                :src="insight.icon"
                alt=""
              />
            </span>
            <span class="resultName">
              <template
                v-for="(part, index) in highlight(displayName(insight))"
                :key="index"
              >
                <mark v-if="part.match">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
            <span
              v-if="insight.units"
              class="unit"
            >{{ insight.units }}</span>
            <i class="fas fa-chevron-right chevron"></i>
          </button>
        </template>
      </div>

      <EmptyCard
        v-if="!selected"
        icon="fa-chart-line"
        :title="Homey.__('settings.explorer.noSelection')"
        :text="Homey.__('settings.explorer.hint')"
      />

      <template v-else>
        <div class="card">
          <div class="insightHeader">
            <span class="iconTile large">
              <img
                v-if="selected.icon"
                :src="selected.icon"
                alt=""
              />
            </span>
            <div class="insightName">
              <strong>{{ displayName(selected) }}</strong>
              <span>{{ selected.description }}</span>
            </div>
            <div :class="['lastValue', {isLoading: loading}]">
              <span
                v-if="data && !noData"
                class="tileValue"
                :title="String(data.lastvalue)"
              >
                <strong class="tileNumber">{{ data.lastvalue }}</strong>
                <span class="unitSuffix">{{ units }}</span>
              </span>
              <strong
                v-else
                class="tileNumber placeholder"
              >–</strong>
              <small>{{ Homey.__('settings.lastValue') }}</small>
            </div>
          </div>
          <div class="rangeRow">
            <span>{{ Homey.__('settings.explorer.range') }}</span>
            <input
              v-model.number="range"
              class="hy-nostyle"
              type="number"
              min="1"
              placeholder="24"
              :aria-label="Homey.__('settings.explorer.range')"
              @change="load"
            />
            <select
              v-model.number="unit"
              class="hy-nostyle"
              @change="load"
            >
              <option :value="1">{{ Homey.__('settings.minutes') }}</option>
              <option :value="60">{{ Homey.__('settings.hours') }}</option>
              <option :value="1440">{{ Homey.__('settings.days') }}</option>
            </select>
            <button
              type="button"
              class="iconButton hy-nostyle"
              :disabled="loading"
              @click="load"
            >
              <i :class="['fas', 'fa-sync', {'fa-spin': loading}]"></i>
            </button>
          </div>
        </div>

        <EmptyCard
          v-if="noData"
          icon="fa-clock"
          :warning="true"
          :title="Homey.__('settings.explorer.noData')"
          :text="Homey.__('settings.explorer.noDataHint')"
        />

        <div
          v-else-if="data"
          :class="['explorerContent', {isLoading: loading}]"
        >
          <div class="card chartCard">
            <div class="cardTitle">
              {{ Homey.__('settings.explorer.history') }}
              <span class="legend">
                <span>{{ Homey.__('settings.explorer.value') }}</span>
                <span class="trendKey">{{ Homey.__('settings.trend') }}</span>
              </span>
            </div>
            <div
              v-if="units"
              class="axisUnit"
            >{{ units }}</div>
            <InsightChart
              :data="data.data ?? []"
              :trend-line="data.trendLine ?? []"
              :stepped="selected.type === 'boolean'"
            />
          </div>

          <section class="section">
            <h3 class="sectionTitle">{{ Homey.__('settings.explorer.statistics') }}</h3>
            <div class="card trendCard">
              <span :class="['trendIcon', data.trend_direction]">
                <i :class="['fas', trend.icon]"></i>
              </span>
              <div class="grow">
                <span class="tileLabel">{{ Homey.__('settings.trendDirection') }}</span>
                <strong>{{ Homey.__(trend.label) }}</strong>
              </div>
              <div class="right">
                <span class="tileLabel">{{ Homey.__('settings.trend') }}</span>
                <strong :title="String(data.trend)">{{ data.trend }}</strong>
              </div>
            </div>
            <div class="tileGrid">
              <StatTile :label="Homey.__('settings.minimum')" :value="data.min" :unit="units" />
              <StatTile :label="Homey.__('settings.maximum')" :value="data.max" :unit="units" />
              <StatTile :label="Homey.__('settings.average')" :value="data.mean" :unit="units" />
              <StatTile :label="Homey.__('settings.median')" :value="data.median" :unit="units" />
              <StatTile :label="Homey.__('settings.standardDeviation')" :value="data.standardDeviation" :unit="units" />
              <StatTile :label="Homey.__('settings.explorer.dataPoints')" :value="data.size" />
            </div>
          </section>

          <section class="section">
            <h3 class="sectionTitle">{{ Homey.__('settings.explorer.values') }}</h3>
            <div class="tileGrid">
              <StatTile :label="Homey.__('settings.firstValue')" :value="data.firstvalue" :unit="units">
                <span class="tileMeta">{{ data.firstvalue_time }}</span>
                <span class="tileMono">{{ data.firstvalue_timestamp }}</span>
              </StatTile>
              <StatTile :label="Homey.__('settings.lastValue')" :value="data.lastvalue" :unit="units">
                <span class="tileMeta">{{ data.lastvalue_time }}</span>
                <span class="tileMono">{{ data.lastvalue_timestamp }}</span>
              </StatTile>
            </div>
            <p class="sectionHint">{{ Homey.__('settings.explorer.tapHint') }}</p>
          </section>

          <section class="section">
            <h3 class="sectionTitle">{{ Homey.__('settings.percentile') }}</h3>
            <div class="card percentileCard">
              <div class="grow">
                <label for="percentileRange">
                  {{ Homey.__('settings.percent') }}: <strong>{{ percent }} %</strong>
                </label>
                <input
                  id="percentileRange"
                  v-model.number="percent"
                  class="hy-nostyle"
                  type="range"
                  min="0"
                  max="100"
                  @change="load"
                />
              </div>
              <div class="percentileResult">
                <span class="tileLabel">{{ Homey.__('settings.percentile') }}</span>
                <span
                  class="tileValue"
                  :title="String(data.percentile)"
                >
                  <strong class="tileNumber">{{ data.percentile }}</strong>
                  <span class="tileUnit">{{ units }}</span>
                </span>
              </div>
            </div>
          </section>
        </div>
      </template>
    </div>
  </MenuWrapper>
</template>
