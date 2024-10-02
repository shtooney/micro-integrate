import { LightningElement } from 'lwc';
import chartjs from '@salesforce/resourceUrl/chartJS';
import { loadScript } from 'lightning/platformResourceLoader';
import "./customElement";


export default class RetiremenetChartExample extends LightningElement {

    chartJsInitialized = false;

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
            this.template.querySelector("what-if-analysis").calculateProjection();
        }).catch(error => {
            console.error('Error loading ChartJS', JSON.stringify(error));
        });
    }

}