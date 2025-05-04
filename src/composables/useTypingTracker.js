import { ref, computed } from 'vue';

export function useTypingTracker() {
  // State
  const intervals = ref([]);
  const anomalies = ref([]);  // Track anomalous intervals
  const keyTimes = ref([]);
  const backspaceCount = ref(0);
  const startTime = ref(null);
  const endTime = ref(null);

  // Threshold for anomaly detection (in milliseconds)
  const ANOMALY_THRESHOLD = 2.5; // multiplier of average

  // Reset all tracking data
  const resetTracking = () => {
    intervals.value = [];
    anomalies.value = [];
    keyTimes.value = [];
    backspaceCount.value = 0;
    startTime.value = null;
    endTime.value = null;
  };

  // Handle key press
  const handleKeyPress = (event) => {
    const currentTime = Date.now();

    // Initialize start time if this is the first key press
    if (!startTime.value) {
      startTime.value = currentTime;
    }

    // Update end time with each key press
    endTime.value = currentTime;

    // Track backspace usage
    if (event.key === 'Backspace') {
      backspaceCount.value++;
    }

    // Calculate interval from previous key press
    if (keyTimes.value.length > 0) {
      const lastKeyTime = keyTimes.value[keyTimes.value.length - 1];
      const interval = currentTime - lastKeyTime;
      intervals.value.push(interval);

      // Check for anomalies after we have a few intervals
      if (intervals.value.length > 3) {
        detectAnomalies();
      }
    }

    // Add current time to key times array
    keyTimes.value.push(currentTime);
  };

  // Detect anomalies in typing intervals
  const detectAnomalies = () => {
    // Calculate the average of all intervals except the last one
    const prevIntervals = intervals.value.slice(0, -1);
    const avg = prevIntervals.reduce((sum, val) => sum + val, 0) / prevIntervals.length;

    // Get the last interval
    const lastInterval = intervals.value[intervals.value.length - 1];

    // Check if the last interval is an anomaly
    if (lastInterval > avg * ANOMALY_THRESHOLD) {
      // Add the index of the anomalous interval
      anomalies.value.push(intervals.value.length - 1);
    }
  };

  // Computed properties
  const duration = computed(() => {
    if (!startTime.value || !endTime.value) return 0;
    return endTime.value - startTime.value;
  });

  const averageInterval = computed(() => {
    if (intervals.value.length === 0) return 0;
    const sum = intervals.value.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / intervals.value.length);
  });

  // Generate metrics JSON
  const metricsJson = computed(() => {
    return {
      intervals: intervals.value,
      duration: duration.value,
      backspaceCount: backspaceCount.value
    };
  });

  // Format JSON for display
  const formattedJson = computed(() => {
    return JSON.stringify(metricsJson.value, null, 2);
  });

  // Copy metrics to clipboard
  const copyMetrics = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson.value);
      return true;
    } catch (err) {
      console.error('Failed to copy metrics:', err);
      return false;
    }
  };

  return {
    intervals,
    anomalies,
    backspaceCount,
    duration,
    averageInterval,
    metricsJson,
    formattedJson,
    handleKeyPress,
    resetTracking,
    copyMetrics
  };
}
