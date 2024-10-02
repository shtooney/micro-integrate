import { LightningElement, wire, api, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

const FIELDS = [
    'Account.Address_Street__c',
    'Account.Address_City__c',
    'Account.Address_State__c'
];

export default class Embed extends LightningElement {
    @api recordId;
    @track iframeSrc; // Track this to trigger reactivity in the template

    // Wire service to get the Account data
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            const street = data.fields.Address_Street__c.value || '';
            const city = data.fields.Address_City__c.value || '';
            const state = data.fields.Address_State__c.value || '';
            
            // Replace spaces with "+" only in the street address
            const streetFormatted = street.replace(/ /g, '+');
            
            // Construct the Google Maps iframe URL with only street having "+" signs
            this.iframeSrc = `https://maps.google.com/maps?q=${streetFormatted},${city},${state}&output=embed`;
        } else if (error) {
            console.error('Error fetching account data:', error);
            this.iframeSrc = ''; // Clear iframeSrc in case of error
        }
    }
}
