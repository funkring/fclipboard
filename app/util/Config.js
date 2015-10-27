/*global Ext:false, futil:false, DBUtil:false*/

Ext.define('Fclipboard.util.Config', {
    singleton : true,
    alternateClassName: 'Config',
    requires: [
        'Ext.proxy.PouchDBUtil'
    ],
    config : {
        "searchDelay" : 500,
        "searchLimit" : 100,
        "maxRows" : 10
    },
    
    constructor: function(config) {
        this.initConfig(config);
    },
    
    valueToString: function(val, vtype) {
        if ( !val ) {
            return null;            
        }        
        if ( !vtype ) {
            return val.toString();
        } else {
            switch (vtype) {
                case 'product_id':
                    return val.get('name');
                case 'partner_id':
                    return val.get('name');
                case 'pricelist_id':
                    return val.get('name');
                case 'valf':
                    return futil.formatFloat(val);
                default:
                    return val.toString();
            }
        }
    },
    
    getDB: function() {
        var db = DBUtil.getDB('fclipboard');
        return db;
    },
    
    getLog: function() {
        return Ext.getStore("LogStore");
    },
    
    testNumberInput: function(c) {
        this.showNumberInput(c, 0.0, '');
    },
    
    showNumberInput: function(nextTo, val, info, handler, editHandler) {
        var self = this;
        //check number view
        if ( !self.numberInputView ) {
            self.numberInputView = Ext.create('Fclipboard.view.SmallNumberInputView');
        }
        // show
        self.numberInputView.showBy(nextTo, 'tl-tr?', false, val, info, handler, editHandler);
    }
    
});