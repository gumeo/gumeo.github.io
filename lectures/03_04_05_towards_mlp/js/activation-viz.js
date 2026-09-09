/**
 * Activation Function Explorer
 * A single unified, switchable D3 visualization for ReLU / Sigmoid / Tanh
 * (replaces three near-duplicate per-function slides with one interactive explorer)
 */

(function() {
    'use strict';

    const ACTIVATIONS = {
        relu: {
            label: 'ReLU(x) = max(0, x)',
            derivLabel: "ReLU'(x)",
            fn: x => Math.max(0, x),
            deriv: x => x > 0 ? 1 : 0,
            yDomain: [-1, 5],
            derivDomain: [-0.5, 1.5],
            derivStep: true,
            props: 'Range [0, &infin;) &middot; not zero-centered &middot; no vanishing gradient for x&gt;0 &middot; cheapest to compute &middot; sparse (exactly 0 for x&lt;0)'
        },
        sigmoid: {
            label: 'sigmoid(x) = 1 / (1 + e⁻ˣ)',
            derivLabel: '&sigma;’(x) = &sigma;(x)(1&minus;&sigma;(x))',
            fn: x => 1 / (1 + Math.exp(-x)),
            deriv: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); },
            yDomain: [-0.2, 1.2],
            derivDomain: [-0.05, 0.3],
            derivStep: false,
            props: 'Range (0, 1) &middot; not zero-centered &middot; max derivative 0.25 at x=0 &middot; &#9888; vanishes for large |x|'
        },
        tanh: {
            label: 'tanh(x)',
            derivLabel: "tanh'(x) = 1 − tanh²(x)",
            fn: x => Math.tanh(x),
            deriv: x => { const t = Math.tanh(x); return 1 - t * t; },
            yDomain: [-1.2, 1.2],
            derivDomain: [-0.2, 1.2],
            derivStep: false,
            props: 'Range (-1, 1) &middot; zero-centered &middot; max derivative 1.0 at x=0 &middot; &#9888; still vanishes for large |x|'
        }
    };

    let current = 'relu';
    let built = false;
    let xScale, yScale, yScaleDeriv, gPlot, gDeriv, path, pathDeriv, circle, circleDeriv;
    let axisYPlot, axisYDeriv;

    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initActivationExplorer);
        Reveal.on('slidechanged', initActivationExplorer);
    } else {
        document.addEventListener('DOMContentLoaded', initActivationExplorer);
    }

    function initActivationExplorer() {
        const container = document.getElementById('activation-explorer');
        if (!container) return;
        if (built) { render(); return; }

        const plotContainer = document.getElementById('act-plot');
        const derivContainer = document.getElementById('act-deriv-plot');
        if (!plotContainer || !derivContainer) return;
        // Slide may still be display:none (not yet the current slide) the first time
        // 'ready'/'slidechanged' fires, which makes clientWidth 0. Don't mark built
        // in that case, so we retry once the slide is actually visible.
        if (plotContainer.clientWidth === 0) return;

        const margin = { top: 28, right: 16, bottom: 30, left: 42 };
        const width = plotContainer.clientWidth - margin.left - margin.right;
        const height = 230 - margin.top - margin.bottom;

        xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);
        yScale = d3.scaleLinear().range([height, 0]);
        yScaleDeriv = d3.scaleLinear().range([height, 0]);

        const svg = d3.select(plotContainer).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        gPlot = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const svgDeriv = d3.select(derivContainer).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        gDeriv = svgDeriv.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        gPlot.append('g').attr('class', 'axis-x').call(d3.axisBottom(xScale).ticks(6));
        gPlot.append('g').attr('class', 'axis-y');
        gDeriv.append('g').attr('class', 'axis-x').call(d3.axisBottom(xScale).ticks(6));
        gDeriv.append('g').attr('class', 'axis-y');

        gPlot.append('text').attr('class', 'fn-title').attr('x', width / 2).attr('y', -10)
            .style('text-anchor', 'middle').style('font-weight', 'bold').style('font-size', '13px');
        gDeriv.append('text').attr('class', 'fn-title').attr('x', width / 2).attr('y', -10)
            .style('text-anchor', 'middle').style('font-weight', 'bold').style('font-size', '13px');

        path = gPlot.append('path').attr('fill', 'none').attr('stroke', '#10099F').attr('stroke-width', 2.5);
        pathDeriv = gDeriv.append('path').attr('fill', 'none').attr('stroke', '#FC8484').attr('stroke-width', 2.5);

        circle = gPlot.append('circle').attr('r', 5.5).attr('fill', '#2DD2C0').attr('stroke', 'white').attr('stroke-width', 1.5);
        circleDeriv = gDeriv.append('circle').attr('r', 5.5).attr('fill', '#2DD2C0').attr('stroke', 'white').attr('stroke-width', 1.5);

        // Function toggle buttons
        container.querySelectorAll('.fn-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.fn-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                current = btn.dataset.fn;
                render();
            });
        });

        const input = document.getElementById('act-input');
        input.addEventListener('input', updatePoint);

        built = true;
        render();
    }

    function render() {
        const cfg = ACTIVATIONS[current];
        yScale.domain(cfg.yDomain);
        yScaleDeriv.domain(cfg.derivDomain);

        const width = xScale.range()[1];
        const height = yScale.range()[0];

        gPlot.select('.axis-x').transition().duration(300)
            .attr('transform', `translate(0,${yScale(0)})`).call(d3.axisBottom(xScale).ticks(6));
        gPlot.select('.axis-y').transition().duration(300).call(d3.axisLeft(yScale).ticks(5));

        gDeriv.select('.axis-x').transition().duration(300)
            .attr('transform', `translate(0,${cfg.derivStep ? yScaleDeriv(0) : height})`).call(d3.axisBottom(xScale).ticks(6));
        gDeriv.select('.axis-y').transition().duration(300).call(d3.axisLeft(yScaleDeriv).ticks(5));

        gPlot.select('.fn-title').text(cfg.label);
        gDeriv.select('.fn-title').html(cfg.derivLabel);

        const data = d3.range(-5, 5.01, 0.1).map(x => ({ x, y: cfg.fn(x) }));
        const derivData = d3.range(-5, 5.01, 0.1).map(x => ({ x, y: cfg.deriv(x) }));

        const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y));
        const lineDeriv = d3.line().x(d => xScale(d.x)).y(d => yScaleDeriv(d.y))
            .curve(cfg.derivStep ? d3.curveStepAfter : d3.curveLinear);

        path.datum(data).transition().duration(400).attr('d', line);
        pathDeriv.datum(derivData).transition().duration(400).attr('d', lineDeriv);

        document.getElementById('act-properties').innerHTML = cfg.props;

        updatePoint();
    }

    function updatePoint() {
        const cfg = ACTIVATIONS[current];
        const input = document.getElementById('act-input');
        const valueDisplay = document.getElementById('act-value');
        const x = parseFloat(input.value);
        const y = cfg.fn(x);
        const dy = cfg.deriv(x);

        circle.attr('cx', xScale(x)).attr('cy', yScale(y));
        circleDeriv.attr('cx', xScale(x)).attr('cy', yScaleDeriv(dy));
        valueDisplay.textContent = `f(${x.toFixed(1)}) = ${y.toFixed(3)},  f'(${x.toFixed(1)}) = ${dy.toFixed(3)}`;
    }

})();
