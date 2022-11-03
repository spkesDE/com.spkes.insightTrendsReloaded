import {InsightTrendsReloaded} from "../../app";
import {FlowCardAction} from "homey";
import FlowUtils from "../flowUtils";
import {Stats} from "fast-stats";
import Trend from "../../trend";

export default class CalculateTrend {
    constructor(app: InsightTrendsReloaded, card: FlowCardAction, withToken: boolean = true) {
        card.registerRunListener(async (args: any) => {
            let state = {id: args.insight.id, uri: args.insight.uri};
            let logs = await app.getLogs(args.range, args.unit, state, args.insight.type == 'boolean');
            console.log(logs);
            let stats = await new Stats().push(logs.map((entry: any) => entry.y));
            let token = {
                min: Number(stats.range()[0]),
                max: Number(stats.range()[1]),
                mean: stats.amean(),
                median: stats.median(),
                standardDeviation: stats.stddev(),
                trend: Trend.createTrend(logs).slope * 1000,
                size: logs.length
            };
            app.log(`Got ${logs.length} from getLogs. The tokens are:`, token)
            await app.homey.flow.getTriggerCard('trendCalculated').trigger(token, state);
            if (withToken)
                return token;
        });
        card.registerArgumentAutocompleteListener('insight', async (query: any) => {
            return await FlowUtils.getSortedInsightsForAutocomplete(app, query);
        });
    }

}
