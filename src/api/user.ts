import {axios} from '../utils/request'
import {USER_MODULE} from './_prefix'

type LoginInfo = {
    username: string,
    password: string
}

type RegisterInfo = {
    username: string,
    password: string,
}

export type User = {
    username: string,
    password: string,
}

// 如果有“Vue: This may be converted to an async function”警告，可以不管
// 用户登录
export const userLogin = (loginInfo: LoginInfo) => {
    return axios.post(`${USER_MODULE}/login`, loginInfo, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

// 用户注册
export const userRegister = (registerInfo: RegisterInfo) => {
    return axios.post(`${USER_MODULE}/register`, registerInfo, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}

//修改用户密码
export const changePassword = ( oldPassword: string, newPassword: string) => {
    return axios.put(`${USER_MODULE}/password`, {oldPassword, newPassword}, {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            return res
        })
}
