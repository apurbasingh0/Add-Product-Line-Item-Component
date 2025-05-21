"# Add-Product-Line-Item-Component" 
# Quote Line Item Management

This repository contains a Salesforce Apex controller and Lightning Web Component (LWC) for managing **Quote Line Items** and associated **Product Line Items** in Salesforce. It allows users to view quote line items, search available product line items, select products, specify pricing and quantity, and save them as quote product line items.

---

## Features

- Fetch Quote Line Item details by record Id.
- Search Product Line Items excluding those already associated with the Quote Line Item.
- Add selected Product Line Items to a Quote Line Item with custom price, quantity, and size.
- Real-time UI validation for quantity and sales price.
- Toast notifications for success/error feedback.
- Support for multiple currencies, including INR.

---

## Apex Controller: `QuoteLineItemController`

### Methods

- `getQuoteLineItemRecords(String recordId)`:  
  Retrieves details of a Quote Line Item by Id.

- `getProductLineItemDetails(String recordId, String searchKey)`:  
  Returns Product Line Items filtered by a search key and excluding those already linked to the given Quote Line Item.

- `createQuoteProductLineItem(List<AM360__Quote_Product_Line_Item__c> quoteProductList, String recordId)`:  
  Inserts new Quote Product Line Item records associating selected products to the specified Quote Line Item.

---

## Lightning Web Component: `addProductLineItem`

### Functionality

- Loads Quote Line Item currency and product line items on component initialization.
- Provides a search input to filter available product line items dynamically.
- Allows selecting multiple products and specifying size, quantity, and sales price.
- Validates user inputs before saving.
- Shows success/error toast messages.
- Supports pagination with Next and Back buttons.
- Allows deleting selected products before saving.

---



