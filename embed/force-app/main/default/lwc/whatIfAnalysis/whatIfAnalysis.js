// whatIfAnalysis.js
import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import calculateProjection from '@salesforce/apex/WhatIfAnalysisController.calculateProjection';
import chartjs from '@salesforce/resourceUrl/chartJS';

export default class WhatIfAnalysis extends LightningElement {
    @track initialInvestment = 10000;
    @track monthlyContribution = 500;
    @track yearsToRetirement = 30;
    @track expectedReturnRate = 7;
    @track finalValue;
    @track chartData;
    chart;
    chartJsInitialized = false;

    connectedCallback() {
        this.calculateProjection();
    }

    handleInputChange(event) {
        this[event.target.name] = parseFloat(event.target.value);
        this.calculateProjection();
    }

    calculateProjection() {
        calculateProjection({ 
            initialInvestment: this.initialInvestment,
            monthlyContribution: this.monthlyContribution,
            yearsToRetirement: this.yearsToRetirement,
            expectedReturnRate: this.expectedReturnRate
        })
        .then(result => {
            this.finalValue = result.finalValue;
            this.chartData = {
                labels: Array.from({length: this.yearsToRetirement}, (_, i) => i + 1),
                datasets: [{
                    label: 'Projected Value',
                    data: result.yearlyProjections,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            };
            if (this.chartJsInitialized) {
                this.updateChart();
            } else {
                this.initializeChartJs();
            }
        })
        .catch(error => {
            console.error('Error calculating projection:', JSON.parse(JSON.stringify(error)));
        });
    }

    renderedCallback() {
        if (this.chartJsInitialized) {
            return;
        }
        this.initializeChartJs();
    }

    initializeChartJs() {
        Promise.all([
            loadScript(this, chartjs)
        ]).then(() => {
            this.chartJsInitialized = true;
            this.updateChart();
        }).catch(error => {
            console.error('Error loading ChartJS', error);
        });
    }

    updateChart() {
        const canvas = this.template.querySelector('canvas');
        if (canvas && this.chartData) {
            if (this.chart) {
                this.chart.destroy();
            }
            const ctx = canvas.getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: this.chartData,
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
}