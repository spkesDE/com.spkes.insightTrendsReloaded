import {InsightTrendsReloaded} from "../app";
import Trend from "../trend";
import {Stats} from "fast-stats";

export default class FlowUtils {
    public static compare(a: number, b: number, operator: string): boolean {
        if (operator === "smaller") return a < b;
        if (operator === "smaller_equal") return a <= b;
        if (operator === "equal") return a === b;
        if (operator === "not_equal") return a !== b;
        if (operator === "greater") return a > b;
        if (operator === "greater_equal") return a >= b;
        return false;
    }

    public static getValue(logs: any, characteristic: string, percent: number = 0): number {
        if (characteristic === "trend") return Trend.createTrend(logs).slope ?? 0
        let stats = new Stats().push(logs.map((entry: any) => entry.y));
        if (characteristic === "min") return stats.range()[0];
        if (characteristic === "max") return stats.range()[1];
        if (characteristic === "average") return stats.amean();
        if (characteristic === "median") return stats.median();
        if (characteristic === "standardDeviation") return stats.stddev();
        if (characteristic === "percentile") return stats.percentile(percent);
        return 0;
    }

    public static async getSortedInsightsForAutocomplete(app: InsightTrendsReloaded, query: any, filter: any = {type: undefined}): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let insights: any = await app.getHomeyAPI().insights.getLogs(filter).catch(app.error);
            if (insights === undefined || insights.length === 0) reject(new Error('Failed to get insights'));
            resolve(insights.filter((entry: any) => entry.type == filter.type || filter.type == undefined)
                // Map entries to a usable friendly object
                .map((entry: any) => {
                    let result: any = {
                        name: entry.title,
                        description: entry.uriObj?.name ?? entry.ownerName ?? "Unknown",
                        id: entry.id,
                        uri: entry.uri,
                        type: entry.type,
                        units: entry.units
                    }
                    if (entry.uriObj?.iconObj && app.homeyId) {
                        result.icon = "https://" + app.homeyId + ".connect.athom.com" + entry.uriObj?.iconObj?.url;
                    }
                    if (entry.units !== null) {
                        result.name = result.name + ' (' + entry.units + ')';
                    }
                    return result;
                })
                //Filter results based on query string
                .filter((entry: any) => !query ||
                    (entry.name && entry.name.toLowerCase().includes(query.toLowerCase())) ||
                    (entry.description && entry.description.toLowerCase().includes(query.toLowerCase())))
                //Sort results based on description, so it looks neat in the search
                .sort((a: any, b: any) =>
                    ('' + a.description).localeCompare(b.description)
                ));
        })
    }
    public static toSignificantDigits(number: number, precision: number = 4): number {
        if (precision > 20) precision = 20;
        return Number(number.toFixed(precision))
    }
}
