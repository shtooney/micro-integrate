public without sharing class AccountController {
    @AuraEnabled
    public static List<Account> getAccounts() {
        return [SELECT Id, Name, Description, Phone FROM Account LIMIT 10]; // Fetching required fields
    }
}
