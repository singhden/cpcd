sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("zurich.fscm.ui.cpcd.controller.App", {

        onInit : function () {
            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();                
            var scenario ="01";//this.getOwnerComponent().getComponentData().startupParameters["Scenario"];     
            
            /*if (this.getOwnerComponent().getComponentData().startupParameters.hasOwnProperty("Scenario")){
                scenario = this.getOwnerComponent().getComponentData().startupParameters["Scenario"];
            }else{
                scenario ="01";                
            }
                
            /*if   (scenario === undefined){
                scenario ="01";                       
            }else{
                scenario =   scenario[0];                     
            }*/

            var complete_url = window.location.href;
            if   (complete_url.indexOf("ZZ9FSCM_CD") >0){
                scenario ="02";                       
            }else{
                scenario ="01";                 
            }
                        
        /*    var pieces = complete_url.split("?");            
            var params = pieces[1].split("&");          
            $.each( params, function( key, value ) {           
                var param_value = value.split("=");
                if (param_value[0]==="Scenario"){
                    scenario = param_value[1]; 
                }
            });*/

            oViewModel = new JSONModel({
                busy : true,
                delay : 0,
                layout : "OneColumn",
                previousLayout : "",                
                scenario : scenario,
                selectedItem: "",
                userFormat: "",
                actionButtonsInfo : {
                    midColumn : {
                        fullScreen : false
                    }
                }
            });
            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };
                        
            // since then() has no "reject"-path attach to the MetadataFailed-Event to disable the busy indicator in case of an error
            this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
            this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }

    });
});