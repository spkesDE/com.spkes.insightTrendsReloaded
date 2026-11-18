import {InsightTrendsReloaded} from "../../app";
import {FlowCardAction} from "homey";
import FlowUtils from "../flowUtils";
import Trend from "../../trend";
import {Stats} from "fast-stats";

export default class CheckInsight {
    constructor(app: InsightTrendsReloaded, card: FlowCardAction) {
        card.registerRunListener(async (args: any) => {
            app.log("🔍 Debug: card.registerRunListener");
            app.log("Args:", args);

            try {
                const logEntries = await app.getLogs(args.range, args.unit, {
                    id: args.insight.id,
                    uri: args.insight.uri
                }, false, FlowUtils.parseValueFilter(args));
                app.log("Log entries length:", logEntries.length);
                app.log("Log Trends:", Trend.createTrendHumanized(logEntries, app.useHumanizedTrend));
                let stats = new Stats().push(logEntries.map((entry: any) => entry.y));
                app.log("Stats:", stats);

                const valueFromLogs = FlowUtils.getValue(logEntries, args.characteristic, {
                    useHumanizedTrend: app.useHumanizedTrend
                });
                app.log("Extracted value from logs:", valueFromLogs, " (typeof:", typeof valueFromLogs, ")");

                app.log("Args.value:", args.value, " (typeof:", typeof args.value, ")");
                app.log("Operator:", args.operator);

                const result = FlowUtils.compare(valueFromLogs, args.value, args.operator);
                app.log("Comparison result:", result);
                return result;
            } catch (err) {
                app.error("❌ Error in registerRunListener:", err);
                throw err;
            }
        });
        card.registerArgumentAutocompleteListener('insight', async (query: any) => {
            return await FlowUtils.getSortedInsightsForAutocomplete(app, query);
        });
    }

}
