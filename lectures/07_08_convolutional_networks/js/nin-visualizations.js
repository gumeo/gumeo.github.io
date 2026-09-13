// NiN Visualizations for Modern CNNs Presentation
// Network in Network architecture demonstrations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize NiN block visualization on slide reveal
    Reveal.on('slidechanged', event => {
        if (event.currentSlide.querySelector('#nin-block-viz')) {
            initializeNiNBlockViz();
        }
        if (event.currentSlide.querySelector('#nin-architecture-viz')) {
            initializeNiNArchitecture();
        }
        if (event.currentSlide.querySelector('#one-by-one-conv-demo')) {
            initializeOneByOneConvDemo();
        }
        if (event.currentSlide.querySelector('#gap-vs-fc-viz')) {
            initializeGAPComparison();
        }
        if (event.currentSlide.querySelector('#nin-param-comparison')) {
            initializeParameterComparison();
        }
        if (event.currentSlide.querySelector('#nin-feature-evolution')) {
            initializeFeatureEvolution();
        }
    });
});

// NiN Block Visualization
function initializeNiNBlockViz() {
    const container = d3.select('#nin-block-viz');
    container.selectAll('*').remove();

    const width = 800;
    const height = 250;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define the NiN block structure
    const layers = [
        {type: 'input', x: 20, y: 100, width: 110, height: 120, label: 'Input\n(H×W×C_in)', color: '#10099F'},
        {type: 'conv', x: 140, y: 80, width: 80, height: 140, label: 'Conv\n(k×k)', color: '#2DD2C0'},
        {type: 'relu', x: 240, y: 90, width: 40, height: 120, label: 'ReLU', color: '#00FFBA'},
        {type: 'conv1x1', x: 300, y: 80, width: 80, height: 140, label: '1×1 Conv', color: '#FAC55B'},
        {type: 'relu', x: 400, y: 90, width: 40, height: 120, label: 'ReLU', color: '#00FFBA'},
        {type: 'conv1x1', x: 460, y: 80, width: 80, height: 140, label: '1×1 Conv', color: '#FFA05F'},
        {type: 'relu', x: 560, y: 90, width: 40, height: 120, label: 'ReLU', color: '#00FFBA'},
        {type: 'output', x: 620, y: 100, width: 120, height: 120, label: 'Output\n(H×W×C_out)', color: '#FC8484'}
    ];

    // Draw connections
    const connections = svg.append('g').attr('class', 'connections');

    for (let i = 0; i < layers.length - 1; i++) {
        const from = layers[i];
        const to = layers[i + 1];

        connections.append('line')
            .attr('x1', from.x + from.width)
            .attr('y1', from.y + from.height / 2)
            .attr('x2', to.x)
            .attr('y2', to.y + to.height / 2)
            .attr('stroke', '#ccc')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)');
    }

    // Add arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#ccc');

    // Draw layers
    const layerGroups = svg.selectAll('.layer')
        .data(layers)
        .enter().append('g')
        .attr('class', 'layer');

    layerGroups.append('rect')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .attr('fill', d => d.color)
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .attr('rx', 5)
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay((d, i) => i * 100)
        .style('opacity', 0.8);

    layerGroups.append('text')
        .attr('x', d => d.x + d.width / 2)
        .attr('y', d => d.y + d.height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(d => d.label)
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay((d, i) => i * 100 + 200)
        .style('opacity', 1);

    // Add annotations
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('NiN Block Structure');
}

