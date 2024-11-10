import axios from "axios";

const baseURL = process.env.HTTP_BASE_URL;
const api = axios.create({
    baseURL
});

api.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem('token');
        const spaceId = localStorage.getItem('spaceId');
        if (token && spaceId) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.data.spaceId = spaceId;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default api;
