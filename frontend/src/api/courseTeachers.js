import axiosInstance from "../utils/axiosInstance";

const assignTeacherToCourse = async (data) => {
    try {
        const response = await axiosInstance.post('/course-teachers/assign', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const updateCourseTeacher = async (id, data) => {
    try {
        const response = await axiosInstance.patch(`/course-teachers/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const removeTeacherFromCourse = async (id) => {
    try {
        const response = await axiosInstance.delete(`/course-teachers/remove/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getCourseTeachers = async (courseId) => {
    try {
        const response = await axiosInstance.get(`/course-teachers/${courseId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { assignTeacherToCourse, updateCourseTeacher, removeTeacherFromCourse, getCourseTeachers };