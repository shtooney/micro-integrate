import { LightningElement, wire, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import D3 from '@salesforce/resourceUrl/d3v5';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Account.Year_1_Projection__c',
    'Account.Year_2_Projection__c',
    'Account.Year_3_Projection__c',
    'Account.Year_4_Projection__c',
    'Account.Year_5_Projection__c'
];

export default class HelloWorldD3 extends LightningElement {
    @api recordId;

    @track year1;
    @track year2;
    @track year3;
    @track year4;
    @track year5;

    @track fluctuatingData = []; // Initial empty array

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            this.year1 = data.fields.Year_1_Projection__c.value || 0;
            this.year2 = data.fields.Year_2_Projection__c.value || 0;
            this.year3 = data.fields.Year_3_Projection__c.value || 0;
            this.year4 = data.fields.Year_4_Projection__c.value || 0;
            this.year5 = data.fields.Year_5_Projection__c.value || 0;

            // Update fluctuatingData with tracked year values
            this.fluctuatingData = [
                this.year1,
                this.year2,
                this.year3,
                this.year4,
                this.year5
            ];
        } else if (error) {
            console.error('Error fetching account data:', error);
        }
    }
    
    @track error;
   // @track fluctuatingData = [100, 200, 300, 400, 500]; // Initial data for bars

    renderedCallback() {
        // Load D3.js library
        loadScript(this, D3)
            .then(() => {
                this.initializeD3();
            })
            .catch(error => {
                this.error = error;
                console.error("Error loading D3: ", this.error);
            });
    }

    initializeD3() {
        // Clear previous SVG elements before drawing new ones
        const svg = this.template.querySelector('svg');
        d3.select(svg).selectAll('*').remove(); // Clear the SVG

        const baseData = [...this.fluctuatingData]; // Base heights of the bars (in "money" hundreds)

        const margin = { top: 20, right: 30, bottom: 50, left: 40 },
            width = svg.clientWidth - margin.left - margin.right,
            height = svg.clientHeight - margin.top - margin.bottom;

        const xScale = d3.scaleBand()
            .domain(baseData.map((_, i) => `Year ${i + 1}`)) // Year labels
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(baseData) + 100]) // Set the domain based on base data
            .range([height, 0]);

        const g = d3.select(svg)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Create bars
        g.selectAll(".bar")
            .data(baseData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(`Year ${i + 1}`))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d))
            .on("click", (event, d, i) => {
                // Update fluctuating data randomly on bar click
                this.fluctuatingData[i] = Math.max(0, this.fluctuatingData[i] + (Math.random() * 200 - 100));
                updateLine(); // Update the line after changing data
            });

        // Create a line generator
        const lineGenerator = d3.line()
            .x((d, i) => xScale(`Year ${i + 1}`) + xScale.bandwidth() / 2) // Center line above bars
            .y(d => yScale(d) - 10) // Position slightly above the bar
            .curve(d3.curveBasis); // Create a curvy line

        // Add the initial line path
        const linePath = g.append("path")
            .datum(this.fluctuatingData) // Bind fluctuating data
            .attr("class", "line")
            .attr("d", lineGenerator);

        // Function to update the line with animation
        const updateLine = () => {
            // Randomly fluctuate all data points
            this.fluctuatingData = this.fluctuatingData.map(d => Math.max(0, d + (Math.random() * 200 - 100)));

            // Transition for smooth animation
            linePath.datum(this.fluctuatingData) // Update the data
                .transition()
                .duration(500) // Duration of the animation
                .attr("d", lineGenerator); // Update the line path
        };

        // Create X axis
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        // Create Y axis
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${Math.round(d)}`)); // Format y-axis with dollar sign
    }
}
