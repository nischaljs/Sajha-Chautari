import axios from 'axios';

describe("User Registration and Login", () => {
    const email = Math.random() + "-user@example.com";
    const password = "securePassword123";

    describe("User Registration", () => {
        it("should respond with success message, token data, and userId when registering", async () => {
            const response = await axios.post(`${baseURL}/auth/register`, {
                email: email,
                password: password,
            });

           
            expect(response.status).toBe(201);
            expect(response.data.data.token).toBeDefined();
            expect(typeof response.data.data.token).toBe("string");
            expect(typeof response.data.data.userId).toBe("string");
        });

        it("should respond with error when email is missing", async () => {
            const response = await axios.post(`${baseURL}/auth/register`, {
                password: password,
            });
            expect(response.status).toBe(400);
            expect(response.data.message).toBe("Email is required");
        });

        it("should respond with error when password is missing", async () => {
            const response = await axios.post(`${baseURL}/auth/register`, {
                email: email,
            });
            expect(response.status).toBe(400);
            expect(response.data.message).toBe("Password is required");
        });

        it("should respond with error for invalid email format", async () => {
            const response = await axios.post(`${baseURL}/auth/register`, {
                email: "invalid-email",
                password: password,
            });
            expect(response.status).toBe(400);
            expect(response.data.message).toBe("Invalid email format");
        });

        it("should respond with error when password is too weak", async () => {
            const response = await axios.post(`${baseURL}/auth/register`, {
                email: email,
                password: "123",
            });
            expect(response.status).toBe(400);
            expect(response.data.message).toBe("Password is too weak");
        });

        it("should respond with error when email is already in use", async () => {
            await axios.post(`${baseURL}/auth/register`, {
                email: email,
                password: password,
            });

            const response = await axios.post(`${baseURL}/auth/register`, {
                email: email,
                password: password,
            });
            expect(response.status).toBe(400);
            expect(response.data.message).toBe("Email is already in use");
        });
    });

    describe("User Login", () => {
        beforeAll(async () => {
            // Ensure the user is registered before login tests
            await axios.post(`${baseURL}/auth/register`, {
                email: email,
                password: password,
            });
        });

        it("should sign in successfully with correct credentials", async () => {
            const response = await axios.post(`${baseURL}/auth/login`, {
                email: email,
                password: password,
            });

            expect(response.status).toBe(200);
            expect(response.data.data.token).toBeDefined();
            expect(typeof response.data.data.token).toBe("string");
            expect(typeof response.data.data.userId).toBe("string");
        });

        it("should respond with error for incorrect email", async () => {
            const response = await axios.post(`${baseURL}/auth/login`, {
                email: "wrong-email@example.com",
                password: password,
            });
            expect(response.status).toBe(401);
            expect(response.data.message).toBe("Invalid email or password");
        });

        it("should respond with error for incorrect password", async () => {
            const response = await axios.post(`${baseURL}/auth/login`, {
                email: email,
                password: "wrongPassword",
            });
            expect(response.status).toBe(401);
            expect(response.data.message).toBe("Invalid email or password");
        });

        it("should respond with error when email is missing during login", async () => {
            const response = await axios.post(`${baseURL}/auth/login`, {
                password: password,
            });
            expect(response.status).toBe(400);
            expect(response.data.message).toBe("Email is required");
        });

        it("should respond with error when password is missing during login", async () => {
            const response = await axios.post(`${baseURL}/auth/login`, {
                email: email,
            });
            expect(response.status).toBe(400);
            expect(response.data.message).toBe("Password is required");
        });
    });
});