// Complete NiN Architecture Visualization
function initializeNiNArchitecture() {
    const container = d3.select('#nin-architecture-viz');
    container.selectAll('*').remove();

    const width = 900;
    const height = 500;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Architecture layers
    const blocks = [
        {name: 'Input\n224×224×3', x: 50, width: 80, height: 160, color: '#10099F'},
        {name: 'NiN Block 1\n96 ch, 11×11\nstride 4', x: 150, width: 100, height: 140, color: '#2DD2C0'},
        {name: 'MaxPool\n3×3, s=2', x: 270, width: 70, height: 120, color: '#00FFBA'},
        {name: 'NiN Block 2\n256 ch, 5×5\nstride 1', x: 360, width: 100, height: 100, color: '#FAC55B'},
        {name: 'MaxPool\n3×3, s=2', x: 480, width: 70, height: 80, color: '#00FFBA'},
        {name: 'NiN Block 3\n384 ch, 3×3\nstride 1', x: 570, width: 100, height: 60, color: '#FFA05F'},
        {name: 'MaxPool\n3×3, s=2', x: 690, width: 70, height: 40, color: '#00FFBA'},
        {name: 'Dropout\n0.5', x: 780, width: 60, height: 40, color: '#EEEEEE'},
        {name: 'NiN Block 4\n10 ch, 3×3', x: 50, width: 100, height: 40, color: '#FC8484', row: 2},
        {name: 'Global\nAvg Pool', x: 170, width: 80, height: 30, color: '#10099F', row: 2},
        {name: 'Output\n10 classes', x: 270, width: 80, height: 20, color: '#262626', row: 2}
    ];

    // Draw blocks
    blocks.forEach((block, i) => {
        const y = block.row === 2 ? 350 : 200 - block.height / 2;

        const g = svg.append('g')
            .attr('class', 'architecture-block');

        // Block rectangle
        g.append('rect')
            .attr('x', block.x)
            .attr('y', y)
            .attr('width', block.width)
            .attr('height', block.height)
            .attr('fill', block.color)
            .attr('stroke', '#262626')
            .attr('stroke-width', 2)
            .attr('rx', 5)
            .style('opacity', 0)
            .transition()
            .duration(500)
            .delay(i * 100)
            .style('opacity', 0.8);

        // Block label
        g.append('text')
            .attr('x', block.x + block.width / 2)
            .attr('y', y + block.height / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', block.color === '#262626' || block.color === '#EEEEEE' ? 'white' : '#262626')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .text(block.name)
            .style('opacity', 0)
            .transition()
            .duration(500)
            .delay(i * 100 + 200)
            .style('opacity', 1);

        // Draw connections
        if (i < blocks.length - 1 && block.row !== 2) {
            const nextBlock = blocks[i + 1];
            const nextY = nextBlock.row === 2 ? 350 : 200 - nextBlock.height / 2;

            svg.append('line')
                .attr('x1', block.x + block.width)
                .attr('y1', y + block.height / 2)
                .attr('x2', nextBlock.x)
                .attr('y2', nextY + nextBlock.height / 2)
                .attr('stroke', '#ccc')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrow)')
                .style('opacity', 0)
                .transition()
                .duration(300)
                .delay(i * 100 + 300)
                .style('opacity', 1);
        }

        // Special connection for row transition
        if (i === 7) {
            svg.append('path')
                .attr('d', `M ${block.x + block.width / 2} ${y + block.height}
                            L ${block.x + block.width / 2} 320
                            L ${blocks[8].x + blocks[8].width / 2} 320
                            L ${blocks[8].x + blocks[8].width / 2} 350`)
                .attr('fill', 'none')
                .attr('stroke', '#ccc')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrow)')
                .style('opacity', 0)
                .transition()
                .duration(300)
                .delay(800)
                .style('opacity', 1);
        }
    });

    // Arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#ccc');

    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Complete NiN Architecture');
}

