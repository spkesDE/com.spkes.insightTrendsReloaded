module.exports = {
    async searchInsights({homey, query}: any) {
        return await homey.app.searchInsights(query.search);
    },

    /**
     * Calculates the trend of the Insight
     * @param id
     * @param uri
     * @param range
     * @param unit
     * @param percent - optional
     * @param type - optional
     *
     * @returns object {
     *     trendline: [
     *         {X: number (timestamp): y: number}
     *     ]
     *     min: number
     *     max: number
     *     mean: number
     *     median: number
     *     standardDeviation: number
     *     trend: number
     *     firstvalue: number
     *     firstvalue_timestamp: number (timestamp)
     *     firstvalue_time: string
     *     lastvalue: number
     *     lastvalue_timestamp: number (timestamp)
     *     lastvalue_time: string
     *     size: number,
     *     percentile: number
     *     percent: number,
     *     data: [
     *          {x: number (timestamp), y: number}
     *     ]
     * }
     */
    async getInsightCalculated({homey, query}: any) {
        return await homey.app.getInsightCalculated(query.id, query.uri, query.range, query.unit, query.percentile, query.type);
    },
};
