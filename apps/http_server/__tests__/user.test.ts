import axios, { AxiosInstance } from "axios";

describe("User Route Tests", () => {
  const userEmail = `${Math.random()}-user@gmail.com`;
  const userPassword = "TheSecretPassword@123";
  let userToken: string;
  let adminToken: string;
  let userApi: AxiosInstance;
  let adminApi: AxiosInstance;
  let avatarId: string;
  let testUserIds: string[] = [];

  beforeAll(async () => {
    // Register a new user
    const response = await axios.post(`${baseURL}/auth/register`, {
      email: userEmail,
      password: userPassword,
    });
    userToken = response.data.data.token;

    // Admin login
    const adminResponse = await axios.post(`${baseURL}/auth/login`, {
      email: `admin@gmail.com`,
      password: "Admin@123",
    });
    adminToken = adminResponse.data.data.token;

    // Create axios instances for user and admin
    userApi = axios.create({ baseURL });
    adminApi = axios.create({ baseURL });

    // Set authorization headers
    userApi.interceptors.request.use((config) => {
      config.headers["Authorization"] = `Bearer ${userToken}`;
      return config;
    });
    adminApi.interceptors.request.use((config) => {
      config.headers["Authorization"] = `Bearer ${adminToken}`;
      return config;
    });

    // Admin creates an avatar
    const avatarCreationResponse = await adminApi.post("/admin/avatars", {
      imageUrl: "/avatars/robot_001.png",
      name: "Friendly Robot",
    });
    avatarId = avatarCreationResponse.data.data.id;

    // Create additional users for testing profiles endpoint
    for (let i = 0; i < 3; i++) {
      const testUserResponse = await axios.post(`${baseURL}/auth/register`, {
        email: `${Math.random()}-user${i}@gmail.com`,
        password: userPassword,
      });
      testUserIds.push(testUserResponse.data.data.userId);
    }
  });

  it("should retrieve available avatars", async () => {
    const response = await userApi.get("/user/avatars");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data.avatars)).toBe(true);
    expect(response.data.data.avatars.length).toBeGreaterThan(0);
  });

  it("should allow the user to update their profile with valid data", async () => {
    const nickname = `CoolUser${Math.random()}`;

    const response = await userApi.put("/user/profile", {
      nickname,
      avatarId,
    });

    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Profile updated successfully");
    expect(response.data.data.nickname).toBe(nickname);
    expect(response.data.data.avatarId).toBe(avatarId);
  });

  it("should return validation error for invalid profile update data", async () => {
    try {
      await userApi.put("/user/profile", {
        nickname: "a", // Invalid nickname, too short
        avatarId: "invalid-avatar-id",
      });
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.errors).toContain(
        "Nickname must be between 3 and 20 characters",
      );
      expect(error.response.data.errors).toContain("Invalid avatar ID");
    }
  });

  it("should retrieve multiple user profiles", async () => {
    const ids = testUserIds.join(",");

    const response = await userApi.get("/user/profiles", {
      params: { ids },
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data.profiles)).toBe(true);
    expect(response.data.data.profiles.length).toBe(testUserIds.length);
  });

  it("should return error for invalid user IDs in profile retrieval", async () => {
    try {
      await userApi.get("/user/profiles", {
        params: { ids: "invalid_id1,invalid_id2" },
      });
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.message).toBe("Invalid user IDs provided");
    }
  });
});
