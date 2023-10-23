import {InsightTrendsReloaded} from "../../app";
import {FlowCardAction} from "homey";
import FlowUtils from "../flowUtils";
import {Stats} from "fast-stats";

export default class CalculatePercentage {
    constructor(app: InsightTrendsReloaded, card: FlowCardAction) {
        card.registerRunListener(async (args: any) => {
            let state = {id: args.insight.id, uri: args.insight.uri};
            let logs = await app.getLogs(args.range, args.unit, state, args.insight.type == 'boolean');
            let logsCondition = logs.filter((a: {x: number, y: any}, index : number, array) =>
                FlowUtils.compare(a.y, args.value, args.operator));
            let percentage = (logsCondition.length * 100) / logs.length
            let token = {
                percent: app.roundPercentage ?  Math.round(percentage) : app.significantFigures ? FlowUtils.toSignificantDigits(Number(percentage), app.significantFiguresValue) : percentage,
                size: logs.length
            };
            app.log(`Got ${logs.length} from getLogs. The tokens are:`, token)
            return token;
        });
        card.registerArgumentAutocompleteListener('insight', async (query: any) => {
            return await FlowUtils.getSortedInsightsForAutocomplete(app, query);
        });
    }

}
