import axios from "axios";

const baseURL = (global?.web || "https://api.jerexd.my.id").replace(/\/$/, "");

const api = {
  get(endpoint, config = {}) {
    return axios.get(baseURL + endpoint, {
      ...config
    });
  },

  post(endpoint, data = {}, config = {}) {
    return axios.post(
      baseURL + endpoint,
      data,
      {
        ...config
      }
    );
  }
};

export default api;
