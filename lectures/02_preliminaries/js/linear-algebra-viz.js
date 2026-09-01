// Linear Algebra Visualizations for Deep Learning Slides

(function() {
    'use strict';

    // Norm Comparison Visualization
    function initNormComparisonViz() {
        const container = document.getElementById('norm-comparison-viz');
        if (!container) return;
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = 400;
        const margin = { top: 20, right: 120, bottom: 50, left: 50 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([-2, 2])
            .range([0, plotWidth]);

        const yScale = d3.scaleLinear()
            .domain([-2, 2])
            .range([plotHeight, 0]);

        // Add grid
        const gridLines = 20;
        for (let i = 0; i <= gridLines; i++) {
            const x = (i / gridLines) * plotWidth;
            const y = (i / gridLines) * plotHeight;
            
            // Vertical lines
            g.append('line')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', plotHeight)
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 0.5);
            
            // Horizontal lines
            g.append('line')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', plotWidth)
                .attr('y2', y)
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 0.5);
        }

        // Add axes
        g.append('g')
            .attr('transform', `translate(0,${plotHeight})`)
            .call(d3.axisBottom(xScale));

        g.append('g')
            .call(d3.axisLeft(yScale));

        // Add axis labels
        g.append('text')
            .attr('x', plotWidth / 2)
            .attr('y', plotHeight + 40)
            .attr('text-anchor', 'middle')
            .text('x₁');

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -plotHeight / 2)
            .attr('y', -35)
            .attr('text-anchor', 'middle')
            .text('x₂');

        // Generate unit ball points
        const numPoints = 100;
        const angles = d3.range(0, 2 * Math.PI, (2 * Math.PI) / numPoints);

        // L1 norm unit ball (diamond)
        const l1Points = [];
        for (let t = 0; t < 1; t += 0.25) {
            l1Points.push([1 - t, t]);
            l1Points.push([-t, 1 - t]);
            l1Points.push([-(1 - t), -t]);
            l1Points.push([t, -(1 - t)]);
        }

        const l1Path = l1Points.map(d => [xScale(d[0]), yScale(d[1])]);
        
        // Draw L1 norm unit ball
        g.append('path')
            .datum([[xScale(1), yScale(0)], [xScale(0), yScale(1)], 
                   [xScale(-1), yScale(0)], [xScale(0), yScale(-1)], 
                   [xScale(1), yScale(0)]])
            .attr('d', d3.line())
            .attr('fill', 'none')
            .attr('stroke', '#FC8484')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.8);

        // L2 norm unit ball (circle)
        const l2Points = angles.map(angle => ({
            x: Math.cos(angle),
            y: Math.sin(angle)
        }));

        g.append('circle')
            .attr('cx', xScale(0))
            .attr('cy', yScale(0))
            .attr('r', Math.min(plotWidth, plotHeight) / 4)
            .attr('fill', 'none')
            .attr('stroke', '#10099F')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8);

        // L∞ norm unit ball (square)
        g.append('rect')
            .attr('x', xScale(-1))
            .attr('y', yScale(1))
            .attr('width', xScale(1) - xScale(-1))
            .attr('height', yScale(-1) - yScale(1))
            .attr('fill', 'none')
            .attr('stroke', '#2DD2C0')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '10,5')
            .attr('opacity', 0.8);

        // Add legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 100}, ${margin.top})`);

        const legendData = [
            { name: 'L₁ norm', color: '#FC8484', dasharray: '5,5' },
            { name: 'L₂ norm', color: '#10099F', dasharray: null },
            { name: 'L∞ norm', color: '#2DD2C0', dasharray: '10,5' }
        ];

        legendData.forEach((d, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);

            legendRow.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 20)
                .attr('y2', 0)
                .attr('stroke', d.color)
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', d.dasharray);

            legendRow.append('text')
                .attr('x', 25)
                .attr('y', 5)
                .text(d.name)
                .style('font-size', '14px');
        });

        // Add title
        g.append('text')
            .attr('x', plotWidth / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text('Unit Balls for Different Norms');
    }

    // Matrix Multiplication Visualization
    function initMatrixMultiplicationViz() {
        const container = document.getElementById('matrix-mult-viz');
        if (!container) return;
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = 400;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Matrix A (3x2)
        const A = [[1, 2], [3, 4], [5, 6]];
        const B = [[7, 8, 9], [10, 11, 12]];
        const C = [
            [1*7 + 2*10, 1*8 + 2*11, 1*9 + 2*12],
            [3*7 + 4*10, 3*8 + 4*11, 3*9 + 4*12],
            [5*7 + 6*10, 5*8 + 6*11, 5*9 + 6*12]
        ];

        const cellSize = 40;
        const padding = 20;

        // Draw matrix A
        drawMatrix(svg, A, 50, 100, 'A', '#10099F');
        
        // Draw matrix B
        drawMatrix(svg, B, 200, 100, 'B', '#2DD2C0');
        
        // Draw equals sign
        svg.append('text')
            .attr('x', 340)
            .attr('y', 150)
            .text('=')
            .style('font-size', '24px')
            .style('font-weight', 'bold');
        
        // Draw result matrix C
        drawMatrix(svg, C, 380, 100, 'C', '#FC8484');

        function drawMatrix(svg, matrix, x, y, label, color) {
            const g = svg.append('g')
                .attr('transform', `translate(${x}, ${y})`);

            // Draw label
            g.append('text')
                .attr('x', (matrix[0].length * cellSize) / 2)
                .attr('y', -10)
                .text(label)
                .style('font-size', '18px')
                .style('font-weight', 'bold')
                .style('text-anchor', 'middle')
                .style('fill', color);

            // Draw cells
            matrix.forEach((row, i) => {
                row.forEach((val, j) => {
                    // Cell border
                    g.append('rect')
                        .attr('x', j * cellSize)
                        .attr('y', i * cellSize)
                        .attr('width', cellSize)
                        .attr('height', cellSize)
                        .attr('fill', 'white')
                        .attr('stroke', color)
                        .attr('stroke-width', 2);

                    // Cell value
                    g.append('text')
                        .attr('x', j * cellSize + cellSize / 2)
                        .attr('y', i * cellSize + cellSize / 2 + 5)
                        .text(val)
                        .style('text-anchor', 'middle')
                        .style('font-size', '14px');
                });
            });

            // Draw size label
            g.append('text')
                .attr('x', (matrix[0].length * cellSize) / 2)
                .attr('y', matrix.length * cellSize + 20)
                .text(`${matrix.length}×${matrix[0].length}`)
                .style('font-size', '12px')
                .style('text-anchor', 'middle')
                .style('fill', '#666');
        }
    }

    // Vector Operations Visualization
    function initVectorOperationsViz() {
        const container = document.getElementById('vector-ops-viz');
        if (!container) return;
        container.innerHTML = '';

        const width = container.clientWidth || 800;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([-1, 6])
            .range([0, plotWidth]);

        const yScale = d3.scaleLinear()
            .domain([-1, 6])
            .range([plotHeight, 0]);

        // Add grid
        addGrid(g, xScale, yScale, plotWidth, plotHeight);

        // Add axes
        g.append('g')
            .attr('transform', `translate(0,${yScale(0)})`)
            .call(d3.axisBottom(xScale));

        g.append('g')
            .attr('transform', `translate(${xScale(0)},0)`)
            .call(d3.axisLeft(yScale));

        // Vectors
        const u = [3, 2];
        const v = [1, 3];
        const sum = [u[0] + v[0], u[1] + v[1]];

        // Draw vectors
        drawVector(g, [0, 0], u, '#10099F', 'u', xScale, yScale);
        drawVector(g, [0, 0], v, '#2DD2C0', 'v', xScale, yScale);
        drawVector(g, [0, 0], sum, '#FC8484', 'u + v', xScale, yScale);

        // Draw parallelogram
        const parallelogram = [
            [0, 0],
            u,
            sum,
            v,
            [0, 0]
        ];

        g.append('path')
            .datum(parallelogram)
            .attr('d', d3.line()
                .x(d => xScale(d[0]))
                .y(d => yScale(d[1])))
            .attr('fill', 'none')
            .attr('stroke', '#999')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0.5);

        function drawVector(g, start, end, color, label, xScale, yScale) {
            const x1 = xScale(start[0]);
            const y1 = yScale(start[1]);
            const x2 = xScale(end[0]);
            const y2 = yScale(end[1]);

            // Arrow line
            g.append('line')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2)
                .attr('stroke', color)
                .attr('stroke-width', 3)
                .attr('marker-end', `url(#arrow-${color.replace('#', '')})`);

            // Arrow marker
            svg.append('defs').append('marker')
                .attr('id', `arrow-${color.replace('#', '')}`)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 8)
                .attr('refY', 0)
                .attr('markerWidth', 8)
                .attr('markerHeight', 8)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', color);

            // Label
            g.append('text')
                .attr('x', x2 + 10)
                .attr('y', y2)
                .text(label)
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .style('fill', color);
        }

        function addGrid(g, xScale, yScale, width, height) {
            const xTicks = xScale.ticks(10);
            const yTicks = yScale.ticks(10);

            // Vertical lines
            g.selectAll('.grid-line-vertical')
                .data(xTicks)
                .enter().append('line')
                .attr('class', 'grid-line-vertical')
                .attr('x1', d => xScale(d))
                .attr('y1', 0)
                .attr('x2', d => xScale(d))
                .attr('y2', height)
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 0.5);

            // Horizontal lines
            g.selectAll('.grid-line-horizontal')
                .data(yTicks)
                .enter().append('line')
                .attr('class', 'grid-line-horizontal')
                .attr('x1', 0)
                .attr('y1', d => yScale(d))
                .attr('x2', width)
                .attr('y2', d => yScale(d))
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 0.5);
        }
    }

    // Initialize all visualizations when the DOM is ready
    if (typeof Reveal !== 'undefined') {
        // For Reveal.js presentations
        Reveal.on('slidechanged', event => {
            setTimeout(() => {
                initNormComparisonViz();
                initMatrixMultiplicationViz();
                initVectorOperationsViz();
            }, 100);
        });
    } else {
        // For standalone testing
        document.addEventListener('DOMContentLoaded', () => {
            initNormComparisonViz();
            initMatrixMultiplicationViz();
            initVectorOperationsViz();
        });
    }

    // Export functions for external use
    window.linearAlgebraViz = {
        initNormComparisonViz,
        initMatrixMultiplicationViz,
        initVectorOperationsViz
    };

})();