document.addEventListener('DOMContentLoaded', (event) => {
    const kSlider = document.getElementById('k-slider');
    const reactantInput = document.getElementById('reactant-input');
    const productInput = document.getElementById('product-input');
    const kValue = document.getElementById('k-value');

    const canvas = document.getElementById('chartCanvas');
    let chart;

    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Reactants', 'Products'],
                    datasets: [{
                        label: 'Concentration (M)',
                        data: [1, 0],  // Initial data
                        backgroundColor: ['blue', 'green']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            console.error('Failed to get 2D context.');
        }
    } else {
        console.error('Canvas element not found.');
    }

    function updateChart() {
        const k = parseFloat(kSlider.value);
        const initialReactants = parseFloat(reactantInput.value);
        const initialProducts = parseFloat(productInput.value);

        kValue.textContent = k.toFixed(2);

        const concentrations = calculateConcentrations(k, initialReactants, initialProducts);
        chart.data.datasets[0].data = [concentrations.reactant, concentrations.product];
        chart.update();
    }

    function calculateConcentrations(K, initialReactants, initialProducts) {
        const a = 1;
        const b = K;
        const c = -K * initialReactants;
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return { reactant: initialReactants, product: initialProducts };
        }

        const equilibriumX = (-b + Math.sqrt(discriminant)) / (2 * a);
        return {
            reactant: initialReactants - equilibriumX,
            product: initialProducts + equilibriumX
        };
    }

    function applyLeChateliersPrinciple() {
        const condition = document.getElementById("change-condition").value;
        const output = document.getElementById("lechateliers-output");
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
    }

    function downloadChart() {
        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = 'equilibrium_chart.png';
        link.click();
    }

    function calculateHomogeneousEquilibrium() {
        const reaction = document.getElementById("reaction-homogeneous").value;
        const k = parseFloat(document.getElementById("k-homogeneous").value);
        const concentrations = document.getElementById("concentration-homogeneous").value.split(',').map(Number);

        // Add logic to calculate equilibrium concentrations based on homogeneous equilibrium
        const result = `Equilibrium concentrations for ${reaction} with K=${k}: [${concentrations}]`;
        document.getElementById("result-homogeneous").textContent = result;
    }

    function calculateHeterogeneousEquilibrium() {
        const reaction = document.getElementById("reaction-heterogeneous").value;
        const k = parseFloat(document.getElementById("k-heterogeneous").value);
        const concentrations = document.getElementById("concentration-heterogeneous").value.split(',').map(Number);

        // Add logic to calculate equilibrium concentrations based on heterogeneous equilibrium
        const result = `Equilibrium concentrations for ${reaction} with K=${k}: [${concentrations}]`;
        document.getElementById("result-heterogeneous").textContent = result;
    }

    function calculateCustomReaction() {
        const reaction = document.getElementById("reaction-custom").value;
        const k = parseFloat(document.getElementById("k-custom").value);
        const concentrations = document.getElementById("concentration-custom").value.split(',').map(Number);

        // Add logic to calculate equilibrium concentrations based on custom input reaction
        const result = `Equilibrium concentrations for ${reaction} with K=${k}: [${concentrations}]`;
        document.getElementById("result-custom").textContent = result;
    }

    function resetSimulation() {
        kSlider.value = "1";
        reactantInput.value = "1";
        productInput.value = "0";
        kValue.textContent = "1.00";

        chart.data.datasets[0].data = [1, 0];
        chart.update();
    }

    kSlider.addEventListener("input", updateChart);
    reactantInput.addEventListener("input", updateChart);
    productInput.addEventListener("input", updateChart);

    updateChart(); // Initialize the chart with default values
});
