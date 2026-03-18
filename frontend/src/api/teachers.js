import axiosInstance from "../utils/axiosInstance";

const createTeacher = async (data) => {
    try {
        const response = await axiosInstance.post('/teachers/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateTeacher = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/teachers/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteTeacher = async (id) => {
    try {
        const response = await axiosInstance.delete(`/teachers/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getAllTeachers = async () => {
    try {
        const response = await axiosInstance.get('/teachers/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getTeacherProfile = async () => {
    try {
        const response = await axiosInstance.get('/teachers/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { createTeacher, updateTeacher, deleteTeacher, getAllTeachers, getTeacherProfile };