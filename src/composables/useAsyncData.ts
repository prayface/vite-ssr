import { getActivePinia } from "pinia";

export interface anyncItem {
    key: String;
    data: any;
    usePromise: () => Promise<any>;
}

export let asyncList: anyncItem[] = [];
export const useAsyncData = (key: string, usePromise: () => Promise<any>) => {
    const pinia = getActivePinia();
    const result = pinia.state.value?.async?.[key];

    if (!result) asyncList.push({ key, usePromise, data: undefined });

    return result;
};

export const cleanAsyncData = () => {
    asyncList = [];
};
