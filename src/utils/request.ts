import axios from 'axios'
import { API_BASE_URL } from './api'

//创建一个axios的实例service
const service = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

//判断是否登录
function hasToken() {
    return !(sessionStorage.getItem('token') == '')
}

//当前实例的拦截器，对所有要发送给后端的请求进行处理，在其中加入token
service.interceptors.request.use(
    config => {
        if (!config.url?.includes('/rate/get_all_forex')) {
            if (hasToken()) {
                config.headers['token'] = sessionStorage.getItem('token')
            }
        }
        return config
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
)

//当前实例的拦截器，对所有从后端收到的请求进行处理，检验http的状态码
service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response;
        } else {
            return Promise.reject();
        }
    },
    error => {
        console.log(error);
        if (error.response && error.response.status === 401) {
            console.log('未授权，请重新登录');
        }
        return Promise.reject();
    }
)

//设置为全局变量
export {
    service as axios
}
