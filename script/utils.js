export function showErrorModal(msg) {
    document.getElementById('errorText').textContent = msg;
    document.getElementById('errorModal').style.display = 'block';
}

export function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

export function parseNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return NaN;
    const f = parseFloat(val);
    return isNaN(f) ? NaN : f;
}

export function calculateNorms(eco, econ, social, weights) {
    return eco.map((e, i) => {
        const ecoVal = e * weights.eco;
        const econVal = econ[i] * weights.econ;
        const socialVal = social[i] * weights.social;
        return Math.sqrt(ecoVal * ecoVal + econVal * econVal + socialVal * socialVal);
    });
}

export function calculateAverages(eco, econ, social, weights) {
    return eco.map((e, i) => {
        const ecoVal = e * weights.eco;
        const econVal = econ[i] * weights.econ;
        const socialVal = social[i] * weights.social;
        return 0.25*(ecoVal + econVal + socialVal);
    });
}

export const customColorScale = [
    ['0.0', 'rgb(69,0,166)'],
    ['0.111111111111', 'rgb(69,20,166)'],
    ['0.222222222222', 'rgb(69,50,166)'],
    ['0.333333333333', 'rgb(69,80,166)'],
    ['0.444444444444', 'rgb(69,110,166)'],
    ['0.555555555556', 'rgb(69,140,166)'],
    ['0.666666666667', 'rgb(69,170,166)'],
    ['0.777777777778', 'rgb(69,200,166)'],
    ['0.888888888889', 'rgb(69,230,166)'],
    ['1.0', 'rgb(69,255,166)']
];
