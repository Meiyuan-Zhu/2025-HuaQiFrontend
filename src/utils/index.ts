//将身份转化为中文显示
export function parseRole(role: string | null) {
    if (role === 'MANAGER') {
        return "管理员"
    } else if (role === 'CUSTOMER') {
        return "顾客"
    } else if (role === 'STAFF') {
        return "商家"
    } else if (role === 'CEO') {
        return "CEO"
    }
}

//将时间转化为日常方式
export function parseTime(time: string) {
    let times = time.split(/T|\./)
    return times[0] + " " + times[1]
}

//获取对应的国旗
export const getCurrencyFlag = (currency: string): string => {
    const currencyToCountry: Record<string, string> = {
      USD: "us",
      EUR: "eu",
      GBP: "gb",
      JPY: "jp",
      CNY: "cn",
      HKD: "hk",
      AUD: "au",
      CAD: "ca",
      SGD: "sg",
      CHF: "ch",
    };
    return currencyToCountry[currency] || "cn";
};

//将货币转化为中文显示
export const parseCurrency = (currency: string) => {
    if (currency === 'USD') {
        return "美"
    } else if (currency === 'EUR') {
        return "欧"
    } else if (currency === 'AUD') {
        return "澳"
    } else if (currency === 'JPY') {
        return "日"
    } else if (currency === 'CNY') {
        return "中"
    }
    return "中"
}
export const parseCurrencyFullName = (currency: string) => {
    if (currency === 'USD') {
        return "美元"
    } else if (currency === 'EUR') {
        return "欧元"
    } else if (currency === 'AUD') {
        return "澳元"
    } else if (currency === 'JPY') {
        return "日元"
    } else if (currency === 'CNY') {
        return "人民币"
    }
    return "人民币"
}
  
//将模型转化为数字
export const parseModel = (model: string) => {
    return Number(model[2]);
}