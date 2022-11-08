// noinspection JSUnresolvedVariable

let chart = undefined;

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
    console.log('Loading chart data...')
    let range = document.getElementById('range').value ?? 24;
    let unit = document.getElementById('unit').value ?? 60;
    if (range === undefined || range === '') range = 24;
    let data = await getInsightCalculated(value.id, value.uri, range, unit, 25, value.type ?? false).catch(e => {
        console.log(e);
    });
    document.getElementById('min').value = data.min;
    document.getElementById('max').value = data.max;
    document.getElementById('mean').value = data.mean;
    document.getElementById('median').value = data.median;
    document.getElementById('standardDeviation').value = data.standardDeviation;
    document.getElementById('trend').value = data.trend;
    document.getElementById('size').value = data.size;
    chart.data.datasets[0].steppedLine = value.type === 'boolean';
    chart.data.datasets[0].data = data.data;
    chart.data.datasets[1].data = data.trendLine
    chart.update();
}

function autoCompleteHandler() {
    const autoCompleteJS = new autoComplete({
        selector: "#insights-select",
        placeHolder: "Search of Insights...",
        data: {
            src: async (query) => {
                return await this.searchInsights(query)
            },
            keys: ["name"],
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
        },
        resultItem: {
            element: (item, data) => {
                if (data.value.icon) {
                    const img = document.createElement("img");
                    img.classList.add("search-icon");
                    img.src = data.value.icon;
                    item.prepend(img)
                }
                if (data.value.description) {
                    const description = document.createElement("div");
                    description.classList.add("description");
                    description.innerHTML = data.value.description;
                    item.append(description)
                }
            },
            highlight: true,
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
