// noinspection JSUnresolvedVariable

let chart = undefined;
let autoCompleteJS = undefined;
let requestInProgress = false;

function loadChart() {
    let ctx = document.getElementById('chart');
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    showLine: true,
                    borderColor: 'rgba(0, 130, 250, .7)',
                    backgroundColor: 'rgba(0, 130, 250,0.16)',
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBorderWidth: 0,
                    data: []
                },
                {
                    showLine: true,
                    borderColor: 'rgba(79,79,79,0.7)',
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
    return new Promise(async (resolve, reject) => {
        await Homey.api('GET', '/searchInsights?search=' + query, {}, (error, result) => {
            if (error) {
                Homey.alert(error);
                reject(error);
            }
            resolve(result);
        });
    })
}

async function getInsightCalculated(id, uri, range, unit, percentile, type) {
    return new Promise(async (resolve, reject) => {
        await Homey.api('GET', '/getInsightCalculated' +
            '?id=' + id +
            '&uri=' + uri +
            '&range=' + range +
            '&unit=' + unit +
            '&percentile=' + percentile +
            '&type=' + type,
            {}, (error, result) => {
                if (error) {
                    console.error("Got Error!", error);
                    console.error(result);
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
    console.log(value)
    let data = await getInsightCalculated(value.id, value.uri, range, unit, percent, value.type ?? false).catch(e => {
        console.log(e);
    });
    document.getElementById('min').value = data.min ?? "0";
    document.getElementById('max').value = data.max ?? "0";
    document.getElementById('mean').value = data.mean ?? "0";
    document.getElementById('median').value = data.median ?? "0";
    document.getElementById('standardDeviation').value = data.standardDeviation ?? "0";
    document.getElementById('trend').value = data.trend ?? "0";
    document.getElementById('size').value = data.size ?? "0";
    document.getElementById('firstValue').value = data.firstvalue ?? "0";
    document.getElementById('firstValueTime').value = data.firstvalue_time ?? "0";
    document.getElementById('firstValueTimestamp').value = data.firstvalue_timestamp ?? "0";
    document.getElementById('lastValue').value = data.lastvalue ?? "0";
    document.getElementById('lastValueTime').value = data.lastvalue_time ?? "0";
    document.getElementById('lastValueTimestamp').value = data.lastvalue_timestamp ?? "0";
    document.getElementById('percentile').value = data.percentile ?? "0";
    chart.data.datasets[0].steppedLine = value.type === 'boolean';
    chart.data.datasets[0].data = data.data ?? [];
    chart.data.datasets[1].data = data.trendLine ?? []
    chart.update();
}

async function refreshChart() {
    if (autoCompleteJS === undefined) return;
    if (autoCompleteJS.feedback === undefined) return;
    if (autoCompleteJS.feedback.selection.value === undefined) return;
    let icon = document.getElementById('reload-icon');
    if (icon.classList.contains('fa-spin')) return;
    console.log('Refreshing chart');
    icon.classList.add('fa-spin');
    loadChartData(autoCompleteJS.feedback.selection.value).then(() => {
        if (Homey.isMock)
            setTimeout(() => {
                icon.classList.remove('fa-spin');
            }, 1000)
        else
            icon.classList.remove('fa-spin');
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
                    if (data.value.icon)
                        description.classList.add("icon-padding");
                    let splitDescription = data.value.description.split(reg);
                    if (splitDescription.length > 1)
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

function createWarningBox(text) {
    let warningBox = document.createElement('div');
    warningBox.style.position = "fixed";
    warningBox.style.bottom = "1%";
    warningBox.style.left = "50%";
    warningBox.style.width = "25%"
    warningBox.style.padding = "5px"
    warningBox.style.fontWeight = "bold";
    warningBox.style.transform = "translateX(-50%)";
    warningBox.style.border = "1px solid black";
    warningBox.style.backgroundColor = "rgba(200, 0, 0, 0.75)";
    warningBox.style.textAlign = "center";
    warningBox.innerHTML = text;
    document.body.appendChild(warningBox);
}

function onHomeyReady(Homey) {
    if (Homey.isMock) {
        createWarningBox("Homey is Mock");
        Homey.addRoutes([
            {
                method: 'GET',
                path: '/searchInsights',
                public: false,
                fn: function (args, callback) {
                    return callback(null, [{
                        name: 'temperature 1',
                        description: 'device 1',
                        id: '1',
                        uri: 'uri',
                        type: 'number',
                        units: '&#8451',
                        booleanBasedCapability: false,
                        color: '#ff0000',
                        icon: "https://60755625448a330c22a0bdfe.connect.athom.com/icon/de128d34f89b99dc3c44eb5678e3e067/icon.svg",
                    }, {
                        name: 'temperature 2',
                        description: 'device 2',
                        id: '2',
                        uri: 'uri',
                        type: 'number',
                        units: '&#8451',
                        booleanBasedCapability: false,
                        color: '#00ff00',
                        icon: "https://60755625448a330c22a0bdfe.connect.athom.com/icon/de128d34f89b99dc3c44eb5678e3e067/icon.svg"
                    }, {
                        name: 'temperature 3',
                        description: 'device 3',
                        id: '3',
                        uri: 'uri',
                        type: 'number',
                        units: '&#8451',
                        booleanBasedCapability: false,
                        color: '#0000ff',
                        icon: "https://60755625448a330c22a0bdfe.connect.athom.com/icon/de128d34f89b99dc3c44eb5678e3e067/icon.svg"
                    }]);
                }
            },
            {
                method: 'GET',
                path: '/getInsightCalculated',
                public: false,
                fn: async function (args, callback) {
                    let entries = [];
                    let now = Date.now();
                    for (let i = 0; i < 100; i++) {
                        entries.push({x: now + (i * 1000 * 60) - (100 * 1000 * 60), y: Math.random() * 100});
                    }
                    return callback(null, {
                        data: entries,
                        trendLine: [{x: now - (100 * 1000 * 60), y: 0}, {
                            x: now + (100 * 1000 * 60) - (100 * 1000 * 60),
                            y: 100
                        }],
                        firstvalue: 18.800640000000012,
                        firstvalue_time: "07/11/2022, 14:40:00",
                        firstvalue_timestamp: 1667828400000,
                        lastvalue: 18.808627199999986,
                        lastvalue_time: "08/11/2022, 14:30:00",
                        lastvalue_timestamp: 1667914200000,
                        max: 18.869247999999985,
                        mean: 18.808090343321716,
                        median: 18.808832000000013,
                        min: 18.800435200000006,
                        percent: "25",
                        percentile: 18.800640000000012,
                        size: 287,
                        standardDeviation: 0.011371776738991278,
                        trend: 2.7052422915815307e-7,
                    })
                }
            }
        ]);
    }
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

function onIgnoreTrendValue() {
    let significantFigures = document.getElementById('ignoreTrendValue').checked ?? false;
    Homey.set('ignoreTrendValue', significantFigures)
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
