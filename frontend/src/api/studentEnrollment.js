import axiosInstance from "../utils/axiosInstance";

const enrollStudent = async (data) => {
    try {
        const response = await axiosInstance.post('/enrollments/enroll', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const promoteStudent = async (studentId, data) => {
    try {
        const response = await axiosInstance.post(`/enrollments/promote/${studentId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getEnrollmentHistory = async (studentId) => {
    try {
        const response = await axiosInstance.get(`/enrollments/history/${studentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getSemStudents = async (semId) => {
    try {
        const response = await axiosInstance.get(`/enrollments/sem/${semId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getMyEnrollment = async () => {
    try {
        const response = await axiosInstance.get(`/enrollments/history/me`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { enrollStudent, promoteStudent, getEnrollmentHistory, getSemStudents, getMyEnrollment };