// 1×1 Convolution Interactive Demo
function initializeOneByOneConvDemo() {
    const container = d3.select('#one-by-one-conv-demo');
    container.selectAll('*').remove();

    const width = 800;
    const height = 450;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Input feature map
    const inputChannels = 3;
    const outputChannels = 2;
    const featureSize = 4;

    // Generate sample data
    const inputData = [];
    for (let c = 0; c < inputChannels; c++) {
        const channel = [];
        for (let i = 0; i < featureSize; i++) {
            const row = [];
            for (let j = 0; j < featureSize; j++) {
                row.push(Math.random() * 2 - 1);
            }
            channel.push(row);
        }
        inputData.push(channel);
    }

    // Draw input feature maps
    const inputGroup = svg.append('g')
        .attr('transform', 'translate(50, 100)');

    inputGroup.append('text')
        .attr('x', 0)
        .attr('y', -20)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text('Input Feature Maps (3 channels)');

    const cellSize = 30;

    inputData.forEach((channel, c) => {
        const channelGroup = inputGroup.append('g')
            .attr('transform', `translate(0, ${c * (featureSize * cellSize + 20)})`);

        channel.forEach((row, i) => {
            row.forEach((val, j) => {
                channelGroup.append('rect')
                    .attr('x', j * cellSize)
                    .attr('y', i * cellSize)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('fill', val > 0 ? '#10099F' : '#FC8484')
                    .attr('fill-opacity', Math.abs(val))
                    .attr('stroke', '#262626')
                    .attr('stroke-width', 1);

                channelGroup.append('text')
                    .attr('x', j * cellSize + cellSize / 2)
                    .attr('y', i * cellSize + cellSize / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '10px')
                    .attr('fill', '#262626')
                    .text(val.toFixed(1));
            });
        });
    });

    // Draw 1×1 convolution weights
    const weightsGroup = svg.append('g')
        .attr('transform', 'translate(250, 200)');

    weightsGroup.append('text')
        .attr('x', 0)
        .attr('y', -20)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text('1×1 Conv Weights');

    const weights = [];
    for (let o = 0; o < outputChannels; o++) {
        const outputWeights = [];
        for (let i = 0; i < inputChannels; i++) {
            outputWeights.push(Math.random() * 2 - 1);
        }
        weights.push(outputWeights);
    }

    weights.forEach((outputWeights, o) => {
        const weightGroup = weightsGroup.append('g')
            .attr('transform', `translate(${o * 80}, 0)`);

        outputWeights.forEach((w, i) => {
            weightGroup.append('rect')
                .attr('x', 0)
                .attr('y', i * 25)
                .attr('width', 60)
                .attr('height', 20)
                .attr('fill', w > 0 ? '#2DD2C0' : '#FFA05F')
                .attr('fill-opacity', Math.abs(w))
                .attr('stroke', '#262626')
                .attr('stroke-width', 1);

            weightGroup.append('text')
                .attr('x', 30)
                .attr('y', i * 25 + 10)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '10px')
                .attr('fill', '#262626')
                .text(`w${o}${i}: ${w.toFixed(2)}`);
        });
    });

    // Draw output feature maps
    const outputGroup = svg.append('g')
        .attr('transform', 'translate(500, 100)');

    outputGroup.append('text')
        .attr('x', 0)
        .attr('y', -20)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text('Output Feature Maps (2 channels)');

    // Calculate output
    const outputData = [];
    for (let o = 0; o < outputChannels; o++) {
        const channel = [];
        for (let i = 0; i < featureSize; i++) {
            const row = [];
            for (let j = 0; j < featureSize; j++) {
                let sum = 0;
                for (let c = 0; c < inputChannels; c++) {
                    sum += inputData[c][i][j] * weights[o][c];
                }
                row.push(Math.tanh(sum)); // Apply activation
            }
            channel.push(row);
        }
        outputData.push(channel);
    }

    outputData.forEach((channel, c) => {
        const channelGroup = outputGroup.append('g')
            .attr('transform', `translate(0, ${c * (featureSize * cellSize + 20)})`);

        channel.forEach((row, i) => {
            row.forEach((val, j) => {
                channelGroup.append('rect')
                    .attr('x', j * cellSize)
                    .attr('y', i * cellSize)
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('fill', val > 0 ? '#10099F' : '#FC8484')
                    .attr('fill-opacity', Math.abs(val))
                    .attr('stroke', '#262626')
                    .attr('stroke-width', 1)
                    .style('opacity', 0)
                    .transition()
                    .duration(500)
                    .delay((i * featureSize + j) * 50)
                    .style('opacity', 1);

                channelGroup.append('text')
                    .attr('x', j * cellSize + cellSize / 2)
                    .attr('y', i * cellSize + cellSize / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '10px')
                    .attr('fill', '#262626')
                    .text(val.toFixed(1))
                    .style('opacity', 0)
                    .transition()
                    .duration(500)
                    .delay((i * featureSize + j) * 50 + 200)
                    .style('opacity', 1);
            });
        });
    });

    // Add explanation
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#262626')
        .text('1×1 convolution applies the same linear combination at every spatial location');
}

