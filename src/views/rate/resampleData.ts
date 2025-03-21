import dayjs from 'dayjs'

/**
 * 将按日数据降采样为更粗粒度，取分组内最后一个数据。
 * @param dailyData 原始按日数据，如 [{ date: '2025-01-01', pred: 7.3, ...}, ...]
 * @param mode 'week' | 'month' | '10day' | 'none'
 * @returns 聚合后的数据数组，每个元素依旧形如 { date, pred, ... }，但日期可能是该组里最新那天
 */
export function resampleData(dailyData: any[], mode: string): any[] {
    if (mode === 'none') {
        return dailyData;
    }

    const grouped: Record<string, any> = {};

    for (const item of dailyData) {
        const d = dayjs(item.date);
        let groupKey = '';

        if (mode === 'week') {
            const year = d.year();
            const dayOfYear = getDayOfYear(d);
            const weekSlot = Math.floor(dayOfYear / 7);
            groupKey = `${year}-W${weekSlot}`;
            console.log(groupKey);
        } else if (mode === 'month') {
            groupKey = d.format('YYYY-MM');
        } else if (mode === '10day') {
            const yearMonth = d.format('YYYY-MM');
            // day() 返回当月第几天(1~31) - dayjs(d).date()
            const slot = Math.floor((d.date() - 1) / 10);
            groupKey = `${yearMonth}-slot${slot}`;
        }

        if (!grouped[groupKey]) {
            grouped[groupKey] = item;
        } else {
            const oldItem = grouped[groupKey];
            if (dayjs(item.data).isAfter(dayjs(oldItem.date))) {
                grouped[groupKey] = item;
            }
        }
    }

    const result = Object.values(grouped);

    result.sort((a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());

    return result;
}

function getDayOfYear(d: dayjs.Dayjs): number {
    const startOfYear = d.startOf('year');
    return d.diff(startOfYear, 'day') + 1;
}