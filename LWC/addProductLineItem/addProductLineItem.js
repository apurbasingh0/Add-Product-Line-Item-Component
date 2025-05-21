import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProductLineItemDetails from '@salesforce/apex/QuoteLineItemController.getProductLineItemDetails';
import createQuoteProductLineItem from '@salesforce/apex/QuoteLineItemController.createQuoteProductLineItem';
import getQuoteLineItemRecords from '@salesforce/apex/QuoteLineItemController.getQuoteLineItemRecords';
import { RefreshEvent } from 'lightning/refresh';


export default class AddProductLineItem extends LightningElement {
    @api recordId;
    @track productLineItems;
    nextPage=false;
    choosePriceBook=false;
    productList=[];
    @track selectedProduct=[];
    disabledButton=true;
    //noAccPro=false;
    recordNumber;
    currencyCode;
    @track currencyINR=true;
    load=false;
    


    getAllProductLineItemDetails(){
        console.log("recid::",this.recordId);
        getProductLineItemDetails({recordId:this.recordId, searchkey:''})
        .then(result=>{
            if(result){
            console.log('result:::'+JSON.stringify(result));
            this.productList=result;
            }
            this.checkList();
            })
        .catch(error=>{
            console.log('error::'+JSON.stringify(error));
            this.showToastMessage('Error',error.message,'error');
        })
    }


    handleSearch(event){
        var searchKeyword = event.target.value;
        console.log("inside handle Search",searchKeyword);
        console.log("inside recordId Search",this.recordId);
        getProductLineItemDetails({recordId:this.recordId, searchkey:searchKeyword})
        .then(result=>{
            console.log('result:::'+JSON.stringify(result));
            this.productList=result.filter(item=>{
                if(this.checkProductSelected(item.Id)){
                    console.log('in');
                    item.check=true;
                    }else{
                    item.check=false;
                    }
                    item.name='/'+item.Id;
                    return item;
                });
                this.checkList();
            })
        .catch(error=>{
            console.log('error::'+JSON.stringify(error));
            this.showToastMessage('Error',error.message,'error');
        })
    }

    checkProductSelected(Id){
        for(let i=0;i<this.selectedProduct.length;i++){
            if(this.selectedProduct[i].Id==Id){
                return true;
            }
        }
        return false;
    }

    connectedCallback(){
        this.getQuoteLineItemInfo(); 
    }

    getQuoteLineItemInfo(){
        this.load=true;
        this.choosePriceBook=false;
        getQuoteLineItemRecords({recordId:this.recordId})
        .then(result=>{
            console.log('result:::'+JSON.stringify(result));
            if(result != null){
                console.log('CurrencyIsoCode:::',result[0].CurrencyIsoCode);

                this.currencyCode=result[0].CurrencyIsoCode;
                if(result[0].CurrencyIsoCode=='INR'){
                    this.currencyINR=true;
                }else{
                    this.currencyINR=false;
                }
                console.log('this.currencyINR:::',this.currencyINR);
                console.log('this.currencyCode:::',this.currencyCode);

            }
            this.load=false;
            this.getAllProductLineItemDetails(); 

        })
        .catch(error=>{
            console.log('error::'+JSON.stringify(error));
            this.showToastMessage('Error',error.message,'error');
            this.load=false;
        });
    }



    closeAction() {   
        const closeQA = new CustomEvent('close');
        // Dispatches the event.
        this.dispatchEvent(closeQA);
    }

   
    
    handleCancel(){

        
        this.closeAction();
        this.load = false;
    }

    handleProductSelect(event){
        var value=event.target.checked;
        var productId=event.target.name;
        this.productList.filter(el=>{
            if(el.Id==productId){
                el.check=value;
                this.disabledButton=false;
            }
            return el;
        });
        if(value){
            var temp=this.productList.filter(el => {
                if(el.Id==productId){
                    el.List_Price__c=el.Price__c;
                    el.Sales_Price__c=el.Price__c;
                    el.Size__c=el.Size__c;
                    el.Quantity__c=0;
                    el.Total_Price__c=0;
                    el.Quote_Line_Item__c = this.recordId;
                    el.Product_Line_Item__c = el.Id;
                    el.CurrencyIsoCode=this.currencyCode;
                    return el;
                }
            });

            for(let i=0;i<temp.length;i++){
                this.selectedProduct.push(temp[i]);
            }
        }else{
            //removing the unselected product from the list
            this.selectedProduct=this.selectedProduct.filter(el => {
                return el.Id!=productId;
            });
        }
        this.checkSelected();
        console.log('SelectedProduct:::'+JSON.stringify(this.selectedProduct));
    }
    

