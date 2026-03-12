import axiosInstance from "../utils/axiosInstance";

const createSemester = async (data) => {
    try {
        const response = await axiosInstance.post('/semesters/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateSemester = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/semesters/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteSemester = async (id) => {
    try {
        const response = await axiosInstance.delete(`/semesters/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getAllSemesters = async (deptId) => {
    try {
        const response = await axiosInstance.get(`/semesters/${deptId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { createSemester, updateSemester, deleteSemester, getAllSemesters };