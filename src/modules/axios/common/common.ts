"use strict";

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Canceler } from "axios";

export interface ApiOptions {
    success?: (data: any, response: any) => void;
    finally?: () => void;
    error?: (error: any) => void;

    controller?: AbortController;
    loading?: boolean;
    notify?: boolean;
}

export default class commonApi {
    public api: AxiosInstance;
    private requests: AbortController[];

    /**@name 初始化数据 */
    constructor(options: AxiosRequestConfig<any> = {}) {
        this.requests = [];
        this.api = axios.create(options);
    }

    get(resource: string, data: any, options: ApiOptions = {}) {
        const config = this.configInit(options);
        const api = this.api.get(resource, { params: data, ...config });
        return this.requestInit(api, config, options);
    }

    put(resource: string, data: any = {}, options: ApiOptions = {}) {
        const config = this.configInit(options);
        const api = this.api.put(resource, data, config);
        return this.requestInit(api, config, options);
    }

    post(resource: string, data: any = {}, options: ApiOptions = {}) {
        const config = this.configInit(options);
        const api = this.api.post(resource, data, config);
        return this.requestInit(api, config, options);
    }

    delete(resource: string, data: any = {}, options: ApiOptions = {}) {
        const config = this.configInit(options);
        const api = this.api.delete(resource, { params: data, ...config });
        return this.requestInit(api, config, options);
    }

    /**@name 取消全部请求 */
    cancelAll() {
        this.requests.forEach((r) => r.abort && r.abort());
        this.requests = [];
    }

    private configInit(options: ApiOptions) {
        const config: AxiosRequestConfig<any> = {};

        if (options.controller) {
            config.signal = options.controller.signal;
            this.requests.push(options.controller);
        } else {
            const controller = new AbortController();
            config.signal = controller.signal;
            this.requests.push(controller);
        }

        config.headers = {
            notify: options.notify == false ? false : true,
            loading: options.loading == false ? false : true,
        };

        return config;
    }

    private requestInit(api: Promise<AxiosResponse<any, any>>, config: AxiosRequestConfig<any>, options: ApiOptions) {
        if (options.success) api.then((response) => options.success(response.data, response));
        if (options.error) api.catch((error) => options.error(error));

        api.finally(() => {
            options.finally && options.finally();
            this.requests = this.requests.filter((v) => v.signal !== config.signal);
        });

        return api;
    }
}
