import Homey from 'homey';
import PercentileCalculated from "./flows/triggers/percentileCalculated";
import TrendCalculated from "./flows/triggers/trendCalculated";
import CalculatePercentile from "./flows/actions/calculatePercentile";
import CalculateTrend from "./flows/actions/calculateTrend";
import CheckInsight from "./flows/conditions/checkInsight";
import CheckInsightPercentile from "./flows/conditions/checkInsightPercentile";
import {HomeyAPI, HomeyAPIV3Local} from "homey-api";
import {Stats} from "fast-stats";
import Trend from "./trend";
import {HomeyCloudAPI} from "homey-api/assets/types/homey-api.private";
import FlowUtils from "./flows/flowUtils";
import CalculatePercentage from "./flows/actions/calculatePercentage";

export class InsightTrendsReloaded extends Homey.App {
    public homeyCloudUrl: string | undefined;
    private api!: HomeyAPI;
    public significantFigures: boolean = false;
    public ignoreTrendValue: boolean = false;
    public significantFiguresValue: number = 5;
    cachedInsightsLastupdate: number = 0;
    cachedInsights: any[] = [];

    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        try {
            // @ts-ignore
            this.api = await HomeyAPI.createAppAPI({homey: this.homey});
        } catch (err) {
            this.error(err)
        }
        this.significantFigures = await this.homey.settings.get("significantFigures") ?? false;
        this.significantFiguresValue = await this.homey.settings.get("significantFiguresValue") ?? 5;
        this._initializeFlowCards();
        let image = await this.homey.images.createImage();
        // @ts-ignore
        this.homeyCloudUrl = image.cloudUrl.split("/api/")[0];
        await image.unregister();
        this.log('InsightTrendsReloaded has been initialized');
        this.homey.settings.on('set', async key => {
            if (key === 'significantFigures') {
                this.significantFigures = await this.homey.settings.get('significantFigures')
                this.log(`Significant Figure is now ${this.significantFigures}`);
            }
            if (key === 'significantFiguresValue') {
                this.significantFiguresValue = await this.homey.settings.get('significantFiguresValue')
                this.log(`Significant Figure Value is now ${this.significantFiguresValue}`);
            }
            if (key === 'ignoreTrendValue') {
                this.ignoreTrendValue = await this.homey.settings.get('ignoreTrendValue')
                this.log(`Ignore Trend Value is now ${this.ignoreTrendValue}`);
            }
        });

        this.initCachedInsights();

    }

    public initCachedInsights(tries: number = 3) {
        FlowUtils.getCachedInsights(this).then(() => {
            this.log("Successfully cached Insights!");
        }).catch(() => {
            this.error(`Failed to get Insights! Tries left ${--tries}`);
            this.initCachedInsights(--tries)
        });
    }

    public getHomeyAPI() {
        return this.api as any;
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
            let logEntries: any = await this.getHomeyAPI().insights.getLogEntries(opts).catch(this.error);
            if (logEntries === undefined || logEntries.length === 0) {
                this.error('Failed to get log entries! Most likely Timeout after 5000ms. Try again later.');
                return [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]
            }
            //Calculate the lowest date based on user input
            let minDate = Date.now() - minutes * 60000;
            this.log('Got ' + logEntries.values.length + ' entries from homey with timespan(' + minutes + ') of ' + this.minutesToTimespan(minutes))
            resolve(
                //Filter the log entries by date
                logEntries.values.filter((entry: { t: string, v: any }) => {
                    return Date.parse(entry.t) >= minDate;
                })
                    //Map the log entries to the x and y
                    .map((entry: { t: string; v: any; }) => {
                        return {x: Date.parse(entry.t), y: Number(entry.v ?? 0)};
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
        new CalculatePercentage(this, this.homey.flow.getActionCard('calculatePercentage'));
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

    public async searchInsights(query: string) {
        return await FlowUtils.getSortedInsightsForAutocomplete(this, query);
    }

    public async getInsightCalculated(id: string, uri: string, range: number, unit: string, percent: number, type: string) {
        let logEntries = await this.getLogs(range, unit, {id: id, uri: uri}, type === 'boolean');
        let stats = await new Stats().push(logEntries.map((entry: any) => entry.y));
        let trendline = Trend.createTrend(logEntries);
        return {
            trendLine: [
                {x: logEntries[0].x, y: trendline.calcY(logEntries[0].x)},
                {x: logEntries[logEntries.length - 1].x, y: trendline.calcY(logEntries[logEntries.length - 1].x)},
            ],
            //Casting to number because of boolean values
            min: this.significantFigures ? FlowUtils.toSignificantDigits(Number(stats.range()[0]), this.significantFiguresValue) : Number(stats.range()[0]),
            max: this.significantFigures ? FlowUtils.toSignificantDigits(Number(stats.range()[1]), this.significantFiguresValue) : Number(stats.range()[1]),
            mean: this.significantFigures ? FlowUtils.toSignificantDigits(stats.amean(), this.significantFiguresValue) : stats.amean(),
            median: this.significantFigures ? FlowUtils.toSignificantDigits(stats.median(), this.significantFiguresValue) : stats.median(),
            standardDeviation: this.significantFigures ? FlowUtils.toSignificantDigits(stats.stddev(), this.significantFiguresValue) : stats.stddev(),
            trend: this.significantFigures && !this.ignoreTrendValue ? FlowUtils.toSignificantDigits(trendline.slope * 1000, this.significantFiguresValue) : trendline.slope * 1000,
            firstvalue: this.significantFigures ? FlowUtils.toSignificantDigits(logEntries[0].y, this.significantFiguresValue) : logEntries[0].y,
            firstvalue_timestamp: logEntries[0].x,
            firstvalue_time: new Date(logEntries[0].x).toLocaleString('en-GB', {
                timeZone: this.homey.clock.getTimezone(), hour12: false
            }),
            lastvalue: this.significantFigures ? FlowUtils.toSignificantDigits(logEntries[logEntries.length - 1].y, this.significantFiguresValue) : logEntries[logEntries.length - 1].y,
            lastvalue_timestamp: logEntries[logEntries.length - 1].x,
            lastvalue_time: new Date(logEntries[logEntries.length - 1].x).toLocaleString('en-GB', {
                timeZone: this.homey.clock.getTimezone(), hour12: false
            }),
            size: logEntries.length,
            percentile: stats.percentile(percent),
            percent: percent,
            data: logEntries
        };
    }
}

module.exports = InsightTrendsReloaded;
