import {axios} from '../utils/request'
import {INTERPRET_MODULE} from './_prefix'

export type Node2 = {
    id: string,
    name: string,
    desc: string,
}

export type Link = {
    source: string,
    target: string,
    weight: number,
}

/*
获取可解释性图
  GET /v1/explainability/graph
  接口ID：268986305
  接口地址：https://app.apifox.com/link/project/5986862/apis/api-268986305
*/

export interface GraphRequest {
    /**
     * 模型ID
     */
    model: number;
    [property: string]: any;
}

//获取可解释性图数据
export const getInterpretData = (params: GraphRequest) => {
    return axios.get(`${INTERPRET_MODULE}/graph`, {params})
        .then(res => {
            return res
        })
}