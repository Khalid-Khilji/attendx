import axiosInstance from "../utils/axiosInstance";

const createAcademicYear = async (data) => {
    const response = await axiosInstance.post('/academic-years/', data);
    return response.data;
};

const updateAcademicYear = async (id, data) => {
    const response = await axiosInstance.patch(`/academic-years/${id}`, data);
    return response.data;
};

const deleteAcademicYear = async (id) => {
    const response = await axiosInstance.delete(`/academic-years/${id}`);
    return response.data;
};

const getAllAcademicYears = async () => {
    const response = await axiosInstance.get('/academic-years/');
    return response.data;
};

const getCurrentAcademicYear = async () => {
    const response = await axiosInstance.get('/academic-years/current');
    return response.data;
};

export {
    createAcademicYear, updateAcademicYear, deleteAcademicYear,
    getAllAcademicYears, getCurrentAcademicYear
};