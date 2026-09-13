// GoogLeNet Visualizations
// Interactive visualizations for Inception blocks and GoogLeNet architecture

(function() {
    'use strict';

    // Initialize visualizations when Reveal is ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', () => initVisualizations());
        Reveal.on('slidechanged', event => {
            if (event.currentSlide.querySelector('#inception-block-viz') ||
                event.currentSlide.querySelector('#googlenet-full-arch') ||
                event.currentSlide.querySelector('#channel-progression-viz') ||
                event.currentSlide.querySelector('#googlenet-timeline-viz')) {
                initVisualizations();
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', initVisualizations);
    }

    function initVisualizations() {
        createInceptionBlockVisualization();
        createFullArchitectureVisualization();
        createChannelProgressionChart();
        createTimelineVisualization();
    }

    // Inception Block Visualization
    function createInceptionBlockVisualization() {
        const container = document.getElementById('inception-block-viz');
        if (!container || container.hasChildNodes()) return;

        const width = 800;
        const height = 400;

        const svg = d3.select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('max-width', '100%')
            .style('height', 'auto');

        // Define gradients for branches
        const defs = svg.append('defs');

        const gradientIds = ['branch1', 'branch2', 'branch3', 'branch4'];
        const colors = [
            ['#10099F', '#2DD2C0'],
            ['#2DD2C0', '#00FFBA'],
            ['#FAC55B', '#FFA05F'],
            ['#FC8484', '#FFA05F']
        ];

        gradientIds.forEach((id, i) => {
            const gradient = defs.append('linearGradient')
                .attr('id', id)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', colors[i][0])
                .attr('stop-opacity', 0.8);

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', colors[i][1])
                .attr('stop-opacity', 0.8);
        });

        // Input block
        const inputX = 100;
        const inputY = height / 2;

        svg.append('rect')
            .attr('x', inputX - 40)
            .attr('y', inputY - 30)
            .attr('width', 80)
            .attr('height', 60)
            .attr('fill', '#10099F')
            .attr('rx', 5);

        svg.append('text')
            .attr('x', inputX)
            .attr('y', inputY)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('Input');

        // Branch structure
        const branchStartX = 200;
        const branchEndX = 600;
        const branchYPositions = [80, 160, 240, 320];

        const branches = [
            { name: '1×1 conv', ops: ['1×1 conv\n(c1 channels)'], gradient: 'branch1' },
            { name: '1×1 + 3×3', ops: ['1×1 conv\n(c2[0])', '3×3 conv\n(c2[1])'], gradient: 'branch2' },
            { name: '1×1 + 5×5', ops: ['1×1 conv\n(c3[0])', '5×5 conv\n(c3[1])'], gradient: 'branch3' },
            { name: 'pool + 1×1', ops: ['3×3 pool', '1×1 conv\n(c4)'], gradient: 'branch4' }
        ];

        branches.forEach((branch, i) => {
            const y = branchYPositions[i];
            const group = svg.append('g').attr('class', `branch-${i}`);

            // Connection from input
            group.append('path')
                .attr('d', `M ${inputX + 40} ${inputY} L ${branchStartX} ${y}`)
                .attr('stroke', '#888')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('opacity', 0.5);

            // Branch operations
            const opsWidth = (branchEndX - branchStartX - 20) / branch.ops.length;

            branch.ops.forEach((op, j) => {
                const opX = branchStartX + j * opsWidth + opsWidth / 2;

                // Operation box
                group.append('rect')
                    .attr('x', opX - 40)
                    .attr('y', y - 20)
                    .attr('width', 80)
                    .attr('height', 40)
                    .attr('fill', `url(#${branch.gradient})`)
                    .attr('rx', 5)
                    .attr('class', `op-box-${i}-${j}`);

                // Operation text
                const lines = op.split('\n');
                lines.forEach((line, k) => {
                    group.append('text')
                        .attr('x', opX)
                        .attr('y', y + (k - 0.5) * 12)
                        .attr('text-anchor', 'middle')
                        .attr('alignment-baseline', 'middle')
                        .attr('fill', 'white')
                        .attr('font-size', '11px')
                        .text(line);
                });

                // Connection between ops
                if (j > 0) {
                    const prevX = branchStartX + (j - 1) * opsWidth + opsWidth / 2;
                    group.append('line')
                        .attr('x1', prevX + 40)
                        .attr('y1', y)
                        .attr('x2', opX - 40)
                        .attr('y2', y)
                        .attr('stroke', '#888')
                        .attr('stroke-width', 2);
                }
            });
        });

        // Concatenation
        const concatX = 700;
        const concatY = height / 2;

        svg.append('rect')
            .attr('x', concatX - 40)
            .attr('y', concatY - 30)
            .attr('width', 80)
            .attr('height', 60)
            .attr('fill', '#10099F')
            .attr('rx', 5);

        svg.append('text')
            .attr('x', concatX)
            .attr('y', concatY)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', 'white')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('Concat');

        // Connections to concat
        branchYPositions.forEach(y => {
            svg.append('path')
                .attr('d', `M ${branchEndX} ${y} L ${concatX - 40} ${concatY}`)
                .attr('stroke', '#888')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('opacity', 0.5);
        });

        // Animation functionality
        const animateBtn = document.getElementById('animate-inception');
        const resetBtn = document.getElementById('reset-inception');

        if (animateBtn) {
            animateBtn.addEventListener('click', () => animateDataFlow(svg));
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => resetAnimation(svg));
        }
    }

    function animateDataFlow(svg) {
        // Create data particles
        const particleGroup = svg.append('g').attr('class', 'particles');

        // Animate through each branch
        [0, 1, 2, 3].forEach((branchIdx, i) => {
            setTimeout(() => {
                const particle = particleGroup.append('circle')
                    .attr('r', 4)
                    .attr('fill', '#FFA05F')
                    .attr('cx', 100)
                    .attr('cy', 200);

                // Animate along branch
                particle.transition()
                    .duration(2000)
                    .attr('cx', 700)
                    .attr('cy', 200)
                    .on('end', function() {
                        d3.select(this).remove();
                    });
            }, i * 500);
        });
    }

    function resetAnimation(svg) {
        svg.selectAll('.particles').remove();
    }

    // Full GoogLeNet Architecture Visualization
    function createFullArchitectureVisualization() {
        const container = document.getElementById('googlenet-full-arch');
        if (!container || container.hasChildNodes()) return;

        const width = 900;
        const height = 200;

        const svg = d3.select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('max-width', '100%')
            .style('height', 'auto');

        // Network stages
        const stages = [
            { name: 'Input\n96×96', type: 'input', width: 50, color: '#10099F' },
            { name: 'Stem\nb1+b2', type: 'stem', width: 60, color: '#1976d2' },
            { name: 'Inc×2\nb3', type: 'inception', width: 80, color: '#7b1fa2' },
            { name: 'Inc×5\nb4', type: 'inception', width: 100, color: '#7b1fa2' },
            { name: 'Inc×2\nb5', type: 'inception', width: 80, color: '#7b1fa2' },
            { name: 'GAP', type: 'pool', width: 50, color: '#388e3c' },
            { name: 'Output\n10', type: 'output', width: 50, color: '#FC8484' }
        ];

        let xPos = 50;
        const yCenter = height / 2;

        stages.forEach((stage, i) => {
            const group = svg.append('g').attr('class', `stage-${i}`);

            // Stage block
            const blockHeight = stage.type === 'inception' ? 120 : 80;
            group.append('rect')
                .attr('x', xPos)
                .attr('y', yCenter - blockHeight/2)
                .attr('width', stage.width)
                .attr('height', blockHeight)
                .attr('fill', stage.color)
                .attr('opacity', 0.8)
                .attr('rx', 5);

            // Stage label
            const lines = stage.name.split('\n');
            lines.forEach((line, j) => {
                group.append('text')
                    .attr('x', xPos + stage.width/2)
                    .attr('y', yCenter + (j - 0.5) * 15)
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'middle')
                    .attr('fill', 'white')
                    .attr('font-size', '12px')
                    .attr('font-weight', 'bold')
                    .text(line);
            });

            // Connection to next stage
            if (i < stages.length - 1) {
                const nextX = xPos + stage.width + 20;
                svg.append('line')
                    .attr('x1', xPos + stage.width)
                    .attr('y1', yCenter)
                    .attr('x2', nextX)
                    .attr('y2', yCenter)
                    .attr('stroke', '#888')
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrowhead)');
            }

            xPos += stage.width + 20;
        });

        // Add arrowhead marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 9)
            .attr('refY', 5)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z')
            .attr('fill', '#888');

        // Stage exploration functionality
        const exploreBtn = document.getElementById('explore-stages');
        const dimensionsBtn = document.getElementById('show-dimensions');

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => highlightStages(svg));
        }

        if (dimensionsBtn) {
            dimensionsBtn.addEventListener('click', () => showDimensions(svg, stages));
        }
    }

    function highlightStages(svg) {
        svg.selectAll('g[class^="stage-"]').each(function(d, i) {
            const group = d3.select(this);
            setTimeout(() => {
                group.select('rect')
                    .transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .transition()
                    .duration(300)
                    .attr('opacity', 0.8);
            }, i * 200);
        });
    }

    function showDimensions(svg, stages) {
        const dimensions = [
            '3×96×96',
            '192×12×12',
            '480×6×6',
            '832×3×3',
            '1024×1×1',
            '1024',
            '10'
        ];

        svg.selectAll('.dimension-label').remove();

        let xPos = 50;
        stages.forEach((stage, i) => {
            svg.append('text')
                .attr('class', 'dimension-label')
                .attr('x', xPos + stage.width/2)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .attr('fill', '#666')
                .attr('font-size', '10px')
                .text(dimensions[i])
                .attr('opacity', 0)
                .transition()
                .duration(500)
                .attr('opacity', 1);

            xPos += stage.width + 20;
        });
    }

    // Channel Progression Chart
    function createChannelProgressionChart() {
        const container = document.getElementById('channel-progression-viz');
        if (!container || container.hasChildNodes()) return;

        const width = 700;
        const height = 400;
        const margin = { top: 40, right: 40, bottom: 60, left: 60 };

        const svg = d3.select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('max-width', '100%')
            .style('height', 'auto');

        // Data: channel counts through the network
        const data = [
            { block: 'Input', channels: 3 },
            { block: 'Stem', channels: 192 },
            { block: 'Inc1', channels: 256 },
            { block: 'Inc2', channels: 480 },
            { block: 'Inc3', channels: 512 },
            { block: 'Inc4', channels: 512 },
            { block: 'Inc5', channels: 512 },
            { block: 'Inc6', channels: 528 },
            { block: 'Inc7', channels: 832 },
            { block: 'Inc8', channels: 832 },
            { block: 'Inc9', channels: 1024 }
        ];

        // Scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.block))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, 1100])
            .range([height - margin.bottom, margin.top]);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .append('text')
            .attr('x', width / 2)
            .attr('y', 40)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('Network Blocks');

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -height / 2)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('Number of Channels');

        // Bars with gradient
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'channel-gradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#10099F')
            .attr('stop-opacity', 0.8);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#2DD2C0')
            .attr('stop-opacity', 0.8);

        // Draw bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.block))
            .attr('y', height - margin.bottom)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('fill', 'url(#channel-gradient)')
            .transition()
            .duration(800)
            .delay((d, i) => i * 100)
            .attr('y', d => yScale(d.channels))
            .attr('height', d => height - margin.bottom - yScale(d.channels));

        // Value labels
        svg.selectAll('.value-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('x', d => xScale(d.block) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.channels) - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', '#666')
            .attr('font-size', '10px')
            .text(d => d.channels)
            .attr('opacity', 0)
            .transition()
            .duration(500)
            .delay((d, i) => i * 100 + 800)
            .attr('opacity', 1);
    }

    // Timeline Visualization
    function createTimelineVisualization() {
        const container = document.getElementById('googlenet-timeline-viz');
        if (!container || container.hasChildNodes()) return;

        const width = 800;
        const height = 300;

        const svg = d3.select(container)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('max-width', '100%')
            .style('height', 'auto');

        // Timeline data
        const events = [
            { year: 2012, name: 'AlexNet', error: 16.4, significance: 'Deep learning arrives' },
            { year: 2014, name: 'VGG', error: 7.3, significance: 'Deeper networks' },
            { year: 2014, name: 'GoogLeNet', error: 6.67, significance: 'Efficient design', highlight: true },
            { year: 2015, name: 'ResNet', error: 3.6, significance: 'Skip connections' },
            { year: 2017, name: 'SENet', error: 2.25, significance: 'Attention mechanisms' }
        ];

        // Scales
        const xScale = d3.scaleLinear()
            .domain([2011, 2018])
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain([20, 0])
            .range([50, height - 100]);

        // Draw timeline axis
        svg.append('line')
            .attr('x1', 50)
            .attr('y1', height - 50)
            .attr('x2', width - 50)
            .attr('y2', height - 50)
            .attr('stroke', '#888')
            .attr('stroke-width', 2);

        // Draw error rate line
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.error))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(events)
            .attr('fill', 'none')
            .attr('stroke', '#10099F')
            .attr('stroke-width', 2)
            .attr('d', line)
            .attr('opacity', 0.5);

        // Draw events
        events.forEach((event, i) => {
            const x = xScale(event.year);
            const y = yScale(event.error);

            // Event dot
            svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', event.highlight ? 8 : 6)
                .attr('fill', event.highlight ? '#FC8484' : '#10099F')
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .attr('opacity', 0)
                .transition()
                .duration(500)
                .delay(i * 200)
                .attr('opacity', 1);

            // Event label
            svg.append('text')
                .attr('x', x)
                .attr('y', height - 35)
                .attr('text-anchor', 'middle')
                .attr('fill', event.highlight ? '#FC8484' : '#666')
                .attr('font-size', '12px')
                .attr('font-weight', event.highlight ? 'bold' : 'normal')
                .text(event.name)
                .attr('opacity', 0)
                .transition()
                .duration(500)
                .delay(i * 200)
                .attr('opacity', 1);

            // Error rate label
            svg.append('text')
                .attr('x', x)
                .attr('y', y - 10)
                .attr('text-anchor', 'middle')
                .attr('fill', '#666')
                .attr('font-size', '10px')
                .text(`${event.error}%`)
                .attr('opacity', 0)
                .transition()
                .duration(500)
                .delay(i * 200 + 200)
                .attr('opacity', 1);
        });

        // Title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#333')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('ImageNet Top-5 Error Rate Evolution');
    }
})();