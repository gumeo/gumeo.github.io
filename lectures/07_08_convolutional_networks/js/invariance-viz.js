// Translation Invariance Visualization
(function() {
    let svg, objectGroup;
    let currentPosition = { x: 150, y: 150 };
    const objectSize = 40;
    const detectorSize = 60;
    
    function initTranslationDemo() {
        const container = document.getElementById('translation-svg');
        if (!container || !window.d3) return;
        
        svg = d3.select(container);
        svg.selectAll("*").remove();
        
        const width = 600;
        const height = 300;
        
        // Create background grid
        const gridSize = 30;
        const grid = svg.append('g').attr('class', 'grid');
        
        // Vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            grid.append('line')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', height)
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 1);
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            grid.append('line')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 1);
        }
        
        // Create detector regions (showing that same detector works everywhere)
        const detectorGroup = svg.append('g').attr('class', 'detectors');
        
        // Add multiple detector regions to show weight sharing
        const detectorPositions = [
            { x: 100, y: 100 },
            { x: 250, y: 100 },
            { x: 400, y: 100 },
            { x: 100, y: 200 },
            { x: 250, y: 200 },
            { x: 400, y: 200 }
        ];
        
        detectorPositions.forEach(pos => {
            const detector = detectorGroup.append('g')
                .attr('transform', `translate(${pos.x}, ${pos.y})`);
            
            detector.append('rect')
                .attr('x', -detectorSize/2)
                .attr('y', -detectorSize/2)
                .attr('width', detectorSize)
                .attr('height', detectorSize)
                .attr('fill', 'none')
                .attr('stroke', '#10099F')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5')
                .attr('opacity', 0.3);
            
            detector.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', -detectorSize/2 - 5)
                .attr('font-size', '10px')
                .attr('fill', '#10099F')
                .attr('opacity', 0.5)
                .text('Same Weights');
        });
        
        // Create movable object
        objectGroup = svg.append('g')
            .attr('class', 'object')
            .attr('transform', `translate(${currentPosition.x}, ${currentPosition.y})`);
        
        // Object shape (simple pattern)
        const pattern = objectGroup.append('g');
        
        // Main circle
        pattern.append('circle')
            .attr('r', objectSize/2)
            .attr('fill', '#FC8484')
            .attr('stroke', '#262626')
            .attr('stroke-width', 2);
        
        // Inner pattern (to make it recognizable)
        pattern.append('rect')
            .attr('x', -objectSize/4)
            .attr('y', -objectSize/4)
            .attr('width', objectSize/2)
            .attr('height', objectSize/2)
            .attr('fill', '#FFA05F');
        
        pattern.append('circle')
            .attr('r', objectSize/8)
            .attr('fill', '#10099F');
        
        // Add label
        objectGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', objectSize/2 + 15)
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .text('Pattern');
        
        // Add response indicator
        updateDetectorResponses();
        
        setupInvarianceControls();
    }
    
    function updateDetectorResponses() {
        const detectors = svg.selectAll('.detectors g');
        
        detectors.each(function() {
            const detector = d3.select(this);
            const transform = detector.attr('transform');
            const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
            if (match) {
                const dx = parseFloat(match[1]);
                const dy = parseFloat(match[2]);
                
                // Calculate distance from object
                const distance = Math.sqrt(
                    Math.pow(dx - currentPosition.x, 2) + 
                    Math.pow(dy - currentPosition.y, 2)
                );
                
                // If object is within detector range
                if (distance < detectorSize/2) {
                    // Highlight active detector
                    detector.select('rect')
                        .transition()
                        .duration(300)
                        .attr('stroke', '#2DD2C0')
                        .attr('stroke-width', 3)
                        .attr('opacity', 1);
                    
                    // Show activation
                    if (!detector.select('.activation').node()) {
                        detector.append('text')
                            .attr('class', 'activation')
                            .attr('text-anchor', 'middle')
                            .attr('y', 5)
                            .attr('font-size', '14px')
                            .attr('font-weight', 'bold')
                            .attr('fill', '#2DD2C0')
                            .text('DETECTED!');
                    }
                } else {
                    // Reset inactive detector
                    detector.select('rect')
                        .transition()
                        .duration(300)
                        .attr('stroke', '#10099F')
                        .attr('stroke-width', 2)
                        .attr('opacity', 0.3);
                    
                    detector.select('.activation').remove();
                }
            }
        });
    }
    
    function moveObject() {
        // Random new position
        const width = 600;
        const height = 300;
        const margin = objectSize;
        
        currentPosition = {
            x: margin + Math.random() * (width - 2 * margin),
            y: margin + Math.random() * (height - 2 * margin)
        };
        
        // Animate movement
        objectGroup.transition()
            .duration(1000)
            .attr('transform', `translate(${currentPosition.x}, ${currentPosition.y})`)
            .on('end', updateDetectorResponses);
        
        // Update responses during movement
        const timer = d3.interval(() => {
            updateDetectorResponses();
        }, 50);
        
        setTimeout(() => timer.stop(), 1100);
    }
    
    function resetPosition() {
        currentPosition = { x: 150, y: 150 };
        
        objectGroup.transition()
            .duration(500)
            .attr('transform', `translate(${currentPosition.x}, ${currentPosition.y})`)
            .on('end', updateDetectorResponses);
        
        const timer = d3.interval(() => {
            updateDetectorResponses();
        }, 50);
        
        setTimeout(() => timer.stop(), 600);
    }
    
    function setupInvarianceControls() {
        const moveBtn = document.getElementById('move-object');
        const resetBtn = document.getElementById('reset-position');
        
        if (moveBtn) {
            moveBtn.addEventListener('click', moveObject);
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetPosition);
        }
    }
    
    // Initialize when slide is shown
    Reveal.on('slidechanged', event => {
        if (event.currentSlide.querySelector('#translation-demo')) {
            setTimeout(initTranslationDemo, 100);
        }
    });
    
    // Also initialize if already on the slide
    if (document.querySelector('.present #translation-demo')) {
        setTimeout(initTranslationDemo, 100);
    }
})();