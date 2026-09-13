// Batch Normalization Visualizations
// Interactive visualizations for understanding batch normalization concepts

// Wait for Reveal.js to be ready
if (typeof Reveal !== 'undefined') {
    Reveal.on('ready', () => initBatchNormVisualizations());
    Reveal.on('slidechanged', () => initBatchNormVisualizations());
} else {
    document.addEventListener('DOMContentLoaded', initBatchNormVisualizations);
}

function initBatchNormVisualizations() {
    // Initialize all visualizations
    createActivationDriftVisualization();
    createBNFCVisualization();
    createBNConvVisualization();
    createBNImplementationDemo();
    createLeNetComparisonVisualization();
    createPerformanceComparisonVisualization();
}

// Visualization 1: Activation Drift Over Training
function createActivationDriftVisualization() {
    const container = document.getElementById('activation-drift-viz');
    if (!container || container.hasChildNodes()) return;

    const width = container.clientWidth || 800;
    const height = 250;
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate sample data showing distribution drift
    const epochs = 50;
    const layers = 3;
    const data = [];

    for (let layer = 0; layer < layers; layer++) {
        const layerData = [];
        let mean = 0;
        let std = 1;

        for (let epoch = 0; epoch < epochs; epoch++) {
            // Simulate drift without batch norm
            if (layer > 0) {
                mean += (Math.random() - 0.5) * 0.2;
                std *= (1 + (Math.random() - 0.5) * 0.1);
            }
            layerData.push({
                epoch: epoch,
                mean: mean,
                std: std,
                layer: layer
            });
        }
        data.push(layerData);
    }

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, epochs - 1])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([-3, 3])
        .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2])
        .range(['#10099F', '#2DD2C0', '#FC8484']);

    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 35)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Training Epoch');

    g.append('g')
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -innerHeight / 2)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Activation Mean');

    // Draw lines for each layer
    const line = d3.line()
        .x(d => xScale(d.epoch))
        .y(d => yScale(d.mean))
        .curve(d3.curveMonotoneX);

    data.forEach((layerData, i) => {
        // Draw standard deviation area
        const area = d3.area()
            .x(d => xScale(d.epoch))
            .y0(d => yScale(d.mean - d.std))
            .y1(d => yScale(d.mean + d.std))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(layerData)
            .attr('fill', colorScale(i))
            .attr('opacity', 0.2)
            .attr('d', area);

        // Draw mean line
        g.append('path')
            .datum(layerData)
            .attr('fill', 'none')
            .attr('stroke', colorScale(i))
            .attr('stroke-width', 2)
            .attr('d', line);
    });

    // Add legend
    const legend = g.append('g')
        .attr('transform', `translate(${innerWidth - 100}, 10)`);

    ['Layer 1', 'Layer 2', 'Layer 3'].forEach((text, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);

        legendRow.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', colorScale(i));

        legendRow.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .attr('font-size', '12px')
            .attr('fill', '#262626')
            .text(text);
    });

    // Add title
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Activation Distribution Drift Without Batch Norm');
}

