import { customColorScale } from './utils.js';

// Keep track if the plot was initialized
let plot3dInitialized = false;
let globalCameraPosition = null;
let barChartInitialized = false;
let currentAnimationPromise = null;
let currentCityOrder = null;

// Initialize fullscreen functionality
function initFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const plot3dContainer = document.getElementById('plot3d-container');
    const plot3dElement = document.getElementById('plot3d');
    
    if (!fullscreenBtn) return;
    
    fullscreenBtn.addEventListener('click', () => {
        const isFullscreen = plot3dContainer.classList.contains('fullscreen-mode');
        
        if (!isFullscreen) {
            plot3dContainer.classList.add('fullscreen-mode');
            fullscreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/></svg>';
            
            // Resize plot for better fullscreen view
            setTimeout(() => {
                Plotly.relayout(plot3dElement, {
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, 100);
        } else {
            plot3dContainer.classList.remove('fullscreen-mode');
            fullscreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/></svg>';
            
            // Reset to original size
            setTimeout(() => {
                Plotly.relayout(plot3dElement, {
                    width: null,
                    height: 600
                });
            }, 100);
        }
    });
    
    // Handle escape key to exit fullscreen
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && plot3dContainer.classList.contains('fullscreen-mode')) {
            plot3dContainer.classList.remove('fullscreen-mode');
            fullscreenBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/></svg>';
            
            // Reset to original size
            setTimeout(() => {
                Plotly.relayout(plot3dElement, {
                    width: null,
                    height: 600
                });
            }, 100);
        }
    });
}

export function plot3DVectors(cities, eco, econ, social, norms) {
    const maxNorm = Math.max(...norms);
    const axisMax = maxNorm * 0.8;
    
    const lineX = [], lineY = [], lineZ = [], lineColors = [], lineTexts = [];
    
    for (let i = 0; i < cities.length; i++) {
        lineX.push(0, eco[i]);
        lineY.push(0, econ[i]);
        lineZ.push(0, social[i]);
        
        const normValue = norms[i];
        lineColors.push(normValue, normValue);
        
        const text = `${cities[i]}<br>Ökologie: ${eco[i].toFixed(2)}<br>Ökonomie: ${econ[i].toFixed(2)}<br>Soziales: ${social[i].toFixed(2)}`;
        lineTexts.push(text, text);
    }

    const coneTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: lineX,
        y: lineY,
        z: lineZ,
        line: {
            color: lineColors,
            colorscale: customColorScale,
            cmin: 0,
            cmax: maxNorm,
            width: 5
        },
        hoverinfo: 'text',
        text: lineTexts,
        showlegend: false
    };

    const labelTrace = {
        type: 'scatter3d',
        mode: 'text',
        x: eco, 
        y: econ, 
        z: social,
        text: cities,
        textposition: 'top center',
        textfont: { size: 12, color: 'black' },
        hoverinfo: 'none'
    };

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

    const layout = {
        scene: {
            xaxis: { title: 'Ökologie-Score', range: [0, axisMax] },
            yaxis: { title: 'Ökonomie-Score', range: [0, axisMax] },
            zaxis: { title: 'Soziales-Score', range: [0, axisMax] },
            aspectmode: 'cube'
        },
        margin: { l: 0, r: 0, b: 0, t: 0 },
        showlegend: false
    };

    // Save the current camera position before updating if it exists
    if (!globalCameraPosition) {
        const graphDiv = document.getElementById('plot3d');
        if (graphDiv && graphDiv._fullLayout && graphDiv._fullLayout.scene && graphDiv._fullLayout.scene.camera) {
            globalCameraPosition = JSON.parse(JSON.stringify(graphDiv._fullLayout.scene.camera));
        }
    }

    // Apply the stored camera position if available
    if (globalCameraPosition) {
        layout.scene.camera = globalCameraPosition;
    }

    // Use React for updates instead of newPlot to avoid rerendering
    if (!plot3dInitialized) {
        Plotly.newPlot('plot3d', [coneTrace, labelTrace, ...axes], layout);
        plot3dInitialized = true;
        
        // Add event listener to capture camera position changes
        const plot3dElement = document.getElementById('plot3d');
        plot3dElement.on('plotly_relayout', function(eventData) {
            const graphDiv = document.getElementById('plot3d');
            if (graphDiv && graphDiv._fullLayout && graphDiv._fullLayout.scene && graphDiv._fullLayout.scene.camera) {
                globalCameraPosition = JSON.parse(JSON.stringify(graphDiv._fullLayout.scene.camera));
            }
        });
        
        // Initialize fullscreen button after first plot creation
        setTimeout(initFullscreenButton, 100);
    } else {
        Plotly.react('plot3d', [coneTrace, labelTrace, ...axes], layout);
    }
}

