import axiosInstance from "../utils/axiosInstance";

const login = async (data) => {
    try {
        const response = await axiosInstance.post('/users/login', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { login };