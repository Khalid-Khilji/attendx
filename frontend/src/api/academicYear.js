import axiosInstance from "../utils/axiosInstance";

const createAcademicYear = async (data) => {
    try {
        const response = await axiosInstance.post('/academic-years/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateAcademicYear = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/academic-years/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteAcademicYear = async (id) => {
    try {
        const response = await axiosInstance.delete(`/academic-years/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getAllAcademicYears = async () => {
    try {
        const response = await axiosInstance.get('/academic-years/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getCurrentAcademicYear = async () => {
    try {
        const response = await axiosInstance.get('/academic-years/current');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export {
    createAcademicYear, updateAcademicYear, deleteAcademicYear,
    getAllAcademicYears, getCurrentAcademicYear
};