// Global Average Pooling vs Fully Connected Comparison
function initializeGAPComparison() {
    const container = d3.select('#gap-vs-fc-viz');
    container.selectAll('*').remove();

    const width = 900;
    const height = 400;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // FC approach
    const fcGroup = svg.append('g')
        .attr('transform', 'translate(50, 50)');

    fcGroup.append('text')
        .attr('x', 150)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Traditional Approach (FC Layers)');

    // Feature maps
    fcGroup.append('rect')
        .attr('x', 0)
        .attr('y', 30)
        .attr('width', 80)
        .attr('height', 80)
        .attr('fill', '#2DD2C0')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2);

    fcGroup.append('text')
        .attr('x', 40)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('5×5×384');

    // Flatten
    fcGroup.append('line')
        .attr('x1', 80)
        .attr('y1', 70)
        .attr('x2', 120)
        .attr('y2', 70)
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow2)');

    fcGroup.append('rect')
        .attr('x', 120)
        .attr('y', 30)
        .attr('width', 30)
        .attr('height', 80)
        .attr('fill', '#FAC55B')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2);

    fcGroup.append('text')
        .attr('x', 135)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#262626')
        .text('9600');

    // FC layer
    fcGroup.append('line')
        .attr('x1', 150)
        .attr('y1', 70)
        .attr('x2', 190)
        .attr('y2', 70)
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow2)');

    fcGroup.append('rect')
        .attr('x', 190)
        .attr('y', 55)
        .attr('width', 60)
        .attr('height', 30)
        .attr('fill', '#FC8484')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2);

    fcGroup.append('text')
        .attr('x', 220)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('10');

    // Parameter count
    fcGroup.append('text')
        .attr('x', 150)
        .attr('y', 130)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#FC8484')
        .text('Parameters: 96,000');

    // GAP approach
    const gapGroup = svg.append('g')
        .attr('transform', 'translate(450, 50)');

    gapGroup.append('text')
        .attr('x', 150)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('NiN Approach (Global Avg Pooling)');

    // Feature maps with channels = classes
    gapGroup.append('rect')
        .attr('x', 0)
        .attr('y', 30)
        .attr('width', 80)
        .attr('height', 80)
        .attr('fill', '#2DD2C0')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2);

    gapGroup.append('text')
        .attr('x', 40)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('5×5×10');

    // Global average pooling
    gapGroup.append('line')
        .attr('x1', 80)
        .attr('y1', 70)
        .attr('x2', 120)
        .attr('y2', 70)
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow2)');

    gapGroup.append('rect')
        .attr('x', 120)
        .attr('y', 60)
        .attr('width', 80)
        .attr('height', 20)
        .attr('fill', '#10099F')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2);

    gapGroup.append('text')
        .attr('x', 160)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', 'white')
        .text('GAP');

    // Output
    gapGroup.append('line')
        .attr('x1', 200)
        .attr('y1', 70)
        .attr('x2', 240)
        .attr('y2', 70)
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow2)');

    gapGroup.append('rect')
        .attr('x', 240)
        .attr('y', 55)
        .attr('width', 60)
        .attr('height', 30)
        .attr('fill', '#FC8484')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2);

    gapGroup.append('text')
        .attr('x', 270)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('10');

    // Parameter count
    gapGroup.append('text')
        .attr('x', 150)
        .attr('y', 130)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#2DD2C0')
        .text('Parameters: 0');

    // Arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrow2')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#262626');

    // Visual explanation of GAP
    const explanationGroup = svg.append('g')
        .attr('transform', 'translate(200, 250)');

    explanationGroup.append('text')
        .attr('x', 200)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text('Global Average Pooling: Average each channel spatially');

    // Show averaging process
    const channelColors = ['#10099F', '#2DD2C0', '#FAC55B'];
    for (let i = 0; i < 3; i++) {
        const channelG = explanationGroup.append('g')
            .attr('transform', `translate(${i * 150}, 30)`);

        // Input channel
        channelG.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 40)
            .attr('height', 40)
            .attr('fill', channelColors[i])
            .attr('fill-opacity', 0.3)
            .attr('stroke', channelColors[i])
            .attr('stroke-width', 2);

        // Grid lines
        for (let j = 1; j < 3; j++) {
            channelG.append('line')
                .attr('x1', 0)
                .attr('y1', j * 13.33)
                .attr('x2', 40)
                .attr('y2', j * 13.33)
                .attr('stroke', channelColors[i])
                .attr('stroke-width', 1);

            channelG.append('line')
                .attr('x1', j * 13.33)
                .attr('y1', 0)
                .attr('x2', j * 13.33)
                .attr('y2', 40)
                .attr('stroke', channelColors[i])
                .attr('stroke-width', 1);
        }

        // Arrow
        channelG.append('line')
            .attr('x1', 45)
            .attr('y1', 20)
            .attr('x2', 65)
            .attr('y2', 20)
            .attr('stroke', channelColors[i])
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrow3)');

        // Output value
        channelG.append('circle')
            .attr('cx', 80)
            .attr('cy', 20)
            .attr('r', 10)
            .attr('fill', channelColors[i])
            .attr('stroke', '#262626')
            .attr('stroke-width', 2);

        channelG.append('text')
            .attr('x', 80)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'white')
            .text('avg');
    }

    // Arrow marker for explanation
    svg.append('defs').append('marker')
        .attr('id', 'arrow3')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#262626');
}

