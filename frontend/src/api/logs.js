import axiosInstance from "../utils/axiosInstance";

const getAllLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/logs/all', {
      params: {
        actor_role: params.role || null,
        action: params.action || null,
        entity: params.entity || null,
        entity_name: params.search || null, 
        start_date: params.start_date || null,
        end_date: params.end_date || null,
        page: params.page || 1,
        limit: params.limit || 10
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getMyLogs = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/logs/my', {
      params: {
        start_date: params.start_date || null,
        end_date: params.end_date || null,
        page: params.page || 1,
        limit: params.limit || 10
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export { getAllLogs, getMyLogs };