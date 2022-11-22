fetch('/dashboard/statistics_per_day', {
    method: 'GET',
}).then(response => response.json())
    .then(data => {
        let classes = [];
        let yArray = [];
        for (let i = 0; i < data.length; i++) {
            let date = new Date(data[i].datetime);
            classes.push(date.toISOString().split("T")[0]);
            yArray.push(data[i].count);
        }
        let allData = [{
            x: classes,
            y: yArray,
            type: "scatter",
            line: {
                color: "#28a745",
            }
        }];

        const layout = {
            title: 'Número de predicciones por día',
            font: {
                size: 16
            }
        };
        const config = {responsive: true}

        Plotly.newPlot("myPlot", allData, layout, config);

    });

fetch('/dashboard/users_per_day', {
    method: 'GET',
}).then(response => response.json())
    .then(data => {
        let classes = [];
        let yArray = [];
        for (let i = 0; i < data.length; i++) {
            let date = new Date(data[i].datetime);
            classes.push('[' + date.toISOString().split("T")[0] + ']');
            yArray.push(data[i].count);
        }
        let allData = [{
            x: classes,
            y: yArray,
            type: "bar",
            width: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
            marker: {
                color: "#28a745",
            }
        }];

        const layout = {
            title: 'Usuarios registrados por día (última semana)',
            font: {
                size: 16
            }
        };
        const config = {responsive: true}

        Plotly.newPlot("usersPlot", allData, layout, config);

    });

fetch('/dashboard/predictions_per_type', {
    method: 'GET',
}).then(response => response.json())
    .then(data => {
        let classes = [];
        let yArray = [];
        for (let i = 0; i < data.length; i++) {
            classes.push(data[i].type);
            yArray.push(data[i].count);
        }
        let allData = [{
            labels: classes,
            values: yArray,
            type: "pie",
            automargin: true,
        }];

        const layout = {
            title: 'Predicciones por tipo',
            font: {
                size: 16
            }
        };
        const config = {responsive: true}

        Plotly.newPlot("predictionsPlot", allData, layout, config);
        const pieChart = document.getElementById('predictionsPlot');

        pieChart.on('plotly_click', function (data) {
            let predictionType = data.points[0].label;
            fetch('/dashboard/percentage_accurate_predictions/' + predictionType, {
                method: 'GET',
            }).then(response => response.json())
                .then(data => {
                    let container = document.getElementById('custom_type');
                    container.style.display = 'block';
                    let kpi_label = document.getElementById('type_label');
                    kpi_label.innerHTML = 'Predicciones Correctas (' + predictionType + ')';
                    let kpi_value = document.getElementById('type_value');
                    let value = parseFloat(data);
                    if (isNaN(value)) {
                        kpi_value.innerHTML = 'No hay datos';
                    } else {
                        kpi_value.innerHTML = value + '%';
                    }

            });
        });

    });


