// Early Stopping Visualization
(function() {
    'use strict';

    if (typeof Reveal !== 'undefined') {
        Reveal.on('ready', initEarlyStoppingViz);
        Reveal.on('slidechanged', initEarlyStoppingViz);
    } else {
        document.addEventListener('DOMContentLoaded', initEarlyStoppingViz);
    }

    function initEarlyStoppingViz() {
        const container = document.getElementById('early-stopping-viz');
        if (!container) return;

        container.innerHTML = '';

        const margin = {top: 20, right: 110, bottom: 45, left: 55};
        const width = Math.max(200, container.clientWidth - margin.left - margin.right);
        const height = 320 - margin.top - margin.bottom;

        const svg = d3.select('#early-stopping-viz')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        const trainLine = d3.line()
            .x(d => xScale(d.epoch))
            .y(d => yScale(d.loss))
            .curve(d3.curveMonotoneX);

        const valLine = d3.line()
            .x(d => xScale(d.epoch))
            .y(d => yScale(d.loss))
            .curve(d3.curveMonotoneX);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(10))
            .append('text')
            .attr('x', width / 2)
            .attr('y', 36)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('Epoch');

        g.append('g')
            .call(d3.axisLeft(yScale))
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -38)
            .attr('x', -height / 2)
            .attr('fill', 'black')
            .style('text-anchor', 'middle')
            .text('Loss');

        const legend = svg.append('g')
            .attr('transform', `translate(${width + margin.left + 15}, ${margin.top + 15})`);

        legend.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 0).attr('y2', 0)
            .style('stroke', '#10099F').style('stroke-width', 2);
        legend.append('text').attr('x', 25).attr('y', 5).text('Training').style('font-size', '12px');

        legend.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 20).attr('y2', 20)
            .style('stroke', '#FC8484').style('stroke-width', 2);
        legend.append('text').attr('x', 25).attr('y', 25).text('Validation').style('font-size', '12px');

        const trainPath = g.append('path').style('stroke', '#10099F').style('stroke-width', 2).style('fill', 'none');
        const valPath = g.append('path').style('stroke', '#FC8484').style('stroke-width', 2).style('fill', 'none');

        const stopMarker = g.append('g').style('display', 'none');
        stopMarker.append('line').style('stroke', '#FFA05F').style('stroke-width', 2).style('stroke-dasharray', '5,5');
        stopMarker.append('text').attr('text-anchor', 'middle').attr('y', -5)
            .style('fill', '#FFA05F').style('font-weight', 'bold').text('Early Stop');

        const patienceSlider = document.getElementById('patience-slider');
        const patienceValue = document.getElementById('patience-value');
        const noiseSlider = document.getElementById('noise-slider');
        const noiseValue = document.getElementById('noise-value');
        const startButton = document.getElementById('start-training');
        const resetButton = document.getElementById('reset-training');
        const statusDiv = document.getElementById('training-status');

        let timeoutId = null;
        let currentEpoch = 0;
        let trainData = [];
        let valData = [];
        let bestValLoss = Infinity;
        let epochsSinceImprovement = 0;
        let stoppedEpoch = -1;

        function generateData(epoch, noiseLevel) {
            const baseTrainLoss = 0.8 * Math.exp(-epoch / 20) + 0.05;
            const trainNoise = (Math.random() - 0.5) * 0.02;

            const baseValLoss = 0.8 * Math.exp(-epoch / 15) + 0.15;
            const valNoise = (Math.random() - 0.5) * (0.02 + noiseLevel * 0.003);
            const overfittingTerm = noiseLevel > 0 ? Math.max(0, (epoch - 30) * 0.003 * noiseLevel / 20) : 0;

            return {
                epoch: epoch,
                trainLoss: Math.max(0.01, baseTrainLoss + trainNoise),
                valLoss: Math.max(0.01, baseValLoss + valNoise + overfittingTerm)
            };
        }

        function animate() {
            if (currentEpoch > 100 || stoppedEpoch > 0) {
                if (stoppedEpoch > 0) {
                    statusDiv.textContent = `Training stopped at epoch ${stoppedEpoch} (patience criterion met)`;
                    statusDiv.style.color = '#2DD2C0';
                } else {
                    statusDiv.textContent = 'Training completed (100 epochs)';
                    statusDiv.style.color = '#10099F';
                }
                return;
            }

            const noiseLevel = parseFloat(noiseSlider.value) / 100;
            const patience = parseInt(patienceSlider.value);

            const data = generateData(currentEpoch, noiseLevel);
            trainData.push({epoch: data.epoch, loss: data.trainLoss});
            valData.push({epoch: data.epoch, loss: data.valLoss});

            if (data.valLoss < bestValLoss - 0.001) {
                bestValLoss = data.valLoss;
                epochsSinceImprovement = 0;
            } else {
                epochsSinceImprovement++;
            }

            if (epochsSinceImprovement >= patience && stoppedEpoch < 0) {
                stoppedEpoch = currentEpoch;

                stopMarker.style('display', 'block');
                stopMarker.select('line')
                    .attr('x1', xScale(stoppedEpoch))
                    .attr('x2', xScale(stoppedEpoch))
                    .attr('y1', 0)
                    .attr('y2', height);
                stopMarker.select('text').attr('x', xScale(stoppedEpoch));
            }

            trainPath.datum(trainData).attr('d', trainLine);
            valPath.datum(valData).attr('d', valLine);

            statusDiv.textContent = `Epoch ${currentEpoch} | Train Loss: ${data.trainLoss.toFixed(4)} | Val Loss: ${data.valLoss.toFixed(4)} | Patience: ${epochsSinceImprovement}/${patience}`;
            statusDiv.style.color = '#262626';

            currentEpoch++;

            if (stoppedEpoch < 0) {
                timeoutId = setTimeout(animate, 100);
                if (window.activeAnimations) window.activeAnimations.intervals.push(timeoutId);
            } else {
                statusDiv.textContent = `Training stopped at epoch ${stoppedEpoch} (patience criterion met)`;
                statusDiv.style.color = '#2DD2C0';
            }
        }

        function reset() {
            if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
            currentEpoch = 0;
            trainData = [];
            valData = [];
            bestValLoss = Infinity;
            epochsSinceImprovement = 0;
            stoppedEpoch = -1;

            trainPath.datum([]).attr('d', null);
            valPath.datum([]).attr('d', null);
            stopMarker.style('display', 'none');
            statusDiv.textContent = 'Ready to start training';
            statusDiv.style.color = '#262626';
        }

        startButton.addEventListener('click', function() {
            if (timeoutId) clearTimeout(timeoutId);
            reset();
            animate();
        });

        resetButton.addEventListener('click', reset);

        patienceSlider.addEventListener('input', function() { patienceValue.textContent = this.value; });
        noiseSlider.addEventListener('input', function() { noiseValue.textContent = this.value + '%'; });

        reset();
    }
})();
