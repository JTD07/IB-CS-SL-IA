const canvas = document.getElementById("visualization");
const ctx = canvas.getContext("2d");
const chartCanvas = document.getElementById("chartCanvas");
const chartCtx = chartCanvas.getContext("2d");

const reactantASlider = document.getElementById("reactantA");
const reactantBSlider = document.getElementById("reactantB");
const productABSlider = document.getElementById("productAB");
const kcInput = document.getElementById("kc");
const reactionSpeedSlider = document.getElementById("reactionSpeed");
const startButton = document.getElementById("start-simulation");
const stopButton = document.getElementById("stop-simulation");
const resetButton = document.getElementById("reset-simulation");

const reactantAValue = document.getElementById("reactantA-value");
const reactantBValue = document.getElementById("reactantB-value");
const productABValue = document.getElementById("productAB-value");
const calculatedKc = document.getElementById("calculated-kc");

let particles = [];
const particleColors = { reactantA: "red", reactantB: "blue", productAB: "green" };
let equilibriumReached = false;
let equilibriumValue = null; // To store the equilibrium value
const dataPoints = [];
let animationFrameId = null;

function createParticles(count, type) {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
        newParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            type,
        });
    }
    return newParticles;
}

function updateParticles() {
    particles = [
        ...createParticles(parseInt(reactantASlider.value), "reactantA"),
        ...createParticles(parseInt(reactantBSlider.value), "reactantB"),
        ...createParticles(parseInt(productABSlider.value), "productAB"),
    ];
    updateEquilibriumDisplay();
    logEquilibrium(); // Update the chart in real-time
}

function moveParticles() {
    const speedFactor = parseInt(reactionSpeedSlider.value) / 5; // Adjust speed factor based on slider

    particles.forEach((particle) => {
        particle.x += particle.vx * speedFactor;
        particle.y += particle.vy * speedFactor;

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
    });
}

function handleCollisions() {
    const reactantAParticles = particles.filter(p => p.type === "reactantA");
    const reactantBParticles = particles.filter(p => p.type === "reactantB");
    const reactionSpeed = parseInt(reactionSpeedSlider.value);

    reactantAParticles.forEach((a) => {
        reactantBParticles.forEach((b) => {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 10 && !equilibriumReached && Math.random() < reactionSpeed / 10) { // Collision threshold and speed factor
                a.type = "merged";
                b.type = "merged";

                particles.push({
                    x: (a.x + b.x) / 2,
                    y: (a.y + b.y) / 2,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    type: "productAB",
                });

                logEquilibrium();
            }
        });
    });

    // Remove merged particles
    particles = particles.filter(p => p.type !== "merged");
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = particleColors[particle.type];
        ctx.fill();
    });
}

function calculateEquilibrium() {
    const reactantA = particles.filter(p => p.type === "reactantA").length;
    const reactantB = particles.filter(p => p.type === "reactantB").length;
    const productAB = particles.filter(p => p.type === "productAB").length;
    return (productAB ** 2) / (reactantA * reactantB);
}

function checkEquilibrium() {
    const kc = calculateEquilibrium();
    const targetKc = parseFloat(kcInput.value);

    if (Math.abs(kc - targetKc) < 0.1 && !equilibriumReached) {
        equilibriumReached = true;
        equilibriumValue = kc; // Save the equilibrium value
        document.body.style.backgroundColor = "lightgreen"; // Visual feedback
        alert('Equilibrium Reached!'); // Auditory feedback
    } else if (Math.abs(kc - targetKc) >= 0.1) {
        equilibriumReached = false;
        equilibriumValue = null;
        document.body.style.backgroundColor = ""; // Reset background color
    }
}

