sap.ui.define([   
], function () {
    "use strict";
    return {
        
        /**
         * Rounds the currency value to 2 digits
         *
         * @public
         * @param {string} sValue value to be formatted
         * @returns {string} formatted currency value with 2 digits
         */
        currencyValue : function (sValue) {
            if (!sValue) {
                return "";
            }

            return parseFloat(sValue).toFixed(2);
        },
        numberFormat : function (numberFormat, sValue, sEnabled) {
              if (!sValue) {
                return "";
            }else if  ( !sEnabled && numberFormat !== undefined && numberFormat !== "" && typeof numberFormat === 'object') {          
                return numberFormat.format(sValue);
            }else{   
                return sValue;
            }
        },  
        dateformat : function (dateFormat, sValue) {
            if (!sValue) {
                 return "";
             }else if  ( dateFormat !== undefined && dateFormat !== "" && typeof dateFormat === 'object') {          
                return dateFormat.format(sValue, true);
             }else{                                
                return sValue;
             }
         },              
        Amount: function(numberFormat, sAmount, workingDay){
            if (!sAmount) {
                return "";
            }            
            if (workingDay==="X") {   
                if (numberFormat !== undefined && numberFormat !== "" && typeof numberFormat === 'object') {          
                    return numberFormat.format(sAmount);
                }else{
                    return "";  
                }
            }else{
                return "";  
            }
        },
        Status: function(sStatus, workingDay){
            if (workingDay==="X") {             
                return sStatus;
            }else{
                return "Public Holiday";  
            }
        },
        Enabled: function(sStatus, sRole){
            if (sRole==="03" ) {             
                return false;
            }else{               
                return sStatus;  
            }
        },
        RemitEnabled :function(sRemitEnabled, sEnabled){
            if (sEnabled && sRemitEnabled ==='X') {             
                return true;
            }else{               
                return false;  
            }
        },       
        State: function(code){
        //var             
        /*    if (code==="05") {             
                return "Error";
            }else if (code==="06") { 
                return "Warning";
            }else if(code==="04" || code==="07"||code==="99") {//== 04, 07 OR 99. 
                return "Success";
            }else{
                return "None";
            }*/
        }        
    };
});