/**
 * Interactive visuals for "AI in the analytics workplace".
 *
 * Two demos:
 *   1. initializeLoopDemo()  - the business's two loops, and what happens to each
 *                              one when AI is poured into the middle.
 *   2. initializeSwarmDemo() - an org-shaped swarm of agents, scaled from a
 *                              handful up to the 37,075 of the Virtual Biotech.
 *
 * Both are idempotent: calling them again clears and rebuilds their container.
 */

(function () {
  'use strict';

  const UI = {
    primary: '#10099F',
    teal: '#2DD2C0',
    coral: '#FC8484',
    orange: '#FFA05F',
    yellow: '#FAC55B',
    dark: '#262626',
    gray: '#EEEEEE',
    muted: '#666666'
  };

  /* =============================================================
     1. The two loops
     ============================================================= */

  function initializeLoopDemo() {
    const host = document.getElementById('loop-demo-stage');
    if (!host || typeof d3 === 'undefined') return;

    host.innerHTML = '';

    const W = 940;
    const H = 310;

    const svg = d3.select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width', '100%')
      .attr('role', 'img')
      .attr('aria-label',
        'Two feedback loops sharing one company. The left loop serves paying ' +
        'users, the right loop takes offers to market and learns from feedback.');

    const yMid = 150;
    const nodes = {
      user: { x: 120, y: yMid, label: 'User' },
      company: { x: 470, y: yMid, label: "Company's software" },
      market: { x: 820, y: yMid, label: 'Market' }
    };

    // Arc helper: a lens-shaped curve between two x positions.
    const arc = (x1, x2, lift) =>
      `M ${x1} ${yMid} Q ${(x1 + x2) / 2} ${yMid - lift} ${x2} ${yMid}`;

    const paths = [
      // Loop 2 - the service loop (left lens)
      { id: 'service', d: arc(nodes.user.x + 30, nodes.company.x - 60, 105), loop: 2, label: 'service', labelX: 265, labelY: 66, color: '#1a9e5f' },
      { id: 'payment', d: arc(nodes.company.x - 60, nodes.user.x + 30, -105), loop: 2, label: 'payment', labelX: 265, labelY: 252, color: '#c2185b' },
      // Loop 1 - the discovery loop (right lens)
      { id: 'offer', d: arc(nodes.company.x + 90, nodes.market.x - 30, 105), loop: 1, label: 'offer', labelX: 655, labelY: 66, color: '#1a9e5f' },
      { id: 'feedback', d: arc(nodes.market.x - 30, nodes.company.x + 90, -105), loop: 1, label: 'feedback', labelX: 655, labelY: 252, color: '#c2185b' }
    ];

    const pathLayer = svg.append('g');
    const pathSel = {};

    paths.forEach(p => {
      pathSel[p.id] = pathLayer.append('path')
        .attr('d', p.d)
        .attr('fill', 'none')
        .attr('stroke', p.loop === 1 ? UI.coral : UI.primary)
        .attr('stroke-width', 2)
        .attr('opacity', 0.55);

      svg.append('text')
        .attr('x', p.labelX)
        .attr('y', p.labelY)
        .attr('text-anchor', 'middle')
        .attr('font-size', 17)
        .attr('fill', p.color)
        .text(p.label);
    });

    // Loop captions
    svg.append('text')
      .attr('x', 265).attr('y', 158)
      .attr('text-anchor', 'middle')
      .attr('font-size', 15).attr('font-weight', 'bold')
      .attr('fill', UI.primary)
      .text('LOOP 2 · stability');

    svg.append('text')
      .attr('x', 655).attr('y', 158)
      .attr('text-anchor', 'middle')
      .attr('font-size', 15).attr('font-weight', 'bold')
      .attr('fill', UI.coral)
      .text('LOOP 1 · speed');

    // Nodes
    const nodeLayer = svg.append('g');
    Object.entries(nodes).forEach(([key, n]) => {
      const g = nodeLayer.append('g')
        .attr('transform', `translate(${n.x}, ${n.y})`)
        .attr('class', `loop-node loop-node-${key}`);

      g.append('rect')
        .attr('x', key === 'company' ? -105 : -55)
        .attr('y', -22)
        .attr('width', key === 'company' ? 210 : 110)
        .attr('height', 44)
        .attr('rx', 8)
        .attr('fill', '#FFFFFF')
        .attr('stroke', key === 'company' ? UI.primary : UI.dark)
        .attr('stroke-width', key === 'company' ? 3 : 1.5);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 6)
        .attr('font-size', key === 'company' ? 17 : 18)
        .attr('fill', UI.dark)
        .text(n.label);
    });

    const companyNode = nodeLayer.select('.loop-node-company');

    // The AI firehose pointing at the company
    const aiArrow = svg.append('g').attr('opacity', 0);
    aiArrow.append('line')
      .attr('x1', 470).attr('y1', 34)
      .attr('x2', 470).attr('y2', 118)
      .attr('stroke', '#E53935').attr('stroke-width', 5)
      .attr('marker-end', 'url(#ai-arrowhead)');
    aiArrow.append('text')
      .attr('x', 470).attr('y', 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', 19).attr('font-weight', 'bold')
      .attr('fill', '#E53935')
      .text('AI');

    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'ai-arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8).attr('refY', 5)
      .attr('markerWidth', 5).attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#E53935');

    // Particle layer
    const particleLayer = svg.append('g');

    // Cracks that appear on the service loop as it destabilises
    const crackLayer = svg.append('g');
    const crackSpots = [
      { x: 200, y: 96 }, { x: 330, y: 86 }, { x: 250, y: 224 },
      { x: 360, y: 214 }, { x: 160, y: 178 }
    ];
    const cracks = crackLayer.selectAll('text')
      .data(crackSpots)
      .join('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', 'middle')
      .attr('font-size', 22)
      .attr('opacity', 0)
      .text('⚡');

    // Particles: each carries a path id and a position along it in [0, 1).
    const particles = [];
    const baseCounts = { service: 4, payment: 4, offer: 4, feedback: 4 };
    paths.forEach(p => {
      const node = pathSel[p.id].node();
      const len = node.getTotalLength();
      for (let i = 0; i < baseCounts[p.id]; i++) {
        particles.push({
          pathId: p.id,
          loop: p.loop,
          len: len,
          t: i / baseCounts[p.id],
          el: null
        });
      }
    });

    const circles = particleLayer.selectAll('circle')
      .data(particles)
      .join('circle')
      .attr('r', 6)
      .attr('fill', d => (d.loop === 1 ? UI.coral : UI.primary))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5);

    circles.each(function (d) { d.el = this; });

    // ---- state + controls -------------------------------------------------
    let aiLevel = 0;          // 0 .. 10
    let running = true;
    let rafId = null;
    let last = null;

    const slider = document.getElementById('loop-ai-slider');
    const readoutSpeed = document.getElementById('loop-readout-speed');
    const readoutStability = document.getElementById('loop-readout-stability');
    const toggleBtn = document.getElementById('loop-toggle');

    function stabilityFor(level) {
      // Stability falls off as the first loop is pushed harder.
      return Math.max(12, Math.round(100 - level * 8.5));
    }

    function render() {
      const speedMult = 1 + aiLevel * 0.55;
      const stability = stabilityFor(aiLevel);

      if (readoutSpeed) readoutSpeed.textContent = speedMult.toFixed(1) + '×';
      if (readoutStability) {
        readoutStability.textContent = stability + '%';
        readoutStability.style.color =
          stability > 70 ? UI.primary : stability > 40 ? '#c97016' : '#c74a4a';
      }

      aiArrow.attr('opacity', aiLevel === 0 ? 0 : Math.min(1, 0.25 + aiLevel / 10));

      // Loop 1 arcs thicken; loop 2 arcs thin out and fade.
      paths.forEach(p => {
        if (p.loop === 1) {
          pathSel[p.id]
            .attr('stroke-width', 2 + aiLevel * 0.6)
            .attr('opacity', 0.55 + aiLevel * 0.035);
        } else {
          pathSel[p.id]
            .attr('stroke-width', Math.max(0.8, 2 - aiLevel * 0.1))
            .attr('opacity', Math.max(0.18, 0.55 - aiLevel * 0.03))
            .attr('stroke-dasharray', aiLevel > 4 ? `${14 - aiLevel} 6` : null);
        }
      });

      const visibleCracks = Math.floor(aiLevel / 2);
      cracks.attr('opacity', (d, i) => (i < visibleCracks ? 0.9 : 0))
        .attr('fill', '#E53935');

      companyNode.select('rect')
        .attr('stroke', aiLevel > 6 ? '#E53935' : UI.primary);
    }

    function tick(now) {
      if (last === null) last = now;
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      const loop1Speed = 90 * (1 + aiLevel * 0.55);
      const loop2Speed = 90 * Math.max(0.25, 1 - aiLevel * 0.06);

      particles.forEach(p => {
        const speed = p.loop === 1 ? loop1Speed : loop2Speed;
        p.t = (p.t + (speed * dt) / p.len) % 1;
        const pt = pathSel[p.pathId].node().getPointAtLength(p.t * p.len);
        // Loop 2 particles jitter once the ground under them moves.
        const jitter = p.loop === 2 ? aiLevel * 0.4 : 0;
        p.el.setAttribute('cx', pt.x + (Math.random() - 0.5) * jitter);
        p.el.setAttribute('cy', pt.y + (Math.random() - 0.5) * jitter);
      });

      if (running) rafId = requestAnimationFrame(tick);
    }

    if (slider) {
      slider.value = 0;
      slider.oninput = () => {
        aiLevel = +slider.value;
        render();
      };
    }

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        running = !running;
        toggleBtn.textContent = running ? 'Pause' : 'Play';
        if (running) {
          last = null;
          rafId = requestAnimationFrame(tick);
        } else if (rafId) {
          cancelAnimationFrame(rafId);
        }
      };
      toggleBtn.textContent = 'Pause';
    }

    render();
    rafId = requestAnimationFrame(tick);
    window.loopDemoInitialized = true;
  }

  /* =============================================================
     2. The agent swarm, shaped like an org chart
     ============================================================= */

  function initializeSwarmDemo() {
    const host = document.getElementById('swarm-demo-stage');
    if (!host || typeof d3 === 'undefined') return;

    host.innerHTML = '';

    const W = 940;
    const H = 340;
    const MAX_DOTS = 1800;   // we draw at most this many, then say so honestly

    const svg = d3.select(host)
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width', '100%')
      .attr('role', 'img')
      .attr('aria-label',
        'A chief scientific officer agent delegating to four division agents, ' +
        'which in turn command a large field of worker agents.');

    const divisions = [
      { name: 'Target discovery', color: UI.primary },
      { name: 'Molecule design', color: UI.teal },
      { name: 'Safety assessment', color: UI.orange },
      { name: 'Clinical trials', color: UI.coral }
    ];

    const ceo = { x: W / 2, y: 34 };
    const divY = 112;
    const divXs = divisions.map((d, i) => 130 + i * ((W - 260) / (divisions.length - 1)));

    const edgeLayer = svg.append('g');
    const dotLayer = svg.append('g');
    const nodeLayer = svg.append('g');
    const pulseLayer = svg.append('g');

    // Edges from the CSO down to each division
    const edges = divisions.map((d, i) =>
      edgeLayer.append('path')
        .attr('d', `M ${ceo.x} ${ceo.y + 22} C ${ceo.x} ${divY - 30}, ${divXs[i]} ${ceo.y + 40}, ${divXs[i]} ${divY - 20}`)
        .attr('fill', 'none')
        .attr('stroke', d.color)
        .attr('stroke-width', 2)
        .attr('opacity', 0.5)
    );

    // Worker-agent dot field, one band per division
    const bandTop = 168;
    const bandHeight = H - bandTop - 30;
    const bandWidth = (W - 120) / divisions.length;

    function layoutDots(totalAgents) {
      const drawn = Math.min(totalAgents, MAX_DOTS);
      const perBand = Math.ceil(drawn / divisions.length);
      const dots = [];

      divisions.forEach((div, di) => {
        const x0 = 60 + di * bandWidth;
        const cols = Math.max(1, Math.ceil(Math.sqrt(perBand * (bandWidth - 24) / bandHeight)));
        const rows = Math.max(1, Math.ceil(perBand / cols));
        const dx = (bandWidth - 24) / cols;
        const dy = bandHeight / rows;
        const r = Math.max(1.2, Math.min(5, Math.min(dx, dy) * 0.32));

        for (let k = 0; k < perBand && dots.length < drawn; k++) {
          const c = k % cols;
          const rw = Math.floor(k / cols);
          dots.push({
            x: x0 + 12 + dx * (c + 0.5),
            y: bandTop + dy * (rw + 0.5),
            r: r,
            color: div.color,
            division: di
          });
        }
      });

      return dots;
    }

    // Division + CSO boxes
    nodeLayer.append('rect')
      .attr('x', ceo.x - 130).attr('y', ceo.y - 22)
      .attr('width', 260).attr('height', 44).attr('rx', 8)
      .attr('fill', '#FFFFFF').attr('stroke', UI.dark).attr('stroke-width', 3);
    nodeLayer.append('text')
      .attr('x', ceo.x).attr('y', ceo.y + 6)
      .attr('text-anchor', 'middle').attr('font-size', 17).attr('font-weight', 'bold')
      .attr('fill', UI.dark)
      .text('Chief scientific officer agent');

    divisions.forEach((d, i) => {
      nodeLayer.append('rect')
        .attr('x', divXs[i] - 92).attr('y', divY - 20)
        .attr('width', 184).attr('height', 40).attr('rx', 7)
        .attr('fill', '#FFFFFF').attr('stroke', d.color).attr('stroke-width', 2.5);
      nodeLayer.append('text')
        .attr('x', divXs[i]).attr('y', divY + 5)
        .attr('text-anchor', 'middle').attr('font-size', 14)
        .attr('fill', UI.dark)
        .text(d.name);
    });

    const countLabel = svg.append('text')
      .attr('x', W / 2).attr('y', H - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13)
      .attr('fill', UI.muted);

    // ---- state + controls -------------------------------------------------
    // Log scale so the slider can travel from 8 agents to 37,075.
    const scale = d3.scaleLog().domain([1, 100]).range([8, 37075]);
    let agents = 8;
    let running = true;
    let pulseTimer = null;

    const slider = document.getElementById('swarm-slider');
    const readout = document.getElementById('swarm-readout');
    const toggleBtn = document.getElementById('swarm-toggle');

    function redraw() {
      const dots = layoutDots(agents);

      dotLayer.selectAll('circle')
        .data(dots)
        .join(
          enter => enter.append('circle')
            .attr('cx', d => d.x).attr('cy', d => d.y)
            .attr('r', 0).attr('fill', d => d.color).attr('opacity', 0.75)
            .call(e => e.transition().duration(350).attr('r', d => d.r)),
          update => update
            .attr('fill', d => d.color)
            .call(u => u.transition().duration(350)
              .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r)),
          exit => exit.call(e => e.transition().duration(200).attr('r', 0).remove())
        );

      if (readout) readout.textContent = d3.format(',')(agents);
      countLabel.text(dots.length < agents
        ? `showing ${d3.format(',')(dots.length)} of ${d3.format(',')(agents)} agents`
        : `${d3.format(',')(agents)} agents`);

      edges.forEach(e => e.attr('stroke-width', 2 + Math.log10(agents) * 0.8));
    }

    // A finding travelling from a worker up through its division to the CSO.
    function sendPulse() {
      if (!running) return;
      const di = Math.floor(Math.random() * divisions.length);
      const div = divisions[di];
      const startX = 60 + di * bandWidth + 12 + Math.random() * (bandWidth - 24);
      const startY = bandTop + Math.random() * bandHeight;

      const dot = pulseLayer.append('circle')
        .attr('cx', startX).attr('cy', startY)
        .attr('r', 5).attr('fill', div.color)
        .attr('stroke', '#FFFFFF').attr('stroke-width', 1.5);

      dot.transition().duration(700).ease(d3.easeCubicInOut)
        .attr('cx', divXs[di]).attr('cy', divY + 22)
        .transition().duration(700).ease(d3.easeCubicInOut)
        .attr('cx', ceo.x).attr('cy', ceo.y + 24)
        .transition().duration(220)
        .attr('r', 14).attr('opacity', 0)
        .remove();
    }

    if (slider) {
      slider.value = 1;
      slider.oninput = () => {
        agents = Math.round(scale(Math.max(1, +slider.value)));
        redraw();
      };
    }

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        running = !running;
        toggleBtn.textContent = running ? 'Pause' : 'Play';
      };
      toggleBtn.textContent = 'Pause';
    }

    redraw();
    if (pulseTimer) clearInterval(pulseTimer);
    pulseTimer = setInterval(() => {
      // More agents, more chatter flowing upward.
      const bursts = Math.min(5, 1 + Math.floor(Math.log10(agents)));
      for (let i = 0; i < bursts; i++) setTimeout(sendPulse, i * 110);
    }, 900);

    window.swarmDemoInitialized = true;
  }

  window.initializeLoopDemo = initializeLoopDemo;
  window.initializeSwarmDemo = initializeSwarmDemo;
})();
