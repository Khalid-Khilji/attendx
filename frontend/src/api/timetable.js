import axiosInstance from "../utils/axiosInstance";

const createSlot = async (data) => {
    try {
        const response = await axiosInstance.post('/timetable/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateSlot = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/timetable/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteSlot = async (id) => {
    try {
        const response = await axiosInstance.delete(`/timetable/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getSemTimetable = async (semId) => {
    try {
        const response = await axiosInstance.get(`/timetable/sem/${semId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getMyTimetable = async () => {
    try {
        const response = await axiosInstance.get('/timetable/my');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { createSlot, updateSlot, deleteSlot, getSemTimetable, getMyTimetable };