<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import TypingChart from './components/TypingChart.vue';
import { useTypingTracker } from './composables/useTypingTracker';
import { storeKeyprint, verifyKeyprint } from './services/api';

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
const userId = ref('');
const isStoring = ref(false);
const isVerifying = ref(false);
const apiResponse = ref(null);
const apiError = ref(null);
const mode = ref('store'); // 'store' or 'verify'

// Watch for mode changes and reset data
watch(mode, (newMode) => {
  console.log('Mode changed to:', newMode);
  handleFullReset();
});

// Computed properties
const hasEnoughData = computed(() => {
  return intervals.value.length >= 5 && inputText.value.length >= 10;
});

const keyprintData = computed(() => {
  return {
    intervals: intervals.value,
    duration: duration.value,
    backspaceCount: backspaceCount.value
  };
});

// API interaction functions
const storeUserKeyprint = async () => {
  console.log('Store button clicked');
  console.log('User ID:', userId.value);
  console.log('Has enough data:', hasEnoughData.value);
  console.log('Keyprint data:', keyprintData.value);

  if (!userId.value) {
    apiError.value = 'Please enter a user ID';
    console.log('Error: No user ID');
    return;
  }

  if (!hasEnoughData.value) {
    apiError.value = 'Please type more text to generate a reliable keyprint';
    console.log('Error: Not enough data');
    return;
  }

  console.log('Starting API call to store keyprint...');

  try {
    console.log('Starting API call...');
    isStoring.value = true;
    apiError.value = null;
    apiResponse.value = null;

    console.log('Sending data to API:', {
      userId: userId.value,
      keyprint: keyprintData.value
    });

    const response = await storeKeyprint(userId.value, keyprintData.value);
    console.log('API response received:', response);
    apiResponse.value = response;
    console.log('Keyprint stored successfully:', response);
  } catch (error) {
    console.error('API error:', error);
    apiError.value = `Failed to store keyprint: ${error.message}`;
  } finally {
    console.log('API call completed, isStoring set to false');
    isStoring.value = false;
  }
};

const verifyUserKeyprint = async () => {
  console.log('Verify button clicked');
  console.log('User ID:', userId.value);
  console.log('Has enough data:', hasEnoughData.value);
  console.log('Keyprint data:', keyprintData.value);

  if (!userId.value) {
    apiError.value = 'Please enter a user ID';
    console.log('Error: No user ID');
    return;
  }

  if (!hasEnoughData.value) {
    apiError.value = 'Please type more text to generate a reliable keyprint';
    console.log('Error: Not enough data');
    return;
  }

  console.log('Starting API call to verify keyprint...');

  try {
    console.log('Starting verification API call...');
    isVerifying.value = true;
    apiError.value = null;
    apiResponse.value = null;

    console.log('Sending verification data to API:', {
      userId: userId.value,
      keyprint: keyprintData.value
    });

    const response = await verifyKeyprint(userId.value, keyprintData.value);
    console.log('Verification API response received:', response);

    // Ensure response has the expected format
    if (response && typeof response === 'object') {
      if (response.match_ === undefined) {
        console.warn('API response missing match_ property:', response);
        response.match_ = false;
      }

      if (response.similarity === undefined || isNaN(response.similarity)) {
        console.warn('API response missing or invalid similarity property:', response);
        response.similarity = 0;
      }
    } else {
      console.error('Invalid API response format:', response);
      throw new Error('Invalid API response format');
    }

    apiResponse.value = response;
    console.log('Keyprint verification result:', response);
  } catch (error) {
    console.error('Verification API error:', error);
    apiError.value = `Failed to verify keyprint: ${error.message}`;
  } finally {
    console.log('Verification API call completed, isVerifying set to false');
    isVerifying.value = false;
  }
};

// Reset everything including API state
const handleFullReset = () => {
  resetTracking();
  inputText.value = '';
  apiResponse.value = null;
  apiError.value = null;
  isCopied.value = false;
};

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

