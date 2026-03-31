import axiosInstance from "../utils/axiosInstance";

const createSession = async (data) => {
    try {
        const response = await axiosInstance.post('/sessions/create', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getCourseSessions = async (courseId) => {
    try {
        const response = await axiosInstance.get(`/sessions/${courseId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const markAttendanceByFrames = async (sessionId, frameFiles) => {
    try {
        const formData = new FormData();
        frameFiles.forEach((file) => formData.append('frames', file));
        const response = await axiosInstance.post(`/sessions/mark-by-frames/${sessionId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getSessionRecords = async (sessionId) => {
    try {
        const response = await axiosInstance.get(`/attendance/session/${sessionId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getMyAttendance = async (courseId = null) => {
    try {
        const url = courseId ? `/attendance/my?course_id=${courseId}` : '/attendance/my';
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const reviewAttendanceRecord = async (recordId, data) => {
    try {
        const response = await axiosInstance.patch(`/attendance/review/${recordId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const confirmAttendance = async (sessionId, results) => {
    const response = await axiosInstance.post(`/sessions/confirm/${sessionId}`, { results });
    return response.data;
};

const cancelSession = async (sessionId) => {
    const response = await axiosInstance.delete(`/sessions/cancel/${sessionId}`);
    return response.data;
};

export {
    createSession, getCourseSessions, markAttendanceByFrames,
    getSessionRecords, getMyAttendance, reviewAttendanceRecord, confirmAttendance, cancelSession
};