// Initialize Chart.js line chart
const chart = new Chart(chartCtx, {
    type: 'line',
    data: {
        labels: [], // Time labels will be added dynamically
        datasets: [
            {
                label: 'Reactant A',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                tension: 0.4, // Smooth curves
                fill: false,
            },
            {
                label: 'Reactant B',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.4, // Smooth curves
                fill: false,
            },
            {
                label: 'Product AB',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.4, // Smooth curves
                fill: false,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Disable animations for better performance
        plugins: {
            legend: {
                position: 'top', // Position legend above the chart
                labels: {
                    font: {
                        size: 14 // Larger font for better readability
                    }
                }
            },
            tooltip: {
                enabled: true,
                mode: 'nearest',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time',
                    font: {
                        size: 16 // Larger font for axis title
                    }
                },
                min: 0,
                max: 2000, // Extended x-axis range for longer transitions
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                suggestedMin: 0, // Ensure the Y-axis starts at 0 and does not adjust dynamically
                suggestedMax: 100, // Set an upper limit for the Y-axis
                title: {
                    display: true,
                    text: 'Concentration (M)',
                    font: {
                        size: 16 // Larger font for axis title
                    }
                },
                ticks: {
                    font: {
                        size: 12
                    }
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.3)', // Light gray grid lines
                }
            }
        }
    }
});

let time = 0; // Initial time

function updateChart() {
    const maxPoints = 200; // Maximum points to display

    const reactantA = particles.filter(p => p.type === "reactantA").length;
    const reactantB = particles.filter(p => p.type === "reactantB").length;
    const productAB = particles.filter(p => p.type === "productAB").length;

    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(reactantA);
    chart.data.datasets[1].data.push(reactantB);
    chart.data.datasets[2].data.push(productAB);

    if (chart.data.labels.length > maxPoints) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(dataset => dataset.data.shift());
    }

    chart.update();
    time++; // Increment time
}

function logEquilibrium() {
    const kc = calculateEquilibrium();
    dataPoints.push(kc);
    updateChart();
    updateEquilibriumDisplay();
}

function updateEquilibriumDisplay() {
    const reactantA = particles.filter(p => p.type === "reactantA").length;
    const reactantB = particles.filter(p => p.type === "reactantB").length;
    const productAB = particles.filter(p => p.type === "productAB").length;
    const kc = calculateEquilibrium();

    reactantAValue.textContent = reactantA;
    reactantBValue.textContent = reactantB;
    productABValue.textContent = productAB;
    calculatedKc.textContent = kc.toFixed(2);
}

function simulate() {
    moveParticles();
    handleCollisions();
    checkEquilibrium();
    drawParticles();
    logEquilibrium(); // Ensure chart updates with each frame
    animationFrameId = requestAnimationFrame(simulate);
}

function stopSimulation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function resetSimulation() {
    stopSimulation();
    particles = [];
    dataPoints.length = 0;
    equilibriumReached = false;
    equilibriumValue = null;
    updateParticles();
    drawChart();
    drawParticles();
    time = 0; // Reset time for the chart
    chart.data.labels = [];
    chart.data.datasets.forEach(dataset => dataset.data = []);
    chart.update();
}

reactantASlider.addEventListener("input", updateParticles);
reactantBSlider.addEventListener("input", updateParticles);
productABSlider.addEventListener("input", updateParticles);
kcInput.addEventListener("input", () => {
    const value = parseFloat(kcInput.value);
    if (isNaN(value) || value <= 0) {
        kcInput.setCustomValidity("Please enter a valid, positive number.");
        kcInput.reportValidity();
    } else {
        kcInput.setCustomValidity("");
        drawChart();
    }
});

reactionSpeedSlider.addEventListener("input", () => {
    const speedFactor = parseInt(reactionSpeedSlider.value);
    console.log(`Reaction Speed Factor: ${speedFactor}`);
});

startButton.addEventListener("click", () => {
    if (!animationFrameId) {
        simulate();
    }
});

stopButton.addEventListener("click", stopSimulation);
resetButton.addEventListener("click", resetSimulation);

// Initialize
updateParticles();
drawChart();