// Reset typing data only
const handleReset = () => {
  handleFullReset();
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
      <p style="margin-bottom: 1rem; font-size: 0.875rem; opacity: 0.8;">Type something to generate your unique typing rhythm fingerprint</p>

      <!-- Mode selection -->
      <div style="display: flex; margin-bottom: 1rem;">
        <button
          @click="mode = 'store'"
          class="btn"
          :style="{
            backgroundColor: mode === 'store' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            color: mode === 'store' ? '#00f0ff' : '#c3d0e0',
            marginRight: '0.5rem'
          }"
        >
          Store Keyprint
        </button>
        <button
          @click="mode = 'verify'"
          class="btn"
          :style="{
            backgroundColor: mode === 'verify' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            color: mode === 'verify' ? '#00f0ff' : '#c3d0e0'
          }"
        >
          Verify Keyprint
        </button>
      </div>

      <!-- User ID input -->
      <div style="margin-bottom: 1rem;">
        <label for="user-id" style="display: block; font-size: 0.875rem; margin-bottom: 0.5rem;">
          User ID:
        </label>
        <input
          id="user-id"
          v-model="userId"
          type="text"
          class="input-glow"
          style="width: 100%; padding: 0.5rem; background-color: rgba(255, 255, 255, 0.05); border-radius: 0.25rem; font-family: 'JetBrains Mono', monospace; border: 1px solid rgba(255, 255, 255, 0.1);"
          placeholder="Enter user ID"
        />
      </div>

      <textarea
        id="typing-input"
        v-model="inputText"
        @keydown="handleKeyPress"
        class="input-glow"
        style="flex-grow: 1; padding: 1rem; background-color: rgba(255, 255, 255, 0.05); border-radius: 0.5rem; font-family: 'JetBrains Mono', monospace; resize: none; outline: none; min-height: 150px;"
        placeholder="Start typing here..."
      ></textarea>

      <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 0.5rem;">
          <button @click="handleReset" class="btn">
            Reset
          </button>

          <button
            v-if="mode === 'store'"
            @click="storeUserKeyprint"
            class="btn btn-highlight tooltip-container"
            :disabled="isStoring || !hasEnoughData || !userId"
            :style="{ opacity: (hasEnoughData && userId) ? 1 : 0.5 }"
          >
            <span class="tooltip" v-if="!userId">
              Please enter a user ID
            </span>
            <span class="tooltip" v-else-if="!hasEnoughData">
              Please type more text to generate a reliable keyprint
            </span>
            <span class="tooltip" v-else-if="isStoring">
              Request in progress...
            </span>
            {{ isStoring ? 'Storing...' : 'Store Keyprint' }}
          </button>

          <button
            v-if="mode === 'verify'"
            @click="verifyUserKeyprint"
            class="btn btn-highlight tooltip-container"
            :disabled="isVerifying || !hasEnoughData || !userId"
            :style="{ opacity: (hasEnoughData && userId) ? 1 : 0.5 }"
          >
            <span class="tooltip" v-if="!userId">
              Please enter a user ID
            </span>
            <span class="tooltip" v-else-if="!hasEnoughData">
              Please type more text to generate a reliable keyprint
            </span>
            <span class="tooltip" v-else-if="isVerifying">
              Request in progress...
            </span>
            {{ isVerifying ? 'Verifying...' : 'Verify Keyprint' }}
          </button>
        </div>

        <div style="font-size: 0.875rem; opacity: 0.7;">
          {{ inputText.length }} characters
        </div>
      </div>

      <!-- API response/error messages -->
      <div v-if="apiResponse || apiError" style="margin-top: 1rem; padding: 0.75rem; border-radius: 0.25rem; font-size: 0.875rem;" :style="{
        backgroundColor: apiError ? 'rgba(255, 50, 50, 0.1)' : 'rgba(0, 240, 255, 0.1)',
        borderLeft: apiError ? '3px solid rgba(255, 50, 50, 0.5)' : '3px solid rgba(0, 240, 255, 0.5)'
      }">
        <div v-if="apiError" style="color: #ff5050;">
          {{ apiError }}
        </div>
        <div v-else-if="apiResponse && mode === 'verify'">
          <div style="margin-bottom: 0.5rem;">
            <span style="font-weight: bold;">Match: </span>
            <span :style="{ color: apiResponse && apiResponse.match_ === true ? '#00f0ff' : '#ff5050' }">
              {{ apiResponse && apiResponse.match_ === true ? 'Yes' : 'No' }}
            </span>
          </div>
          <div>
            <span style="font-weight: bold;">Similarity: </span>
            <span>{{ apiResponse && typeof apiResponse.similarity === 'number' ? (apiResponse.similarity * 100).toFixed(2) : '0.00' }}%</span>
          </div>
        </div>
        <div v-else-if="apiResponse && mode === 'store'" style="color: #00f0ff;">
          Keyprint stored successfully!
          <div v-if="apiResponse.code === 0" style="margin-top: 0.5rem; font-size: 0.75rem;">
            {{ apiResponse.message || 'Success' }}
          </div>
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
          <div style="display: flex; gap: 0.5rem;">
            <button @click="handleCopy" class="btn btn-highlight" style="font-size: 0.75rem; padding: 0.25rem 0.75rem;">
              {{ isCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
        <pre style="background-color: rgba(0, 0, 0, 0.3); padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; overflow: auto; max-height: 10rem;">{{ formattedJson }}</pre>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; opacity: 0.7;">
          This is the data that will be sent to the API when you click {{ mode === 'store' ? 'Store Keyprint' : 'Verify Keyprint' }}.
          {{ hasEnoughData ? '' : 'Type more text to generate a reliable keyprint.' }}
        </p>
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

/* Tooltip styles */
.tooltip-container {
  position: relative;
}

.tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 8px 12px;
  border-radius: 4px;
  width: max-content;
  max-width: 200px;
  font-size: 12px;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s, visibility 0.3s;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

/* Special styling for disabled buttons */
button:disabled {
  cursor: not-allowed;
}

button:disabled:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>
