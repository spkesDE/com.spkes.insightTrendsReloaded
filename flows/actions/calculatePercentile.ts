import {InsightTrendsReloaded} from "../../app";
import {FlowCardAction} from "homey";
import FlowUtils from "../flowUtils";
import {Stats} from "fast-stats";

export default class CalculatePercentile {
    constructor(app: InsightTrendsReloaded, card: FlowCardAction) {
        card.registerRunListener(async (args: any) => {
            let state = {id: args.insight.id, uri: args.insight.uri};
            let logs = await app.getLogs(args.range, args.unit, state, args.insight.type == 'boolean');
            let stats = new Stats().push(logs.map((entry: any) => entry.y));
            let token = {
                value: stats.percentile(args.percent),
                percent: args.percent,
                size: logs.length
            };
            app.log(`Got ${logs.length} from getLogs. The tokens are:`, token)
            await app.homey.flow.getTriggerCard('percentileCalculated').trigger(token, state);
            return token;
        });
        card.registerArgumentAutocompleteListener('insight', async (query: any) => {
            return await FlowUtils.getSortedInsightsForAutocomplete(app, query);
        });
    }

}
