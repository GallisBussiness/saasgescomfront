import axios from "axios";
const Api = axios.create({
    baseURL: import.meta.env.VITE_BACKURL,
  })
  Api.interceptors.request.use(config => {
    const token = window.localStorage.getItem(import.meta.env.VITE_TOKENSTORAGENAME);
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  Api.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if(error.response.status === 440){
      localStorage.removeItem(import.meta.env.VITE_TOKENSTORAGENAME);
      
    }
    if(error.response.status === 401 || error.response.status === 500){
      localStorage.removeItem(import.meta.env.VITE_TOKENSTORAGENAME);
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  });
export default Api;