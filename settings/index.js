// noinspection JSUnresolvedVariable

let chart = undefined;
let autoCompleteJS = undefined;

function loadChart() {
    let ctx = document.getElementById('chart');
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    showLine: true,
                    borderColor: 'rgb(170,57,57)',
                    backgroundColor: 'rgba(170,57,57,0.16)',
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBorderWidth: 0,
                    data: []
                },
                {
                    showLine: true,
                    borderColor: 'rgb(0,0,0)',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointBorderWidth: 0,
                    data: []
                }
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                }
            }
        }
    });
}

async function searchInsights(query) {
    return new Promise((resolve, reject) => {
        Homey.api('GET', '/searchInsights?search=' + query, {}, (error, result) => {
            if (error) {
                Homey.alert(error);
                reject(error);
            }
            resolve(result);
        });
    })
}

async function getInsightCalculated(id, uri, range, unit, percentile, type) {
    return new Promise((resolve, reject) => {
        Homey.api('GET', '/getInsightCalculated' +
            '?id=' + id +
            '&uri=' + uri +
            '&range=' + range +
            '&unit=' + unit +
            '&percentile=' + percentile +
            '&type=' + type,
            {}, (error, result) => {
                if (error) {
                    Homey.alert(error);
                    reject(new Error(error));
                }
                resolve(result);
            });
    })
}


async function loadChartData(value) {
    if (chart === undefined) return;
    console.log('Loading chart data...');
    if (value === undefined) {
        console.error('Value is undefined');
        return;
    }
    let range = document.getElementById('range').value ?? 24;
    let unit = document.getElementById('unit').value ?? 60;
    let percent = document.getElementById('percentileRange').value ?? 50;
    if (range === undefined || range === '') range = 24;
    let data = await getInsightCalculated(value.id, value.uri, range, unit, percent, value.type ?? false).catch(e => {
        console.log(e);
    });
    document.getElementById('min').value = data.min;
    document.getElementById('max').value = data.max;
    document.getElementById('mean').value = data.mean;
    document.getElementById('median').value = data.median;
    document.getElementById('standardDeviation').value = data.standardDeviation;
    document.getElementById('trend').value = data.trend;
    document.getElementById('size').value = data.size;
    document.getElementById('firstValue').value = data.firstvalue;
    document.getElementById('firstValueTime').value = data.firstvalue_time;
    document.getElementById('firstValueTimestamp').value = data.firstvalue_timestamp;
    document.getElementById('lastValue').value = data.lastvalue;
    document.getElementById('lastValueTime').value = data.lastvalue_time;
    document.getElementById('lastValueTimestamp').value = data.lastvalue_timestamp;
    document.getElementById('percentile').value = data.percentile;
    chart.data.datasets[0].steppedLine = value.type === 'boolean';
    chart.data.datasets[0].data = data.data;
    chart.data.datasets[1].data = data.trendLine
    chart.update();
}

async function refreshChart() {
    if (autoCompleteJS === undefined) return;
    if (autoCompleteJS.feedback === undefined) return;
    if (autoCompleteJS.feedback.selection.value === undefined) return;
    let btn = document.getElementById('refreshChart');
    if (btn.classList.contains('loading')) return;
    console.log('Refreshing chart');
    document.getElementById('refreshChart').classList.add('loading');
    loadChartData(autoCompleteJS.feedback.selection.value).then(() => {
        btn.classList.remove('loading');
    });
}

function onPercentileChange() {
    document.getElementById('valueRange').innerHTML = document.getElementById('percentileRange').value;
}

function significantFiguresRangeChange() {
    let value = document.getElementById('significantFiguresRange').value;
    if (value < 10) value = "0" + value;
    document.getElementById('significantFiguresRangeValue').innerHTML = value;
}

function saveSignificantFiguresValue() {
    Homey.set('significantFiguresValue', document.getElementById('significantFiguresRange')?.value ?? 4)
}

function autoCompleteHandler() {
    autoCompleteJS = new autoComplete({
        selector: "#insights-select",
        placeHolder: "Search of Insights...",
        data: {
            src: async (query) => {
                return await this.searchInsights(query)
            },
            keys: ["name", "description"],
        },
        resultsList: {
            element: (list, data) => {
                if (!data.results.length) {
                    const message = document.createElement("div");
                    message.classList.add("noResult");
                    message.innerHTML = `<span>Found no results for "${data.query}"</span>`;
                    list.prepend(message);
                }
            },
            noResults: true,
            maxResults: 25
        },
        resultItem: {
            element: (item, data) => {
                let reg = new RegExp("(" + autoCompleteJS.feedback.query + ")")
                let split = data.value.name.split(reg);
                if(split.length > 1)
                    split[1] = "<mark>" + split[1] + "</mark>";
                item.innerHTML = split.join("");
                if (data.value.icon) {
                    const img = document.createElement("img");
                    img.classList.add("search-icon");
                    img.src = data.value.icon;
                    item.prepend(img)
                }
                if (data.value.description) {
                    const description = document.createElement("div");
                    description.classList.add("description");
                    let splitDescription = data.value.description.split(reg);
                    if(splitDescription.length > 1)
                        splitDescription[1] = "<mark>" + splitDescription[1] + "</mark>";
                    description.innerHTML = splitDescription.join("");
                    item.append(description)
                }
            },
            highlight: false,
        },
    });

    autoCompleteJS.input.addEventListener("selection", function (event) {
        const feedback = event.detail;
        autoCompleteJS.input.value = feedback.selection.value.name;
        loadChartData(feedback.selection.value).then();
    });
}

function onHomeyReady(Homey) {
    Array.from(document.getElementsByClassName('tab-links'))
        .forEach(function (element) {
            element.addEventListener('click', handleTab);
        });
    document.getElementById('defaultOpen').click();

    this.loadChart();
    this.autoCompleteHandler();

    Homey.get('significantFigures', (e, boolean) => {
        document.getElementById('significantFigures').checked = boolean ?? false;
    })

    Homey.ready();
}

function onSignificantFigures() {
    let significantFigures = document.getElementById('significantFigures').checked ?? false;
    Homey.set('significantFigures', significantFigures)
    saveSignificantFiguresValue();
}

function handleTab(event) {
    //Hide all tabs
    let tabContent = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = 'none';
    }
    let tabLinks = document.getElementsByClassName('tab-links');
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(' active', '');
    }
    document.getElementById(event.currentTarget.dataset.target).style.display = 'block';
    event.currentTarget.className += ' active';
}
