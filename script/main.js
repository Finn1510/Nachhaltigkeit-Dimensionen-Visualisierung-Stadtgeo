import { parseNumber, calculateNorms, showErrorModal, closeErrorModal, calculateAverages } from './utils.js';
import { plot3DVectors, plotAnimatedBarChart } from './plots.js';

let cities = [], eco = [], econ = [], social = [];
let sustainabilityType = 'weak'; // Default to weak sustainability
let weights = {
    eco: 1.0,
    econ: 1.0,
    social: 1.0
};

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

                updateWeights();
                updateVisualization();
            },
            error: err => showErrorModal('Fehler beim CSV-Parsing.')
        });
    });

function updateWeights() {
    if (sustainabilityType === 'weak') {
        weights = { eco: 1.0, econ: 1.0, social: 1.0 };
        document.getElementById('ecoWeight').value = '1.0';
        document.getElementById('econWeight').value = '1.0';
        document.getElementById('socialWeight').value = '1.0';
        
        document.querySelectorAll('.weight-input input').forEach(input => {
            input.disabled = true;
        });
    } 
    else if (sustainabilityType === 'strong') {
        weights = { eco: 1.5, econ: 0.5, social: 1.0 };
        document.getElementById('ecoWeight').value = '1.5';
        document.getElementById('econWeight').value = '0.5';
        document.getElementById('socialWeight').value = '1.0';
        
        document.querySelectorAll('.weight-input input').forEach(input => {
            input.disabled = true;
        });
    }
    else { // custom
        document.querySelectorAll('.weight-input input').forEach(input => {
            input.disabled = false;
        });
        weights = {
            eco: parseFloat(document.getElementById('ecoWeight').value),
            econ: parseFloat(document.getElementById('econWeight').value),
            social: parseFloat(document.getElementById('socialWeight').value)
        };
    }
}

function updateVisualization() {
    // Verwende neutrale Gewichtungen (1.0) für den 3D-Plot
    const neutralWeights = { eco: 1.0, econ: 1.0, social: 1.0 };
    const norms = calculateNorms(eco, econ, social, neutralWeights);
    
    // Verwende die aktuellen Gewichtungen nur für das Balkendiagramm
    const averages = calculateAverages(eco, econ, social, weights);
    
    plot3DVectors(cities, eco, econ, social, norms);
    
    // Das Balkendiagramm erhält die gewichteten Daten
    plotAnimatedBarChart(cities, averages, sustainabilityType);
}

// Setup event listeners for sustainability type radio buttons
document.querySelectorAll('input[name="sustainabilityType"]').forEach(input => {
    input.addEventListener('change', (e) => {
        sustainabilityType = e.target.value;
        updateWeights();
        updateVisualization();
    });
});

// Setup event listeners for weight inputs
document.querySelectorAll('.weight-input input').forEach(input => {
    input.addEventListener('input', () => {
        if (sustainabilityType === 'custom') {
            weights = {
                eco: parseFloat(document.getElementById('ecoWeight').value) || 1.0,
                econ: parseFloat(document.getElementById('econWeight').value) || 1.0,
                social: parseFloat(document.getElementById('socialWeight').value) || 1.0
            };
            updateVisualization();
        }
    });
});

window.closeErrorModal = closeErrorModal;
