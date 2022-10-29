import {InsightTrendsReloaded} from "../../app";
import {FlowCardAction} from "homey";
import FlowUtils from "../flowUtils";

export default class PercentileCalculated {
    constructor(app: InsightTrendsReloaded, card: FlowCardAction) {
        card.registerRunListener(async (args: any, state: any) => {
            return args.insight.uri == state.uri && args.insight.id == state.id;
        });
        card.registerArgumentAutocompleteListener('insight', async (query: any) => {
            return await FlowUtils.getSortedInsightsForAutocomplete(app, query);
        });
    }

}
