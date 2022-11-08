module.exports = {
    async searchInsights({homey, query}: any) {
        return await homey.app.searchInsights(query.search);
    },
    async getInsightCalculated({homey, query}: any) {
        return await homey.app.getInsightCalculated(query.id, query.uid, query.minutes, query.scopeUnit, query.percentile);
    },
};
