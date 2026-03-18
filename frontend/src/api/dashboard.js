import axiosInstance from "../utils/axiosInstance";

const getAdminDashboard = async () => {
    const response = await axiosInstance.get('/dashboard/admin');
    return response.data;
};

export { getAdminDashboard };