// Probability Visualizations for Deep Learning Course
// University of Iceland

// Initialize probability visualizations when Reveal is ready
Reveal.addEventListener('ready', function() {
    initializeProbabilityVisualizations();
});

Reveal.addEventListener('slidechanged', function(event) {
    // Re-initialize visualizations when changing slides
    if (event.currentSlide.querySelector('#coin-toss-simulator')) {
        initializeCoinTossSimulator();
    }
    if (event.currentSlide.querySelector('#bayes-calculator')) {
        initializeBayesCalculator();
    }
    if (event.currentSlide.querySelector('#distribution-viz')) {
        initializeDistributionViz();
    }
});

function initializeProbabilityVisualizations() {
    initializeCoinTossSimulator();
    initializeBayesCalculator();
    initializeDistributionViz();
}

// Coin Toss Simulator
function initializeCoinTossSimulator() {
    const container = document.getElementById('coin-toss-simulator');
    if (!container || container.hasChildNodes()) return;

    const width = 600;
    const height = 400;
    const margin = {top: 40, right: 60, bottom: 60, left: 80};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Initialize data
    let data = [];
    let headsCount = 0;
    let tailsCount = 0;
    let isRunning = false;
    let animationId = null;

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

    // Axes
    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickFormat(d => d))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Number of Tosses');

    g.append('g')
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -innerHeight / 2)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Probability');

    // Reference line at 0.5
    g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(0.5))
        .attr('y2', yScale(0.5))
        .attr('stroke', '#262626')
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.5);

    // Lines for heads and tails probability
    const headsLine = d3.line()
        .x((d, i) => xScale(i + 1))
        .y(d => yScale(d.heads));

    const tailsLine = d3.line()
        .x((d, i) => xScale(i + 1))
        .y(d => yScale(d.tails));

    const headsPath = g.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2);

    const tailsPath = g.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#2DD2C0')
        .attr('stroke-width', 2);

    // Legend
    const legend = g.append('g')
        .attr('transform', `translate(${innerWidth - 100}, 20)`);

    legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2);

    legend.append('text')
        .attr('x', 25)
        .attr('y', 4)
        .text('P(Heads)')
        .style('font-size', '12px');

    legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 20)
        .attr('y2', 20)
        .attr('stroke', '#2DD2C0')
        .attr('stroke-width', 2);

    legend.append('text')
        .attr('x', 25)
        .attr('y', 24)
        .text('P(Tails)')
        .style('font-size', '12px');

    // Control buttons
    const controls = d3.select(container)
        .append('div')
        .style('text-align', 'center')
        .style('margin-top', '20px');

    const startBtn = controls.append('button')
        .text('Start Simulation')
        .style('margin', '5px')
        .style('padding', '8px 16px')
        .style('background-color', '#10099F')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('cursor', 'pointer')
        .on('click', startSimulation);

    const resetBtn = controls.append('button')
        .text('Reset')
        .style('margin', '5px')
        .style('padding', '8px 16px')
        .style('background-color', '#FC8484')
        .style('color', 'white')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('cursor', 'pointer')
        .on('click', resetSimulation);

    const statsDiv = controls.append('div')
        .style('margin-top', '10px')
        .style('font-size', '14px');

    function tossCoins(n) {
        for (let i = 0; i < n; i++) {
            if (Math.random() > 0.5) {
                headsCount++;
            } else {
                tailsCount++;
            }
            const total = headsCount + tailsCount;
            data.push({
                heads: headsCount / total,
                tails: tailsCount / total
            });
        }
    }

    function updateVisualization() {
        if (data.length > 100) {
            xScale.domain([0, data.length]);
        }

        headsPath.datum(data)
            .attr('d', headsLine);

        tailsPath.datum(data)
            .attr('d', tailsLine);

        statsDiv.html(
            `Tosses: ${data.length} | ` +
            `Heads: ${headsCount} (${(headsCount / data.length * 100).toFixed(1)}%) | ` +
            `Tails: ${tailsCount} (${(tailsCount / data.length * 100).toFixed(1)}%)`
        );
    }

    function startSimulation() {
        if (isRunning) return;
        isRunning = true;
        startBtn.text('Running...');

        function animate() {
            if (data.length < 1000) {
                tossCoins(5);
                updateVisualization();
                animationId = requestAnimationFrame(animate);
            } else {
                isRunning = false;
                startBtn.text('Start Simulation');
            }
        }
        animate();
    }

    function resetSimulation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        data = [];
        headsCount = 0;
        tailsCount = 0;
        isRunning = false;
        startBtn.text('Start Simulation');
        headsPath.datum([]).attr('d', headsLine);
        tailsPath.datum([]).attr('d', tailsLine);
        statsDiv.html('');
        xScale.domain([0, 100]);
    }
}

