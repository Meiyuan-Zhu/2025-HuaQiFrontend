目录结构说明
原始数据目录结构
├── 回测收益/
    ├── 回测收益_中日/       # 中日货币对的回测收益JSON文件
    ├── 回测收益_中欧/       # 中欧货币对的回测收益JSON文件
    ├── 回测收益_中澳/       # 中澳货币对的回测收益JSON文件
    └── 回测收益_中美/       # 中美货币对的回测收益JSON文件

JSON文件字段说明
1. 文件位置
所有JSON文件生成在 回测收益/回测收益_[货币对] 目录下，例如：
回测收益_中美/Aberration+MODEL_result.json

2. JSON字段定义
json
{
  "currency_pair": "中日",   // 货币对标识
  "Strategy": "Aberration_result", // 策略名称
  "data": [                     
    {
      "period": "1Week",         // 评估周期（如 1周，1个月，1年等）
      "Cumulative_Return": -0.001516884710837,    // 累计收益率
      "Annualized_Return": -0.076103061780779,    // 年化收益率
      "Sharpe_Ratio": -1.54563454104875,         // 夏普比率
      "Maximum_Drawdown": 0.005302690724791,     // 最大回撤
      "Calmar_Ratio": -14.3517820914914          // 卡玛比率
    },
    // ...（更多数据）
  ]
}