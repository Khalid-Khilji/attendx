import axiosInstance from "../utils/axiosInstance";

const createSlot = async (data) => {
    const response = await axiosInstance.post('/timetable/create', data);
    return response.data;
};

const updateSlot = async (id, data) => {
    const response = await axiosInstance.patch(`/timetable/update/${id}`, data);
    return response.data;
};

const deleteSlot = async (id) => {
    const response = await axiosInstance.delete(`/timetable/delete/${id}`);
    return response.data;
};

const getSemTimetable = async (semId) => {
    const response = await axiosInstance.get(`/timetable/sem/${semId}`);
    return response.data;
};

const getStudentTimetable = async () => {
    const response = await axiosInstance.get('/timetable/student');
    return response.data;
};

export { createSlot, updateSlot, deleteSlot, getSemTimetable, getStudentTimetable };