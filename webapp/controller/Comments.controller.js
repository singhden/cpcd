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

    return BaseController.extend("zurich.fscm.ui.cpcd.controller.Comments", {

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

            this.getRouter().getRoute("comments").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "commentsView");
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
		onPost: function(oEvent) {
			// create new entry
			var sValue = oEvent.getParameter("value"), that = this;
			var oEntry = {
				TranIdStr: this.sTransId,
				Content: sValue
			};
            this.getOwnerComponent().getModel().create(Constants.CommentSet,oEntry,{              
                success:function(data, response){
                   that._readComments(that.sTransId);                  
                }
            }); 
		},         
        _onObjectMatched: function (oEvent) {
            var sTransId =  oEvent.getParameter("arguments").Id;
            this.sTransId = sTransId; 
            this._readComments(sTransId);
        },

        _readComments: function (sTransId) {
            var oFilters = [new sap.ui.model.Filter("TranIdStr", sap.ui.model.FilterOperator.EQ, sTransId)];                  
            var that = this;   
            //var role =  this.getModel("appView").getProperty("/selectedItem/Role");         
            this.getOwnerComponent().getModel().read(Constants.CommentSet,{
                filters:oFilters,                
                success:function(data, response){
                    that.getView().setBusy(false);
                    that.getModel("commentsView").setProperty("/list", data.results);
                }
            });
        }  ,   
        /**
         * Set the full screen mode to false and navigate to list page
         */
        onCloseDetailPress: function () {
           //this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

            var sweep = this.getModel("appView").getProperty("/selectedItem");

            // No item should be selected on list after detail page is closed
            //this.getOwnerComponent().oListSelector.clearListListSelection();
            //this.getRouter().navTo("list");
            this.getRouter().navTo("object", {
                objectId : sweep.RepUnit, 
                account : encodeURIComponent(sweep.BankAccL),
            });   

        },     

    });

});