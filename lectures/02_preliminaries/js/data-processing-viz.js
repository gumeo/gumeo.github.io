// Data Processing Pipeline Visualization
(function() {
    'use strict';

    // Wait for Reveal.js to be ready
    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initDataProcessingViz);
        Reveal.on('slidechanged', function(event) {
            if (event.currentSlide.querySelector('#data-pipeline-viz')) {
                initDataProcessingViz();
            }
        });
    }

    function initDataProcessingViz() {
        const container = document.getElementById('data-pipeline-viz');
        if (!container) return;

        const width = container.clientWidth;
        if (!width) return;

        container.innerHTML = '';
        const height = 400;
        const nodeWidth = 140;
        const nodeHeight = 60;
        const verticalSpacing = 80;

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.width = '100%';
        svg.style.height = '100%';
        container.appendChild(svg);

        // Define pipeline stages
        const stages = [
            { id: 'raw', label: 'Raw CSV Data', color: '#10099F', y: 30 },
            { id: 'load', label: 'Load with pandas', color: '#2DD2C0', y: 30 + verticalSpacing },
            { id: 'split', label: 'Split Features/Target', color: '#2DD2C0', y: 30 + verticalSpacing * 2 },
            { id: 'impute', label: 'Handle Missing Values', color: '#FAC55B', y: 30 + verticalSpacing * 3 },
            { id: 'tensor', label: 'Convert to Tensors', color: '#FC8484', y: 30 + verticalSpacing * 4 }
        ];

        // Create gradient definitions
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Arrow marker
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#666');
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Calculate center position
        const centerX = width / 2;

        // Draw connections
        stages.forEach((stage, i) => {
            if (i < stages.length - 1) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', centerX);
                line.setAttribute('y1', stage.y + nodeHeight / 2);
                line.setAttribute('x2', centerX);
                line.setAttribute('y2', stages[i + 1].y - nodeHeight / 2);
                line.setAttribute('stroke', '#999');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('marker-end', 'url(#arrowhead)');
                line.style.opacity = '0';
                svg.appendChild(line);

                // Animate line appearance
                setTimeout(() => {
                    line.style.transition = 'opacity 0.5s ease-in-out';
                    line.style.opacity = '1';
                }, 500 + i * 300);
            }
        });

        // Draw nodes
        stages.forEach((stage, i) => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.style.opacity = '0';
            
            // Rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', centerX - nodeWidth / 2);
            rect.setAttribute('y', stage.y - nodeHeight / 2);
            rect.setAttribute('width', nodeWidth);
            rect.setAttribute('height', nodeHeight);
            rect.setAttribute('rx', '8');
            rect.setAttribute('fill', stage.color);
            rect.setAttribute('fill-opacity', '0.2');
            rect.setAttribute('stroke', stage.color);
            rect.setAttribute('stroke-width', '2');
            g.appendChild(rect);

            // Text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centerX);
            text.setAttribute('y', stage.y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#262626');
            text.setAttribute('font-family', 'Atkinson Hyperlegible, sans-serif');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', 'bold');
            text.textContent = stage.label;
            g.appendChild(text);

            // Add hover effect
            g.style.cursor = 'pointer';
            g.addEventListener('mouseenter', function() {
                rect.setAttribute('fill-opacity', '0.4');
                rect.style.transform = 'scale(1.05)';
                rect.style.transformOrigin = `${centerX}px ${stage.y}px`;
                rect.style.transition = 'all 0.2s ease-in-out';
            });
            
            g.addEventListener('mouseleave', function() {
                rect.setAttribute('fill-opacity', '0.2');
                rect.style.transform = 'scale(1)';
            });

            svg.appendChild(g);

            // Animate node appearance
            setTimeout(() => {
                g.style.transition = 'opacity 0.5s ease-in-out';
                g.style.opacity = '1';
            }, i * 300);
        });

        // Add sample data annotations
        const annotations = [
            { stage: 0, text: 'NumRooms,RoofType,Price', side: 'right' },
            { stage: 1, text: 'DataFrame object', side: 'left' },
            { stage: 2, text: 'X (features), y (target)', side: 'right' },
            { stage: 3, text: 'No NaN values', side: 'left' },
            { stage: 4, text: 'torch.Tensor', side: 'right' }
        ];

        annotations.forEach((ann, i) => {
            const stage = stages[ann.stage];
            const xOffset = ann.side === 'right' ? 90 : -90;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centerX + xOffset);
            text.setAttribute('y', stage.y + 5);
            text.setAttribute('text-anchor', ann.side === 'right' ? 'start' : 'end');
            text.setAttribute('fill', '#666');
            text.setAttribute('font-family', 'Source Code Pro, monospace');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-style', 'italic');
            text.textContent = ann.text;
            text.style.opacity = '0';
            svg.appendChild(text);

            // Animate annotation appearance
            setTimeout(() => {
                text.style.transition = 'opacity 0.5s ease-in-out';
                text.style.opacity = '0.7';
            }, 1500 + i * 200);
        });
    }
})();