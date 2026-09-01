// Broadcasting visualization for tensor operations

class BroadcastingVisualizer {
    constructor() {
        this.animationDuration = 800;
        this.stepDelay = 500;
    }

    // Create a visual representation of broadcasting
    visualizeBroadcasting(tensor1Shape, tensor2Shape, resultShape) {
        const container = document.createElement('div');
        container.className = 'broadcasting-viz';
        
        // Create tensor visualizations
        const t1 = this.createShapeViz(tensor1Shape, 'Tensor A', 'source');
        const arrow1 = this.createArrow('→');
        const t1Expanded = this.createShapeViz(resultShape, 'A (broadcast)', 'expanded');
        
        const t2 = this.createShapeViz(tensor2Shape, 'Tensor B', 'source');
        const arrow2 = this.createArrow('→');
        const t2Expanded = this.createShapeViz(resultShape, 'B (broadcast)', 'expanded');
        
        // Create operation section
        const opSection = document.createElement('div');
        opSection.className = 'broadcast-operation';
        opSection.style.display = 'flex';
        opSection.style.flexDirection = 'column';
        opSection.style.alignItems = 'center';
        opSection.style.gap = '20px';
        
        const plusSign = document.createElement('div');
        plusSign.className = 'operator';
        plusSign.textContent = '+';
        plusSign.style.fontSize = '2em';
        
        const result = this.createShapeViz(resultShape, 'Result', 'result');
        
        // Build the visualization
        const row1 = document.createElement('div');
        row1.style.display = 'flex';
        row1.style.alignItems = 'center';
        row1.style.gap = '20px';
        row1.appendChild(t1);
        row1.appendChild(arrow1);
        row1.appendChild(t1Expanded);
        
        const row2 = document.createElement('div');
        row2.style.display = 'flex';
        row2.style.alignItems = 'center';
        row2.style.gap = '20px';
        row2.appendChild(t2);
        row2.appendChild(arrow2);
        row2.appendChild(t2Expanded);
        
        container.appendChild(row1);
        container.appendChild(plusSign);
        container.appendChild(row2);
        container.appendChild(document.createElement('hr'));
        container.appendChild(result);
        
        // Animate the broadcasting
        this.animateBroadcast(t1, t1Expanded, t2, t2Expanded, result);
        
        return container;
    }

    createShapeViz(shape, label, type) {
        const viz = document.createElement('div');
        viz.className = `broadcast-tensor ${type}`;
        viz.style.position = 'relative';
        viz.style.minWidth = '120px';
        viz.style.textAlign = 'center';
        
        // Add label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'shape-label';
        labelDiv.textContent = label;
        viz.appendChild(labelDiv);
        
        // Create grid based on shape
        const grid = this.createGrid(shape);
        viz.appendChild(grid);
        
        // Add shape dimensions
        const dimLabel = document.createElement('div');
        dimLabel.className = 'dim-indicator';
        dimLabel.textContent = `(${shape.join(', ')})`;
        dimLabel.style.marginTop = '10px';
        viz.appendChild(dimLabel);
        
        return viz;
    }

