document.addEventListener('DOMContentLoaded', () => {
    const tempSlider = document.getElementById('temp-slider');
    const catalystToggle = document.getElementById('catalyst-toggle');
    const tempVal = document.getElementById('temp-val');
    const analysisText = document.getElementById('analysis-text');

    const epCtx = document.getElementById('energyProfileChart').getContext('2d');
    const mbCtx = document.getElementById('maxwellChart').getContext('2d');

    // Chart configs
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
    };

    let epChart = new Chart(epCtx, {
        document: 'line',
        type: 'line',
        data: {
            labels: ['Reactants', 'Transition State', 'Products'],
            datasets: [{
                label: 'Energy',
                data: [50, 150, 20],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#ef4444'
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: { title: { display: true, text: 'Reaction Progress', color: '#94a3b8' } },
                y: { title: { display: true, text: 'Potential Energy (kJ)', color: '#94a3b8' }, min: 0, max: 200 }
            }
        }
    });

    // Maxwell-Boltzmann Array prep
    const mbLabels = Array.from({length: 100}, (_, i) => i * 4); // Kin. Energy
    let mbChart = new Chart(mbCtx, {
        type: 'line',
        data: {
            labels: mbLabels,
            datasets: [
                {
                    label: 'Fraction of Molecules',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0
                },
                {
                    label: 'Activation Energy Ea',
                    data: [],
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                x: { title: { display: true, text: 'Kinetic Energy (E)', color: '#94a3b8' }, max: 400 },
                y: { title: { display: true, text: 'Fraction of Molecules', color: '#94a3b8' }, min: 0 }
            }
        }
    });

    function maxwellBoltzmann(E, T) {
        // Abstract simplified MB distribution for visualization
        // f(E) ~ sqrt(E) * exp(-E / (k*T))
        const k = 1; // dummy constant
        const scale = 5000 / (T*Math.sqrt(T)); // visual scaling
        return scale * Math.sqrt(E) * Math.exp(-E / (k*(T/10)));
    }

    function updateCharts() {
        const T = parseFloat(tempSlider.value);
        const hasCatalyst = catalystToggle.checked;
        
        tempVal.textContent = T;

        // Energy Profile Update
        // Ea normal is 150. With catalyst it's 100.
        const peakEnergy = hasCatalyst ? 100 : 150;
        epChart.data.datasets[0].data = [50, peakEnergy, 20];
        epChart.data.datasets[0].borderColor = hasCatalyst ? '#10b981' : '#ef4444';
        epChart.data.datasets[0].pointBackgroundColor = hasCatalyst ? '#10b981' : '#ef4444';
        epChart.data.datasets[0].backgroundColor = hasCatalyst ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        epChart.update();

        // Maxwell Update
        const targetEa = peakEnergy; // corresponding Ea on x-axis (approx index/value)
        const mbData = mbLabels.map(E => maxwellBoltzmann(E, T));
        mbChart.data.datasets[0].data = mbData;
        
        // Vertical line for Ea
        const eaLine = mbLabels.map(E => E === targetEa ? 0.05 : null);
        mbChart.data.datasets[1].data = mbLabels.map(E => {
           if(Math.abs(E - targetEa) < 3) return mbData.reduce((a,b)=>Math.max(a,b)); // max Y
           return null;
        });
        
        // Let's create a solid vertical line for Ea by simply adding a manual line logic, or using a hacky dataset
        const maxValue = Math.max(...mbData) * 1.2;
        mbChart.options.scales.y.max = maxValue > 0 ? maxValue : 0.05;
        
        const eaData = mbLabels.map(E => {
            if (E >= targetEa - 2 && E <= targetEa + 2) return maxValue; // Draw a peak to act as a vertical line
            return null;
        });
        
        mbChart.data.datasets[1].data = eaData;
        
        // Calculate abstract integral past Ea to show reaction rate
        let sumPastEa = 0;
        let c = 0;
        mbLabels.forEach((E, i) => {
            if (E >= targetEa) {
                sumPastEa += mbData[i];
                c++;
            }
        });
        
        mbChart.update();

        // Analysis Text
        let factor = sumPastEa.toFixed(4);
        analysisText.textContent = `A higher temperature flattens the curve, and a catalyst lowers the activation energy (Ea) threshold. Notice the area representing molecules with enough energy to react: ${factor}.`;
    }

    tempSlider.addEventListener('input', updateCharts);
    catalystToggle.addEventListener('change', updateCharts);

    updateCharts();
});
