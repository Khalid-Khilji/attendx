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
        const response = await axiosInstance.put(`/departments/update/${id}`, data);
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
        const response = await axiosInstance.put(`/semesters/update/${id}`, data);
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

const getAllSemesters = async (deptId = null) => {
    try {
        const response = await axiosInstance.get(`/semesters/${deptId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

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
        const response = await axiosInstance.put(`/courses/update/${id}`, data);
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

const getAllCourses = async (semId = null) => {
    try {
        const response = await axiosInstance.get(`/courses/${deptId}/${semId}`);
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

export { createDepartment, updateDepartment, deleteDepartment, getAllDepartments, createSemester, updateSemester, deleteSemester, getAllSemesters, createCourse, updateCourse, deleteCourse, getAllCourses, getMyCourses };