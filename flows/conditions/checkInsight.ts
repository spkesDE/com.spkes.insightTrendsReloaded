import {InsightTrendsReloaded} from "../../app";
import {FlowCardAction} from "homey";
import FlowUtils from "../flowUtils";

export default class CheckInsight {
    constructor(app: InsightTrendsReloaded, card: FlowCardAction) {
        card.registerRunListener(async (args: any) => {
            let logEntries = await app.getLogs(args.range, args.unit, {id: args.insight.id, uri: args.insight.uri});
            return FlowUtils.compare(FlowUtils.getValue(logEntries, args.characteristic), args.value, args.operator)
        });
        card.registerArgumentAutocompleteListener('insight', async (query: any) => {
            return await FlowUtils.getSortedInsightsForAutocomplete(app, query);
        });
    }

}
