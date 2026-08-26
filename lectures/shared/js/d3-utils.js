// D3.js utilities for Deep Learning course visualizations

const d3Utils = {
  // Create SVG container with responsive sizing
  createSVG: function(selector, width = 800, height = 600) {
    const container = d3.select(selector);
    
    // Clear any existing SVG
    container.select('svg').remove();
    
    const svg = container
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');
    
    return svg;
  },

  // Create standard scales
  createScales: function(domain, range, type = 'linear') {
    if (type === 'linear') {
      return d3.scaleLinear()
        .domain(domain)
        .range(range);
    } else if (type === 'band') {
      return d3.scaleBand()
        .domain(domain)
        .range(range)
        .padding(0.1);
    }
  },

  // Draw standard axes with labels
  drawAxes: function(svg, xScale, yScale, options = {}) {
    const defaults = {
      xLabel: 'X',
      yLabel: 'Y',
      width: 800,
      height: 600,
      margin: { top: 20, right: 20, bottom: 40, left: 50 }
    };
    
    const config = { ...defaults, ...options };
    const { margin, width, height } = config;
    
    // X-axis
    const xAxis = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    // X-axis label
    svg.append('text')
      .attr('class', 'x-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .text(config.xLabel)
      .style('fill', 'var(--color-text-secondary)');
    
    // Y-axis
    const yAxis = svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));
    
    // Y-axis label
    svg.append('text')
      .attr('class', 'y-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .text(config.yLabel)
      .style('fill', 'var(--color-text-secondary)');
    
    // Style the axes
    svg.selectAll('.x-axis, .y-axis')
      .style('color', 'var(--color-text-secondary)')
      .selectAll('line')
      .style('stroke', 'var(--color-text-secondary)');
    
    return { xAxis, yAxis };
  },

  // Create a line generator
  createLineGenerator: function(xScale, yScale, curve = d3.curveMonotoneX) {
    return d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(curve);
  },

  // Animate a path drawing
  animatePath: function(path, duration = 1000) {
    const totalLength = path.node().getTotalLength();
    
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(duration)
      .ease(d3.easeSinInOut)
      .attr('stroke-dashoffset', 0);
  },

  // Create gradient definitions
  createGradient: function(svg, id, colors) {
    const defs = svg.append('defs');
    
    const gradient = defs.append('linearGradient')
      .attr('id', id)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    
    colors.forEach((color, i) => {
      gradient.append('stop')
        .attr('offset', `${(i / (colors.length - 1)) * 100}%`)
        .style('stop-color', color.color)
        .style('stop-opacity', color.opacity || 1);
    });
    
    return gradient;
  },

  // Create tooltip
  createTooltip: function(container) {
    const tooltip = container.append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('padding', '10px')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '14px');
    
    return {
      show: function(event, text) {
        tooltip
          .style('opacity', 1)
          .html(text)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      },
      hide: function() {
        tooltip.style('opacity', 0);
      },
      move: function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      }
    };
  },

  // Generate smooth curve points
  generateSmoothCurve: function(numPoints, amplitude, frequency, phase = 0) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const x = i / (numPoints - 1);
      const y = amplitude * Math.sin(frequency * Math.PI * x + phase);
      points.push({ x, y });
    }
    return points;
  },

  // Color interpolation for weights
  getWeightColor: function(weight, minWeight = -1, maxWeight = 1) {
    const normalized = (weight - minWeight) / (maxWeight - minWeight);
    const colorScale = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range(['var(--color-weight-min)', '#95a5a6', 'var(--color-weight-max)']);
    return colorScale(normalized);
  },

  // Create responsive container
  createResponsiveContainer: function(selector, aspectRatio = 4/3) {
    const container = d3.select(selector);
    
    container
      .style('position', 'relative')
      .style('width', '100%')
      .style('padding-bottom', `${100 / aspectRatio}%`);
    
    const innerContainer = container.append('div')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('right', 0)
      .style('bottom', 0);
    
    return innerContainer;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = d3Utils;
}