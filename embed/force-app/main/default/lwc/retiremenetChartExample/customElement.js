class CustomElement extends HTMLElement {

    chartJsInitialized = false

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.initialInvestment = 10000;
        this.monthlyContribution = 500;
        this.yearsToRetirement = 30;
        this.expectedReturnRate = 7;
        this.chart = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.calculateProjection();
    }


    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: Arial, sans-serif;
                    margin: 0 auto;
                }
                .input-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                }
                input {
                    width: calc(100% - 1rem);
                    padding: 5px;
                }
                #result {
                    margin-top: 20px;
                    font-weight: bold;
                }
            </style>
            <div>
                <div class="input-group">
                    <label for="initialInvestment">Initial Investment</label>
                    <input type="number" id="initialInvestment" value="${this.initialInvestment}">
                </div>
                <div class="input-group">
                    <label for="monthlyContribution">Monthly Contribution</label>
                    <input type="number" id="monthlyContribution" value="${this.monthlyContribution}">
                </div>
                <div class="input-group">
                    <label for="yearsToRetirement">Years to Retirement</label>
                    <input type="number" id="yearsToRetirement" value="${this.yearsToRetirement}">
                </div>
                <div class="input-group">
                    <label for="expectedReturnRate">Expected Annual Return Rate (%)</label>
                    <input type="number" id="expectedReturnRate" value="${this.expectedReturnRate}">
                </div>
                <div id="result"></div>
                <div class="chart-container" style="position: relative;">
                    <canvas class="projectionChart"></canvas>
                </div>
                
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => this.handleInputChange(input));
        });

        let resizeObserver = new ResizeObserver(entries => {
            this.chart.resize()
        });
        resizeObserver.observe(this.shadowRoot.host)
    }

    handleInputChange(input) {
        this[input.id] = parseFloat(input.value);
        this.calculateProjection();
    }

    calculate(initialInvestment, monthlyContribution, yearsToRetirement, expectedReturnRate) {
        let totalValue = initialInvestment;
        const yearlyProjections = [];
    
        for (let i = 1; i <= yearsToRetirement; i++) {
            totalValue = (totalValue + (monthlyContribution * 12)) * (1 + (expectedReturnRate / 100));
            yearlyProjections.push(Number(totalValue.toFixed(2)));
        }
    
        return yearlyProjections
    }

    calculateProjection() {
        let totalValue = this.initialInvestment;
        const yearlyProjections = this.calculate(this.initialInvestment,this.monthlyContribution,this.yearsToRetirement,this.expectedReturnRate);

        for (let i = 1; i <= this.yearsToRetirement; i++) {
            totalValue = (totalValue + (this.monthlyContribution * 12)) * (1 + (this.expectedReturnRate / 100));
            yearlyProjections.push(totalValue);
        }

        this.updateResult(totalValue);
        this.updateChart(yearlyProjections);
    }

    updateResult(finalValue) {
        const resultElement = this.shadowRoot.getElementById('result');
        resultElement.textContent = `Projected Value at Retirement: $${finalValue.toFixed(2)}`;
    }

    updateChart(yearlyProjections) {
        const ctx = this.shadowRoot.querySelector('.projectionChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: this.yearsToRetirement}, (_, i) => i + 1),
                datasets: [{
                    label: 'Projected Value',
                    data: yearlyProjections,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                onResize: chart => {chart.resize()},
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

customElements.define('what-if-analysis', CustomElement);