import axiosInstance from "../utils/axiosInstance";

const login = async (userData) => {
    try {
        const response = await axiosInstance.post('/users/login', userData);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export { login };