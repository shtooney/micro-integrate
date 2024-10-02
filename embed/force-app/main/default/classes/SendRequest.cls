public class SendRequest {
    
    @future(callout=true) 
    public static void go(String givenStreet, String givenCity, String givenState, String givenCountry, String givenZip, String givenID) {
        
        JSONGenerator gen = JSON.createGenerator(true);
        gen.writeStartObject();
        gen.writeStringField('Street', givenStreet);
        gen.writeStringField('City', givenCity);
        gen.writeStringField('State', givenState);
        String jsonBody = gen.getAsString();
        
        HttpRequest req = new HttpRequest();
        Http http = new Http();        
        req.setEndpoint('https://postman-echo.com/post');
        req.setMethod('POST');
        
        req.setBody(jsonBody);
        HttpResponse res = http.send(req);
        //System.debug('Response: ' + res.getBody());
        
        Map<String, Object> jsonResponse = (Map<String, Object>)JSON.deserializeUntyped(res.getbody());
        Object o = jsonResponse.get('form');
        
        Map<String, Object> outputData = (Map<String, Object>)jsonResponse.get('form');
        
        //Parse results
        String info = outputData.keySet().toString();
        String info2 = info.substring(1, info.length() - 1);
        
        //Now it's a JSON we can work with - pick values of choice
        Map<String, Object> jsonMap = (Map<String, Object>)JSON.deserializeUntyped(info2);
        String myStreet = (String)jsonMap.get('Street');
        String myCity = (String)jsonMap.get('City');
        String myState = (String)jsonMap.get('State');
        
        String newAddress = myStreet + ' ' + myCity;        
        
        Long milliSeconds = 5000;
        Long timeDiff = 0;
        
        // This let's time (specified above) pass before proceeding to do a chained job
        DateTime firstTime = System.now();
        do{
            timeDiff = System.now().getTime() - firstTime.getTime();
        }
        while(timeDiff <= milliSeconds);

		List<Account> a = [SELECT Id, Address_Street__c, Address_City__c, Address_State__c FROM Account WHERE Id = :givenID];
		a[0].Address_Street__c = myStreet;
		a[0].Address_City__c = myCity;
		a[0].Address_State__c = myState;
		update a;        
        
        
        Messaging.CustomNotification notification = new Messaging.CustomNotification();
        
        // Set the notification properties
        notification.setNotificationTypeId('Hello_World_Notification'); // Use the API name of your notification type
        notification.setTitle('Address Change Validated!');
        notification.setBody('Address is now ' + newAddress + '. Backend ID is ' + SendRequest.generateRandomString());
        notification.setTargetId('005Hr00000EVUUmIAP'); // ID of the user to send the notification to
        
        // Send the notification
        notification.setNotificationTypeId('0MLHr0000000Fs5OAE');
        notification.setTargetId(givenID); // target object id
        notification.send(new Set<String> { '005Hr00000EVUUmIAP' });
        
    }
    
    public static String generateRandomString() {
        String letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Possible letters
        String numbers = '0123456789'; // Possible numbers
        
        // Generate two random letters
        String randomLetters = '';
        for (Integer i = 0; i < 2; i++) {
            Integer randomIndex = Math.mod(Math.abs(Crypto.getRandomInteger()), letters.length());
            randomLetters += letters.substring(randomIndex, randomIndex + 1);
        }
        
        // Generate three random numbers
        String randomNumbers = '';
        for (Integer j = 0; j < 6; j++) {
            Integer randomIndex = Math.mod(Math.abs(Crypto.getRandomInteger()), numbers.length());
            randomNumbers += numbers.substring(randomIndex, randomIndex + 1);
        }
        
        // Combine letters and numbers and return the result
        return randomLetters + randomNumbers;
    }
}