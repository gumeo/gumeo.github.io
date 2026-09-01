// Tensor visualization and animation functions

class TensorVisualizer {
    constructor(container) {
        this.container = container;
        this.animationSpeed = 500;
    }

    // Create a visual representation of a tensor
    createTensorGrid(data, shape) {
        const viz = document.createElement('div');
        viz.className = 'tensor-viz';
        
        if (shape.length === 1) {
            // 1D tensor (vector)
            viz.innerHTML = this.render1DTensor(data);
        } else if (shape.length === 2) {
            // 2D tensor (matrix)
            viz.innerHTML = this.render2DTensor(data, shape);
        } else if (shape.length === 3) {
            // 3D tensor
            viz.innerHTML = this.render3DTensor(data, shape);
        }
        
        return viz;
    }

    render1DTensor(data) {
        let html = '<div class="tensor-grid">';
        data.forEach((value, i) => {
            html += `<div class="tensor-cell" data-index="${i}">${value}</div>`;
        });
        html += '</div>';
        return html;
    }

    render2DTensor(data, shape) {
        const [rows, cols] = shape;
        let html = '<div class="tensor-grid">';
        html += '<div style="display: grid; grid-template-columns: repeat(' + cols + ', 1fr);">';
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const idx = i * cols + j;
                html += `<div class="tensor-cell" data-row="${i}" data-col="${j}">${data[idx]}</div>`;
            }
        }
        
        html += '</div></div>';
        return html;
    }

    render3DTensor(data, shape) {
        const [depth, rows, cols] = shape;
        let html = '<div class="tensor-grid" style="display: flex; gap: 20px;">';
        
        for (let d = 0; d < depth; d++) {
            html += '<div class="tensor-slice">';
            html += `<div class="shape-label">Slice ${d}</div>`;
            html += '<div style="display: grid; grid-template-columns: repeat(' + cols + ', 1fr);">';
            
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const idx = d * rows * cols + i * cols + j;
                    html += `<div class="tensor-cell" data-depth="${d}" data-row="${i}" data-col="${j}">${data[idx]}</div>`;
                }
            }
            
            html += '</div></div>';
        }
        
        html += '</div>';
        return html;
    }

    // Animate reshaping operation
    animateReshape(fromShape, toShape, data) {
        const container = document.createElement('div');
        container.className = 'operation-viz';
        
        // Create source tensor
        const source = this.createTensorGrid(data, fromShape);
        source.classList.add('source-tensor');
        
        // Create arrow
        const arrow = document.createElement('div');
        arrow.className = 'operator';
        arrow.innerHTML = '→';
        
        // Create target tensor
        const target = this.createTensorGrid(data, toShape);
        target.classList.add('target-tensor');
        target.style.opacity = '0';
        
        container.appendChild(source);
        container.appendChild(arrow);
        container.appendChild(target);
        
        // Animate
        setTimeout(() => {
            source.style.opacity = '0.5';
            target.style.opacity = '1';
            
            // Highlight corresponding cells
            const sourceCells = source.querySelectorAll('.tensor-cell');
            const targetCells = target.querySelectorAll('.tensor-cell');
            
            sourceCells.forEach((cell, i) => {
                setTimeout(() => {
                    cell.classList.add('highlighted');
                    targetCells[i].classList.add('highlighted');
                    
                    setTimeout(() => {
                        cell.classList.remove('highlighted');
                        targetCells[i].classList.remove('highlighted');
                    }, 300);
                }, i * 100);
            });
        }, 500);
        
        return container;
    }

    // Animate element-wise operation
    animateElementwiseOp(tensor1, tensor2, op, result) {
        const container = document.createElement('div');
        container.className = 'operation-viz';
        
        const t1 = this.createTensorGrid(tensor1.data, tensor1.shape);
        const opSymbol = document.createElement('div');
        opSymbol.className = 'operator';
        opSymbol.textContent = op;
        
        const t2 = this.createTensorGrid(tensor2.data, tensor2.shape);
        const equals = document.createElement('div');
        equals.className = 'equals';
        equals.textContent = '=';
        
        const res = this.createTensorGrid(result.data, result.shape);
        res.style.opacity = '0';
        
        container.appendChild(t1);
        container.appendChild(opSymbol);
        container.appendChild(t2);
        container.appendChild(equals);
        container.appendChild(res);
        
        // Animate operation
        setTimeout(() => {
            const cells1 = t1.querySelectorAll('.tensor-cell');
            const cells2 = t2.querySelectorAll('.tensor-cell');
            const resCells = res.querySelectorAll('.tensor-cell');
            
            cells1.forEach((cell, i) => {
                setTimeout(() => {
                    cells1[i].classList.add('highlighted');
                    cells2[i].classList.add('highlighted');
                    
                    setTimeout(() => {
                        res.style.opacity = '1';
                        resCells[i].classList.add('highlighted');
                        
                        setTimeout(() => {
                            cells1[i].classList.remove('highlighted');
                            cells2[i].classList.remove('highlighted');
                            resCells[i].classList.remove('highlighted');
                        }, 300);
                    }, 200);
                }, i * 150);
            });
        }, 500);
        
        return container;
    }

    // Animate indexing/slicing
    animateIndexing(data, shape, indices) {
        const container = document.createElement('div');
        container.className = 'indexing-viz';
        
        const grid = this.createTensorGrid(data, shape);
        container.appendChild(grid);
        
        // Highlight selected cells based on indices
        setTimeout(() => {
            const cells = grid.querySelectorAll('.tensor-cell');
            indices.forEach(idx => {
                if (typeof idx === 'number') {
                    cells[idx].classList.add('selected');
                } else if (idx.row !== undefined && idx.col !== undefined) {
                    const cell = grid.querySelector(`[data-row="${idx.row}"][data-col="${idx.col}"]`);
                    if (cell) cell.classList.add('selected');
                }
            });
        }, 500);
        
        return container;
    }

    // Animate concatenation
    animateConcat(tensor1, tensor2, axis, result) {
        const container = document.createElement('div');
        container.className = 'operation-viz';
        
        const t1 = this.createTensorGrid(tensor1.data, tensor1.shape);
        t1.style.border = '2px solid var(--color-primary)';
        
        const plus = document.createElement('div');
        plus.className = 'operator';
        plus.textContent = axis === 0 ? '⊕↓' : '⊕→';
        
        const t2 = this.createTensorGrid(tensor2.data, tensor2.shape);
        t2.style.border = '2px solid var(--color-accent)';
        
        const equals = document.createElement('div');
        equals.className = 'equals';
        equals.textContent = '=';
        
        const res = this.createTensorGrid(result.data, result.shape);
        res.style.opacity = '0';
        
        container.appendChild(t1);
        container.appendChild(plus);
        container.appendChild(t2);
        container.appendChild(equals);
        container.appendChild(res);
        
        // Animate concatenation
        setTimeout(() => {
            t1.style.transform = axis === 0 ? 'translateY(-10px)' : 'translateX(-10px)';
            t2.style.transform = axis === 0 ? 'translateY(10px)' : 'translateX(10px)';
            
            setTimeout(() => {
                res.style.opacity = '1';
                t1.style.opacity = '0.5';
                t2.style.opacity = '0.5';
            }, 500);
        }, 500);
        
        return container;
    }

    // Animate memory allocation
    animateMemory(operations) {
        const container = document.createElement('div');
        container.className = 'memory-viz';
        
        operations.forEach((op, i) => {
            const block = document.createElement('div');
            block.className = 'memory-block';
            block.style.opacity = '0';
            
            const addr = document.createElement('div');
            addr.className = 'memory-address';
            addr.textContent = `id: ${op.id}`;
            
            const content = document.createElement('div');
            content.className = `memory-content ${op.type}`;
            content.innerHTML = `
                <strong>${op.name}</strong><br>
                <small>${op.description}</small>
            `;
            
            block.appendChild(addr);
            block.appendChild(content);
            container.appendChild(block);
            
            // Animate appearance
            setTimeout(() => {
                block.style.opacity = '1';
                block.style.transform = 'translateX(0)';
            }, i * 300);
        });
        
        return container;
    }
}

