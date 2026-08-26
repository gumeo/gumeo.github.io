// Interactive Overfitting Demo: Polynomial Regression on Noisy Data
// Reuses targetFunction(x) from tuner-visualization.js as the ground truth,
// then fits a polynomial (up to degree 50) to 50 noisy samples of it to
// demonstrate how increasing model complexity leads to overfitting.

let overfitViz = {
  svg: null,
  g: null,
  xScale: null,
  yScale: null,
  points: [],
  degree: 1,
  width: 420,
  height: 220,
  margin: { top: 15, right: 25, bottom: 35, left: 40 }
};

const OVERFIT_NUM_POINTS = 50;
const OVERFIT_NOISE_STD = 1.0;
const OVERFIT_MAX_DEGREE = 50;
const OVERFIT_Y_DOMAIN = [-5, 5];

// Standard normal sample via Box-Muller transform
function sampleGaussian() {
  const u1 = Math.max(Math.random(), 1e-12);
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Sample noisy points from the same target function used in the first demo
function generateNoisyPoints() {
  const points = [];
  for (let i = 0; i < OVERFIT_NUM_POINTS; i++) {
    const x = i / (OVERFIT_NUM_POINTS - 1);
    const y = targetFunction(x) + OVERFIT_NOISE_STD * sampleGaussian();
    points.push({ x, y });
  }
  return points;
}

// Legendre polynomial basis on t in [-1, 1] - stays numerically stable
// at high degree, unlike raw powers of x.
function legendreBasis(t, degree) {
  const P = new Array(degree + 1);
  P[0] = 1;
  if (degree >= 1) P[1] = t;
  for (let k = 2; k <= degree; k++) {
    P[k] = ((2 * k - 1) * t * P[k - 1] - (k - 1) * P[k - 2]) / k;
  }
  return P;
}

// Solve a small dense linear system via Gaussian elimination with partial pivoting
function solveLinearSystem(A, b) {
  const n = b.length;
  const M = A.map((row, i) => row.concat([b[i]]));

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > maxVal) {
        maxVal = Math.abs(M[r][col]);
        maxRow = r;
      }
    }
    if (maxRow !== col) {
      const tmp = M[col];
      M[col] = M[maxRow];
      M[maxRow] = tmp;
    }
    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-14) continue;
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / pivot;
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = M[row][n];
    for (let c = row + 1; c < n; c++) {
      sum -= M[row][c] * x[c];
    }
    x[row] = Math.abs(M[row][row]) < 1e-14 ? 0 : sum / M[row][row];
  }
  return x;
}

// Least-squares polynomial fit (Legendre basis, tiny ridge term for stability
// when the degree approaches/exceeds the number of points)
function fitPolynomial(points, degree) {
  const n = points.length;
  const m = degree + 1;
  const ridgeLambda = 1e-6;

  const Phi = points.map(p => legendreBasis(2 * p.x - 1, degree));
  const y = points.map(p => p.y);

  const A = Array.from({ length: m }, () => new Array(m).fill(0));
  const b = new Array(m).fill(0);

  for (let i = 0; i < n; i++) {
    for (let r = 0; r < m; r++) {
      b[r] += Phi[i][r] * y[i];
      for (let c = 0; c < m; c++) {
        A[r][c] += Phi[i][r] * Phi[i][c];
      }
    }
  }
  for (let r = 0; r < m; r++) {
    A[r][r] += ridgeLambda;
  }

  return solveLinearSystem(A, b);
}

function evalPolynomial(coeffs, x) {
  const t = 2 * x - 1;
  const P = legendreBasis(t, coeffs.length - 1);
  let y = 0;
  for (let k = 0; k < coeffs.length; k++) y += coeffs[k] * P[k];
  return y;
}

