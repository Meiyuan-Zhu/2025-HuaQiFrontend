import {axios} from '../utils/request'
import {PREDICTION_MODULE} from './_prefix'

/*
获取汇率预测结果
    GET /v1/prediction/predict
    接口ID：268986306
    接口地址：https://app.apifox.com/link/project/5986862/apis/api-268986306
*/
export interface PredictRequest {
    /**
     * 基准货币代码
     */
    currency: string;
    /**
     * 预测时间跨度(天)
     */
    timeSpan: number;
    [property: string]: any;
}

export const getPredict = (params: PredictRequest) => {
    return axios.get(`${PREDICTION_MODULE}/predict`, {params})
        .then((res) => {
            return res
        })
}

/*
获取大模型解释结果
  POST /v1/prediction/explanation
  接口ID：268986308
  接口地址：https://app.apifox.com/link/project/5986862/apis/api-268986308
*/
export interface ExplanationRequest {
    currencyPair: string;
    // data: Datum[];
    timeSpan: string;
    [property: string]: any;
}

export interface Datum {
    date: string;
    pred: number;
    [property: string]: any;
}

export const getExplanation = (explanationRequest: ExplanationRequest) => {
    return axios.post(`http://118.178.184.189:6020/v1/prediction/get_analysis`, explanationRequest, { headers: { 'Content-Type': 'application/json' } })
        .then((res) => {
            if (res.data && res.data.data) {
                res.data.data = res.data.data.replace(/&#10;/g, '\n');
            }
            return res
    })
}

/*
下载分析报告
  GET /v1/prediction/report
  接口ID：268986309
  接口地址：https://app.apifox.com/link/project/5986862/apis/api-268986309
*/

export interface ReportRequest {
    /**
     * 买入点列表
     */
    buyPoints: number[];
    /**
     * 汇率列表
     */
    rates: string[];
    /**
     * 卖出点列表
     */
    sellPoints: number[];
    [property: string]: any;
}

export const getReport = (params: ReportRequest) => {
    return axios.get(`${PREDICTION_MODULE}/report`, {params})
        .then((res) => {
            return res
        })
}