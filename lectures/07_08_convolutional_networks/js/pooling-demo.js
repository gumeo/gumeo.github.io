// pooling-demo.js - Interactive pooling visualization
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('pooling-demo')) return;

    const svgElement = document.getElementById('pooling-svg');
    if (!svgElement) {
        console.error('pooling-svg element not found!');
        return;
    }

    const svg = d3.select('#pooling-svg');
    const width = 800;
    const height = 400;

    // UI Colors
    const colors = {
        primary: '#10099F',
        secondary: '#2DD2C0',
        highlight: '#FFA05F',
        error: '#FC8484',
        light: '#F5F5F5',
        dark: '#262626'
    };

    // State - Initialize from DOM elements
    const poolSizeSlider = document.getElementById('pool-size-slider');
    const poolTypeSelect = document.getElementById('pool-type');

    let poolSize = poolSizeSlider ? parseInt(poolSizeSlider.value) : 2;
    let poolType = poolTypeSelect ? poolTypeSelect.value : 'max';
    let animating = false;
    let currentStep = 0;

    // Validate poolSize
    if (isNaN(poolSize) || poolSize < 2 || poolSize > 4) {
        console.log('Initial poolSize invalid, setting to 2. Was:', poolSize);
        poolSize = 2;
    }

    // Sample input matrix (6x6)
    const inputMatrix = [
        [3, 1, 4, 2, 8, 5],
        [2, 9, 6, 3, 1, 7],
        [5, 3, 8, 4, 2, 6],
        [1, 7, 2, 9, 5, 3],
        [8, 4, 6, 1, 3, 9],
        [2, 5, 7, 8, 4, 1]
    ];

    // Calculate output dimensions
    function getOutputDimensions() {
        const inputSize = 6;

        console.log('getOutputDimensions() - poolSize:', poolSize, 'type:', typeof poolSize);

        // Validate poolSize
        let validPoolSize = poolSize;
        if (!validPoolSize || isNaN(validPoolSize) || validPoolSize <= 0) {
            console.log('poolSize validation failed, using default 2');
            validPoolSize = 2;
        }

        // For non-overlapping pooling (stride = pool size)
        const outputDim = Math.floor(inputSize / validPoolSize);

        console.log('Calculated outputDim:', outputDim, 'from validPoolSize:', validPoolSize);

        // Ensure at least 1x1 output
        return Math.max(1, outputDim);
    }

    // Perform pooling operation
    function performPooling() {
        const outputSize = getOutputDimensions();
        const output = [];

        // Validate poolSize for this operation
        let validPoolSize = poolSize;
        if (!validPoolSize || isNaN(validPoolSize) || validPoolSize <= 0) {
            validPoolSize = 2;
        }

        for (let i = 0; i < outputSize; i++) {
            output[i] = [];
            for (let j = 0; j < outputSize; j++) {
                const window = [];
                for (let di = 0; di < validPoolSize; di++) {
                    for (let dj = 0; dj < validPoolSize; dj++) {
                        const rowIdx = i * validPoolSize + di;
                        const colIdx = j * validPoolSize + dj;
                        if (rowIdx < 6 && colIdx < 6) {
                            window.push(inputMatrix[rowIdx][colIdx]);
                        }
                    }
                }

                if (window.length > 0) {
                    if (poolType === 'max') {
                        output[i][j] = Math.max(...window);
                    } else {
                        output[i][j] = window.reduce((a, b) => a + b, 0) / window.length;
                    }
                } else {
                    output[i][j] = 0; // Fallback for empty windows
                }
            }
        }

        return output;
    }

    // Draw the visualization
    function draw() {
        console.log('draw() called with poolSize:', poolSize);
        svg.selectAll('*').remove();

        const outputSize = getOutputDimensions();
        const outputMatrix = performPooling();

        console.log('Output size calculated as:', outputSize);

        // Validate output
        if (!outputSize || outputSize <= 0 || isNaN(outputSize)) {
            console.error('Invalid output size. poolSize:', poolSize, 'outputSize:', outputSize);
            return;
        }

        // Create main groups
        const inputGroup = svg.append('g')
            .attr('transform', 'translate(50, 50)');

        const outputGroup = svg.append('g')
            .attr('transform', 'translate(500, 50)');

        // Draw input matrix
        const cellSize = 40;
        const inputCells = inputGroup.selectAll('.input-cell')
            .data(inputMatrix.flat())
            .enter()
            .append('g')
            .attr('class', 'input-cell')
            .attr('transform', (d, i) => {
                const row = Math.floor(i / 6);
                const col = i % 6;
                return `translate(${col * cellSize}, ${row * cellSize})`;
            });

        inputCells.append('rect')
            .attr('width', cellSize - 2)
            .attr('height', cellSize - 2)
            .attr('fill', colors.light)
            .attr('stroke', colors.dark)
            .attr('stroke-width', 1);

        inputCells.append('text')
            .attr('x', cellSize / 2)
            .attr('y', cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', colors.dark)
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(d => d);

        // Draw output matrix
        const outputCellSize = 60;
        const outputCells = outputGroup.selectAll('.output-cell')
            .data(outputMatrix.flat())
            .enter()
            .append('g')
            .attr('class', 'output-cell')
            .attr('transform', (d, i) => {
                const row = Math.floor(i / outputSize);
                const col = i % outputSize;
                return `translate(${col * outputCellSize}, ${row * outputCellSize})`;
            });

        outputCells.append('rect')
            .attr('width', outputCellSize - 2)
            .attr('height', outputCellSize - 2)
            .attr('fill', colors.secondary)
            .attr('fill-opacity', 0.2)
            .attr('stroke', colors.secondary)
            .attr('stroke-width', 2);

        outputCells.append('text')
            .attr('x', outputCellSize / 2)
            .attr('y', outputCellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', colors.dark)
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .text(d => {
                if (typeof d === 'number') {
                    return poolType === 'max' ? d : d.toFixed(1);
                }
                return '0';
            });

        // Labels
        inputGroup.append('text')
            .attr('x', 120)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.dark)
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Input (6×6)');

        outputGroup.append('text')
            .attr('x', outputSize * outputCellSize / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.dark)
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text(`Output (${outputSize}×${outputSize})`);

        // Draw arrow
        const arrow = svg.append('g');
        arrow.append('path')
            .attr('d', 'M 320 150 L 470 150')
            .attr('stroke', colors.primary)
            .attr('stroke-width', 3)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrowhead)');

        // Arrow marker
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 9)
            .attr('refY', 3)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3, 0 6')
            .attr('fill', colors.primary);

        // Pool type label
        const validPoolSize = poolSize || 2;
        arrow.append('text')
            .attr('x', 395)
            .attr('y', 140)
            .attr('text-anchor', 'middle')
            .attr('fill', colors.primary)
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`${validPoolSize}×${validPoolSize} ${poolType === 'max' ? 'Max' : 'Avg'} Pool`);
    }

    // Animate pooling operation
    function animate() {
        if (animating) return;
        animating = true;
        currentStep = 0;

        const outputSize = getOutputDimensions();
        const totalSteps = outputSize * outputSize;

        // Validate poolSize for animation
        let validPoolSize = poolSize;
        if (!validPoolSize || isNaN(validPoolSize) || validPoolSize <= 0) {
            validPoolSize = 2;
        }

        function animateStep() {
            if (currentStep >= totalSteps) {
                animating = false;
                draw();
                return;
            }

            const row = Math.floor(currentStep / outputSize);
            const col = currentStep % outputSize;

            // Highlight current pooling window
            svg.selectAll('.highlight-rect').remove();

            const inputGroup = svg.select('g');
            const highlightRect = inputGroup.append('rect')
                .attr('class', 'highlight-rect')
                .attr('x', col * validPoolSize * 40)
                .attr('y', row * validPoolSize * 40)
                .attr('width', validPoolSize * 40)
                .attr('height', validPoolSize * 40)
                .attr('fill', 'none')
                .attr('stroke', colors.highlight)
                .attr('stroke-width', 3)
                .attr('stroke-dasharray', '5,5')
                .attr('opacity', 0)
                .transition()
                .duration(300)
                .attr('opacity', 1);

            // Highlight corresponding output cell
            const outputGroup = svg.select('g:nth-child(2)');
            const outputHighlight = outputGroup.append('rect')
                .attr('class', 'highlight-rect')
                .attr('x', col * 60)
                .attr('y', row * 60)
                .attr('width', 58)
                .attr('height', 58)
                .attr('fill', colors.highlight)
                .attr('fill-opacity', 0)
                .transition()
                .duration(300)
                .attr('fill-opacity', 0.3);

            currentStep++;
            setTimeout(animateStep, 600);
        }

        animateStep();
    }

    // Event handlers
    const sliderElement = document.getElementById('pool-size-slider');
    if (sliderElement) {
        sliderElement.addEventListener('input', function(e) {
            // Try both e.target.value and e.value
            const rawValue = e.target ? e.target.value : e.value;
            console.log('Slider event:', e, 'Raw value:', rawValue, 'e.target:', e.target);

            const newPoolSize = parseInt(rawValue);
            console.log('Slider value changed to:', rawValue, 'Parsed as:', newPoolSize);

            if (!isNaN(newPoolSize) && newPoolSize >= 2 && newPoolSize <= 4) {
                poolSize = newPoolSize;
                console.log('Setting poolSize to:', poolSize);
                const valueElement = document.getElementById('pool-size-value');
                if (valueElement) {
                    valueElement.textContent = `${poolSize}×${poolSize}`;
                }
                draw();
            } else {
                console.error('Invalid pool size from slider. Raw:', rawValue, 'Parsed:', newPoolSize);
            }
        });
    } else {
        console.error('Slider element not found!');
    }

    const poolTypeElement = document.getElementById('pool-type');
    if (poolTypeElement) {
        poolTypeElement.addEventListener('change', function(e) {
            poolType = e.value;
            draw();
        });
    }

    const animateButton = document.getElementById('animate-pooling');
    if (animateButton) {
        animateButton.addEventListener('click', animate);
    }

    const resetButton = document.getElementById('reset-pooling');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            animating = false;
            currentStep = 0;
            draw();
        });
    }

    // Initial draw
    draw();
});