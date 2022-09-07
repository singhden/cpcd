sap.ui.define([], function() {
    "use strict";

    return {
    //IDs
    RequestTableID: "_requestSmartTable",                
    RequestUITableID : "_requestUITable",
    DetailTableID: "_detailSmartTable",                
    DetailUITableID : "_detailUITable",    
    //Entity
    BUKEYS: "/Y2GL_DDL_BSG_BUKEYS",
    DashboardSet: "/DASHBOARDSet",
    ColumnSet: "/DASHBOARD_COLSSet",
    ItemSet: "/ItemSet",  
    CommentSet: "/COMMENTSSet",
    //Parmeters
    Parameters:",BankAccL,AmtT4,AmtT5,TX,T1X,T2X,T3X,T4X,T5X,StatusT,StatusT1,StatusT2,StatusT3,StatusT4,StatusT5,StatusStrT,StatusStrT1,StatusStrT2,StatusStrT3,StatusStrT4,StatusStrT5,RepUnitName,Role,CurrBalance",
    CreateRequest: "zurich.fscm.ui.cpcd.view.fragments.Submit", 
   
    AppName:"SOD", 
    //Constant Number
    SUCCESS:"Success"

    };
});
