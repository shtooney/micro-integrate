import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';

export default class AccountDataTableFetcher extends LightningElement {
    @track accounts;
    @track error;

    columns = [
        { label: 'Account Name', fieldName: 'Name', type: 'text' },
        { label: 'Description', fieldName: 'Description', type: 'text' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
    ];

    fetchAccounts() {
        getAccounts()
            .then(result => {
                // Only keep the first 10 accounts
                this.accounts = result.slice(0, 10);
                this.error = undefined;
            })
            .catch(error => {
                this.error = 'Error fetching accounts: ' + error.body.message;
                this.accounts = undefined;
            });
    }
}
