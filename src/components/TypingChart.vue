<template>
  <div class="typing-chart-container">
    <canvas ref="chartCanvas" width="400" height="200"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, toRaw } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  intervals: {
    type: Array,
    default: () => []
  },
  anomalies: {
    type: Array,
    default: () => []
  }
});

const chartCanvas = ref(null);
let chart = null;

const createChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');

  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy();
  }

  // Create new chart
  // Use toRaw to avoid Vue's reactivity system causing infinite loops
  const rawIntervals = toRaw(props.intervals);
  const rawAnomalies = toRaw(props.anomalies);

  // Create background colors array with anomalies highlighted in red
  const backgroundColors = rawIntervals.map((_, index) => {
    return rawAnomalies.includes(index) ? 'rgba(255, 50, 50, 0.7)' : 'rgba(0, 240, 255, 0.5)';
  });

  // Create border colors array with anomalies highlighted in red
  const borderColors = rawIntervals.map((_, index) => {
    return rawAnomalies.includes(index) ? 'rgba(255, 50, 50, 1)' : 'rgba(0, 240, 255, 1)';
  });

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rawIntervals.map((_, index) => `Key ${index + 1}`),
      datasets: [{
        label: 'Typing Intervals (ms)',
        data: [...rawIntervals], // Create a shallow copy to avoid reactivity issues
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#c3d0e0'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#c3d0e0',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#c3d0e0'
          }
        },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              return `Key ${tooltipItems[0].dataIndex + 1}`;
            },
            label: (context) => {
              const ms = context.parsed.y;
              const isAnomaly = rawAnomalies.includes(context.dataIndex);
              return [
                `Interval: ${ms} ms`,
                isAnomaly ? '⚠️ Unusually slow typing detected' : ''
              ].filter(Boolean);
            }
          },
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          titleColor: '#00f0ff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(0, 240, 255, 0.3)',
          borderWidth: 1,
          padding: 10,
          displayColors: false
        }
      }
    }
  });
};

// Watch for changes in intervals and update chart
watch(() => props.intervals, (newIntervals) => {
  // Only update chart if we have data
  if (newIntervals && newIntervals.length > 0) {
    createChart();
  }
}, { deep: true });

onMounted(() => {
  // Only create chart if we have data
  if (props.intervals && props.intervals.length > 0) {
    createChart();
  }
});
</script>

<style scoped>
.typing-chart-container {
  width: 100%;
  height: 200px;
}
</style>
