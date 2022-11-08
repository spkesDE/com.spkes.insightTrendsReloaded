// noinspection JSUnresolvedVariable

function loadChart() {
    let ctx = document.getElementById('chart');
    let chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                showLine: true,
                borderColor: 'rgb(79 143 215)',
                backgroundColor: 'rgba(79,143,215,0.16)',
                fill: true,
                borderWidth: 2,
                pointRadius: 3,
                pointBorderWidth: 0,
                data: [
                    {x: 1664841600000, y: 22.422795377776144},
                    {x: 1664863200000, y: 21.63384675555556},
                    {x: 1664884800000, y: 21.06007514074124},
                    {x: 1664906400000, y: 21.236067555554907},
                    {x: 1664928000000, y: 21.669654755555488},
                    {x: 1664949600000, y: 21.83661274074112},
                    {x: 1664971200000, y: 20.563284622221968},
                    {x: 1664992800000, y: 21.340475733332475},
                    {x: 1665014400000, y: 21.65049457777877},
                    {x: 1665036000000, y: 20.74383857777766},
                    {x: 1665057600000, y: 21.229040829630176},
                    {x: 1665079200000, y: 21.10547839999984},
                    {x: 1665100800000, y: 21.49879656296234},
                    {x: 1665122400000, y: 20.826577303704017},
                    {x: 1665144000000, y: 20.677405866666888},
                    {x: 1665165600000, y: 21.314602192592307},
                    {x: 1665187200000, y: 21.723666014814142},
                    {x: 1665208800000, y: 21.82720237036965},
                    {x: 1665230400000, y: 21.60497872592696},
                    {x: 1665252000000, y: 21.849767822222606},
                    {x: 1665273600000, y: 22.357579851851124},
                    {x: 1665295200000, y: 22.468830814814034},
                    {x: 1665316800000, y: 22.323349807408594},
                    {x: 1665338400000, y: 21.51187982222212},
                    {x: 1665360000000, y: 21.66652989629684},
                    {x: 1665381600000, y: 21.587616948148003},
                    {x: 1665403200000, y: 21.644528592593197},
                    {x: 1665424800000, y: 21.190802014813723},
                    {x: 1665446400000, y: 21.463192651852346},
                    {x: 1665468000000, y: 21.973378844446405},
                    {x: 1665489600000, y: 21.51368960000043},
                    {x: 1665511200000, y: 21.57639300740704},
                    {x: 1665532800000, y: 21.077484088889083},
                    {x: 1665554400000, y: 21.20019342222279},
                    {x: 1665576000000, y: 21.462134518519292},
                    {x: 1665597600000, y: 21.411318518516893},
                    {x: 1665619200000, y: 21.585044859260368},
                    {x: 1665640800000, y: 21.711158044445295},
                    {x: 1665662400000, y: 21.18354275555571},
                    {x: 1665684000000, y: 20.954688474073983},
                    {x: 1665705600000, y: 21.387413096296186},
                    {x: 1665727200000, y: 21.205407999999792},
                    {x: 1665748800000, y: 21.772883437037144},
                    {x: 1665770400000, y: 22.91817813333272},
                    {x: 1665792000000, y: 23.082527288888997},
                    {x: 1665813600000, y: 23.166562607408125},
                    {x: 1665835200000, y: 23.394094459258337},
                    {x: 1665856800000, y: 23.38160545185092},
                    {x: 1665878400000, y: 23.56705754074093},
                    {x: 1665900000000, y: 23.56070945185168},
                    {x: 1665921600000, y: 23.519859674075168},
                    {x: 1665943200000, y: 23.774302814816384},
                    {x: 1665964800000, y: 23.6541354666652},
                    {x: 1665986400000, y: 23.696457955556305},
                    {x: 1666008000000, y: 23.729877333333352},
                    {x: 1666029600000, y: 23.86567964444558},
                    {x: 1666051200000, y: 23.666174103702623},
                    {x: 1666072800000, y: 23.653914074073448},
                    {x: 1666094400000, y: 22.266267022222223},
                    {x: 1666116000000, y: 21.470007940740736},
                    {x: 1666137600000, y: 21.442974340740168},
                    {x: 1666159200000, y: 21.786676148149954},
                    {x: 1666180800000, y: 21.788998162963654},
                    {x: 1666202400000, y: 22.045478874074675},
                    {x: 1666224000000, y: 22.25171626666656},
                    {x: 1666245600000, y: 22.28002228148132},
                    {x: 1666267200000, y: 22.322591288887047},
                    {x: 1666288800000, y: 22.1760104296278},
                    {x: 1666310400000, y: 22.098395970370376},
                    {x: 1666332000000, y: 22.226593185185635},
                    {x: 1666353600000, y: 22.22467128888911},
                    {x: 1666375200000, y: 22.29077712592588},
                    {x: 1666396800000, y: 22.234610725925208},
                    {x: 1666418400000, y: 22.37045380740597},
                    {x: 1666440000000, y: 22.487470459258063},
                    {x: 1666461600000, y: 22.50084598518508},
                    {x: 1666483200000, y: 22.46363875555677},
                    {x: 1666504800000, y: 22.421895585184895},
                    {x: 1666526400000, y: 22.426661925926254},
                    {x: 1666548000000, y: 22.420081777778023},
                    {x: 1666569600000, y: 22.462083792591866},
                    {x: 1666591200000, y: 22.42621890370375},
                    {x: 1666612800000, y: 22.44420290370384},
                    {x: 1666634400000, y: 22.496855229630132},
                    {x: 1666656000000, y: 22.522665718517562},
                    {x: 1666677600000, y: 22.63039620740816},
                    {x: 1666699200000, y: 22.52953125926029},
                    {x: 1666720800000, y: 22.561539792590416},
                    {x: 1666742400000, y: 22.63940551111222},
                    {x: 1666764000000, y: 22.672967348150287},
                    {x: 1666785600000, y: 22.62277973333339},
                    {x: 1666807200000, y: 22.60873386666589},
                    {x: 1666828800000, y: 22.721365333333075},
                    {x: 1666850400000, y: 22.5757155555575},
                    {x: 1666872000000, y: 22.534404977778138},
                    {x: 1666893600000, y: 22.583822222221915},
                    {x: 1666915200000, y: 22.844848355555712},
                    {x: 1666936800000, y: 21.95208794074114},
                    {x: 1666958400000, y: 21.16612740740734}
                ]
            }],
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
                    time: {
                        displayFormats: {
                            'millisecond': 'HH:mm:ss',
                            'second': 'HH:mm:ss',
                            'minute': 'HH:mm:ss',
                            'hour': 'HH:mm:ss',
                            'day': 'HH:mm:ss',
                            'week': 'HH:mm:ss',
                            'month': 'HH:mm:ss',
                            'quarter': 'HH:mm:ss',
                            'year': 'HH:mm:ss',
                        }
                    }
                }
            }
        }
    });
}

