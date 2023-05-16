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

    public static async getDescriptionAndIcon(app: InsightTrendsReloaded, uri: string, id: string) {
        return new Promise<{ description: String; icon: any; }>(async (resolve) => {
            let defaultIcon = "/app/com.spkes.insightTrendsReloaded/settings/images/unknown.svg"
            let defaultResult = {
                description: app.homey.__("app.unknown"),
                icon: defaultIcon
            }
            if (uri.includes("homey:device")) {
                let d = await app.getHomeyAPI().devices.getDevice({id: uri.replace("homey:device:", '')}).catch(app.error);
                if(d == undefined) {
                    app.error("Could not get app information for device " + uri);
                    return resolve(defaultResult);
                }
                return resolve({
                    description: d.name ?? app.homey.__("app.unknown"),
                    icon: d.iconObj?.url ?? defaultIcon
                });
            } else if (uri.includes("homey:app:")) {
                let a = await app.getHomeyAPI().apps.getApp({id: uri.replace("homey:app:", '')}).catch(app.error);
                if(a == undefined) {
                    app.error("Could not get app information for app " + uri);
                    return resolve(defaultResult);
                }
                return resolve({
                    description: a.name ?? app.homey.__("app.unknown"),
                    icon: a.iconObj?.url ?? defaultIcon
                });
            } else if (uri.includes("homey:manager:")) {
                switch (uri.replace("homey:manager:", "")) {
                    case "weather":
                        return resolve({
                            description:app.homey.__("app.weather"),
                            icon: "/app/com.spkes.insightTrendsReloaded/settings/images/weather.svg"
                        });
                    case "apps":
                        let appId= id.split('-')[0]
                        let a = await app.getHomeyAPI().apps.getApp({id: appId}).catch(app.error);
                        if(a == undefined) {
                            app.error(`Could not get app information for app ${appId} (${id})`);
                            return resolve(defaultResult);
                        }
                        return resolve({
                            description: a.name ?? app.homey.__("app.unknown"),
                            icon: a.iconObj?.url ?? defaultIcon
                        });
                    case "system":
                        return resolve({
                            description: app.homey.__("app.system"),
                            icon: "/app/com.spkes.insightTrendsReloaded/settings/images/system.svg"
                        });
                    case "logic":
                        return resolve({
                            description: app.homey.__("app.logic"),
                            icon: "/app/com.spkes.insightTrendsReloaded/settings/images/logic.png"
                        });
                    default:
                        app.log("Unknown manager URI type: " + uri);
                        return resolve(defaultResult);
                }
            }
            app.log("Unknown URI type: " + uri);
            return resolve(defaultResult);
        });
    }

    public static async getCachedInsights(app: InsightTrendsReloaded, filter: any = {type: undefined}) {
        return new Promise<any>(async (resolve) => {
            let insights: any = [];
            if (app.cachedInsights.length != 0 && app.cachedInsightsLastupdate > (Date.now() - 60000 * 60)) {
                insights = app.cachedInsights;
                app.log(`Using cached insights MS till update: ${app.cachedInsightsLastupdate - (Date.now() - 60000 * 60)}`);
            } else {
                try {
                    insights = Object.values(await app.getHomeyAPI().insights.getLogs(filter).catch(app.error));
                    if (insights === undefined || insights.length === 0) {
                        app.error("Failed to get insights returning cached insights");
                        return app.cachedInsights;
                    }
                    let insightsTemp = [];
                    for (let entry of insights) {
                        if (app.cachedInsights.some((e: any) => e.id == entry.id)) {
                            //app.log("Cached insights already has this entry " + entry.id + " . skipping...")
                            continue;
                        }
                        let insightInformation = await this.getDescriptionAndIcon(app, entry.ownerUri, entry.ownerId);
                        let result: any = {
                            name: entry.title,
                            description: insightInformation.description,
                            id: entry.id,
                            uri: entry.ownerUri,
                            type: entry.type,
                            units: entry.units
                        }
                        if (insightInformation.icon != undefined && app.homeyCloudUrl) {
                            result.icon = app.homeyCloudUrl + insightInformation.icon;
                        }
                        if (entry.units) {
                            result.name = result.name + ' (' + entry.units + ')';
                        }
                        insightsTemp.push(result);
                    }
                    app.cachedInsights.push(...insightsTemp);
                    app.cachedInsightsLastupdate = Date.now();
                } catch (e) {
                    app.error(e)
                }
            }
            resolve(insights);
        });
    }

    public static async getSortedInsightsForAutocomplete(app: InsightTrendsReloaded, query: any, filter: any = {type: undefined}): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let insights = await this.getCachedInsights(app, filter).catch(app.error);
            if (insights === undefined) reject(new Error(`Insights are undefined`));
            resolve(
                insights
                    .filter((entry: any) => entry.type == filter.type || filter.type == undefined)
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
