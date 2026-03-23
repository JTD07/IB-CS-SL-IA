document.addEventListener('DOMContentLoaded', () => {
    const tempSlider = document.getElementById('temp-slider');
    const pressureSlider = document.getElementById('pressure-slider');
    const removeNh3Select = document.getElementById('remove-nh3');
    
    const tempVal = document.getElementById('temp-val');
    const pressureVal = document.getElementById('pressure-val');
    const resultText = document.getElementById('result-text');
    
    const ctx = document.getElementById('yieldChart').getContext('2d');
    
    let chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['NH₃ Yield (%)', 'Unreacted N₂ & H₂ (%)'],
            datasets: [{
                data: [15, 85],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)', // accent-success
                    'rgba(59, 130, 246, 0.3)'  // accent-blue semi-transparent
                ],
                borderColor: [
                    '#10b981',
                    '#3b82f6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc' }
                }
            }
        }
    });

    function calculateYield() {
        const temp = parseFloat(tempSlider.value);
        const pressure = parseFloat(pressureSlider.value);
        const continuousRemoval = removeNh3Select.value === 'on';
        
        tempVal.textContent = temp;
        pressureVal.textContent = pressure;

        // Haber process is exothermic: N2 + 3H2 <-> 2NH3 + Heat
        // Higher temp -> lower yield equilibrium
        // Higher pressure -> higher yield equilibrium (4 moles gas -> 2 moles gas)
        
        // Base theoretical yield mapped abstractly for visualization:
        // Ideal conditions: Low temp, High pressure
        
        let equilibriumYield = (pressure / 1000) * 100; // max 100% at infinite pressure theoretically
        equilibriumYield -= ((temp - 100) / 700) * 80; // temp penalty
        
        // Kinetics constraint: below 350C, reaction is too slow to achieve equilibrium practically without extreme time
        if (temp < 350) {
            equilibriumYield *= (temp / 350); // drop off sharply
        }
        
        if (continuousRemoval) {
            // Le Chatelier's principle: removing product drives reaction forward
            equilibriumYield += 30;
        }

        // Clamp values
        equilibriumYield = Math.max(0.1, Math.min(99.9, equilibriumYield));
        
        // Update Chart
        chart.data.datasets[0].data = [equilibriumYield, 100 - equilibriumYield];
        chart.update();
        
        // Update Text
        let speedText = temp < 350 ? "Reaction is very slow." : temp > 600 ? "Reaction is fast but equilibrium yield is low." : "Good balance of rate and yield.";
        resultText.textContent = `Current Yield: ${equilibriumYield.toFixed(1)}%. ${speedText}`;
    }

    tempSlider.addEventListener('input', calculateYield);
    pressureSlider.addEventListener('input', calculateYield);
    removeNh3Select.addEventListener('change', calculateYield);

    // Initial calc
    calculateYield();
});