    createGrid(shape) {
        const grid = document.createElement('div');
        grid.className = 'tensor-grid';
        
        if (shape.length === 1) {
            // 1D tensor
            grid.style.display = 'flex';
            grid.style.gap = '5px';
            for (let i = 0; i < Math.min(shape[0], 5); i++) {
                const cell = this.createCell();
                grid.appendChild(cell);
            }
            if (shape[0] > 5) {
                grid.appendChild(this.createEllipsis());
            }
        } else if (shape.length === 2) {
            // 2D tensor
            const [rows, cols] = shape;
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = `repeat(${Math.min(cols, 4)}, 1fr)`;
            grid.style.gap = '5px';
            
            for (let i = 0; i < Math.min(rows, 3); i++) {
                for (let j = 0; j < Math.min(cols, 4); j++) {
                    const cell = this.createCell();
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    grid.appendChild(cell);
                }
                if (cols > 4 && i === 0) {
                    grid.appendChild(this.createEllipsis());
                }
            }
            if (rows > 3) {
                for (let j = 0; j < Math.min(cols, 4); j++) {
                    grid.appendChild(this.createEllipsis());
                }
            }
        } else if (shape.length === 3) {
            // 3D tensor - show as multiple 2D slices
            const [depth, rows, cols] = shape;
            grid.style.display = 'flex';
            grid.style.gap = '15px';
            
            for (let d = 0; d < Math.min(depth, 2); d++) {
                const slice = document.createElement('div');
                slice.style.display = 'grid';
                slice.style.gridTemplateColumns = `repeat(${Math.min(cols, 3)}, 1fr)`;
                slice.style.gap = '3px';
                slice.style.border = '1px solid var(--color-border)';
                slice.style.padding = '5px';
                slice.style.borderRadius = '4px';
                
                for (let i = 0; i < Math.min(rows, 2); i++) {
                    for (let j = 0; j < Math.min(cols, 3); j++) {
                        const cell = this.createCell();
                        cell.style.width = '25px';
                        cell.style.height = '25px';
                        cell.dataset.depth = d;
                        cell.dataset.row = i;
                        cell.dataset.col = j;
                        slice.appendChild(cell);
                    }
                }
                grid.appendChild(slice);
            }
            if (depth > 2) {
                grid.appendChild(this.createEllipsis());
            }
        }
        
        return grid;
    }

    createCell() {
        const cell = document.createElement('div');
        cell.className = 'tensor-cell';
        cell.style.width = '35px';
        cell.style.height = '35px';
        cell.style.background = 'white';
        cell.style.border = '1px solid var(--color-border)';
        cell.style.borderRadius = '4px';
        return cell;
    }

    createEllipsis() {
        const ellipsis = document.createElement('div');
        ellipsis.textContent = '⋯';
        ellipsis.style.display = 'flex';
        ellipsis.style.alignItems = 'center';
        ellipsis.style.justifyContent = 'center';
        ellipsis.style.width = '35px';
        ellipsis.style.height = '35px';
        ellipsis.style.fontSize = '1.2em';
        ellipsis.style.color = 'var(--color-primary)';
        return ellipsis;
    }

    createArrow(text) {
        const arrow = document.createElement('div');
        arrow.className = 'broadcast-arrow';
        arrow.textContent = text;
        arrow.style.opacity = '0';
        return arrow;
    }

    animateBroadcast(source1, expanded1, source2, expanded2, result) {
        // Initially hide expanded versions and result
        expanded1.style.opacity = '0';
        expanded2.style.opacity = '0';
        result.style.opacity = '0';
        
        // Step 1: Show source tensors
        setTimeout(() => {
            source1.classList.add('highlighted');
            source2.classList.add('highlighted');
        }, this.stepDelay);
        
        // Step 2: Show arrows
        setTimeout(() => {
            const arrows = document.querySelectorAll('.broadcast-arrow');
            arrows.forEach(arrow => {
                arrow.style.opacity = '1';
            });
        }, this.stepDelay * 2);
        
        // Step 3: Show expanded versions
        setTimeout(() => {
            expanded1.style.opacity = '1';
            expanded2.style.opacity = '1';
            
            // Animate expansion
            this.animateExpansion(source1, expanded1);
            this.animateExpansion(source2, expanded2);
        }, this.stepDelay * 3);
        
        // Step 4: Show result
        setTimeout(() => {
            result.style.opacity = '1';
            result.classList.add('highlighted');
            
            // Pulse effect on result
            setTimeout(() => {
                result.classList.remove('highlighted');
            }, 1000);
        }, this.stepDelay * 4);
    }

    animateExpansion(source, target) {
        const sourceCells = source.querySelectorAll('.tensor-cell');
        const targetCells = target.querySelectorAll('.tensor-cell');
        
        // Create visual connection between corresponding cells
        sourceCells.forEach((cell, i) => {
            setTimeout(() => {
                cell.style.background = 'var(--color-accent)';
                cell.style.transition = 'all 0.3s ease';
                
                // Highlight corresponding cells in expanded version
                if (targetCells[i]) {
                    targetCells[i].style.background = 'var(--color-accent)';
                    targetCells[i].style.transition = 'all 0.3s ease';
                }
                
                // Reset after animation
                setTimeout(() => {
                    cell.style.background = 'white';
                    if (targetCells[i]) {
                        targetCells[i].style.background = 'white';
                    }
                }, 500);
            }, i * 50);
        });
    }

