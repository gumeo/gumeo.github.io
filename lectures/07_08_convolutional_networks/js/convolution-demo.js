// Interactive Convolution Demonstration
(function() {
    let animationId = null;
    let currentStep = 0;
    let isAnimating = false;
    
    // Sample input matrix (5x5)
    const inputMatrix = [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6],
        [3, 4, 5, 6, 7],
        [4, 5, 6, 7, 8],
        [5, 6, 7, 8, 9]
    ];
    
    // Kernels
    const kernels = {
        3: [
            [1, 0, -1],
            [2, 0, -2],
            [1, 0, -1]
        ], // Edge detection
        5: [
            [1, 4, 6, 4, 1],
            [4, 16, 24, 16, 4],
            [6, 24, 36, 24, 6],
            [4, 16, 24, 16, 4],
            [1, 4, 6, 4, 1]
        ].map(row => row.map(val => val/256)) // Gaussian blur
    };
    
    function initConvolutionDemo() {
        const container = document.getElementById('conv-container');
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create visualization layout
        const layout = document.createElement('div');
        layout.style.display = 'grid';
        layout.style.gridTemplateColumns = '1fr 1fr 1fr';
        layout.style.gap = '20px';
        layout.style.padding = '20px';
        
        // Create input matrix display
        const inputDiv = createMatrixDisplay('Input', inputMatrix, 'input-display');
        layout.appendChild(inputDiv);
        
        // Create kernel display
        const kernelSize = document.getElementById('kernel-size').value;
        const kernel = kernels[kernelSize];
        const kernelDiv = createMatrixDisplay('Kernel', kernel, 'kernel-display');
        layout.appendChild(kernelDiv);
        
        // Create output display
        const outputSize = inputMatrix.length - kernel.length + 1;
        const outputMatrix = Array(outputSize).fill(null).map(() => Array(outputSize).fill(0));
        const outputDiv = createMatrixDisplay('Output', outputMatrix, 'output-display');
        layout.appendChild(outputDiv);
        
        container.appendChild(layout);
        
        // Add event listeners
        setupConvolutionControls();
    }
    
    function createMatrixDisplay(title, matrix, id) {
        const div = document.createElement('div');
        div.style.textAlign = 'center';
        
        const titleEl = document.createElement('h4');
        titleEl.textContent = title;
        titleEl.style.color = '#10099F';
        titleEl.style.marginBottom = '10px';
        div.appendChild(titleEl);
        
        const table = document.createElement('table');
        table.id = id;
        table.style.margin = '0 auto';
        table.style.borderCollapse = 'collapse';
        table.style.backgroundColor = 'white';
        table.style.border = '2px solid #ddd';
        
        matrix.forEach((row, i) => {
            const tr = document.createElement('tr');
            row.forEach((val, j) => {
                const td = document.createElement('td');
                td.style.width = '40px';
                td.style.height = '40px';
                td.style.border = '1px solid #eee';
                td.style.textAlign = 'center';
                td.style.fontSize = '14px';
                td.style.fontFamily = 'monospace';
                td.textContent = typeof val === 'number' ? val.toFixed(2) : '';
                td.dataset.row = i;
                td.dataset.col = j;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
        
        div.appendChild(table);
        return div;
    }
    
    function setupConvolutionControls() {
        const stepBtn = document.getElementById('step-conv');
        const animateBtn = document.getElementById('animate-conv');
        const resetBtn = document.getElementById('reset-conv');
        const kernelSelect = document.getElementById('kernel-size');
        
        if (stepBtn) {
            stepBtn.addEventListener('click', stepConvolution);
        }
        
        if (animateBtn) {
            animateBtn.addEventListener('click', () => {
                if (isAnimating) {
                    stopAnimation();
                } else {
                    animateConvolution();
                }
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetConvolution);
        }
        
        if (kernelSelect) {
            kernelSelect.addEventListener('change', () => {
                resetConvolution();
                initConvolutionDemo();
            });
        }
    }
    
    function stepConvolution() {
        const kernelSize = parseInt(document.getElementById('kernel-size').value);
        const kernel = kernels[kernelSize];
        const outputSize = inputMatrix.length - kernel.length + 1;
        const maxSteps = outputSize * outputSize;
        
        if (currentStep >= maxSteps) {
            currentStep = 0;
        }
        
        const row = Math.floor(currentStep / outputSize);
        const col = currentStep % outputSize;
        
        // Highlight current region in input
        highlightInputRegion(row, col, kernel.length);
        
        // Calculate convolution for current position
        const result = calculateConvolution(row, col, kernel);
        
        // Update output
        updateOutput(row, col, result);
        
        currentStep++;
    }
    
    function highlightInputRegion(startRow, startCol, kernelSize) {
        const inputTable = document.getElementById('input-display');
        if (!inputTable) return;
        
        // Clear previous highlights
        const cells = inputTable.querySelectorAll('td');
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
            cell.style.fontWeight = '';
        });
        
        // Highlight current region
        for (let i = 0; i < kernelSize; i++) {
            for (let j = 0; j < kernelSize; j++) {
                const cell = inputTable.querySelector(`td[data-row="${startRow + i}"][data-col="${startCol + j}"]`);
                if (cell) {
                    cell.style.backgroundColor = '#e3f2fd';
                    cell.style.fontWeight = 'bold';
                }
            }
        }
    }
    
    function calculateConvolution(startRow, startCol, kernel) {
        let sum = 0;
        for (let i = 0; i < kernel.length; i++) {
            for (let j = 0; j < kernel[0].length; j++) {
                sum += inputMatrix[startRow + i][startCol + j] * kernel[i][j];
            }
        }
        return sum;
    }
    
    function updateOutput(row, col, value) {
        const outputTable = document.getElementById('output-display');
        if (!outputTable) return;
        
        const cell = outputTable.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.textContent = value.toFixed(2);
            cell.style.backgroundColor = '#c8e6c9';
            cell.style.fontWeight = 'bold';
            
            // Fade animation
            setTimeout(() => {
                cell.style.backgroundColor = '';
                cell.style.fontWeight = '';
                cell.style.transition = 'background-color 0.5s';
            }, 500);
        }
    }
    
    function animateConvolution() {
        if (isAnimating) return;
        
        isAnimating = true;
        const animateBtn = document.getElementById('animate-conv');
        if (animateBtn) {
            animateBtn.textContent = 'Stop';
        }
        
        function animate() {
            stepConvolution();
            
            const kernelSize = parseInt(document.getElementById('kernel-size').value);
            const kernel = kernels[kernelSize];
            const outputSize = inputMatrix.length - kernel.length + 1;
            const maxSteps = outputSize * outputSize;
            
            if (currentStep < maxSteps && isAnimating) {
                animationId = setTimeout(animate, 500);
            } else {
                stopAnimation();
            }
        }
        
        animate();
    }
    
    function stopAnimation() {
        isAnimating = false;
        if (animationId) {
            clearTimeout(animationId);
            animationId = null;
        }
        
        const animateBtn = document.getElementById('animate-conv');
        if (animateBtn) {
            animateBtn.textContent = 'Animate';
        }
    }
    
    function resetConvolution() {
        currentStep = 0;
        stopAnimation();
        
        // Clear highlights
        const inputTable = document.getElementById('input-display');
        if (inputTable) {
            const cells = inputTable.querySelectorAll('td');
            cells.forEach(cell => {
                cell.style.backgroundColor = '';
                cell.style.fontWeight = '';
            });
        }
        
        // Clear output
        const outputTable = document.getElementById('output-display');
        if (outputTable) {
            const cells = outputTable.querySelectorAll('td');
            cells.forEach(cell => {
                cell.textContent = '0.00';
                cell.style.backgroundColor = '';
                cell.style.fontWeight = '';
            });
        }
    }
    
    // Initialize when slide is shown
    Reveal.on('slidechanged', event => {
        if (event.currentSlide.querySelector('#convolution-demo')) {
            setTimeout(initConvolutionDemo, 100);
        }
    });
    
    // Also initialize if already on the slide
    if (document.querySelector('.present #convolution-demo')) {
        setTimeout(initConvolutionDemo, 100);
    }
})();