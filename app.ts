import Homey from 'homey';
import PercentileCalculated from "./flows/triggers/percentileCalculated";
import TrendCalculated from "./flows/triggers/trendCalculated";
import CalculatePercentile from "./flows/actions/calculatePercentile";
import CalculateTrend from "./flows/actions/calculateTrend";
import CheckInsight from "./flows/conditions/checkInsight";
import CheckInsightPercentile from "./flows/conditions/checkInsightPercentile";
import {HomeyAPIApp} from "homey-api";

export class InsightTrendsReloaded extends Homey.App {
    public homeyId: string | undefined;
    private api: HomeyAPIApp | undefined;

    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        // @ts-ignore
        this.api = await new HomeyAPIApp({homey: this.homey});
        this._initializeFlowCards();
        this.homeyId = await this.homey.cloud.getHomeyId();
        this.log('InsightTrendsReloaded has been initialized');
    }

    public getHomeyAPI() {
        return this.api;
    }

    async getLogs(range: number, unit: string, opts: { uri: string, id: string, resolution?: string }, isBooleanBasedCapability: boolean = false) {
        return new Promise<{ x: number; y: any; }[]>(async (resolve, reject) => {
            let minutes = range * parseInt(unit);
            if (!isBooleanBasedCapability) {
                opts = {
                    ...opts,
                    resolution: this.minutesToTimespan(minutes)
                }
            }
            // @ts-ignore
            let logEntries: any = await this.getHomeyAPI().insights.getLogEntries(opts);
            if (logEntries === undefined) reject(new Error('Failed to get log entries'));
            //Calculate the lowest date based on user input
            let minDate = Date.now() - minutes * 60000;
            this.log('Got ' + logEntries.values.length + ' entries from homey with timespan(' + minutes + ') of ' + this.minutesToTimespan(minutes))
            resolve(
                //Filter the log entries by date
                logEntries.values.filter((entry: { t: string, v: any }) => {
                    return Date.parse(entry.t) >= minDate && entry.v !== null;
                })
                    //Map the log entries to the x and y
                    .map((entry: { t: string; v: any; }) => {
                        return {x: Date.parse(entry.t) / 1000, y: Number(entry.v)};
                    })
            );
        })
    }

    private _initializeFlowCards() {
        this.log('Initialize Flow cards...');
        //Trigger cards
        new PercentileCalculated(this, this.homey.flow.getTriggerCard('percentileCalculated'));
        new TrendCalculated(this, this.homey.flow.getTriggerCard('trendCalculated'));

        //Conditions Cards
        new CheckInsight(this, this.homey.flow.getConditionCard('checkInsight'));
        new CheckInsightPercentile(this, this.homey.flow.getConditionCard('checkInsightPercentile'))

        //Action Cards
        new CalculatePercentile(this, this.homey.flow.getActionCard('calculatePercentile'));
        new CalculatePercentile(this, this.homey.flow.getActionCard('calculatePercentileWithoutToken'), false);
        new CalculateTrend(this, this.homey.flow.getActionCard('calculateTrend'));
        new CalculateTrend(this, this.homey.flow.getActionCard('calculateTrendWithoutToken'), false);
        this.log('Flow cards initialized');
    }

    /*
        The timespan to query
        (“lastHour” | “lastHourLowRes” | “last6Hours” | “last6HoursLowRes” | “last24Hours”
         “last3Days” | “last7Days” | “last14Days” | “last31Days” | “last3Months” | “last6Months”
         “last2Years” | “today” | “thisWeek” | “thisMonth” | “thisYear” | “yesterday” |
         “lastWeek” | “lastMonth” | “lastYear")
     */
    private minutesToTimespan(minutes: number): string {
        if (minutes <= 60) return 'lastHour';
        if (minutes <= 360) return 'last6Hours';
        if (minutes <= 1440) return 'last24Hours';
        if (minutes <= 4320) return 'last3Days';
        if (minutes <= 10080) return 'last7Days';
        if (minutes <= 20160) return 'last14Days';
        if (minutes <= 44640) return 'last31Days';
        if (minutes <= 131400) return 'last3Months';
        if (minutes <= 262800) return 'last6Months';
        if (minutes <= 525600) return 'lastYear';
        if (minutes <= 1051200) return 'last2Years';
        return 'last24Hours';
    }
}

module.exports = InsightTrendsReloaded;