// Visualization 2: Batch Norm for Fully Connected Layers
function createBNFCVisualization() {
    const container = document.getElementById('bn-fc-visualization');
    if (!container || container.hasChildNodes()) return;

    const width = container.clientWidth || 800;
    const height = 300;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create a simple fully connected layer visualization
    const batchSize = 4;
    const features = 5;
    const nodeRadius = 15;
    const padding = 50;

    // Calculate positions
    const batchX = padding;
    const featureX = width - padding - 200;
    const batchSpacing = (height - 2 * padding) / (batchSize - 1);
    const featureSpacing = (height - 2 * padding) / (features - 1);

    // Draw batch samples
    const batchNodes = [];
    for (let i = 0; i < batchSize; i++) {
        const y = padding + i * batchSpacing;
        batchNodes.push({ x: batchX, y: y, id: i });

        svg.append('circle')
            .attr('cx', batchX)
            .attr('cy', y)
            .attr('r', nodeRadius)
            .attr('fill', '#e3f2fd')
            .attr('stroke', '#10099F')
            .attr('stroke-width', 2);

        svg.append('text')
            .attr('x', batchX)
            .attr('y', y + 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#10099F')
            .text(`B${i + 1}`);
    }

    // Draw feature nodes
    const featureNodes = [];
    for (let i = 0; i < features; i++) {
        const y = padding + i * featureSpacing;
        featureNodes.push({ x: featureX, y: y, id: i });

        svg.append('circle')
            .attr('cx', featureX)
            .attr('cy', y)
            .attr('r', nodeRadius)
            .attr('fill', '#e8f5e9')
            .attr('stroke', '#2DD2C0')
            .attr('stroke-width', 2);

        svg.append('text')
            .attr('x', featureX)
            .attr('y', y + 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#2DD2C0')
            .text(`F${i + 1}`);
    }

    // Draw connections
    batchNodes.forEach(bNode => {
        featureNodes.forEach(fNode => {
            svg.append('line')
                .attr('x1', bNode.x + nodeRadius)
                .attr('y1', bNode.y)
                .attr('x2', fNode.x - nodeRadius)
                .attr('y2', fNode.y)
                .attr('stroke', '#EEEEEE')
                .attr('stroke-width', 1)
                .attr('opacity', 0.5);
        });
    });

    // Add batch norm box
    const bnX = (batchX + featureX) / 2 - 50;
    const bnY = height / 2 - 30;
    const bnWidth = 100;
    const bnHeight = 60;

    svg.append('rect')
        .attr('x', bnX)
        .attr('y', bnY)
        .attr('width', bnWidth)
        .attr('height', bnHeight)
        .attr('fill', '#fff3e0')
        .attr('stroke', '#FFA05F')
        .attr('stroke-width', 2)
        .attr('rx', 5);

    svg.append('text')
        .attr('x', bnX + bnWidth / 2)
        .attr('y', bnY + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Batch Norm');

    svg.append('text')
        .attr('x', bnX + bnWidth / 2)
        .attr('y', bnY + 45)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#262626')
        .text('per feature');

    // Add labels
    svg.append('text')
        .attr('x', batchX)
        .attr('y', padding - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Batch');

    svg.append('text')
        .attr('x', featureX)
        .attr('y', padding - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Features');

    // Add normalization indicator
    const normX = featureX + 80;
    featureNodes.forEach((node, i) => {
        svg.append('text')
            .attr('x', normX)
            .attr('y', node.y + 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#2DD2C0')
            .text(`μ${i + 1}, σ${i + 1}`);
    });

    svg.append('text')
        .attr('x', normX)
        .attr('y', padding - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Statistics');
}

// Visualization 3: Batch Norm for Convolutional Layers
function createBNConvVisualization() {
    const container = document.getElementById('bn-conv-visualization');
    if (!container || container.hasChildNodes()) return;

    const width = container.clientWidth || 800;
    const height = 350;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Parameters
    const channels = 3;
    const spatialSize = 4;
    const channelWidth = 120;
    const channelHeight = 120;
    const spacing = 30;
    const startX = 100;
    const startY = 80;

    // Draw channel feature maps
    for (let c = 0; c < channels; c++) {
        const x = startX + c * (channelWidth + spacing);
        const y = startY;

        // Draw feature map grid
        const cellSize = channelWidth / spatialSize;
        for (let i = 0; i < spatialSize; i++) {
            for (let j = 0; j < spatialSize; j++) {
                const intensity = Math.random();
                svg.append('rect')
                    .attr('x', x + j * cellSize)
                    .attr('y', y + i * cellSize)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('fill', d3.interpolate('#ffffff', ['#10099F', '#2DD2C0', '#FC8484'][c])(intensity))
                    .attr('stroke', '#EEEEEE')
                    .attr('stroke-width', 0.5);
            }
        }

        // Channel label
        svg.append('text')
            .attr('x', x + channelWidth / 2)
            .attr('y', y - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', '#262626')
            .text(`Channel ${c + 1}`);

        // Statistics annotation
        svg.append('text')
            .attr('x', x + channelWidth / 2)
            .attr('y', y + channelHeight + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('fill', '#262626')
            .text(`μ_c${c + 1}, σ_c${c + 1}`);
    }

    // Add batch norm indicator
    const bnY = startY + channelHeight + 50;
    svg.append('rect')
        .attr('x', startX - 20)
        .attr('y', bnY)
        .attr('width', channels * (channelWidth + spacing) - spacing + 40)
        .attr('height', 40)
        .attr('fill', '#fff3e0')
        .attr('stroke', '#FFA05F')
        .attr('stroke-width', 2)
        .attr('rx', 5);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', bnY + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Batch Normalization (per channel across spatial dimensions)');

    // Add title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Channel-wise Normalization in CNNs');

    // Add batch dimension indicator
    svg.append('text')
        .attr('x', 40)
        .attr('y', startY + channelHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .attr('transform', `rotate(-90, 40, ${startY + channelHeight / 2})`)
        .text('Batch Dimension');
}

// Visualization 4: Batch Norm Implementation Demo
function createBNImplementationDemo() {
    const container = document.getElementById('bn-implementation-demo');
    if (!container || container.hasChildNodes()) return;

    const width = container.clientWidth || 800;
    const height = 300;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create interactive demo
    const padding = 40;
    const boxWidth = 150;
    const boxHeight = 80;
    const spacing = 50;

    // Define stages
    const stages = [
        { label: 'Input\nX', color: '#e3f2fd', borderColor: '#10099F' },
        { label: 'Normalize\n(X - μ) / σ', color: '#f3e5f5', borderColor: '#7b1fa2' },
        { label: 'Scale & Shift\nγ * X̂ + β', color: '#e8f5e9', borderColor: '#2DD2C0' },
        { label: 'Output\nY', color: '#fff3e0', borderColor: '#FFA05F' }
    ];

    const totalWidth = stages.length * boxWidth + (stages.length - 1) * spacing;
    const startX = (width - totalWidth) / 2;
    const y = height / 2 - boxHeight / 2;

    // Draw stages
    stages.forEach((stage, i) => {
        const x = startX + i * (boxWidth + spacing);

        // Box
        svg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('fill', stage.color)
            .attr('stroke', stage.borderColor)
            .attr('stroke-width', 2)
            .attr('rx', 5);

        // Label
        const lines = stage.label.split('\n');
        lines.forEach((line, j) => {
            svg.append('text')
                .attr('x', x + boxWidth / 2)
                .attr('y', y + boxHeight / 2 - 10 + j * 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', j === 0 ? '14px' : '12px')
                .attr('font-weight', j === 0 ? 'bold' : 'normal')
                .attr('fill', '#262626')
                .text(line);
        });

        // Arrow
        if (i < stages.length - 1) {
            const arrowX = x + boxWidth + 10;
            const arrowY = y + boxHeight / 2;

            svg.append('path')
                .attr('d', `M ${arrowX} ${arrowY} L ${arrowX + spacing - 20} ${arrowY}`)
                .attr('stroke', '#666')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');
        }
    });

    // Define arrowhead marker
    svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 5)
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
        .attr('fill', '#666');

    // Add parameters
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', y - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Batch Normalization Forward Pass');

    // Add learnable parameters annotation
    svg.append('text')
        .attr('x', startX + 2 * (boxWidth + spacing) + boxWidth / 2)
        .attr('y', y + boxHeight + 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#2DD2C0')
        .text('γ, β are learnable parameters');
}

// Visualization 5: LeNet Comparison (with/without BN)
function createLeNetComparisonVisualization() {
    const container = document.getElementById('lenet-comparison-viz');
    if (!container || container.hasChildNodes()) return;

    const width = container.clientWidth || 800;
    const height = 300;
    const margin = { top: 40, right: 80, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate comparison data
    const epochs = 20;
    const dataWithoutBN = [];
    const dataWithBN = [];

    let accWithoutBN = 0.1;
    let accWithBN = 0.1;

    for (let i = 0; i <= epochs; i++) {
        // Without BN: slower convergence
        accWithoutBN += (0.85 - accWithoutBN) * 0.15 * Math.random();
        dataWithoutBN.push({ epoch: i, accuracy: accWithoutBN });

        // With BN: faster convergence
        accWithBN += (0.92 - accWithBN) * 0.25 * Math.random();
        dataWithBN.push({ epoch: i, accuracy: accWithBN });
    }

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, epochs])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.epoch))
        .y(d => yScale(d.accuracy))
        .curve(d3.curveMonotoneX);

    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Epoch');

    g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('.0%')))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -innerHeight / 2)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Validation Accuracy');

    // Draw lines
    g.append('path')
        .datum(dataWithoutBN)
        .attr('fill', 'none')
        .attr('stroke', '#FC8484')
        .attr('stroke-width', 2)
        .attr('d', line);

    g.append('path')
        .datum(dataWithBN)
        .attr('fill', 'none')
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add legend
    const legend = g.append('g')
        .attr('transform', `translate(${innerWidth - 150}, 20)`);

    [
        { label: 'LeNet + BatchNorm', color: '#10099F' },
        { label: 'LeNet (Original)', color: '#FC8484' }
    ].forEach((item, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 25})`);

        legendRow.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', item.color)
            .attr('stroke-width', 2);

        legendRow.append('text')
            .attr('x', 25)
            .attr('y', 4)
            .attr('font-size', '12px')
            .attr('fill', '#262626')
            .text(item.label);
    });

    // Add title
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Training Convergence: LeNet with vs without Batch Normalization');
}

// Visualization 6: Performance Comparison
function createPerformanceComparisonVisualization() {
    const container = document.getElementById('performance-comparison-viz');
    if (!container || container.hasChildNodes()) return;

    const width = container.clientWidth || 800;
    const height = 400;
    const margin = { top: 40, right: 100, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Generate training curves
    const epochs = 50;
    const dataWithoutBN = { train: [], val: [] };
    const dataWithBN = { train: [], val: [] };

    let lossWithoutBN = 2.5;
    let lossWithBN = 2.5;
    let valLossWithoutBN = 2.5;
    let valLossWithBN = 2.5;

    for (let i = 0; i <= epochs; i++) {
        // Without BN
        lossWithoutBN *= 0.96 + Math.random() * 0.02;
        valLossWithoutBN *= 0.95 + Math.random() * 0.03;
        dataWithoutBN.train.push({ epoch: i, loss: lossWithoutBN });
        dataWithoutBN.val.push({ epoch: i, loss: valLossWithoutBN });

        // With BN - faster convergence
        lossWithBN *= 0.92 + Math.random() * 0.02;
        valLossWithBN *= 0.91 + Math.random() * 0.03;
        dataWithBN.train.push({ epoch: i, loss: lossWithBN });
        dataWithBN.val.push({ epoch: i, loss: valLossWithBN });
    }

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, epochs])
        .range([0, innerWidth]);

    const yScale = d3.scaleLog()
        .domain([0.1, 3])
        .range([innerHeight, 0]);

    // Line generator
    const line = d3.line()
        .x(d => xScale(d.epoch))
        .y(d => yScale(d.loss))
        .curve(d3.curveMonotoneX);

    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 40)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Epoch');

    g.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d3.format('.2f')))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -innerHeight / 2)
        .attr('fill', '#262626')
        .style('text-anchor', 'middle')
        .text('Loss (log scale)');

    // Draw lines
    // Without BN
    g.append('path')
        .datum(dataWithoutBN.train)
        .attr('fill', 'none')
        .attr('stroke', '#FC8484')
        .attr('stroke-width', 2)
        .attr('d', line);

    g.append('path')
        .datum(dataWithoutBN.val)
        .attr('fill', 'none')
        .attr('stroke', '#FC8484')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line);

    // With BN
    g.append('path')
        .datum(dataWithBN.train)
        .attr('fill', 'none')
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2)
        .attr('d', line);

    g.append('path')
        .datum(dataWithBN.val)
        .attr('fill', 'none')
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line);

    // Add legend
    const legend = g.append('g')
        .attr('transform', `translate(${innerWidth - 140}, 20)`);

    const legendData = [
        { label: 'With BN (train)', color: '#10099F', dash: false },
        { label: 'With BN (val)', color: '#10099F', dash: true },
        { label: 'No BN (train)', color: '#FC8484', dash: false },
        { label: 'No BN (val)', color: '#FC8484', dash: true }
    ];

    legendData.forEach((item, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 25})`);

        const line = legendRow.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', item.color)
            .attr('stroke-width', 2);

        if (item.dash) {
            line.attr('stroke-dasharray', '5,5');
        }

        legendRow.append('text')
            .attr('x', 25)
            .attr('y', 4)
            .attr('font-size', '11px')
            .attr('fill', '#262626')
            .text(item.label);
    });

    // Add title
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Training Performance: Impact of Batch Normalization');

    // Add annotation
    const annotationX = xScale(25);
    const annotationY = yScale(0.5);

    g.append('line')
        .attr('x1', annotationX)
        .attr('y1', annotationY)
        .attr('x2', annotationX + 50)
        .attr('y2', annotationY - 30)
        .attr('stroke', '#666')
        .attr('stroke-width', 1);

    g.append('text')
        .attr('x', annotationX + 55)
        .attr('y', annotationY - 25)
        .attr('font-size', '11px')
        .attr('fill', '#666')
        .text('10x faster convergence');
}