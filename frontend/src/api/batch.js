import axiosInstance from "../utils/axiosInstance";

const createBatch = async (data) => {
    try {
        const response = await axiosInstance.post('/batches/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getSemBatches = async (semId) => {
    try {
        const response = await axiosInstance.get(`/batches/sem/${semId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteBatch = async (batchId) => {
    try {
        const response = await axiosInstance.delete(`/batches/delete/${batchId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { createBatch, getSemBatches, deleteBatch };