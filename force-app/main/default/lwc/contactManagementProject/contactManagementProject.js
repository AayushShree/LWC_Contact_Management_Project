import { LightningElement, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactProjectHelper.getContacts';
import deleteContact from '@salesforce/apex/ContactProjectHelper.deleteContact';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class ContactManagementProject extends LightningElement {

    contacts;
    wiredContactResult;
    error;
    IsModalOpen = false;
    IdToEditRecord;
    columns = [
        { label: 'Id', fieldName: 'Id', type: 'text' },
        { label: 'Name', fieldName: 'Name', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' },
        { label: 'Account Name', fieldName: 'AccountUrl', type: 'url',
            typeAttributes : {label : {fieldName : 'AccountName'}, target : '_blank'}
         },
        { label: 'Account Id', fieldName: 'AccountId', type: 'text' },
        { type : 'action', typeAttributes : {rowActions : this.getRowActions}},
        // {
        //     type: "button", label: 'Edit', initialWidth: 100, typeAttributes: {
        //         label: 'Edit',
        //         name: 'Edit',
        //         title: 'Edit',
        //         disabled: false,
        //         value: 'edit',
        //         iconPosition: 'left',
        //         iconName:'utility:edit',
        //         variant:'Brand'
        //     }
        // }
    ]

    @wire(getContacts)
    getwiredContacts(result){
        this.wiredContactResult = result;
        const{data, error} = result;
        if(data){
            this.contacts = data.map(contact => {
                let flatcontact = {...contact};
                flatcontact.AccountName = contact.Account.Name;
                flatcontact.AccountUrl = `/lightning/r/Account/${contact.AccountId}/view`;
                return flatcontact;
            });
            console.log('data: ', this.contacts);
            this.error = undefined;
        } else if(error){
            this.contacts = undefined;
            this.error = error;
        }
    }

    getRowActions(row, doneCallback){
        const actions = [
            { label: 'Edit', name: 'edit' },
            { label: 'Delete', name: 'delete' }
        ];
        doneCallback(actions);
    }

    handleRowAction(event){
        const action = event.detail.action;
        const rowId = event.detail.row.Id;
        switch(action.name){
            case 'edit':
                this.IsModalOpen = true;
                this.IdToEditRecord = rowId;
                break;
            case 'delete':
                this.deleteRecord(rowId);
                break;
            default:
                break;
        }
    }

    deleteRecord(recordId){
        deleteContact({recordId : recordId}).then(()=>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record deleted successfully',
                    variant:'success'
                })
            );
            this.refreshData();
        }
        )
        .catch(error=>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                })
            )
        })
        
    }

    successHandler(event){
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Contact Updated Successfully',
                variant: 'success'
            })
        );
        this.IsModalOpen = false;
        this.IdToEditRecord = undefined;
        //refreshApex(this.wiredContactResult);
        this.refreshData();
    }
    refreshData(){
        return this.wiredContactResult ? refreshApex(this.wiredContactResult) : undefined;
    }
    
    closeModal(){
        this.IsModalOpen = false;
        this.IdToEditRecord = undefined;
    }

}