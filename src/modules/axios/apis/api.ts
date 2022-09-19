import CommonApi from "../common/common";

const baseURL = import.meta.env.PROD ? import.meta.env.VITE_API : "";
const request = new CommonApi({
    baseURL: baseURL + "/api/v1",
    withCredentials: true,
    headers: {
        "Access-Control-Allow-Credentials": true,
    },
});

/**@name 请求前拦截器 */
const reqHanlder = (config) => {
    return config;
};

/**@name 请求失败拦截器 */
const resErrorHanlder = (response) => {
    return response;
};

/**@name 请求成功拦截器 */
const resSuccessHanlder = (response) => {
    return response;
};

const api = request.api;

api.defaults.headers.put["Content-Type"] = "application/json";
api.defaults.headers.post["Content-Type"] = "application/json";

api.interceptors.request.use(reqHanlder);
api.interceptors.response.use(resSuccessHanlder, resErrorHanlder);

export { request as api, request as default };
