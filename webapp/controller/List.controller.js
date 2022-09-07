sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/m/GroupHeaderListItem",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "../model/formatter",
    "../utils/Constants",
    "sap/ui/core/format/NumberFormat" 
], function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter, Constants,NumberFormat ) {
    "use strict";

    return BaseController.extend("zurich.fscm.ui.cpcd.controller.List", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the list controller is instantiated. It sets up the event handling for the list/detail communication and other lifecycle tasks.
         * @public
         */
        onInit : function () {
            // Control state model
            var oList = "", //this.byId("list"),
                oViewModel = this._createViewModel();

            //    this._oDetailTable = this.byId(Constants.DetailTableID);
            //    this._oDetailUITable = this.byId(Constants.DetailUITableID);

          /*  this._oGroupFunctions = {
                AmtT: function(oContext) {
                    var iNumber = oContext.getProperty('AmtT'),
                        key, text;
                    if (iNumber <= 20) {
                        key = "LE20";
                        text = this.getResourceBundle().getText("listGroup1Header1");
                    } else {
                        key = "GT20";
                        text = this.getResourceBundle().getText("listGroup1Header2");
                    }
                    return {
                        key: key,
                        text: text
                    };
                }.bind(this)
            };

            //this._oList = oList;
            // keeps the filter and search state
            this._oListFilterState = {
                aFilter : [],
                aSearch : []
            };*/

            this.setModel(oViewModel, "listView");
 
            var that = this;
            setInterval(function() {
                var date = new Date();
                var localTime = date.getTime();
                var localOffset = date.getTimezoneOffset() * 60000;      
               // localOffset = localOffset + 3600000*2;
                 // obtain UTC time in msec
                var utc = localTime + localOffset;
                // create new Date object for current Locale
                var crrentDate = new Date(utc + (3600000*localOffset));
                //localOffset =  utc;
                
                var cetDate = new Date().toLocaleString("de-DE", {timeZone: 'Europe/Berlin'});
                var cetTime =  cetDate.split(",")[1];
                    cetDate= cetDate.split(",")[0];                
                                   
                var hours, minutes, seconds, ms, day, month, year;
                day =  cetDate.substring(0,cetDate.indexOf("."));  
                month = cetDate.substring( cetDate.indexOf(".")+1,  cetDate.lastIndexOf("."));
                year =  cetDate.substring(cetDate.lastIndexOf(".")+1)  ;                            
                hours = parseInt(cetTime.substring(cetTime.indexOf(":")-2,cetTime.indexOf(":", 2)));            
                minutes= parseInt(cetTime.substring(cetTime.lastIndexOf(":")-2, cetTime.lastIndexOf(":")));
                seconds= parseInt(cetTime.substring(cetTime.lastIndexOf(":")+1));            
                              
                ms = (hours*3600 + minutes*60+ seconds)*1000;               
                
               /// var utcDate = new Date(year+"-"+month+"-"+day+ cetTime+" UTC");//new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),0,0,0,0));
               
               /* var gDate = new Date().toLocaleString("en-GB", {timeZone: 'Europe/London'});
                 gTime =  gDate.split(",")[1];
                 gDate= gDate.split(",")[0];    

                day =  gDate.substring(0,gDate.indexOf("."));  
                month = gDate.substring( gDate.indexOf(".")+1,  gDate.lastIndexOf("."));
                year =  gDate.substring(gDate.lastIndexOf(".")+1)  ;                            
                hours = parseInt(gTime.substring(gTime.indexOf(":")-2,gTime.indexOf(":", 2)));            
                minutes= parseInt(gTime.substring(gTime.lastIndexOf(":")-2, gTime.lastIndexOf(":")));
                seconds= parseInt(gTime.substring(gTime.lastIndexOf(":")+1)); */

               // var cetDate = new Date(year+"-"+month+"-"+day+ cetTime+" UTC");
                var utcHours = parseInt(date.toUTCString().substring(date.toUTCString().indexOf(":")-2,date.toUTCString().indexOf(":", 2)));
                var cetDifferenceGMT = hours-utcHours;
                
               that.getModel("listView").setProperty("/today",date);
                var list = that.getModel("listView").getProperty("/dashboard");
                if(list){                
               list.forEach(function(r){
                    r.CutOffCetL = {
                        ms: r.CutOffCet.ms, 
                        "__edmType": "Edm.Time"
                    };
                    hours = date.getHours();            
                    minutes= date.getMinutes();
                    seconds= date.getSeconds();            
                                  
                    ms = (hours*3600 + minutes*60+ seconds)*1000; 

                    r.CutOffCetL.ms = r.CutOffCet.ms - (cetDifferenceGMT*3600 )*1000 - (localOffset);   
  
                });  
                }                           
            }, 1000);          
            var oEventBus = sap.ui.getCore().getEventBus();
            oEventBus.subscribe("list", "refresh", this._refreshDashboard, this); 

           /* this.getView().addEventDelegate({
                onBeforeFirstShow: function () {
                    this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
                }.bind(this)
            });*/

            this.getRouter().getRoute("list").attachPatternMatched(this._onMasterMatched, this);
            this.getRouter().attachBypassed(this.onBypassed, this);
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * After list data is available, this handler method updates the
         * list counter
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished : function (oEvent) {
            // update the list object counter after new data is loaded
         //   this._updateListItemCount(oEvent.getParameter("total"));
        },

        /**
         * Event handler for the list search field. Applies current
         * filter value and triggers a new search. If the search field's
         * 'refresh' button has been pressed, no new search is triggered
         * and the list binding is refresh instead.
         * @param {sap.ui.base.Event} oEvent the search event
         * @public
         */
        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
              //  this.onRefresh();
               // return;
            }

            var sQuery = oEvent.getParameter("query");

            if (!sQuery){
                sQuery= oEvent.getParameter("newValue");
            }
            
            if (sQuery) {
              //  this._oListFilterState.aSearch = [new Filter("RepUnit", FilterOperator.Contains, sQuery)];
                var filters1 = [];
            //   filters1.push(new sap.ui.model.Filter("RepUnit", sap.ui.model.FilterOperator.EQ, sQuery));
            //   filters1.push(new sap.ui.model.Filter("RepUnit", sap.ui.model.FilterOperator.StartsWith, sQuery));
                filters1.push(new sap.ui.model.Filter("RepUnit", sap.ui.model.FilterOperator.Contains, sQuery));
             //   filters1.push(new sap.ui.model.Filter("RepUnit", sap.ui.model.FilterOperator.EndsWith, sQuery));
                var filters2 = [];
             //  filters2.push(new sap.ui.model.Filter("BankBic", sap.ui.model.FilterOperator.EQ, sQuery));
        //   filters2.push(new sap.ui.model.Filter("BankBic", sap.ui.model.FilterOperator.StartsWith, sQuery));
                filters2.push(new sap.ui.model.Filter("BankBic", sap.ui.model.FilterOperator.Contains, sQuery));
            //    filters2.push(new sap.ui.model.Filter("BankBic", sap.ui.model.FilterOperator.EndsWith, sQuery));
                var filters3 = [];
               // filters3.push(new sap.ui.model.Filter("BankAccL", sap.ui.model.FilterOperator.EQ, sQuery)); 
               // filters3.push(new sap.ui.model.Filter("BankAccL", sap.ui.model.FilterOperator.StartsWith, sQuery));                             
                filters3.push(new sap.ui.model.Filter("BankAccL", sap.ui.model.FilterOperator.Contains, sQuery));                             
               //filters3.push(new sap.ui.model.Filter("BankAccL", sap.ui.model.FilterOperator.EndsWith, sQuery));                                         
                var afilter= [];
                //afilter.push(new sap.ui.model.Filter(filters1,true))  ;
                //afilter.push(new sap.ui.model.Filter(filters2))  ;
                afilter.push(new sap.ui.model.Filter(filters3));   

                var contains = sap.ui.model.FilterOperator.Contains;
                var columns = ['RepUnit','BankBic','BankAccL','Currency',"AmtT","AmtT1","AmtT2","AmtT3","AmtT4","AmtT5", "StatusStrT" , "StatusStrT1", "StatusStrT2", "StatusStrT3", "StatusStrT4", "StatusStrT5"];
                var filters = new sap.ui.model.Filter(columns.map(function(colName) {
                    return new sap.ui.model.Filter(colName, contains, sQuery); }),
                        false);

                var itemBinding = this.getView().byId("dasboardTable").getBinding("items");
                itemBinding.filter(filters);
                //this.getModel("listView").setProperty("/total", itemBinding.aIndices.length)  ;              
            } else {
                var itemBinding = this.getView().byId("dasboardTable").getBinding("items");
                itemBinding.filter([]); 
               // itemBinding.
            }
            var sTitle = this.getResourceBundle().getText("tableHeader", [itemBinding.aIndices.length]);
            this.getModel("listView").setProperty("/total",  sTitle);

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function (oEvent) {
            //this._oList.getBinding("items").refresh();
           // this.getView().byId("_dashboardSmartTable").rebindTable();
           this._readDashboard(this);
        },

        onBeforeRebindTable:function(oEvent){
            var oBindingParams = oEvent.getParameter("bindingParams");      
            var that = this;               
            oBindingParams.parameters.select =  oBindingParams.parameters.select + Constants.Parameters;
            var sScenario = this.getModel("appView").getProperty("/scenario");            
            
            oBindingParams.filters.push(new sap.ui.model.Filter("Scenario", "EQ" , sScenario));
            
            //oBindingParams="";
                    
            this.getOwnerComponent().getModel().read(Constants.ColumnSet,{           
                success:function(data, response){                
                    that.getModel("listView").setProperty("/columns", data.results[0]);
                    }
                });                          
        },         
		onSort: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Sort");
			}
		},

		onFilter: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Filter");
			}
		},

		onGroup: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Group");
			}		
        },
        /**
         * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the button press event
         * @public
         */
        onOpenViewSettings: function (oEvent) {
            var sDialogTab = "filter";
            if (oEvent.getSource() instanceof sap.m.Button) {
                var sButtonId = oEvent.getSource().getId();
                if (sButtonId.match("sort")) {
                    sDialogTab = "sort";
                } else if (sButtonId.match("group")) {
                    sDialogTab = "group";
                }
            }
            // load asynchronous XML fragment
            if (!this.byId("viewSettingsDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "zurich.fscm.cpcd.cashpooling.view.ViewSettingsDialog",
                    controller: this
                }).then(function(oDialog){
                    // connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("viewSettingsDialog").open(sDialogTab);
            }
        },

        /**
         * Event handler called when ViewSettingsDialog has been confirmed, i.e.
         * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
         * are applied to the list, which can also mean that they
         * are removed from the list, in case they are
         * removed in the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @public
         */
        onConfirmViewSettingsDialog: function (oEvent) {
            
            var aFilterItems = oEvent.getParameters().filterItems,
                aFilters = [],
                aCaptions = [];

            // update filter state:
            // combine the filter array and the filter string
            aFilterItems.forEach(function (oItem) {
                switch (oItem.getKey()) {
                    case "Filter1" :
                        aFilters.push(new Filter("AmtT", FilterOperator.LE, 100));
                        break;
                    case "Filter2" :
                        aFilters.push(new Filter("AmtT", FilterOperator.GT, 100));
                        break;
                    default :
                        break;
                }
                aCaptions.push(oItem.getText());
            });

            this._oListFilterState.aFilter = aFilters;
            this._updateFilterBar(aCaptions.join(", "));
            this._applyFilterSearch();
            this._applySortGroup(oEvent);
        },

        /**
         * Apply the chosen sorter and grouper to the list
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @private
         */
        _applySortGroup: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                aSorters = [];
            
            // apply sorter to binding
            // (grouping comes before sorting)
            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                var vGroup = this._oGroupFunctions[sPath];
                aSorters.push(new Sorter(sPath, bDescending, vGroup));
            }
            
            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            this._oList.getBinding("items").sort(aSorters);
        },

        /**
         * Event handler for the list selection event
         * @param {sap.ui.base.Event} oEvent the list selectionChange event
         * @public
         */
        onSelectionChange: function (oEvent) {
            var oList = oEvent.getSource(),
                bSelected = oEvent.getParameter("selected");

            // skip navigation when deselecting an item in multi selection mode
            if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
                // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
                //oList.setSelectedItem(oListItem, bSelect?)                 
            }
        },
        onInitialise: function (oEvent){
           this.getView().byId(oEvent.getSource().getId()+"-btnPersonalisation").setVisible(false);   
        },
		onSort: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Sort");
			}
		},

		onFilter: function () {
			var oSmartTable = this._getSmartTable();
			if (oSmartTable) {
				oSmartTable.openPersonalisationDialog("Filter");
			}
		},

		_getSmartTable: function () {
			if (!this._oSmartTable) {
				this._oSmartTable = this.getView().byId("_dashboardSmartTable");
			}
			return this._oSmartTable;
		},
        /**
         * Event handler for the bypassed event, which is fired when no routing pattern matched.
         * If there was an object selected in the list, that selection is removed.
         * @public
         */
        onBypassed: function () {
            this._oList.removeSelections(true);
        },

        /**
         * Used to create GroupHeaders with non-capitalized caption.
         * These headers are inserted into the list to
         * group the list's items.
         * @param {Object} oGroup group whose text is to be displayed
         * @public
         * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
         */
        createGroupHeader: function (oGroup) {
            return new GroupHeaderListItem({
                title : oGroup.text,
                upperCase : false
            });
        },

        /**
         * Event handler for navigating back.
         * We navigate back in the browser history
         * @public
         */
        onNavBack: function() {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


        _createViewModel: function() {
            return new JSONModel({
                isFilterBarVisible: false,
                filterBarLabel: "",
                delay: 0,
                title: this.getResourceBundle().getText("listTitleCount", [0]),
                noDataText: this.getResourceBundle().getText("listListNoDataText"),
                sortBy: "RepUnit",
                total:  this.getResourceBundle().getText("tableHeader", [0]),          
                groupBy: "None"
            });
        },

        _onMasterMatched:  function() {
            //var btn = this.getView().byId("application-zurichfscmuicpcd-display-component---list--_dashboardSmartTable-btnPersonalisation");
           // btn.setVisible(false);
            //Set the layout property of the FCL control to 'OneColumn'
            this.getModel("appView").setProperty("/layout", "OneColumn");
            var that = this;
            this.getOwnerComponent().getModel("user").read("/ZZ9FSCM_curr_user_info_od",{              
                success:function(data, response){                
                    //data.results.length>0                   
                    var pattern, decimalSeparator, groupingSeparator;
                    var userDefaults = data.results[0];                    
                    
                    if (userDefaults.DecimalFormat===""){
                        decimalSeparator = ","; 
                        groupingSeparator = ".";                       
                    }else{
                        decimalSeparator = "."; 
                        groupingSeparator = ",";                            
                    }
                    userDefaults.DecimalFormat =  NumberFormat.getFloatInstance({
                        "groupingEnabled": true,  // grouping is enabled
                        "groupingSeparator": groupingSeparator, // grouping separator is '.'
                        "groupingSize": 3,        // the amount of digits to be grouped (here: thousand)
                        "decimalSeparator": decimalSeparator   // the decimal separator must be different from the grouping separator
                    });

                    if (userDefaults.DataFormat==="1"){
                      pattern = "dd.MM.yyyy";                        
                    }else if (userDefaults.DataFormat==="2"){
                        pattern = "MM/dd/yyyy";       
                    }else if (userDefaults.DataFormat==="3"){  
                        pattern = "MM-dd-yyyy";                        
                    }else if (userDefaults.DataFormat==="4"){
                        pattern = "yyyy.MM.dd";       
                    }else if (userDefaults.DataFormat==="5"){
                        pattern = "yyyy/MM/dd";       
                    }else{
                        pattern = "yyyy-MM-dd";      
                    }
                    userDefaults.DataFormat=sap.ui.core.format.DateFormat.getDateInstance({pattern :pattern }); 

                    that.getModel("appView").setProperty("/userFormat", userDefaults);
                }
            });
          //  this.sScenario  = this.getModel("appView").getProperty("/scenario");
           // var oFilters= [new sap.ui.model.Filter("Scenario", "EQ" , sScenario)];           
  
            this._readDashboard(this);                                 
           /*
            this.getOwnerComponent().getModel().read(Constants.ColumnSet,{           
                success:function(data, response){                
                    that.getModel("listView").setProperty("/columns", data.results[0]);
                    }
                });              
  var items = this.getView().byId("tableBsegments").getBinding("items");
            this.idProposal = oEvent.getParameter("arguments").Id;

            var oFilters = [new sap.ui.model.Filter("Id", sap.ui.model.FilterOperator.EQ, this.idProposal)];
            var filterObj = new sap.ui.model.Filter(oFilters, false);
            items.filter(filterObj);*/

       },

       _readDashboard: function (that){
        var sScenario = that.getModel("appView").getProperty("/scenario");            
        var oFilters= [new sap.ui.model.Filter("Scenario", "EQ" , sScenario)];
        this.getOwnerComponent().getModel().read(Constants.DashboardSet,{   
            filters:oFilters,         
            success:function(data, response){    
                //that.getModel("listView").setProperty("/total", data.results.length)  ;                          
                that.getModel("listView").setProperty("/dashboard", data.results);
                 var sTitle = that.getResourceBundle().getText("tableHeader", [data.results.length]);
                that.getModel("listView").setProperty("/total", sTitle);                    
            }
        });
        this.getOwnerComponent().getModel().read(Constants.ColumnSet,{           
            filters:oFilters, 
            success:function(data, response){                
                that.getModel("listView").setProperty("/columns", data.results[0]);
            }
        });        
       },
  
       _refreshDashboard: function (sChanel, oEvent, oData){   
            var that = this; 
            var oFilters= [new sap.ui.model.Filter("Scenario", "EQ" , oData.sScenario)];
            this.getOwnerComponent().getModel().read(Constants.DashboardSet,{   
                filters:oFilters,         
                success:function(data, response){    
                    //that.getModel("listView").setProperty("/total", data.results.length)  ;                          
                    that.getModel("listView").setProperty("/dashboard", data.results);
                    var sTitle = that.getResourceBundle().getText("tableHeader", [data.results.length]);
                    that.getModel("listView").setProperty("/total", sTitle);                    
                }
            });
       },
        /**
         * Shows the selected item on the detail page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showDetail: function (oItem) {
            var bReplace = !Device.system.phone;
            // set the layout property of FCL control to show two columns
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            var selectedItem = this.getModel("listView").getProperty(oItem.getBindingContextPath());//this.getModel().getProperty(oItem.getBindingContext().sPath);
            this.getModel("appView").setProperty("/selectedItem", selectedItem);
            this.getRouter().navTo("object", {
                objectId : selectedItem.RepUnit, // oItem.getBindingContext().getProperty("RepUnit"), 
                account : encodeURIComponent(selectedItem.BankAccL),//oItem.getBindingContext().getProperty("BankAccL"))
            }, bReplace);
        },

        /**
         * Sets the item count on the list header
         * @param {integer} iTotalItems the total number of items in the list
         * @private
         */
        _updateListItemCount: function (iTotalItems) {
            var sTitle;
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("listTitleCount", [iTotalItems]);
                this.getModel("listView").setProperty("/title", sTitle);
            }
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @private
         */
        _applyFilterSearch: function () {
            var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
                oViewModel = this.getModel("listView");
            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("listListNoDataWithFilterOrSearchText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("listListNoDataText"));
            }
        },

        /**
         * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
         * @param {string} sFilterBarText the selected filter value
         * @private
         */
        _updateFilterBar : function (sFilterBarText) {
            var oViewModel = this.getModel("listView");
            oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
            oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("listFilterBarText", [sFilterBarText]));
        }

    });

});