    handleFieldChange(event){
        var productId=event.currentTarget.dataset.id;
        console.log('productId:::'+productId);
        var value=event.target.value;
        console.log('value:::'+value);
        var fieldName=event.target.name;
        console.log('fieldName:::'+fieldName);
        switch(fieldName){
            case 'size':
                this.selectedProduct=this.selectedProduct.filter(el => {
                    if(el.Id==productId){
                        el.Size__c=value;
                    }
                    return el;
                });
                break;
            case 'quantity':
                this.selectedProduct=this.selectedProduct.filter(el => {
                    if(el.Id==productId){
                        el.Quantity__c=value;
                        el.Total_Price__c=el.Sales_Price__c*el.Quantity__c;
                    }
                    return el;
                });
                break;
            case 'SalesPrice':
                this.selectedProduct=this.selectedProduct.filter(el => {
                    if(el.Id==productId){
                        el.Sales_Price__c=value;
                        el.Total_Price__c=el.Sales_Price__c*el.Quantity__c;
                    }
                    return el;
                });
                break;
        }
    }

   

    //toast message function
    showToastMessage(title,message,variant){
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    //handle next button
    handleNext(){
        this.nextPage=true;
    }

    //handle back button
    handleBack(){
        this.nextPage=false;
    }   

    //handle save button
   handleSave(){
        this.disabledButton=true;
        var pass=false;
        this.selectedProduct.filter(el=>{
            if(el.Quantity__c <= 0){
                this.showToastMessage('Error','Enter Quantity.','error');
                pass=true;
                return;
            }
            if(el.Sales_Price__c<=0){
                this.showToastMessage('Error','Enter Sales Price.','error');
                pass=true;
                return;
            }
        });
        if(pass){
            this.disabledButton=false;
            return;
        }
        // console.log('productList::'+JSON.stringify(this.selectedProduct))
        createQuoteProductLineItem({quoteProductList:this.selectedProduct,recordId:this.recordId })
        .then(result=>{            
            console.log('result:::'+result);
            if(result==='error'){
                this.showToastMessage('Error','Error Saving products!!','error');
                this.disabledButton=false;
            }else{
                this.showToastMessage('Success','Quote Product Line Item Added succesfully.','success');
                this.handleCancel();
               
            }
            // if(result=='error'){
            //     this.showToastMessage('Error','Error Saving products!!','error');
               
            // }else{
            //     this.disabledButton=false;
            //     this.showToastMessage('Success','Quote Product Line Item Added succesfully.','success');
            //     this.handleCancel();
            //     window.location.reload();
              
            // }
        })
        .catch(error=>{
            console.log('Error::'+JSON.stringify(error));
            this.showToastMessage('Error',error.body.message,'error');
            this.disabledButton=false;
        });
    }
    


     //handle delete of selected list
     handleDelete(event){
        var name=event.target.name;
        this.selectedProduct=this.selectedProduct.filter(el => {
            return el.Id!=name;
        });
        this.productList=this.productList.filter(el => {
            if(el.Id==name){
                el.check=false;
            }
            return el;
        });
        this.checkSelected();
    }



    noProduct=true;
    renderedCallback(){
        if(this.productList==null){
            this.recordNumber=0;
        }else{
            this.recordNumber=this.productList.length;
        }
        this.checkList();
       // this.getAllQuoteLineItemdetails();
    }
    //refreshList = ()=> { this.isLoading = true; this.getQuoteInfo(); }
    

    checkList(){
        if(this.productList.length<=0){
            this.noProduct=true;
        }else{
            this.noProduct=false;
        }
    }



    //check the selected list to disable or show next button
    checkSelected(){
        if(this.selectedProduct.length==0){
            this.disabledButton=true;
        }else{
            this.disabledButton=false;
        }
    }
}