sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "../utils/Constants",      
    "sap/m/library",
    "sap/ui/Device", 
    "sap/m/MessageBox",
    "sap/m/MessageToast"  
], function (BaseController, JSONModel, formatter, Constants, mobileLibrary, Device, MessageBox, MessageToast) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return BaseController.extend("zurich.fscm.ui.cpcd.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy : false,
                approveVisible: false,
                saveVisible: false,
                sendApprovalVisible: false,
                delay : 0
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "detailView");
            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onSendEmailPress: function () {
            var oViewModel = this.getModel("detailView");

            URLHelper.triggerEmail(
                null,
                oViewModel.getProperty("/shareSendEmailSubject"),
                oViewModel.getProperty("/shareSendEmailMessage")
            );
        },

        onFullScreen:function(oEvent){
            this.getModel("appView").setProperty("/layout", "OneColumn");
        },

        onExitFullScreen:function(oEvent){
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
        },            
        onCancel:function(oEvent){
            this.getModel("appView").setProperty("/layout", "OneColumn")   
        },
        onComments: function(oEvent){
            var bReplace = !Device.system.phone;
             this.getModel("appView").setProperty("/layout", "ThreeColumnsMidExpanded");
           
            var that = this, id;  
            var row  = oEvent.getParameter("id").substring(oEvent.getParameter("id").lastIndexOf("-")+1);     
            id = this.getModel("detailView").getProperty("/items/"+ parseInt(row) +"/TranIdStr")     
            this.getModel("appView").setProperty("/selectedSweep", this.getModel("detailView").getProperty("/items/"+ parseInt(row)));        
            ///var selectedItem = this.getModel("detailView").getProperty("/item");                                  
            this.getModel("appView").setProperty("/selectedItem",  this.selectedItem);                                                 
            this.getRouter().navTo("comments", {
                objectId : that.sRepUnit, 
                account : encodeURIComponent(that.sAccount),                
                Id :id
            });            
        },
        
        onLiveChange: function(oEvent){
            var path = this.getView().byId("sweepTable").getSelectedContextPaths()[0];
            if (parseFloat(oEvent.getSource().getValue())<0){
                MessageBox.error(this.getResourceBundle().getText("negativeNumbers", [oEvent.getSource().getValue()]));
                var positive = -1*parseFloat(oEvent.getSource().getValue());
                oEvent.getSource().setValue(positive.toString());                                           
            }else if (isNaN(oEvent.getSource().getValue())){                 
                var items = this.getModel("detailView").getProperty("/items");
                var selectedRecord = this.getModel("detailView").getProperty(path)  ;
                oEvent.getSource().setValue(selectedRecord.Amount);                
            }else{    
                this.getModel("detailView").setProperty(path+"/Amount", oEvent.getSource().getValue())  ;
             }
        },
        onAmountChange: function(oEvent){
            var that = this;
            var id = oEvent.getSource();

              //  var userDefaults = this.getModel("appView").getProperty("/userFormat");          
             //   var val = userDefaults.DecimalFormat.format(oEvent.getSource().getValue()).toFixed(2);
                //oEvent.getSource().setValue(val);
               //var str = oEvent.getSource().getValue();                               
               // str =Number(str.slice(0, (str.indexOf(".")) + 2 + 1));
               // this.getModel("detailView").setProperty(path+"/Amount", str.toString())  ;
               // oEvent.getSource().setValue(str.toString()); 
                       
        },
        onSelect : function(oEvent){
            var items = this.getModel("detailView").getProperty("/items"), that = this;
            items.forEach(function(d) {
                d.Enabled = false;
            });
            if (JSON.stringify(items) !== JSON.stringify(this.copiedItems)){
                var copy = this.copiedItems;
                items.forEach(function(d, i) {
                    if ( parseFloat(d.Amount) != parseFloat(copy[i].Amount)){
                        MessageBox.confirm(that.getResourceBundle().getText("confirmSave", [d.Amount]), {
                            actions: [MessageBox.Action.YES,  MessageBox.Action.NO],
                            emphasizedAction: MessageBox.Action.YES,
                            onClose: function (sAction) {
                               if (sAction===MessageBox.Action.YES){   
                                    //pass selected reord                                                                                   
                                    var item =  items[i];    
                                    that.onSubmit(item,"02") ;                                                     
                               }else{
                                d.Amount = copy[i].Amount;
                                that.getModel("detailView").setProperty("/items", items);
                               } 
                            }
                        });  
                    }
                });
            }                    
                var path = this.getView().byId("sweepTable").getSelectedContextPaths()[0];
                var selectedRecord = this.getModel("detailView").getProperty(path)  ;
                var approveVisible, saveVisible, sendApprovalVisible;
                this.AvailBalance = selectedRecord.AvailBalance;
                this.Amount = selectedRecord.Amount;

                var row = path.substring(path.lastIndexOf("/")+1);//path.substring(path.length-1);
                
                items.forEach(function(d, i) {
                    d.Enabled = false;
                    if (parseInt(row) === i){
                        if (d.Role==="02" && !(d.Status==="08") && d.Closed!=="X"){ //99 No 4eye 01 Draft(F) 02 Pend Appr(F) 03 Approved(F)  04 Pre Appr  05 Draft(R)    06 Pend Appr(R) 07 Approved(R) 08 Released
                            d.Enabled = true;
                        }else if (d.Role==="03" || d.Closed==="X"){//Viewer-01, Initiator-02, Approver-03
                            d.Enabled = false;                            
                        }
                    }
                });

                if(selectedRecord.Role === "03" && (selectedRecord.Status ==="06" || selectedRecord.Status ==="02") && selectedRecord.Closed!=="X"){//
                    approveVisible=true;
                    saveVisible=false; 
                    sendApprovalVisible=false;
                }else if (selectedRecord.Role === "02" && !( selectedRecord.Status ==="08") && selectedRecord.Closed!=="X"){ 
                    approveVisible=false;                
                    saveVisible=true; 
                    if (selectedRecord.Status ==="01" || selectedRecord.Status ==="02" || selectedRecord.Status ==="05"|| selectedRecord.Status ==="06"){
                    sendApprovalVisible=true;
                    }else{
                    sendApprovalVisible=false;  
                    }
                }else{
                    approveVisible=false;
                    saveVisible=false; 
                    sendApprovalVisible=false;               
                }   
                this.getModel("detailView").setProperty("/approveVisible",approveVisible);
                this.getModel("detailView").setProperty("/saveVisible",saveVisible);  
                this.getModel("detailView").setProperty("/sendApprovalVisible",sendApprovalVisible);
                                                
        },

        onSubmitDialog: function(oEvent){
            var sDialogKey = "_dialog";
            if (!this[sDialogKey]) {
                this[sDialogKey] = sap.ui.xmlfragment(Constants.CreateRequest, this); 
            }
            this.getView().addDependent(this[sDialogKey]);
            jQuery.sap.syncStyleClass(this.getView(), this[sDialogKey]);
            //this[sDialogKey].open();   
            var that = this;
            var selection = this.getModel("detailView").getProperty(this.getView().byId("sweepTable").getSelectedContextPaths()[0])  ;                          
            var action = oEvent.getSource().getText();            
            if(action === "Reject"){
                this.getModel("detailView").setProperty( "/rejectionComments", "") 
                this[sDialogKey].open();                
  
            }else if(action === "Send for Approval"){
                // MessageBox.confirm("Are you sure you want to send for approval?") ;
                 MessageBox.confirm("Are you sure you want to send for approval?", {
                     actions: ["Send for Approval", MessageBox.Action.CANCEL],
                     emphasizedAction: "Send for Approval",
                     onClose: function (sAction) {
                        if (sAction==="Send for Approval"){                            
                            that.onSubmit(selection,"03") ; 
                        }
                     }
                 });  
            }else if(action === "Approve"){
                // MessageBox.confirm("Are you sure you want to send for approval?") ;
                 MessageBox.confirm("Are you sure you want to approve?", {
                     actions: ["Approve", MessageBox.Action.CANCEL],
                     emphasizedAction: "Approve",
                     onClose: function (sAction) {
                        if (sAction==="Approve"){                                                    
                         that.onSubmit(selection,"04") ;                          
                        }
                    }
                 });               
             
            }else {
               this.onSubmit(selection,"02") ;
            }                              
        },

        /**
        * Event Handler to close error message .
        */ 
        onClose: function(oEvent) {
            this["_dialog"].close();
        },         
        onChange: function(oEvent){
            var path = this.getView().byId("sweepTable").getSelectedContextPaths()[0];
            var index = oEvent.getSource().sId.substring(oEvent.getSource().sId.length-1);
            path = "/items/"+index;
            var selection = this.getModel("detailView").getProperty(path)  ;              
            var amount = oEvent.getParameter("value"); 
            var type = selection.Type; 
            var availBalance = this.AvailBalance;

            if (type ="02"){//Investment
                availBalance = parseFloat(availBalance) + parseFloat(amount);  
            }else{//Withdraw
                availBalance = parseFloat(availBalance) - parseFloat(amount);   
            }
            this.getModel("detailView").setProperty(path+"/AvailBalance",availBalance.toString());
        },
        onSearch: function (oEvent)        {
            var abc;
        },
        onSubmit:function (sSelection, sAction) {           
            var oPayload = {
                TranIdStr : sSelection.TranIdStr,
                Amount : sSelection.Amount,
                AvailBalance : sSelection.AvailBalance, 
                Action : sAction             
            };          
          
            var Scenario =  this.getModel("appView").getProperty("/scenario");
           // if ( parseFloat(selection.Amount) <= parseFloat(selection.MaxSweep)){
            if (Scenario ==="02"){
                oPayload.Type = sSelection.Type;
                oPayload.Remittance = sSelection.Remittance;
            }        
            //}else
            // if (Scenario ==="02" && parseFloat(sSelection.Amount) > parseFloat(sSelection.MaxSweep)){
            //    MessageBox.error("Transaction Amount: "+sSelection.Amount+" cannot be more than Available balance: "+ sSelection.MaxSweep );  
            //}else{   
                this._update(sSelection, oPayload);         
            //}
        },

        onReject:function (oEvent) {           
            var selection = this.getModel("detailView").getProperty(this.getView().byId("sweepTable").getSelectedContextPaths()[0])  ;  
            var rejectionComments = this.getModel("detailView").getProperty( "/rejectionComments") ;   
            var Scenario =  this.getModel("appView").getProperty("/scenario");                
            var oPayload = {
                TranIdStr : selection.TranIdStr,
                Amount : selection.Amount,
                Comment: rejectionComments,  
                AvailBalance : selection.AvailBalance,                             
                Action : "05"              
            }; 
            if (Scenario ==="02"){
                oPayload.Type = selection.Type;
                oPayload.Remittance = selection.Remittance;
            } 
            
            if (rejectionComments.length>0){
                this._update(selection, oPayload);     
            }else{
                MessageBox.error("Please enter reason for rejection" );                 
            }
                      
        },        
        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */

        _update: function(selection, oPayload){
            var that = this;
            this.getView().setBusy(true) ;          
            this.getOwnerComponent().getModel().update("/SWEP_WFSet('"+selection.TranIdStr+"')", oPayload, {
                success: function(oData, sResponse) {
                    that.getView().setBusy(false) ;  
                    if (sResponse.headers.hasOwnProperty("sap-message")){
                        var  sapMessage = JSON.parse(sResponse.headers['sap-message']);

                        if (sapMessage.severity === "error"){
                            MessageBox.error(sapMessage.message);                                          
                        }                                   
                    }else{
                        if(oPayload.Action === "02"){
                            if (that.sScenario ==="01"){
                                MessageToast.show(that.getResourceBundle().getText("sweepSaved")) ;  
                            }else{
                                MessageToast.show(that.getResourceBundle().getText("callDepositSaved")) ;  
                            }                                            
                        } else if (oPayload.Action === "03"){  
                            if (that.sScenario ==="01"){
                                MessageToast.show(that.getResourceBundle().getText("sweepApproval")) ;  
                            }else{
                                MessageToast.show(that.getResourceBundle().getText("callDepositApproval")) ;  
                            }                        
                        } else if (oPayload.Action === "04"){  
                            if (that.sScenario ==="01"){
                                MessageToast.show(that.getResourceBundle().getText("sweepApproved")) ;  
                            }else{
                                MessageToast.show(that.getResourceBundle().getText("callDepositApproved")) ;  
                            }                              
                            that.getModel("detailView").setProperty("/approveVisible", false);                               
                        } else if (oPayload.Action === "05"){ 
                            if (that.sScenario ==="01"){
                                MessageToast.show(that.getResourceBundle().getText("sweepRejected")) ;  
                            }else{
                                MessageToast.show(that.getResourceBundle().getText("callDepositRejected")) ;  
                            }                              
                            that["_dialog"].close();
                            that.getModel("detailView").setProperty("/approveVisible", false);                              
                        }                                                                               
                        //refresh master list   
                        that.getOwnerComponent().getModel().refresh();    
                        var oEventBus = sap.ui.getCore().getEventBus();
                        oEventBus.publish("list", "refresh", {sScenario: that.getModel("appView").getProperty("/scenario")}); 

                        that._readItems(that.sRepUnit, that.sAccount, that.sScenario);                              
                    }
                },
                error: function(oError) {
                    that.getView().setBusy(false) ;  
                    MessageBox.error(oError.responseText);                   
                }
             });
        },
          
        _onObjectMatched: function (oEvent) {
            var sRepUnit =  oEvent.getParameter("arguments").objectId;
            var sAccount =  decodeURIComponent(oEvent.getParameter("arguments").account);            
           
            // this.getView().setProperty("/busy", false);
            var sScenario = this.getModel("appView").getProperty("/scenario");

            this.sRepUnit  =  sRepUnit;        
            this.sAccount  =  sAccount;        
            this.sScenario = sScenario; 
            
            this.userDefaults = this.getModel("appView").getProperty("/userDefaults"); 
            
            var selectedItem =   this.getModel("appView").getProperty("/selectedItem");          
            if (selectedItem===""){                    
               this.getModel("appView").setProperty("/layout", "OneColumn");    
                this.getRouter().navTo("list");                             
            }  else{
                //this.sAccount  =  selectedItem.BankAccL;       
                this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded"); 
                //var d = new Date();
                //var localTime = d.getTime();
               // var localOffset = d.getTimezoneOffset() * 60000;
                
               // selectedItem.CutOffCetL = {
                //    ms:selectedItem.CutOffCet.ms, 
                //    "__edmType": "Edm.Time"
               // };
                //selectedItem.CutOffCetL.ms = selectedItem.CutOffCetL.ms+localOffset;                
                //this.getModel("appView").setProperty("/selectedItem", selectedItem);                 
                this.getModel("detailView").setProperty("/Item", selectedItem);  
                this.selectedItem = selectedItem ;               
            }   

            this._readItems(sRepUnit, sAccount, sScenario);
 
            this.getModel("detailView").setProperty("/approveVisible",false);
            this.getModel("detailView").setProperty("/saveVisible",false);  
            this.getModel("detailView").setProperty("/sendApprovalVisible",false);  

            this.getView().byId("sweepTable").removeSelections();                   
            /*    this.getModel().metadataLoaded().then( function() {
               var sObjectPath = this.getModel().createKey("DASHBOARDSet", {
                    RepUnit:  sRepUnit, BankAccL: sAccount, Scenario:sScenario
                });
                //this._bindView("/" + sObjectPath);
                this.getModel("detailView").setProperty("/Item", this.getModel().getProperty(sObjectPath)); 
            }.bind(this));*/
        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function (sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path : sObjectPath,
                events: {
                    change : this._onBindingChange.bind(this),
                    dataRequested : function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the list
                // does not make sense anymore.
               // this.getOwnerComponent().oListSelector.clearListListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                sObjectId = oObject.RepUnit,
                sObjectName = oObject.RepUnit,
                oViewModel = this.getModel("detailView");

           // this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("detailView");

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            //oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

        /*


*/
        _readItems( sRepUnit, sAccount, sScenario ){
            this.getView().setBusy(true);
            var oFilters = [new sap.ui.model.Filter("RepUnit", sap.ui.model.FilterOperator.EQ, sRepUnit), 
                            new sap.ui.model.Filter("BankAccL", sap.ui.model.FilterOperator.EQ, sAccount),
                            new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, sScenario),
                        ];
            var that = this;   
            //var role =  this.getModel("appView").getProperty("/selectedItem/Role");         
            this.getOwnerComponent().getModel().read("/DETAILSet",{ 
                filters:oFilters,                
                success:function(data, response){
                    that.getView().setBusy(false);
                    data.results.forEach(function(d) {
                        d.Enabled = false;
                    });

                   var path = that.getView().byId("sweepTable").getSelectedContextPaths()[0];
                   if (path!= undefined){
                    var index = path.substring(path.lastIndexOf("/")+1);
                    data.results[parseInt(index)].Enabled = true;                       
                   }
                   that.getModel("detailView").setProperty("/items", data.results);  
                   that.copiedItems = JSON.parse(JSON.stringify(data.results));                   
                }
            });
        },
                
        /**
         * Set the full screen mode to false and navigate to list page
         */
        onCloseDetailPress: function () {
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);            
            // No item should be selected on list after detail page is closed
            //this.getOwnerComponent().oListSelector.clearListListSelection();
            this.getRouter().navTo("list");         
        },

        /**
         * Toggle between full and non full screen mode.
         */
        toggleFullScreen: function () {
            var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
            if (!bFullScreen) {
                // store current layout and go full screen
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
            } else {
                // reset to previous layout
                this.getModel("appView").setProperty("/layout",  this.getModel("appView").getProperty("/previousLayout"));
            }
        }
    });

});