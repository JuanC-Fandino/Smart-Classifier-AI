let classes = [];

let yArray = [];


fetch('/statistics/sorted', {
    method: 'GET',
}).then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            classes.push(data[i].prediction_type);
            yArray.push(data[i].count);
        }
        let allData = [{
            x: classes,
            y: yArray,
            type: "bar"
        }];

        const layout = {
            title: 'Número de predicciones por tipo',
        };

        const config = {responsive: true}

        Plotly.newPlot("myPlot", allData, layout, config);

    });

