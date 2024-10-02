global class InvocableKickoff {
    
    global class MyVars {
        @InvocableVariable(label='Street' required = true)
        public String myStreet;
        @InvocableVariable(label='City' required = true)
        public String myCity;
        @InvocableVariable(label='State')
        public String myState;
        @InvocableVariable(label='Country')
        public String myCountry;
        @InvocableVariable(label='Zip')
        public String myZip;
        @InvocableVariable(label='Context ID')
        public String myID;
    }
    
    @InvocableMethod(label='Address Change Request')
    global static void invokeService(List<MyVars> vars){       
        for(MyVars var : vars){        
            SendRequest.go(var.myStreet, var.myCity, var.myState, var.myCountry, var.myZip, var.myID);
        }
    }



}