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
            let stats = await new Stats().push(logs.map((entry: any) => entry.y));
            let token = {
                min: Number(stats.range()[0]),
                max: Number(stats.range()[1]),
                mean: stats.amean(),
                median: stats.median(),
                standardDeviation: stats.stddev(),
                trend: Trend.createTrend(logs).slope * 1000,
                firstvalue: logs[0].y,
                firstvalue_timestamp: logs[0].x,
                firstvalue_time: new Date(logs[0].x).toLocaleString('en-GB', {
                    timeZone: app.homey.clock.getTimezone(), hour12: false
                }),
                lastvalue: logs[logs.length - 1].y,
                lastvalue_timestamp: logs[logs.length - 1].x,
                lastvalue_time: new Date(logs[logs.length - 1].x).toLocaleString('en-GB', {
                    timeZone: app.homey.clock.getTimezone(), hour12: false
                }),
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
