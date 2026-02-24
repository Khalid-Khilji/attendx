import axiosInstance from "../utils/axiosInstance";

const login = async (userData) => {
    try {
        const response = await axiosInstance.post('/login', userData);
        return response;
    } catch (error) {
        console.log(error);
    }
}

const logout = async (userData) => {
    try {
        const response = await axiosInstance.post('/logout', userData);
        return response;
    } catch (error) {
        console.log(error);
    }
}

export { login, logout };