import axiosInstance from "../utils/axiosInstance";

const createStudent = async (data) => {
    try {
        const response = await axiosInstance.post('/students/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateStudent = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/students/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteStudent = async (id) => {
    try {
        const response = await axiosInstance.delete(`/students/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getAllStudents = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/students/all', {
            params: {
                sem_id: params.semId || null,
                dept_id: params.deptId || null
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getMyProfile = async () => {
    try {
        const response = await axiosInstance.get('/students/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const uploadFace = async (studentId, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        const response = await axiosInstance.post(`/students/face/${studentId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { createStudent, updateStudent, deleteStudent, getAllStudents, getMyProfile, uploadFace };