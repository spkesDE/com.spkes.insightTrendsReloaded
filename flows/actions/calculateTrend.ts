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
                //Casting to number because of boolean values
                min: app.significantFigures ? FlowUtils.toSignificantDigits(Number(stats.range()[0])) : Number(stats.range()[0]),
                max: app.significantFigures ? FlowUtils.toSignificantDigits(Number(stats.range()[1])) : Number(stats.range()[1]),
                mean: app.significantFigures ? FlowUtils.toSignificantDigits(stats.amean()) : stats.amean(),
                median: app.significantFigures ? FlowUtils.toSignificantDigits(stats.median()) : stats.median(),
                standardDeviation: app.significantFigures ? FlowUtils.toSignificantDigits(stats.stddev()) : stats.stddev(),
                trend: app.significantFigures ? FlowUtils.toSignificantDigits(Trend.createTrend(logs).slope * 1000) : Trend.createTrend(logs).slope * 1000,
                firstvalue: app.significantFigures ? FlowUtils.toSignificantDigits(logs[0].y,) : logs[0].y,
                firstvalue_timestamp: logs[0].x,
                firstvalue_time: new Date(logs[0].x).toLocaleString('en-GB', {
                    timeZone: app.homey.clock.getTimezone(), hour12: false
                }),
                lastvalue: app.significantFigures ? FlowUtils.toSignificantDigits(logs[logs.length - 1].y) : logs[logs.length - 1].y,
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
