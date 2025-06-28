const axios = require("axios");

const baseURL = `http://localhost:${process.env.PORT || 3000}/api/v1`;

// Make baseURL globally available
global.baseURL = baseURL;

// Setup test environment
beforeAll(async () => {
  // Wait for server to be ready
  let retries = 10;
  while (retries > 0) {
    try {
      await axios.get(`http://localhost:${process.env.PORT || 3000}`);
      break;
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});