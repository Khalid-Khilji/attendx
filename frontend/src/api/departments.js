import axiosInstance from "../utils/axiosInstance";

const createDepartment = async (data) => {
    try {
        const response = await axiosInstance.post('/departments/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateDepartment = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/departments/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteDepartment = async (id) => {
    try {
        const response = await axiosInstance.delete(`/departments/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getAllDepartments = async () => {
    try {
        const response = await axiosInstance.get('/departments/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { createDepartment, updateDepartment, deleteDepartment, getAllDepartments };