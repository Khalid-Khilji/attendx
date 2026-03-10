import axiosInstance from "../utils/axiosInstance";

const createCourse = async (data) => {
    try {
        const response = await axiosInstance.post('/courses/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateCourse = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/courses/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteCourse = async (id) => {
    try {
        const response = await axiosInstance.delete(`/courses/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getAllCourses = async (semId) => {
    try {
        const response = await axiosInstance.get(`/courses/${semId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getMyCourses = async () => {
    try {
        const response = await axiosInstance.get('/courses/my');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { createCourse, updateCourse, deleteCourse, getAllCourses, getMyCourses };