    // Create an interactive broadcasting demo
    createInteractiveDemo() {
        const demo = document.createElement('div');
        demo.className = 'interactive-demo';
        
        // Controls
        const controls = document.createElement('div');
        controls.className = 'demo-controls';
        
        // Shape inputs
        const shape1Input = this.createShapeInput('Shape A:', '3,1');
        const shape2Input = this.createShapeInput('Shape B:', '1,4');
        
        const visualizeBtn = document.createElement('button');
        visualizeBtn.className = 'demo-btn';
        visualizeBtn.textContent = 'Visualize Broadcasting';
        
        controls.appendChild(shape1Input);
        controls.appendChild(shape2Input);
        controls.appendChild(visualizeBtn);
        
        // Output area
        const output = document.createElement('div');
        output.className = 'demo-output';
        
        demo.appendChild(controls);
        demo.appendChild(output);
        
        // Event handler
        visualizeBtn.addEventListener('click', () => {
            const shape1 = shape1Input.querySelector('input').value.split(',').map(Number);
            const shape2 = shape2Input.querySelector('input').value.split(',').map(Number);
            
            try {
                const resultShape = this.computeBroadcastShape(shape1, shape2);
                output.innerHTML = '';
                const viz = this.visualizeBroadcasting(shape1, shape2, resultShape);
                output.appendChild(viz);
            } catch (error) {
                output.innerHTML = `<div style="color: var(--color-error);">Error: ${error.message}</div>`;
            }
        });
        
        return demo;
    }

    createShapeInput(label, defaultValue) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '10px';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.fontWeight = 'bold';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultValue;
        input.style.padding = '5px';
        input.style.border = '1px solid var(--color-border)';
        input.style.borderRadius = '4px';
        input.style.width = '100px';
        
        container.appendChild(labelEl);
        container.appendChild(input);
        
        return container;
    }

    computeBroadcastShape(shape1, shape2) {
        const maxLen = Math.max(shape1.length, shape2.length);
        const result = [];
        
        // Pad shapes with 1s from the left
        const padded1 = Array(maxLen - shape1.length).fill(1).concat(shape1);
        const padded2 = Array(maxLen - shape2.length).fill(1).concat(shape2);
        
        for (let i = 0; i < maxLen; i++) {
            if (padded1[i] === padded2[i]) {
                result.push(padded1[i]);
            } else if (padded1[i] === 1) {
                result.push(padded2[i]);
            } else if (padded2[i] === 1) {
                result.push(padded1[i]);
            } else {
                throw new Error(`Shapes ${shape1} and ${shape2} are not compatible for broadcasting`);
            }
        }
        
        return result;
    }
}

// Initialize broadcasting visualizations when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const broadcastViz = new BroadcastingVisualizer();
    
    // Find all broadcasting visualization containers
    const containers = document.querySelectorAll('[data-broadcast-viz]');
    
    containers.forEach(container => {
        const config = JSON.parse(container.dataset.broadcastViz);
        
        if (config.interactive) {
            const demo = broadcastViz.createInteractiveDemo();
            container.appendChild(demo);
        } else {
            const viz = broadcastViz.visualizeBroadcasting(
                config.shape1,
                config.shape2,
                config.result
            );
            container.appendChild(viz);
        }
    });
    
    // Add broadcast examples on specific slides
    Reveal.on('slidechanged', event => {
        const slide = event.currentSlide;
        const broadcastExample = slide.querySelector('.broadcast-example');
        
        if (broadcastExample && !broadcastExample.dataset.initialized) {
            broadcastExample.dataset.initialized = 'true';
            
            // Create example visualization
            const viz = broadcastViz.visualizeBroadcasting(
                [3, 1],
                [1, 4],
                [3, 4]
            );
            broadcastExample.appendChild(viz);
        }
    });
});