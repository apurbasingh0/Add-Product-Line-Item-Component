public with sharing class QuoteLineItemController {

    @AuraEnabled
    public static List<AM360__Quote_Line_Item__c> getQuoteLineItemRecords(String recordId) {

        List<AM360__Quote_Line_Item__c> quoteLineItem=[SELECT Id,Name, AM360__Quote__c, CurrencyIsoCode FROM AM360__Quote_Line_Item__c WHERE Id =: recordId];
        return quoteLineItem;

    }

   
    @AuraEnabled
    public static List<AM360__Product_Line_Item__c> getProductLineItemDetails(String recordId, String searchkey) {
        // Retrieve product line item record
        String search='%'+searchkey+'%';

        set<Id> productLineItemIds= new set<Id>();
        List<AM360__Quote_Product_Line_Item__c> quoteProductLineItem=[SELECT Id,Product_Line_Item__c,Quote_Line_Item__c FROM AM360__Quote_Product_Line_Item__c WHERE Quote_Line_Item__c =: recordId];
        for(AM360__Quote_Product_Line_Item__c quoteProduct:quoteProductLineItem){
            productLineItemIds.add(quoteProduct.Product_Line_Item__c);
        }

        List<AM360__Product_Line_Item__c> productLineItems = [SELECT Id, Name, Price__c, Size__c, CurrencyIsoCode FROM AM360__Product_Line_Item__c WHERE Name LIKE :search AND Id Not In: productLineItemIds];
        return productLineItems;

    }


    
    @AuraEnabled
    public static String createQuoteProductLineItem(List<AM360__Quote_Product_Line_Item__c> quoteProductList,String recordId){
        System.debug('quoteProductList'+quoteProductList);
        try{
           
            List<AM360__Quote_Product_Line_Item__c> newRecList=new List <AM360__Quote_Product_Line_Item__c>();
            for(AM360__Quote_Product_Line_Item__c ac : quoteProductList){
                System.debug('ac'+ ac);
                AM360__Quote_Product_Line_Item__c newRec=new AM360__Quote_Product_Line_Item__c();
                newRec.Product_Line_Item__c = ac.Product_Line_Item__c;
                newRec.Quote_Line_Item__c=recordId;
                newRec.List_Price__c = ac.List_Price__c;
                newRec.Quantity__c = ac.Quantity__c;
                newRec.Sales_Price__c = ac.Sales_Price__c;
                newRec.Size__c = ac.Size__c;
                newRec.CurrencyIsoCode = ac.CurrencyIsoCode;
                System.debug('Record:::'+ newRec);
                newRecList.add(newRec);
            }
            insert newRecList;
            return 'success';
        }catch(Exception e){
            System.debug('Error:::'+ e.getLineNumber());
            System.debug('Error creating Quote Product Line Item: ' + e.getMessage());
            throw new AuraHandledException( e.getMessage());
        }
    }


}