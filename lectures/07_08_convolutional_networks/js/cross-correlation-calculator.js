// Cross-Correlation Calculator Interactive Demo
(function() {
    'use strict';

    // Initialize when Reveal is ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', init);
        Reveal.on('slidechanged', event => {
            if (event.currentSlide.querySelector('#cross-correlation-demo')) {
                init();
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    function init() {
        const demo = document.getElementById('cross-correlation-demo');
        if (!demo) return;

        // Default input and kernel values (from the d2l.ai example)
        const inputData = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8]
        ];
        
        const kernelData = [
            [0, 1],
            [2, 3]
        ];

        let currentPosition = { i: 0, j: 0 };
        let isAnimating = false;
        let animationTimer = null;

        // Create grid display functions
        function createGrid(container, data, highlight = null) {
            container.innerHTML = '';
            const table = document.createElement('table');
            table.style.borderCollapse = 'collapse';
            table.style.margin = '0 auto';
            
            data.forEach((row, i) => {
                const tr = document.createElement('tr');
                row.forEach((val, j) => {
                    const td = document.createElement('td');
                    td.textContent = val;
                    td.style.border = '1px solid #ccc';
                    td.style.padding = '10px';
                    td.style.width = '40px';
                    td.style.height = '40px';
                    td.style.textAlign = 'center';
                    td.style.backgroundColor = '#fff';
                    
                    // Highlight cells if needed
                    if (highlight && isInHighlight(i, j, highlight)) {
                        td.style.backgroundColor = '#10099F';
                        td.style.color = 'white';
                    }
                    
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
            
            container.appendChild(table);
        }

        function isInHighlight(i, j, highlight) {
            if (!highlight) return false;
            return i >= highlight.startI && i < highlight.startI + highlight.height &&
                   j >= highlight.startJ && j < highlight.startJ + highlight.width;
        }

        // Compute cross-correlation at a position
        function computeAtPosition(i, j) {
            let sum = 0;
            const calculation = [];
            
            for (let ki = 0; ki < kernelData.length; ki++) {
                for (let kj = 0; kj < kernelData[0].length; kj++) {
                    const inputVal = inputData[i + ki][j + kj];
                    const kernelVal = kernelData[ki][kj];
                    const product = inputVal * kernelVal;
                    sum += product;
                    calculation.push(`${inputVal}×${kernelVal}`);
                }
            }
            
            return { sum, calculation: calculation.join(' + ') + ' = ' + sum };
        }

        // Create output grid
        function createOutputGrid() {
            const outputHeight = inputData.length - kernelData.length + 1;
            const outputWidth = inputData[0].length - kernelData[0].length + 1;
            const output = [];
            
            for (let i = 0; i < outputHeight; i++) {
                output[i] = [];
                for (let j = 0; j < outputWidth; j++) {
                    if (i < currentPosition.i || (i === currentPosition.i && j <= currentPosition.j)) {
                        output[i][j] = computeAtPosition(i, j).sum;
                    } else {
                        output[i][j] = '?';
                    }
                }
            }
            
            return output;
        }

        // Update display
        function updateDisplay() {
            const inputContainer = document.getElementById('correlation-input');
            const kernelContainer = document.getElementById('correlation-kernel');
            const outputContainer = document.getElementById('correlation-output');
            const calcDisplay = document.getElementById('calculation-display');
            
            if (!inputContainer || !kernelContainer || !outputContainer) return;
            
            // Highlight region in input
            const highlight = {
                startI: currentPosition.i,
                startJ: currentPosition.j,
                height: kernelData.length,
                width: kernelData[0].length
            };
            
            createGrid(inputContainer, inputData, highlight);
            createGrid(kernelContainer, kernelData);
            createGrid(outputContainer, createOutputGrid());
            
            // Show calculation
            if (calcDisplay) {
                const calc = computeAtPosition(currentPosition.i, currentPosition.j);
                calcDisplay.innerHTML = `<strong>Position (${currentPosition.i},${currentPosition.j}):</strong> ${calc.calculation}`;
            }
        }

        // Step forward
        function stepForward() {
            const outputHeight = inputData.length - kernelData.length + 1;
            const outputWidth = inputData[0].length - kernelData[0].length + 1;
            
            currentPosition.j++;
            if (currentPosition.j >= outputWidth) {
                currentPosition.j = 0;
                currentPosition.i++;
            }
            if (currentPosition.i >= outputHeight) {
                currentPosition.i = 0;
                currentPosition.j = 0;
            }
            
            updateDisplay();
        }

        // Animate
        function animate() {
            if (isAnimating) {
                stepForward();
                animationTimer = setTimeout(animate, 1000);
            }
        }

        // Reset
        function reset() {
            currentPosition = { i: 0, j: 0 };
            isAnimating = false;
            if (animationTimer) {
                clearTimeout(animationTimer);
                animationTimer = null;
            }
            updateDisplay();
        }

        // Set up event listeners
        const stepBtn = document.getElementById('step-correlation');
        const animateBtn = document.getElementById('animate-correlation');
        const resetBtn = document.getElementById('reset-correlation');
        
        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                isAnimating = false;
                stepForward();
            });
        }
        
        if (animateBtn) {
            animateBtn.addEventListener('click', () => {
                isAnimating = !isAnimating;
                animateBtn.textContent = isAnimating ? 'Pause' : 'Animate';
                if (isAnimating) {
                    animate();
                } else if (animationTimer) {
                    clearTimeout(animationTimer);
                    animationTimer = null;
                }
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', reset);
        }

        // Initial display
        updateDisplay();
    }
})();