export function plotAnimatedBarChart(cities, averages, sustainabilityType) {
    const pairs = cities.map((city, i) => [city, averages[i]]);
    pairs.sort((a, b) => b[1] - a[1]);

    const sortedCities = pairs.map(p => p[0]);
    const sortedNorms = pairs.map(p => p[1]);

    let titleText = 'Mittelwert je Stadt (';
    if (typeof sustainabilityType === 'boolean') {
        titleText += sustainabilityType ? "Starke" : "Schwache";
        titleText += ' Nachhaltigkeit)';
    } else {
        if (sustainabilityType === 'weak') titleText += 'Schwache Nachhaltigkeit)';
        else if (sustainabilityType === 'strong') titleText += 'Starke Gewichtung)';
        else titleText += 'Benutzerdefinierte Gewichtung)';
    }

    // Cancel any ongoing animation
    if (currentAnimationPromise) {
        Plotly.animate('barChart', null, { frame: { duration: 0 } });
        currentAnimationPromise = null;
    }

    // Check if city order has changed (indicating we need to handle reordering)
    const orderChanged = currentCityOrder && 
        JSON.stringify(currentCityOrder) !== JSON.stringify(sortedCities);

    if (!barChartInitialized) {
        // First time: create the plot with initial zero values for animation
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

        const layout = {
            title: { text: titleText },
            yaxis: { title: 'Gesamtscore', range: [0, Math.max(...sortedNorms) * 1.2] },
            xaxis: { tickangle: -45 },
            margin: { l: 50, r: 20, t: 50, b: 100 }
        };

        Plotly.newPlot('barChart', barDataInit, layout).then(() => {
            barChartInitialized = true;
            currentCityOrder = [...sortedCities];
            currentAnimationPromise = Plotly.animate('barChart', {
                data: [{ y: sortedNorms }]
            }, {
                transition: { duration: 1000, easing: 'cubic-in-out' },
                frame: { duration: 1000 }
            }).then(() => {
                currentAnimationPromise = null;
            });
        });
    } else if (orderChanged) {
        // First animate values in current order, then reorder
        const currentElement = document.getElementById('barChart');
        const currentData = currentElement.data;
        
        // Step 1: Animate to new values in current order
        const currentOrderNewValues = currentCityOrder.map(city => {
            const newIndex = sortedCities.indexOf(city);
            return newIndex !== -1 ? sortedNorms[newIndex] : 0;
        });
        
        const currentOrderColors = currentCityOrder.map(city => {
            const newIndex = sortedCities.indexOf(city);
            return newIndex !== -1 ? sortedNorms[newIndex] : 0;
        });

        // Animate to new values in current order
        currentAnimationPromise = Plotly.animate('barChart', {
            data: [{
                y: currentOrderNewValues,
                marker: { color: currentOrderColors }
            }],
            layout: { title: { text: titleText } }
        }, {
            transition: { duration: 600, easing: 'cubic-in-out' },
            frame: { duration: 600 }
        }).then(() => {
            // Step 2: Short delay before reordering
            return new Promise(resolve => setTimeout(resolve, 200));
        }).then(() => {
            // Step 3a: First update the city labels instantly
            return Plotly.restyle('barChart', { x: [sortedCities] });
        }).then(() => {
            // Step 3b: Then animate bars to their new positions
            return Plotly.animate('barChart', {
                data: [{
                    y: sortedNorms,
                    marker: { color: sortedNorms }
                }]
            }, {
                transition: { 
                    duration: 800, 
                    easing: 'cubic-in-out'
                },
                frame: { duration: 800 }
            });
        }).then(() => {
            currentCityOrder = [...sortedCities];
            currentAnimationPromise = null;
        });
    } else {
        // Same order: just animate the values
        currentAnimationPromise = Plotly.animate('barChart', {
            data: [{
                y: sortedNorms,
                marker: { color: sortedNorms }
            }],
            layout: { title: { text: titleText } }
        }, {
            transition: { duration: 600, easing: 'cubic-in-out' },
            frame: { duration: 600 }
        }).then(() => {
            currentAnimationPromise = null;
        });
    }
}
