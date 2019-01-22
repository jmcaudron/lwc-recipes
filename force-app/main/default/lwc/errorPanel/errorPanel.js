import { LightningElement, api, track } from 'lwc';

export default class ErrorPanel extends LightningElement {
    /** Generic / user-friendly message */
    @api friendlyMessage = 'Error retrieving data';

    @track viewDetails = false;

    @track _errors;

    @api
    get errors() {
        return this._errors;
    }
    /** Single or array of LDS errors */
    set errors(value) {
        this._errors = reduceLdsErrors(value);
    }

    handleCheckboxChange(event) {
        this.viewDetails = event.target.checked;
    }
}

/**
 * Reduces one or more LDS errors into a string[] of error messages.
 * @param {ErrorResponse|ErrorResponse[]} errors
 * @return {String[]} Error messages
 */
function reduceLdsErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter(error => !!error)
            // Extract an error message
            .map(error => {
                // UI API error
                if (Array.isArray(error.body)) {
                    return error.body.map(e => e.message);
                }
                // Apex and network error
                else if (error.body && typeof error.body.message === 'string') {
                    return [error.body.message];
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return [error.message];
                }
                // Unknown error shape so try HTTP status text
                return [error.statusText];
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter(message => !!message)
    );
}