async function searchInsights(query) {
    return new Promise((resolve, reject) => {
        Homey.api('GET', '/searchInsights?search=' + query, {}, (error, result) => {
            if (error || result.error) {
                Homey.alert(error ?? result.error);
                reject(error);
            }
            resolve(result.results);
        });
    })
}


function autoCompleteHandler() {
    const autoCompleteJS = new autoComplete({
        selector: "#insights-select",
        placeHolder: "Search of Insights...",
        data: {
            src: async (query) => {
                let data = await this.searchInsights(query);
                console.log(data);
                return data;
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
                if (data.value.units) {
                    item.innerHTML += " (" + data.value.units + ")";
                }
            },
            highlight: true,
        },
    });

    autoCompleteJS.input.addEventListener("selection", function (event) {
        const feedback = event.detail;
        autoCompleteJS.input.value = feedback.selection.value.name;
    });
}

function onHomeyReady(Homey) {
    if (Homey.isMock) {
        Homey.alert('Warning: Homey is mocked only!!!')
        Homey.addRoutes([
            {
                method: 'GET',
                path: '/searchInsights',
                public: false,
                fn: function (args, callback) {
                    return callback(null, {
                        error: null, results: [{
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
                        }]
                    })
                }
            },
            {
                method: 'GET',
                path: '/trends',
                public: false,
                fn: async function (args, callback) {
                    let entries = [];
                    let now = Date.now();
                    for (let i = 0; i < 100; i++) {
                        entries.push({x: now + (i * 1000 * 60) - (100 * 1000 * 60), y: Math.random() * 100});
                    }
                    return callback(null, {
                        entries: entries,
                        trendline: [{x: now - (100 * 1000 * 60), y: 0}, {
                            x: now + (100 * 1000 * 60) - (100 * 1000 * 60),
                            y: 100
                        }],
                        min: -100,
                        max: 100,
                        amean: 10,
                        median: 15,
                        standardDeviation: 5,
                        trend: 0.45,
                        size: 10,
                        lastValue: Math.random() * 100,
                        performance: {
                            total: 0,
                            calculation: 0,
                            fetchInsight: 0,
                            fetchLogEntries: 0
                        }
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
    Homey.ready();
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
