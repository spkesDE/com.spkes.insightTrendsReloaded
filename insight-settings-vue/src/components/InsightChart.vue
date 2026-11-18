<script setup lang="ts">
import {Chart, Filler, LinearScale, LineElement, PointElement, ScatterController, Tooltip} from "chart.js";
import {onBeforeUnmount, onMounted, ref, watch} from "vue";

Chart.register(ScatterController, LineElement, PointElement, LinearScale, Filler, Tooltip);

export interface Point {
  x: number
  y: number
}

const props = defineProps<{
  data: Point[]
  trendLine: Point[]
  stepped: boolean
}>();

const canvas = ref<HTMLCanvasElement>();
let chart: Chart<"scatter"> | undefined;

function formatTime(value: number | string) {
  return new Date(Number(value)).toLocaleString([], {dateStyle: "short", timeStyle: "short"});
}

function update() {
  if (!chart) return;
  const [values, trend] = chart.data.datasets;
  values.data = props.data;
  values.stepped = props.stepped;
  trend.data = props.trendLine;
  // Without fixed bounds the linear scale rounds up and leaves an empty gap on the right.
  const x = chart.options.scales!.x!;
  x.min = props.data[0]?.x;
  x.max = props.data[props.data.length - 1]?.x;
  chart.update();
}

onMounted(() => {
  chart = new Chart(canvas.value!, {
    type: "scatter",
    data: {
      datasets: [
        {
          data: [],
          showLine: true,
          fill: true,
          borderColor: "#0070d8",
          backgroundColor: "rgba(0, 112, 216, .12)",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          data: [],
          showLine: true,
          borderColor: "rgba(79, 79, 79, .7)",
          borderWidth: 3,
          pointRadius: 0
        }
      ]
    },
    options: {
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            title: (items) => formatTime(items[0].parsed.x ?? 0),
            label: (item) => String(item.parsed.y)
          }
        }
      },
      interaction: {mode: "nearest", intersect: false},
      scales: {
        x: {type: "linear", grid: {display: false}, ticks: {callback: formatTime, maxTicksLimit: 4, color: "#6e6e73"}},
        y: {grid: {color: "#f1f2f6"}, ticks: {color: "#6e6e73"}}
      }
    }
  });
  update();
});

watch(() => [props.data, props.trendLine, props.stepped], update);

onBeforeUnmount(() => chart?.destroy());
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>
