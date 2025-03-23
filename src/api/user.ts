import {axios} from '../utils/request'
import {USER_MODULE} from './_prefix'


export type User = {
    username: string,
    password: string,
}

// 如果有"Vue: This may be converted to an async function"警告，可以不管
// 用户登录
export const userLogin = (formData: FormData, config?: any) => {
    return axios.post(`${USER_MODULE}/login`, formData, config)
        .then(res => {
            return res
        })
}

// 用户注册
export const userRegister = (formData: FormData) => {
    return axios.post(`${USER_MODULE}/register`, formData)
        .then(res => {
            return res
        })
}

//修改用户密码
export const changePassword = (formData: FormData, config?: any) => {
    return axios.put(`${USER_MODULE}/password`, formData, config)
        .then(res => {
            return res
        })
}

// 用户退出登录
export const userLogout = (config?: any) => {
    return axios.post(`${USER_MODULE}/logout`, null, config)
        .then(res => {
            return res
        })
}
