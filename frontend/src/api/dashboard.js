import axiosInstance from "../utils/axiosInstance";

const getAdminDashboard = async () => {
    const response = await axiosInstance.get('/dashboard/admin');
    return response.data;
};

const getTeacherDashboard = async () => {
    const response = await axiosInstance.get('/dashboard/teacher');
    return response.data;
};

export { getAdminDashboard, getTeacherDashboard };