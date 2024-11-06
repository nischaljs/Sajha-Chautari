const axios = require('axios');

const baseURL = `http://localhost:${process.env.PORT ||  3000}/api/v1`

describe("Check if server is running ", () => {
  it("should respond with success message and empty data", async () => {
    const response = await axios.get(`http://localhost:${process.env.PORT ||  3000}`);

    // Validate the response status and structure
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      success: true,
      message: "HTTP Server is running",
      data: {}
    });
  });
});
