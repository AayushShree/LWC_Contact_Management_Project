public with sharing class ContactProjectHelper {
    @AuraEnabled(cacheable = True)
    public static List<Contact> getContacts(String searchKeyword){
        if(String.isNotBlank(searchKeyword)){
                String key = '%' + searchKeyword + '%';
                return [SELECT Id, Name, Email, Phone, AccountId, Account.Name FROM Contact WHERE AccountId != NULL AND Name LIKE :key LIMIT 10];
        }
                return [SELECT Id, Name, Email, Phone, AccountId, Account.Name FROM Contact WHERE AccountId != NULL LIMIT 10];
        
        // try {
        //     Schema schema = Schema.get('Contact');
        //     QueryLocator queryLocator = schema.getQueryLocator('SELECT Id, Name, Email FROM Contact LIMIT 10');
        //     List<Contact> contacts = queryLocator.execute();
        //     return contacts;  // Return the list of contacts
            
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }
    }
    // public ContactProjectHelper() {
    // }
    @AuraEnabled
    public static void deleteContact(String recordId){
        Contact c = [SELECT Id FROM Contact Where Id = :recordId];
        DELETE c;
    }

    @AuraEnabled
    public static void deleteBulkContact(List<Id> conIds){
        try {
            List<Contact> deleteConLst = [SELECT Id FROM Contact WHERE Id IN :conIds];
            Delete deleteConLst;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}