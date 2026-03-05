import axiosInstance from "../utils/axiosInstance";

const getAllLogs = async (params) => {
    try {
        const response = await axiosInstance.get('/logs/all', {
            params: {
                role: params?.role || null,
                start_date: params?.start_date || null,
                end_date: params?.end_date || null,
                search: params?.search || null,
                page: params?.page || 1,
                limit: params?.limit || 10
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { getAllLogs };