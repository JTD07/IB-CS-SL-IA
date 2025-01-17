document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const canvas = document.getElementById('chartCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const kSlider = document.getElementById("k-slider");
        const kValue = document.getElementById("k-value");
        const reactantInputA = document.getElementById("reactant-a-input");
        const reactantInputB = document.getElementById("reactant-b-input");
        const productInputC = document.getElementById("product-c-input");
        const productInputD = document.getElementById("product-d-input");

        console.log('Initializing chart...');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['A', 'B', 'C', 'D'],
                datasets: [{
                    label: 'Concentration (M)',
                    data: [1, 1, 0, 0],  // Initial concentrations of A, B, C, D
                    backgroundColor: ['blue', 'orange', 'green', 'red']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        function calculateConcentrations(K, initialA, initialB, initialC, initialD) {
            const a = 1, b = 1, c = 1, d = 1; // Stoichiometric coefficients
            const A = initialA, B = initialB, C = initialC, D = initialD;
           
            //case when K=1
            if (K === 1) {
                const total1 = K*A*B-C*D;
                const total2 = (K*A+K*B+C+D)
                const x = total1 / total2;
                return {
                    Aeq: A - x,
                    Beq: B - x,
                    Ceq: C + x,
                    Deq: D + x
                };
            }
            // Coefficients for the quadratic equation
            const coeffA = K * a * b - c * d;
            const coeffB = -(K * (A * b + B * a)) - (C * d + D * c);
            const coeffC = K * A * B - C * D;
       
            // Solve the quadratic equation: Ax^2 + Bx + C = 0
            const discriminant = Math.pow(coeffB, 2) - 4 * coeffA * coeffC;
            console.log(discriminant);
            if (discriminant < 0) {
                console.error("No real solution exists for the given inputs.");
                return null; // No valid equilibrium concentrations
            }
       
            const sqrtDiscriminant = Math.sqrt(discriminant);
            const x1 = (-coeffB + sqrtDiscriminant) / (2 * coeffA);
            const x2 = (-coeffB - sqrtDiscriminant) / (2 * coeffA);
       
            // Choose the valid root (x must be non-negative and <= min(A/a, B/b))
            const validX = [x1, x2].find(x => x >= 0 && x <= Math.min(A / a, B / b));
       
            if (validX === undefined) {
                console.error("No valid solution for x within the constraints.");
                return null;
            }
       
            // Calculate equilibrium concentrations
            return {
                Aeq: A - a * validX,
                Beq: B - b * validX,
                Ceq: C + c * validX,
                Deq: D + d * validX
            };
        }
       
        function getValidInputValue(elementId) {
            const value = parseFloat(document.getElementById(elementId).value);
            return isNaN(value) ? 0 : value;  // If NaN, return a default value (like 0)
        }
        function updateChart() {
            const k = parseFloat(kSlider.value);
            const initialA = getValidInputValue("reactant-a-input");
            const initialB = getValidInputValue("reactant-b-input");
            const initialC = getValidInputValue("product-c-input");
            const initialD = getValidInputValue("product-d-input");
           
            kValue.textContent = k.toFixed(2);

            // Get equilibrium concentrations
            const concentrations = calculateConcentrations(k, initialA, initialB, initialC, initialD);
           
            chart.data.labels = ['A', 'B', 'C', 'D'];
            chart.data.datasets[0].data = [concentrations.Aeq, concentrations.Beq, concentrations.Ceq, concentrations.Deq];
            chart.update();  // Redraw the chart with updated values
        }

        window.resetChart = function () {
            kSlider.value = 1;
            document.getElementById("reactant-a-input").value = 1;
            document.getElementById("reactant-b-input").value = 1;
            document.getElementById("product-c-input").value = 0;
            document.getElementById("product-d-input").value = 0;
            updateChart();
        };

        window.downloadChart = function () {
            const link = document.createElement('a');
            link.href = chart.toBase64Image();
            link.download = 'equilibrium_chart.png';
            link.click();
        };

        kSlider.addEventListener("input", () => {
            updateChart();
            kValue.textContent = kSlider.value;
        });

        reactantInputA.addEventListener("input", updateChart);
        reactantInputB.addEventListener("input", updateChart);
        productInputC.addEventListener("input", updateChart);
        productInputD.addEventListener("input", updateChart);

        updateChart(); //Initialize the chart with default values
    } else {
        console.warn('Canvas element not found. Chart initialization skipped.');
    }

    window.applyLeChateliersPrinciple = function () {
        const condition = document.getElementById("change-condition").value;
        const output = document.getElementById("lechateliers-output");
        console.log(`Applying Le Chatelier's Principle for condition: ${condition}`);

        switch (condition) {
            case "add-reactant":
                output.textContent = "Adding reactant shifts equilibrium to the products.";
                break;
            case "remove-reactant":
                output.textContent = "Removing reactant shifts equilibrium to the reactants.";
                break;
            case "add-product":
                output.textContent = "Adding product shifts equilibrium to the reactants.";
                break;
            case "remove-product":
                output.textContent = "Removing product shifts equilibrium to the products.";
                break;
            case "increase-pressure":
                output.textContent = "Increasing pressure favors the side with fewer moles of gas.";
                break;
            case "decrease-pressure":
                output.textContent = "Decreasing pressure favors the side with more moles of gas.";
                break;
            case "increase-temperature":
                output.textContent = "Increasing temperature shifts equilibrium depending on the reaction's enthalpy.";
                break;
            case "decrease-temperature":
                output.textContent = "Decreasing temperature shifts equilibrium depending on the reaction's enthalpy.";
                break;
            default:
                output.textContent = "No change applied.";
        }
        console.log('Le Chatelier output:', output.textContent);
    };

    
    window.calculateEquilibriumConstant = function() {
        let reactantA = parseFloat(document.getElementById('reactant-a').value);
        let coefficientA = parseFloat(document.getElementById('coefficient-a').value);
        let reactantB = parseFloat(document.getElementById('reactant-b').value);
        let coefficientB = parseFloat(document.getElementById('coefficient-b').value);
        let reactantC = parseFloat(document.getElementById('reactant-c').value);
        let coefficientC = parseFloat(document.getElementById('coefficient-c').value);
        let reactantD = parseFloat(document.getElementById('reactant-d').value);
        let coefficientD = parseFloat(document.getElementById('coefficient-d').value);
    
        // Calculate the reaction quotient Q
        let reactionQuotient = Math.pow(reactantC, coefficientC) * Math.pow(reactantD, coefficientD) /
                        (Math.pow(reactantA, coefficientA) * Math.pow(reactantB, coefficientB));
    
        document.getElementById('result').innerText = `Reaction Quotient (Q) is ${reactionQuotient.toFixed(2)}`;
    }
    
});