import { customColorScale } from './utils.js';

export function plot3DVectors(cities, eco, econ, social, norms) {
    const maxNorm = Math.max(...norms);
    const coneTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: [].concat(...eco.map(e => [0, e])),
        y: [].concat(...econ.map(e => [0, e])),
        z: [].concat(...social.map(s => [0, s])),
        line: {
            color: [].concat(...norms.map(n => [n, n])),
            colorscale: customColorScale,
            cmin: 0,
            cmax: maxNorm,
            width: 5
        },
        hoverinfo: 'text',
        text: [].concat(...cities.map((city, i) => [
            `${city}<br>Norm: ${norms[i].toFixed(2)}`, 
            `${city}<br>Norm: ${norms[i].toFixed(2)}`
        ])),
        showlegend: false
    };

    const labelTrace = {
        type: 'scatter3d',
        mode: 'text',
        x: eco, y: econ, z: social,
        text: cities,
        textposition: 'top center',
        textfont: { size: 12, color: 'black' },
        hoverinfo: 'none'
    };

    const axisMax = maxNorm * 1.2;
    const axes = [
        { x: [0, axisMax], y: [0, 0], z: [0, 0], text: ['0', 'Ökologie'], axis: 'x' },
        { x: [0, 0], y: [0, axisMax], z: [0, 0], text: ['0', 'Ökonomie'], axis: 'y' },
        { x: [0, 0], y: [0, 0], z: [0, axisMax], text: ['0', 'Soziales'], axis: 'z' }
    ].map(({ x, y, z, text }) => ({
        type: 'scatter3d',
        mode: 'lines+text',
        x, y, z,
        line: { color: 'black', width: 2 },
        text,
        textposition: ['bottom', 'top'],
        hoverinfo: 'none'
    }));

    Plotly.newPlot('plot3d', [coneTrace, labelTrace, ...axes], {
        scene: {
            xaxis: { title: 'Ökologie-Score', range: [0, axisMax] },
            yaxis: { title: 'Ökonomie-Score', range: [0, axisMax] },
            zaxis: { title: 'Soziales-Score', range: [0, axisMax] },
            aspectmode: 'cube'
        },
        margin: { l: 0, r: 0, b: 0, t: 0 },
        showlegend: false
    });
}

export function plotAnimatedBarChart(cities, norms, isStrong) {
    const pairs = cities.map((city, i) => [city, norms[i]]);
    pairs.sort((a, b) => b[1] - a[1]);

    const sortedCities = pairs.map(p => p[0]);
    const sortedNorms = pairs.map(p => p[1]);

    const barDataInit = [{
        x: sortedCities,
        y: sortedCities.map(() => 0),
        type: 'bar',
        marker: {
            color: sortedNorms,
            colorscale: customColorScale,
            cmin: 0,
            cmax: Math.max(...sortedNorms),
            line: { width: 1, color: '#000' }
        },
        customdata: sortedNorms,
        hovertemplate: '%{x}: %{customdata:.2f}<extra></extra>'
    }];

    Plotly.newPlot('barChart', barDataInit, {
        title: `Euklidische Norm (Gesamtscore) je Stadt (${isStrong ? "Starke" : "Schwache"} Nachhaltigkeit)`,
        yaxis: { title: 'Gesamtscore (Norm)', range: [0, Math.max(...sortedNorms) * 1.2] },
        xaxis: { tickangle: -45 },
        margin: { l: 50, r: 20, t: 50, b: 100 }
    }).then(() => {
        Plotly.animate('barChart', {
            data: [{ y: sortedNorms }]
        }, {
            transition: { duration: 1000, easing: 'cubic-in-out' },
            frame: { duration: 1000 }
        });
    });
}
