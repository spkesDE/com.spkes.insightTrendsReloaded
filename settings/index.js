onHomeyReady(undefined)

function loadChart() {
    let ctx = document.getElementById('chart');
    let chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 3
            }]
        }
    });
}

function onHomeyReady(Homey) {
    Array.from(document.getElementsByClassName('tab-links'))
        .forEach(function (element) {
            element.addEventListener('click', handleTab);
        });
    document.getElementById('defaultOpen').click();

    this.loadChart();
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