// Parameter Comparison Chart
function initializeParameterComparison() {
    const container = d3.select('#nin-param-comparison');
    container.selectAll('*').remove();

    const width = 800;
    const height = 400;
    const margin = {top: 40, right: 40, bottom: 60, left: 80};

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Data for comparison
    const data = [
        {model: 'AlexNet', params: 60000000, conv: 3700000, fc: 56300000},
        {model: 'VGG-11', params: 132863336, conv: 9220096, fc: 123643240},
        {model: 'NiN', params: 1950000, conv: 1950000, fc: 0}
    ];

    const x = d3.scaleBand()
        .domain(data.map(d => d.model))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, 140000000])
        .range([height - margin.top - margin.bottom, 0]);

    // Add axes
    g.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', 40)
        .attr('fill', '#262626')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text('Model Architecture');

    g.append('g')
        .call(d3.axisLeft(y).tickFormat(d => d / 1000000 + 'M'))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -60)
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('fill', '#262626')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text('Number of Parameters');

    // Create stacked bars
    const stack = d3.stack()
        .keys(['conv', 'fc'])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedData = stack(data);

    const colors = ['#2DD2C0', '#FC8484'];

    // Add bars
    g.selectAll('.layer')
        .data(stackedData)
        .enter().append('g')
        .attr('class', 'layer')
        .attr('fill', (d, i) => colors[i])
        .selectAll('rect')
        .data(d => d)
        .enter().append('rect')
        .attr('x', d => x(d.data.model))
        .attr('y', height - margin.top - margin.bottom)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 200)
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]));

    // Add value labels
    g.selectAll('.text')
        .data(data)
        .enter().append('text')
        .attr('x', d => x(d.model) + x.bandwidth() / 2)
        .attr('y', d => y(d.params) - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text(d => (d.params / 1000000).toFixed(1) + 'M')
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay(1500)
        .style('opacity', 1);

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 150}, 50)`);

    const legendData = ['Conv Layers', 'FC Layers'];

    legend.selectAll('.legend-item')
        .data(legendData)
        .enter().append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`)
        .each(function(d, i) {
            d3.select(this).append('rect')
                .attr('width', 20)
                .attr('height', 20)
                .attr('fill', colors[i]);

            d3.select(this).append('text')
                .attr('x', 25)
                .attr('y', 10)
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '12px')
                .text(d);
        });

    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Parameter Count Comparison: AlexNet vs VGG vs NiN');
}

