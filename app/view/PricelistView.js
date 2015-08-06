/*global Ext:false, futil:false*/
Ext.define('Fclipboard.view.PricelistView', {
    extend: 'Ext.Container',
    xtype: 'pricelist',
    requires: [
        'Fclipboard.view.NumberInputView',
        'Ext.Toolbar',
        'Ext.XTemplate',      
        'Ext.dataview.List',
        'Ext.field.Search',
        'Ext.util.DelayedTask'
    ],
    id: 'pricelistView',
    config: {
        
        searchValue: null,
        
        pricelist: null,
        
        saveHandler: null, 
        
        order: {},
        
        title: 'Preisliste',
        
        items: [{
            docked: 'top',
            xtype: 'toolbar',
            ui: 'neutral',
            items: [{
                    xtype: 'searchfield',
                    placeholder: 'Suche',
                    flex: 1,
                    listeners: {
                        keyup: function(field, key, opts) {
                            Ext.getCmp('pricelistView').searchDelayed(field.getValue());
                        },
                        clearicontap: function() {
                            Ext.getCmp('pricelistView').searchDelayed(null);
                        }
                    }                       
                }                                         
            ]                           
        },                        
        {
            xtype: 'list',
            height: '100%',
            id: 'pricelist',
            store: 'PricelistItemStore',
            cls: 'PriceListItem',
            scrollToTopOnRefresh: false,
            grouped: true,
            listeners: {
                itemtap: function(list, index, element, record) {
                    Ext.getCmp('pricelistView').showNumberInput(element, record, index);
                },
                select: function(list, record) {
                    list.deselect(record);
                }                    
            }             
        }]
             
        
    },
              
    initialize: function() {
        var self = this;
        self.callParent(arguments);
         
        var pricelist = Ext.getCmp("pricelist");
         
        if ( futil.screenWidth() < 700 ) {
            pricelist.setItemTpl(Ext.create('Ext.XTemplate', 
                                    '<div class="col-75 {cls}">{code} {name} {uom}</div>',
                                    '<div class="col-25-right {cls}">{qty}</div>',
                                    '<div class="col-last"></div>',
                                {
                                  apply: function(values, parent) {
                                     var line = self.getOrder()[values.product_id];
                                     var qty = 0.0;
                                     if ( line ) {
                                        qty = line.qty;
                                     }
                                     
                                     var cls='';
                                     if (qty > 0.0) {
                                        cls = ' col-positive';
                                     }
                                     
                                     values.cls = cls;
                                     values.qty = futil.formatFloat(qty);
                                     return this.applyOut(values, [], parent).join('');
                                  }      
                                }));
            
        
        } else {
             pricelist.setItemTpl(Ext.create('Ext.XTemplate', 
                                    '<div class="col-10 {cls}">{code}</div>',
                                    '<div class="col-70 {cls}">{name}</div>',
                                    '<div class="col-10 {cls}">{uom}</div>',
                                    '<div class="col-10-right {cls}">{qty}</div>',
                                    '<div class="col-last {cls}"></div>',
                                {
                                  apply: function(values, parent) {
                                     var line = self.getOrder()[values.product_id];
                                     var qty = 0.0;
                                     if ( line ) {
                                        qty = line.qty;
                                     }
                                     
                                     var cls='';
                                     if (qty > 0.0) {
                                        cls = ' col-positive';
                                     }
                                     
                                     values.cls = cls;
                                     values.qty = futil.formatFloat(qty);
                                     return this.applyOut(values, [], parent).join('');
                                  }      
                                }));
        }
         
         //
         self.searchTask = Ext.create('Ext.util.DelayedTask', function() {
             self.search();
         });
         
       
    },
    
    updatePricelist: function(priceList) {
        //store
        var store = Ext.getStore("PricelistItemStore");
        if ( priceList ) {
            store.setData(priceList.products);
        } else {
            store.setData([]);
        }
    },
    
    
    searchDelayed: function(searchValue) {
        this.setSearchValue(searchValue);
        this.searchTask.delay(500);
    },
       
    search: function() {        
       var self = this;
       
       var store = Ext.getStore("PricelistItemStore");
       var searchValue = self.getSearchValue();
             
       if ( !Ext.isEmpty(searchValue) ) {
         store.filter([{
            property: "name",
            value: searchValue,
            anyMatch: true
         }]);         
       } else {
           store.clearFilter();
       }       
   },
   
   showNumberInput: function(nextTo, record, index) {
        var self = this;
        var product_id = record.get('product_id');   
        var line = self.getOrder()[product_id]; 
        var qty = line && line.qty || 0.0;
        var name = record.get('name');
        var validateNumberInput = function(numInput, newVal) {
                self.getOrder()[product_id]={
                    name: record.get('name'),
                    qty: newVal,
                    uom: record.get('uom'),
                    code: record.get('code'),
                    category: record.get('category'),
                    sequence: record.get('sequence') 
                };
                
                var store = Ext.getStore("PricelistItemStore");
                store.fireEvent('updaterecord', this, record, index, index, [], {});
            };
        
        /*
        //show number view
        if ( futil.screenWidth() < 700 ) {
           if ( !self.numberInputView ) {
                self.numberInputView = Ext.create('Fclipboard.view.SmallNumberInputView');
           }
           self.numberInputView.showBy(nextTo, 'tl-tr?', false, qty, name, validateNumberInput);
        } else {
            if ( !self.numberInputView ) {
                self.numberInputView = Ext.create('Fclipboard.view.NumberInputView');
            }
            self.numberInputView.showBy(nextTo, 'tl-tr?', false, qty, validateNumberInput);
        }*/
        
        if ( !self.numberInputView ) {
            self.numberInputView = Ext.create('Fclipboard.view.SmallNumberInputView');
        }
        self.numberInputView.showBy(nextTo, 'tl-tr?', false, qty, name, validateNumberInput);
    }
  
});