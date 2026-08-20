import api from '@/plugins/axios';

export const get = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response;
};

export const post = async (url, datos, config = {}) => {
  const response = await api.post(url, datos, config);
  return response;
};

export const put = async (url, datos = {}, config = {}) => {
  const response = await api.put(url, datos, config);
  return response;
};

export const del = async (url) => {
  const response = await api.delete(url);
  return response;
};

export default {
  get,
  post,
  put,
  del,
  api,
};
