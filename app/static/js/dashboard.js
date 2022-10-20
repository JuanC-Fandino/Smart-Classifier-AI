let classes = [];
let yArray = [];

fetch('/dashboard/statistics_per_day', {
    method: 'GET',
}).then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            classes.push(data[i].datetime);
            yArray.push(data[i].count);
        }
        let allData = [{
            x: classes,
            y: yArray,
            type: "scatter"
        }];

        const layout = {
            title: 'Números de predicciones por día',
        };
        const config = {responsive: true}

        Plotly.newPlot("myPlot", allData, layout, config);

    });