// Feature Map Evolution Through NiN
function initializeFeatureEvolution() {
    const container = d3.select('#nin-feature-evolution');
    container.selectAll('*').remove();

    const width = 900;
    const height = 350;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define the feature map sizes through the network
    const stages = [
        {name: 'Input', size: 224, channels: 3, x: 50},
        {name: 'NiN Block 1', size: 54, channels: 96, x: 200},
        {name: 'After Pool 1', size: 26, channels: 96, x: 320},
        {name: 'NiN Block 2', size: 26, channels: 256, x: 440},
        {name: 'After Pool 2', size: 12, channels: 256, x: 560},
        {name: 'NiN Block 3', size: 12, channels: 384, x: 680},
        {name: 'After Pool 3', size: 5, channels: 384, x: 800}
    ];

    // Scale for visualization
    const maxSize = 150;
    const scale = d3.scaleLinear()
        .domain([0, 224])
        .range([0, maxSize]);

    stages.forEach((stage, i) => {
        const g = svg.append('g')
            .attr('transform', `translate(${stage.x}, 100)`);

        const rectSize = scale(stage.size);
        const channelScale = Math.log10(stage.channels + 1) * 15;

        // Draw feature map representation
        for (let j = 0; j < Math.min(3, Math.ceil(stage.channels / 100)); j++) {
            g.append('rect')
                .attr('x', j * 5)
                .attr('y', j * 5)
                .attr('width', rectSize)
                .attr('height', rectSize)
                .attr('fill', j === 0 ? '#10099F' : j === 1 ? '#2DD2C0' : '#FAC55B')
                .attr('fill-opacity', 0.7 - j * 0.2)
                .attr('stroke', '#262626')
                .attr('stroke-width', 1)
                .style('opacity', 0)
                .transition()
                .duration(500)
                .delay(i * 100)
                .style('opacity', 1);
        }

        // Add labels
        g.append('text')
            .attr('x', rectSize / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .text(stage.name)
            .style('opacity', 0)
            .transition()
            .duration(500)
            .delay(i * 100 + 200)
            .style('opacity', 1);

        g.append('text')
            .attr('x', rectSize / 2)
            .attr('y', rectSize + 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .text(`${stage.size}×${stage.size}×${stage.channels}`)
            .style('opacity', 0)
            .transition()
            .duration(500)
            .delay(i * 100 + 200)
            .style('opacity', 1);

        // Add arrows between stages
        if (i < stages.length - 1) {
            const nextStage = stages[i + 1];
            const nextRectSize = scale(nextStage.size);

            svg.append('line')
                .attr('x1', stage.x + rectSize + 10)
                .attr('y1', 100 + rectSize / 2)
                .attr('x2', nextStage.x - 10)
                .attr('y2', 100 + nextRectSize / 2)
                .attr('stroke', '#ccc')
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrow4)')
                .style('opacity', 0)
                .transition()
                .duration(300)
                .delay(i * 100 + 300)
                .style('opacity', 1);
        }
    });

    // Add arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrow4')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#ccc');

    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .attr('fill', '#262626')
        .text('Feature Map Evolution Through NiN');

    // Add final GAP step
    const gapG = svg.append('g')
        .attr('transform', 'translate(50, 280)');

    gapG.append('rect')
        .attr('x', 750)
        .attr('y', 0)
        .attr('width', 80)
        .attr('height', 30)
        .attr('fill', '#10099F')
        .attr('stroke', '#262626')
        .attr('stroke-width', 2)
        .attr('rx', 5)
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay(800)
        .style('opacity', 1);

    gapG.append('text')
        .attr('x', 790)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .text('GAP → 10')
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay(1000)
        .style('opacity', 1);

    // Connect last feature map to GAP
    svg.append('line')
        .attr('x1', 800 + scale(5) / 2)
        .attr('y1', 100 + scale(5) + 10)
        .attr('x2', 790)
        .attr('y2', 270)
        .attr('stroke', '#10099F')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('marker-end', 'url(#arrow5)')
        .style('opacity', 0)
        .transition()
        .duration(500)
        .delay(700)
        .style('opacity', 1);

    // Arrow for GAP
    svg.append('defs').append('marker')
        .attr('id', 'arrow5')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#10099F');
}