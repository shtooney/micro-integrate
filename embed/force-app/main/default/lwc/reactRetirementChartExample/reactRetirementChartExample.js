import { LightningElement } from 'lwc';
import reactComponentExample from '@salesforce/resourceUrl/ReactComponentExample';
import { loadScript } from 'lightning/platformResourceLoader';

export default class ReactRetirementChartExample extends LightningElement {
    bundle_loaded = false;

    renderedCallback() {
        if (this.bundle_loaded) {
            return;
        }
        this.initReactComponent();
    }

    async initReactComponent() {
        const rootElement = this.template.querySelector(".react-app");
        try{
            await Promise.all([
                loadScript(this, reactComponentExample)
            ]);
            this.bundle_loaded = true;
            // eslint-disable-next-line no-debugger
           
            window.mountComponent(rootElement, { title: 'React Component Example' });
        } catch(error){
            console.error('Error loading bundle.js', JSON.stringify(error));
        }
    }
}