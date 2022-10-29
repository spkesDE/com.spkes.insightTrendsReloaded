With the help of Homey’s insightful features, you can view all sensor measurements and their historical evolution. Take it a step further and do more than just observe the insights; act accordingly or even glimpse the future a little.

You can choose an insight (a device and a capacity, such as the outside temperature), as well as a timeframe to analyze. The outcomes will then be computed as follows:

Trend: a number between -1 and 1 that indicates whether the sensors’ measurements are increasing or decreasing (and by how much/slowly). For instance, a score of 0.75 indicates a sharp upward trend, while -0.1 denotes a mild negative trend.
Min/max: the smallest/largest value found within the timeframe
Average: the average value across all data points (arithmetic mean)
Median: If all values were sorted and you took the middle value, it would be the median.
Percentile: Passing in 50% as an argument will return the median, while 25% and 75% will return the first and third quartiles respectively.
Standard deviation: a measure of how “spread out” the data set is.
Number of used data points: The number of measures in the dataset. This can help assess how reliable the results presented above are. Important: A larger timeframe may not contain a larger dataset than a smaller one. Since Athom decreases the data points over a longer timespan.