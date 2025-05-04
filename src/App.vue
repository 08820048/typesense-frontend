<script setup>
import { ref, onMounted } from 'vue';
import TypingChart from './components/TypingChart.vue';
import { useTypingTracker } from './composables/useTypingTracker';

// Use the typing tracker composable
const {
  intervals,
  anomalies,
  backspaceCount,
  duration,
  averageInterval,
  formattedJson,
  handleKeyPress,
  resetTracking,
  copyMetrics
} = useTypingTracker();

// Refs
const inputText = ref('');
const isCopied = ref(false);

// Handle copy button
const handleCopy = async () => {
  const success = await copyMetrics();
  if (success) {
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  }
};

// Reset everything
const handleReset = () => {
  inputText.value = '';
  resetTracking();
  isCopied.value = false;
};

// Focus the input field on mount
onMounted(() => {
  document.getElementById('typing-input').focus();
});
</script>

<template>
  <main style="min-height: 100vh; padding: 1rem; display: flex; flex-direction: column; gap: 1.5rem; background-color: #0f0f1a; color: #c3d0e0;">
    <!-- Left side: Input area -->
    <div class="glass-panel" style="width: 100%; display: flex; flex-direction: column;">
      <h1 class="highlight-text" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">TypeSense</h1>
      <p style="margin-bottom: 1.5rem; font-size: 0.875rem; opacity: 0.8;">Type something to generate your unique typing rhythm fingerprint</p>

      <textarea
        id="typing-input"
        v-model="inputText"
        @keydown="handleKeyPress"
        class="input-glow"
        style="flex-grow: 1; padding: 1rem; background-color: rgba(255, 255, 255, 0.05); border-radius: 0.5rem; font-family: 'JetBrains Mono', monospace; resize: none; outline: none; min-height: 150px;"
        placeholder="Start typing here..."
      ></textarea>

      <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <button @click="handleReset" class="btn">
          Reset
        </button>
        <div style="font-size: 0.875rem; opacity: 0.7;">
          {{ inputText.length }} characters
        </div>
      </div>
    </div>

    <!-- Right side: Metrics panel -->
    <div class="glass-panel" style="width: 100%; display: flex; flex-direction: column;">
      <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Your Typing Metrics</h2>

      <!-- Metrics display -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="glass-panel" style="text-align: center;">
          <div class="highlight-text" style="font-size: 1.5rem;">{{ averageInterval }}</div>
          <div style="font-size: 0.75rem; opacity: 0.7;">Avg. Interval (ms)</div>
        </div>
        <div class="glass-panel" style="text-align: center;">
          <div class="highlight-text" style="font-size: 1.5rem;">{{ duration }}</div>
          <div style="font-size: 0.75rem; opacity: 0.7;">Duration (ms)</div>
        </div>
        <div class="glass-panel" style="text-align: center;">
          <div class="highlight-text" style="font-size: 1.5rem;">{{ backspaceCount }}</div>
          <div style="font-size: 0.75rem; opacity: 0.7;">Backspaces</div>
        </div>
      </div>

      <!-- Chart -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 0.875rem; font-weight: bold; margin-bottom: 0.5rem;">Rhythm Visualization</h3>
        <TypingChart :intervals="intervals" :anomalies="anomalies" />
      </div>

      <!-- JSON output -->
      <div style="margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h3 style="font-size: 0.875rem; font-weight: bold;">Keyprint JSON</h3>
          <button @click="handleCopy" class="btn btn-highlight" style="font-size: 0.75rem; padding: 0.25rem 0.75rem;">
            {{ isCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <pre style="background-color: rgba(0, 0, 0, 0.3); padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; overflow: auto; max-height: 10rem;">{{ formattedJson }}</pre>
      </div>
    </div>
  </main>
</template>

<style scoped>
@media (min-width: 768px) {
  main {
    flex-direction: row !important;
    padding: 2rem !important;
  }
}

.input-glow {
  box-shadow: 0 0 0 0 rgba(0, 240, 255, 0);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.input-glow:focus {
  outline: none;
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.25), 0 0 15px rgba(0, 240, 255, 0.2);
}
</style>