// Bayes Theorem Calculator
function initializeBayesCalculator() {
    const container = document.getElementById('bayes-calculator');
    if (!container || container.hasChildNodes()) return;

    // Create input controls
    const controlsDiv = document.createElement('div');
    controlsDiv.style.marginBottom = '20px';
    controlsDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-width: 600px; margin: 0 auto;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 14px;">P(Disease) - Prior:</label>
                <input type="range" id="prior" min="0" max="100" value="0.15" step="0.01" style="width: 100%;">
                <span id="prior-value" style="font-size: 12px;">0.15%</span>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 14px;">P(Positive|Disease) - Sensitivity:</label>
                <input type="range" id="sensitivity" min="0" max="100" value="99" step="1" style="width: 100%;">
                <span id="sensitivity-value" style="font-size: 12px;">99%</span>
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-size: 14px;">P(Positive|No Disease) - False Positive:</label>
                <input type="range" id="false-positive" min="0" max="100" value="1" step="0.1" style="width: 100%;">
                <span id="false-positive-value" style="font-size: 12px;">1%</span>
            </div>
            <div style="grid-column: span 2;">
                <button id="calculate-bayes" style="padding: 10px 20px; background-color: #10099F; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Calculate Posterior
                </button>
            </div>
        </div>
    `;
    container.appendChild(controlsDiv);

    // Create visualization area
    const vizDiv = document.createElement('div');
    vizDiv.id = 'bayes-viz';
    vizDiv.style.textAlign = 'center';
    container.appendChild(vizDiv);

    // Set up event listeners
    const priorSlider = document.getElementById('prior');
    const sensitivitySlider = document.getElementById('sensitivity');
    const falsePositiveSlider = document.getElementById('false-positive');
    const calculateBtn = document.getElementById('calculate-bayes');

    priorSlider.oninput = function() {
        document.getElementById('prior-value').textContent = this.value + '%';
    };

    sensitivitySlider.oninput = function() {
        document.getElementById('sensitivity-value').textContent = this.value + '%';
    };

    falsePositiveSlider.oninput = function() {
        document.getElementById('false-positive-value').textContent = this.value + '%';
    };

    calculateBtn.onclick = function() {
        const prior = parseFloat(priorSlider.value) / 100;
        const sensitivity = parseFloat(sensitivitySlider.value) / 100;
        const falsePositive = parseFloat(falsePositiveSlider.value) / 100;

        // Calculate using Bayes' theorem
        const pPositive = sensitivity * prior + falsePositive * (1 - prior);
        const posterior = (sensitivity * prior) / pPositive;

        // Display result
        vizDiv.innerHTML = `
            <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                <h3 style="color: #10099F; margin-bottom: 15px;">Bayes' Theorem Result</h3>
                <div style="font-size: 18px; margin-bottom: 10px;">
                    P(Disease|Positive) = <span style="color: #FC8484; font-weight: bold;">${(posterior * 100).toFixed(2)}%</span>
                </div>
                <div style="font-size: 14px; color: #666; margin-top: 15px;">
                    Formula: P(A|B) = P(B|A) × P(A) / P(B)
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 10px;">
                    P(Positive) = ${(pPositive * 100).toFixed(4)}%
                </div>
            </div>
        `;
    };

    // Initial calculation
    calculateBtn.click();
}

// Distribution Visualization
function initializeDistributionViz() {
    const container = document.getElementById('distribution-viz');
    if (!container || container.hasChildNodes()) return;

    const width = 600;
    const height = 400;
    const margin = {top: 40, right: 60, bottom: 60, left: 60};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate data for binomial distribution
    function binomialPMF(n, p, k) {
        const coefficient = factorial(n) / (factorial(k) * factorial(n - k));
        return coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    function factorial(n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    const n = 20;
    const p = 0.5;
    const data = [];
    for (let k = 0; k <= n; k++) {
        data.push({
            k: k,
            probability: binomialPMF(n, p, k)
        });
    }

    // Scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.k))
        .range([0, innerWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.probability)])
        .nice()
        .range([innerHeight, 0]);

    // Axes
    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Number of Successes');

    g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('.2f')))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -innerHeight / 2)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Probability');

    // Bars
    g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.k))
        .attr('y', d => yScale(d.probability))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.probability))
        .attr('fill', '#10099F')
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            d3.select(this).attr('opacity', 1);
            
            // Tooltip
            const tooltip = g.append('g')
                .attr('id', 'tooltip');
            
            const rect = tooltip.append('rect')
                .attr('x', xScale(d.k) + xScale.bandwidth() / 2 - 40)
                .attr('y', yScale(d.probability) - 35)
                .attr('width', 80)
                .attr('height', 25)
                .attr('fill', 'white')
                .attr('stroke', '#10099F')
                .attr('rx', 3);
            
            tooltip.append('text')
                .attr('x', xScale(d.k) + xScale.bandwidth() / 2)
                .attr('y', yScale(d.probability) - 18)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .text(`P(X=${d.k}) = ${(d.probability * 100).toFixed(2)}%`);
        })
        .on('mouseout', function() {
            d3.select(this).attr('opacity', 0.8);
            g.select('#tooltip').remove();
        });

    // Title
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Binomial Distribution (n=20, p=0.5)');
}