// Initialize visualizations when slides are ready
document.addEventListener('DOMContentLoaded', () => {
    // Find all tensor visualization containers
    const vizContainers = document.querySelectorAll('[data-tensor-viz]');
    
    vizContainers.forEach(container => {
        const config = JSON.parse(container.dataset.tensorViz);
        const visualizer = new TensorVisualizer(container);
        
        switch (config.type) {
            case 'reshape':
                const reshapeViz = visualizer.animateReshape(
                    config.fromShape,
                    config.toShape,
                    config.data
                );
                container.appendChild(reshapeViz);
                break;
                
            case 'elementwise':
                const elemViz = visualizer.animateElementwiseOp(
                    config.tensor1,
                    config.tensor2,
                    config.op,
                    config.result
                );
                container.appendChild(elemViz);
                break;
                
            case 'indexing':
                const indexViz = visualizer.animateIndexing(
                    config.data,
                    config.shape,
                    config.indices
                );
                container.appendChild(indexViz);
                break;
                
            case 'concat':
                const concatViz = visualizer.animateConcat(
                    config.tensor1,
                    config.tensor2,
                    config.axis,
                    config.result
                );
                container.appendChild(concatViz);
                break;
                
            case 'memory':
                const memViz = visualizer.animateMemory(config.operations);
                container.appendChild(memViz);
                break;
                
            default:
                const basicViz = visualizer.createTensorGrid(config.data, config.shape);
                container.appendChild(basicViz);
        }
    });
    
    // Add interactive demos
    const demos = document.querySelectorAll('.interactive-demo');
    demos.forEach(demo => {
        const runBtn = demo.querySelector('.demo-btn[data-action="run"]');
        const resetBtn = demo.querySelector('.demo-btn[data-action="reset"]');
        const output = demo.querySelector('.demo-output');
        
        if (runBtn) {
            runBtn.addEventListener('click', () => {
                // Simulate tensor operation
                output.innerHTML = '<div class="tensor-cell animating">Running...</div>';
                setTimeout(() => {
                    output.innerHTML = demo.dataset.result || 'Operation completed!';
                }, 1000);
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                output.innerHTML = 'Ready to run...';
            });
        }
    });
});