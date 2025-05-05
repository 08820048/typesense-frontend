/**
 * API service for TypeSense backend communication
 */

const API_BASE_URL = 'http://127.0.0.1:8080';

/**
 * Store a user's keyprint data
 * @param {string} userId - User identifier
 * @param {Object} keyprint - Keyprint data object
 * @param {Array} keyprint.intervals - Array of typing intervals
 * @param {number} keyprint.duration - Total typing duration
 * @param {number} keyprint.backspace_count - Number of backspaces used
 * @returns {Promise} - API response
 */
export async function storeKeyprint(userId, keyprint) {
  console.log('API Service: storeKeyprint called with:', { userId, keyprint });
  try {
    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!keyprint || !Array.isArray(keyprint.intervals) || keyprint.intervals.length === 0) {
      throw new Error('Valid keyprint data is required');
    }

    const requestBody = {
      user_id: userId,
      keyprint: {
        intervals: keyprint.intervals,
        duration: keyprint.duration,
        backspace_count: keyprint.backspaceCount
      }
    };

    console.log('API Service: Making fetch request to:', `${API_BASE_URL}/api/store-keyprint`);
    console.log('API Service: Request body:', JSON.stringify(requestBody));

    // Use a timeout to ensure the request doesn't hang indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/store-keyprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      console.log('API Service: Response status:', response.status);

      if (!response.ok) {
        console.error('API Service: Response not OK:', response.status, response.statusText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Service: Response data:', data);

      // Check if the response has the expected format
      if (data && typeof data === 'object') {
        return data;
      } else {
        console.error('API Service: Unexpected response format:', data);
        throw new Error('Unexpected response format');
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('API Service: Request timed out');
        throw new Error('Request timed out');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('API Service: Failed to store keyprint:', error);
    throw error;
  }
}

/**
 * Verify a user's keyprint against stored data
 * @param {string} userId - User identifier
 * @param {Object} keyprint - Keyprint data to verify
 * @param {Array} keyprint.intervals - Array of typing intervals
 * @param {number} keyprint.duration - Total typing duration
 * @param {number} keyprint.backspace_count - Number of backspaces used
 * @returns {Promise<{match_: boolean, similarity: number}>} - Verification result
 */
export async function verifyKeyprint(userId, keyprint) {
  console.log('API Service: verifyKeyprint called with:', { userId, keyprint });
  try {
    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!keyprint || !Array.isArray(keyprint.intervals) || keyprint.intervals.length === 0) {
      throw new Error('Valid keyprint data is required');
    }

    const requestBody = {
      user_id: userId,
      keyprint: {
        intervals: keyprint.intervals,
        duration: keyprint.duration,
        backspace_count: keyprint.backspaceCount
      }
    };

    console.log('API Service: Making verification fetch request to:', `${API_BASE_URL}/api/verify-keyprint`);
    console.log('API Service: Verification request body:', JSON.stringify(requestBody));

    // Use a timeout to ensure the request doesn't hang indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-keyprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes

      console.log('API Service: Verification response status:', response.status);

      if (!response.ok) {
        console.error('API Service: Verification response not OK:', response.status, response.statusText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Service: Verification response data:', data);

      // Process the response based on the API structure
      if (data && typeof data === 'object') {
        // Check if the response has a nested data property (common in RESTful APIs)
        const resultData = data.data || data;

        // Ensure match_ and similarity properties exist
        const result = {
          match_: resultData.match_ === true,
          similarity: typeof resultData.similarity === 'number' && !isNaN(resultData.similarity)
            ? resultData.similarity
            : 0
        };

        console.log('API Service: Normalized verification result:', result);
        return result;
      } else {
        console.error('API Service: Invalid verification response format:', data);
        throw new Error('Invalid API response format');
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('API Service: Verification request timed out');
        throw new Error('Request timed out');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('API Service: Failed to verify keyprint:', error);
    throw error;
  }
}
