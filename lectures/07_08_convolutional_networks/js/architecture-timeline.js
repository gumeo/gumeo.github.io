// Architecture Timeline Visualization
document.addEventListener('DOMContentLoaded', function() {
    // Only run on slides with the architecture timeline
    const timelineContainer = document.getElementById('architecture-timeline-viz');
    if (!timelineContainer) return;

    const svg = d3.select('#architecture-timeline-viz svg');
    const width = 800;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Architecture data
    const architectures = [
        { name: 'AlexNet', year: 2012, y: 0.3, color: '#FC8484', description: 'Deep CNN breakthrough' },
        { name: 'NiN', year: 2013, y: 0.6, color: '#FAC55B', description: 'Network in Network' },
        { name: 'VGG', year: 2014, y: 0.2, color: '#FFA05F', description: 'Deeper networks' },
        { name: 'GoogLeNet', year: 2014, y: 0.7, color: '#2DD2C0', description: 'Inception modules' },
        { name: 'ResNet', year: 2015, y: 0.4, color: '#10099F', description: 'Residual connections' },
        { name: 'DenseNet', year: 2017, y: 0.25, color: '#00FFBA', description: 'Dense connections' },
        { name: 'MobileNet', year: 2017, y: 0.8, color: '#FC8484', description: 'Efficient networks' },
        { name: 'RegNet', year: 2020, y: 0.3, color: '#2DD2C0', description: 'Design spaces' },
        { name: 'ViT', year: 2021, y: 0.6, color: '#10099F', description: 'Vision Transformer' },
        { name: 'ConvNeXt', year: 2022, y: 0.4, color: '#FFA05F', description: 'Modern CNNs' }
    ];

    // Create main group
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([2012, 2023])
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'))
        .ticks(6);

    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(xAxis)
        .style('font-size', '12px');

    // Add X axis label
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Year');

    // Add timeline line
    g.append('line')
        .attr('x1', 0)
        .attr('y1', innerHeight / 2)
        .attr('x2', innerWidth)
        .attr('y2', innerHeight / 2)
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    // Create architecture groups
    const archGroups = g.selectAll('.arch-group')
        .data(architectures)
        .enter().append('g')
        .attr('class', 'arch-group')
        .attr('transform', d => `translate(${xScale(d.year)}, ${yScale(d.y)})`);

    // Add connecting lines
    archGroups.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', d => innerHeight / 2 - yScale(d.y))
        .attr('stroke', d => d.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .style('opacity', 0.5);

    // Add circles
    archGroups.append('circle')
        .attr('r', 0)
        .attr('fill', d => d.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .transition()
        .duration(500)
        .delay((d, i) => i * 100)
        .attr('r', 8);

    // Add labels
    const labels = archGroups.append('text')
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', d => d.color)
        .style('opacity', 0)
        .text(d => d.name);

    labels.transition()
        .duration(500)
        .delay((d, i) => i * 100 + 200)
        .style('opacity', 1);

    // Add tooltips
    const tooltip = d3.select('body').append('div')
        .attr('class', 'timeline-tooltip')
        .style('position', 'absolute')
        .style('padding', '10px')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('border-radius', '5px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 1000);

    // Add hover interactions
    archGroups.selectAll('circle')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 12);

            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);

            tooltip.html(`<strong>${d.name} (${d.year})</strong><br/>${d.description}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 8);

            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // Add title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#10099F')
        .text('Evolution of CNN Architectures');

    // Add era indicators
    const eras = [
        { start: 2012, end: 2014, label: 'Early Deep Learning', color: '#FFE0E0' },
        { start: 2014, end: 2017, label: 'Architecture Innovation', color: '#E0F0FF' },
        { start: 2017, end: 2020, label: 'Efficiency Focus', color: '#E0FFE0' },
        { start: 2020, end: 2023, label: 'Beyond CNNs', color: '#FFF0E0' }
    ];

    const eraGroups = g.selectAll('.era-group')
        .data(eras)
        .enter().append('g')
        .attr('class', 'era-group');

    eraGroups.append('rect')
        .attr('x', d => xScale(d.start))
        .attr('y', 0)
        .attr('width', d => xScale(d.end) - xScale(d.start))
        .attr('height', innerHeight)
        .attr('fill', d => d.color)
        .attr('opacity', 0.2);

    eraGroups.append('text')
        .attr('x', d => (xScale(d.start) + xScale(d.end)) / 2)
        .attr('y', innerHeight - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .style('font-style', 'italic')
        .text(d => d.label);

    // Animate on Reveal.js slide change
    if (window.Reveal) {
        Reveal.on('slidechanged', event => {
            if (event.currentSlide.querySelector('#architecture-timeline-viz')) {
                // Re-animate when slide becomes visible
                archGroups.selectAll('circle')
                    .attr('r', 0)
                    .transition()
                    .duration(500)
                    .delay((d, i) => i * 100)
                    .attr('r', 8);

                labels.style('opacity', 0)
                    .transition()
                    .duration(500)
                    .delay((d, i) => i * 100 + 200)
                    .style('opacity', 1);
            }
        });
    }

    // Clean up tooltip on page unload
    window.addEventListener('beforeunload', () => {
        tooltip.remove();
    });
});