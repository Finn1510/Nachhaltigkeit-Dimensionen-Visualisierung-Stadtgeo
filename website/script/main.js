import { parseNumber, calculateNorms, showErrorModal, closeErrorModal } from './utils.js';
import { plot3DVectors, plotAnimatedBarChart } from './plots.js';

let cities = [], eco = [], econ = [], social = [];
let isStrongSustainability = false;

const csvTextUrl = 'data.csv';

fetch(csvTextUrl)
    .then(res => res.text())
    .then(csvText => {
        Papa.parse(csvText, {
            delimiter: ';',
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                const data = results.data;
                data.forEach(row => {
                    const e = parseNumber(row['Ökologie-Score']);
                    const c = parseNumber(row['Ökonomie-Score']);
                    const s = parseNumber(row['Soziales-Score']);
                    if ([e, c, s].some(isNaN)) return;
                    cities.push(row['Raumeinheit']);
                    eco.push(e); econ.push(c); social.push(s);
                });
                if (!cities.length) return showErrorModal('Keine gültigen Datensätze.');

                const norms = calculateNorms(eco, econ, social, isStrongSustainability);
                plot3DVectors(cities, eco, econ, social, norms);
                plotAnimatedBarChart(cities, norms, isStrongSustainability);
            },
            error: err => showErrorModal('Fehler beim CSV-Parsing.')
        });
    });

document.getElementById('sustainabilitySwitch').addEventListener('change', (e) => {
    isStrongSustainability = e.target.checked;
    const norms = calculateNorms(eco, econ, social, isStrongSustainability);
    plot3DVectors(cities, eco, econ, social, norms);
    plotAnimatedBarChart(cities, norms, isStrongSustainability);
});

window.closeErrorModal = closeErrorModal;
