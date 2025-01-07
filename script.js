document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const canvas = document.getElementById('chartCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const kSlider = document.getElementById("k-slider");
        const kValue = document.getElementById("k-value");
        const reactantInput = document.getElementById("reactant-input");
        const productInput = document.getElementById("product-input");

        console.log('Initializing chart...');

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Reactants', 'Products'],
                datasets: [{
                    label: 'Concentration (M)',
                    data: [1, 0],
                    backgroundColor: ['blue', 'green']
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

        function calculateConcentrations(K, initialReactants, initialProducts) {
            console.log(`Calculating concentrations with K=${K}, Reactants=${initialReactants}, Products=${initialProducts}`);
            const a = 1;
            const b = K;
            const c = -K * initialReactants;
            const discriminant = b * b - 4 * a * c;

            if (discriminant < 0) {
                console.warn('No real solution for equilibrium concentrations. Returning initial values.');
                return { reactant: initialReactants, product: initialProducts };
            }

            const equilibriumX = (-b + Math.sqrt(discriminant)) / (2 * a);
            return {
                reactant: initialReactants - equilibriumX,
                product: initialProducts + equilibriumX
            };
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

        window.resetChart = function () {
            kSlider.value = 1;
            reactantInput.value = 1;
            productInput.value = 0;
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

        reactantInput.addEventListener("input", updateChart);
        productInput.addEventListener("input", updateChart);

        updateChart(); // Initialize the chart with default values
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

    window.calculateHomogeneousEquilibrium = function () {
        const reaction = document.getElementById("reaction-homogeneous").value;
        const k = parseFloat(document.getElementById("k-homogeneous").value);
        const concentrations = document.getElementById("concentration-homogeneous").value.split(',').map(Number);
        const equilibriumReactants = concentrations[0] / (1 + k);
        const equilibriumProducts = concentrations[1] / (1 + (1 / k));

        const result = `Equilibrium concentrations for ${reaction} with K=${k}: Reactants = ${equilibriumReactants.toFixed(2)}, Products = ${equilibriumProducts.toFixed(2)}`;
        document.getElementById("result-homogeneous").textContent = result;
    };

    window.calculateHeterogeneousEquilibrium = function () {
        const reaction = document.getElementById("reaction-heterogeneous").value;
        const k = parseFloat(document.getElementById("k-heterogeneous").value);
        const concentrations = document.getElementById("concentration-heterogeneous").value.split(',').map(Number);
        const equilibriumReactants = concentrations[0] * k;
        const equilibriumProducts = concentrations[1] * k;

        const result = `Equilibrium concentrations for ${reaction} with K=${k}: Reactants = ${equilibriumReactants.toFixed(2)}, Products = ${equilibriumProducts.toFixed(2)}`;
        document.getElementById("result-heterogeneous").textContent = result;
    };

    window.calculateEquilibriumConstant = function () {
        // Get the reactants and products data from inputs
        const reactants = document.getElementById("reactants").value.split(",").map(item => item.trim());
        const reactantsCoeff = document.getElementById("reactants-coeff").value.split(",").map(Number);
        const reactantsConc = document.getElementById("reactants-conc").value.split(",").map(Number);
        const products = document.getElementById("products").value.split(",").map(item => item.trim());
        const productsCoeff = document.getElementById("products-coeff").value.split(",").map(Number);
        const productsConc = document.getElementById("products-conc").value.split(",").map(Number);

        // Calculate the equilibrium constant K
        let productQuotient = 1;
        let reactantQuotient = 1;

        // Product Quotient: [Products]^coefficients
        products.forEach((product, index) => {
            productQuotient *= Math.pow(productsConc[index], productsCoeff[index]);
        });

        // Reactant Quotient: [Reactants]^coefficients
        reactants.forEach((reactant, index) => {
            reactantQuotient *= Math.pow(reactantsConc[index], reactantsCoeff[index]);
        });

        const equilibriumConstant = productQuotient / reactantQuotient;
        document.getElementById("result-custom").textContent = `Equilibrium Constant (K) = ${equilibriumConstant.toFixed(4)}`;
    }
});
