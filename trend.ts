export default class Trend {

    /*
        Converted to TS by spkesDE
        https://github.com/heofs/trendline

        MIT License

        Copyright (c) 2020 Henning Ofstad

        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.
    */

    static getAverage(arr: any) {
        const total = arr.reduce((acc: any, c: any) => acc + c, 0);
        return total / arr.length;
    }

    static getSum(arr: any) {
        return arr.reduce((acc: any, c: any) => acc + c, 0);
    }

    static createTrend(data: any, xKey: string = "x", yKey: string = "y") {
        const xData = data.map((value: any) => value[xKey]);
        const yData = data.map((value: any) => value[yKey]);

        // average of X values and Y values
        const xMean: number = this.getAverage(xData);
        const yMean: number = this.getAverage(yData);

        // Subtract X or Y mean from corresponding axis value
        const xMinusYMean = xData.map((val: any) => val - xMean);
        const yMenusXMean = yData.map((val: any) => val - yMean);

        const xMinusXMeanSq = xMinusYMean.map((val: any) => Math.pow(val, 2));

        const xy = [];
        for (let x = 0; x < data.length; x++) {
            xy.push(xMinusYMean[x] * yMenusXMean[x]);
        }

        const xySum = this.getSum(xy);

        // b1 is the slope
        const b1 = xySum / this.getSum(xMinusXMeanSq);
        // b0 is the start of the slope on the Y axis
        const b0 = yMean - b1 * xMean;

        return {
            slope: b1,
            yStart: b0,
            calcY: (x: number) => b0 + b1 * x,
        };
    }
}
