module.exports = {
    async searchInsights({homey, query}: any) {
        return await homey.app.searchInsights(query.search);
    },
    async getInsightCalculated({homey, query}: any) {
        return await homey.app.getInsightCalculated(query.id, query.uri, query.range, query.unit, query.percentile, query.type);
    },
};