// Initialize the overfitting demo
function initializeOverfitDemo() {
  const container = d3.select('#overfit-graph');
  container.selectAll('*').remove();

  overfitViz.svg = null;
  overfitViz.g = null;
  overfitViz.points = generateNoisyPoints();

  const degreeSlider = document.getElementById('overfit-degree');
  overfitViz.degree = degreeSlider ? parseInt(degreeSlider.value, 10) : 1;

  overfitViz.svg = container
    .append('svg')
    .attr('viewBox', `0 0 ${overfitViz.width} ${overfitViz.height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto');

  const g = overfitViz.svg.append('g')
    .attr('transform', `translate(${overfitViz.margin.left},${overfitViz.margin.top})`);
  overfitViz.g = g;

  const innerWidth = overfitViz.width - overfitViz.margin.left - overfitViz.margin.right;
  const innerHeight = overfitViz.height - overfitViz.margin.top - overfitViz.margin.bottom;

  overfitViz.xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
  overfitViz.yScale = d3.scaleLinear().domain(OVERFIT_Y_DOMAIN).range([innerHeight, 0]);

  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(overfitViz.xScale))
    .append('text')
    .attr('x', innerWidth / 2)
    .attr('y', 40)
    .attr('fill', 'var(--color-text)')
    .style('text-anchor', 'middle')
    .text('x');

  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(overfitViz.yScale))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -35)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'var(--color-text)')
    .style('text-anchor', 'middle')
    .text('f(x)');

  g.selectAll('.x-axis, .y-axis')
    .style('color', 'var(--color-text-secondary)')
    .selectAll('line, path')
    .style('stroke', 'var(--color-text-secondary)');

  // True underlying function (dashed)
  const targetData = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    targetData.push({ x, y: targetFunction(x) });
  }
  const lineGenerator = d3.line()
    .x(d => overfitViz.xScale(d.x))
    .y(d => overfitViz.yScale(d.y))
    .curve(d3.curveMonotoneX);

  overfitViz.targetPath = g.append('path')
    .datum(targetData)
    .attr('fill', 'none')
    .attr('stroke', '#FC8484')
    .attr('stroke-width', 3)
    .attr('opacity', 0.8)
    .attr('stroke-dasharray', '5,5')
    .attr('d', lineGenerator);

  // Noisy data points
  g.selectAll('.data-point')
    .data(overfitViz.points)
    .enter()
    .append('circle')
    .attr('class', 'data-point')
    .attr('cx', d => overfitViz.xScale(d.x))
    .attr('cy', d => overfitViz.yScale(d.y))
    .attr('r', 3)
    .attr('fill', '#262626')
    .attr('opacity', 0.6);

  // Fitted polynomial curve
  overfitViz.fitPath = g.append('path')
    .attr('fill', 'none')
    .attr('stroke', '#10099F')
    .attr('stroke-width', 3);

  // Legend
  const legend = g.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${innerWidth - 120}, 10)`);

  legend.append('line')
    .attr('x1', 0).attr('x2', 20).attr('y1', 0).attr('y2', 0)
    .attr('stroke', '#FC8484').attr('stroke-width', 2).attr('stroke-dasharray', '5,5');
  legend.append('text')
    .attr('x', 25).attr('y', 4)
    .attr('fill', 'var(--color-text)').style('font-size', '12px')
    .text('True function');

  legend.append('line')
    .attr('x1', 0).attr('x2', 20).attr('y1', 15).attr('y2', 15)
    .attr('stroke', '#10099F').attr('stroke-width', 2);
  legend.append('text')
    .attr('x', 25).attr('y', 19)
    .attr('fill', 'var(--color-text)').style('font-size', '12px')
    .text('Polynomial fit');

  legend.append('circle')
    .attr('cx', 10).attr('cy', 30).attr('r', 3)
    .attr('fill', '#262626').attr('opacity', 0.6);
  legend.append('text')
    .attr('x', 25).attr('y', 34)
    .attr('fill', 'var(--color-text)').style('font-size', '12px')
    .text('Noisy data');

  setupOverfitListeners();
  updateOverfitVisualization();
}

function updateOverfitVisualization() {
  if (!overfitViz.fitPath || !overfitViz.xScale || !overfitViz.yScale) return;

  const coeffs = fitPolynomial(overfitViz.points, overfitViz.degree);

  const fitData = [];
  for (let i = 0; i <= 200; i++) {
    const x = i / 200;
    fitData.push({ x, y: evalPolynomial(coeffs, x) });
  }

  const lineGenerator = d3.line()
    .x(d => overfitViz.xScale(d.x))
    .y(d => overfitViz.yScale(Math.max(OVERFIT_Y_DOMAIN[0] - 5, Math.min(OVERFIT_Y_DOMAIN[1] + 5, d.y))))
    .curve(d3.curveMonotoneX);

  overfitViz.fitPath.datum(fitData).attr('d', lineGenerator);

  // Training error: how well the fit matches the noisy points it was trained on
  let trainSq = 0;
  overfitViz.points.forEach(p => {
    const err = evalPolynomial(coeffs, p.x) - p.y;
    trainSq += err * err;
  });
  const trainError = Math.sqrt(trainSq / overfitViz.points.length);

  // Deviation from the true, noise-free function
  let trueSq = 0;
  const samples = 100;
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    const err = evalPolynomial(coeffs, x) - targetFunction(x);
    trueSq += err * err;
  }
  const trueError = Math.sqrt(trueSq / (samples + 1));

  const trainElement = document.getElementById('overfit-train-error');
  const trueElement = document.getElementById('overfit-true-error');
  if (trainElement) trainElement.textContent = trainError.toFixed(3);
  if (trueElement) trueElement.textContent = trueError.toFixed(3);

  const trueErrorDisplay = document.getElementById('overfit-true-error-display');
  if (trueErrorDisplay) {
    if (trueError < 0.5) {
      trueErrorDisplay.style.color = '#2DD2C0';
    } else if (trueError < 1.5) {
      trueErrorDisplay.style.color = '#FAC55B';
    } else {
      trueErrorDisplay.style.color = '#FC8484';
    }
  }
}

function setupOverfitListeners() {
  const slider = document.getElementById('overfit-degree');
  if (!slider) return;
  slider.removeEventListener('input', handleOverfitDegreeChange);
  slider.addEventListener('input', handleOverfitDegreeChange);
}

function handleOverfitDegreeChange(e) {
  overfitViz.degree = parseInt(this.value, 10);
  const valueDisplay = document.getElementById('overfit-degree-value');
  if (valueDisplay) valueDisplay.textContent = overfitViz.degree;
  updateOverfitVisualization();
}

function resetOverfitDemo() {
  const slider = document.getElementById('overfit-degree');
  if (slider) {
    slider.value = 1;
    overfitViz.degree = 1;
    const valueDisplay = document.getElementById('overfit-degree-value');
    if (valueDisplay) valueDisplay.textContent = '1';
  }
  updateOverfitVisualization();
}

function resampleOverfitData() {
  overfitViz.points = generateNoisyPoints();
  const g = overfitViz.g;
  if (g) {
    g.selectAll('.data-point')
      .data(overfitViz.points)
      .attr('cx', d => overfitViz.xScale(d.x))
      .attr('cy', d => overfitViz.yScale(d.y));
  }
  updateOverfitVisualization();
}

window.overfitViz = overfitViz;
window.initializeOverfitDemo = initializeOverfitDemo;
window.resetOverfitDemo = resetOverfitDemo;
window.resampleOverfitData = resampleOverfitData;
window.handleOverfitDegreeChange = handleOverfitDegreeChange;
window.updateOverfitVisualization = updateOverfitVisualization;
