/*global Ext:false*/

Ext.define('Fclipboard.view.ListSelect', {
    extend: 'Ext.field.Select',
    xtype: 'listselect',
    requires: [
        'Ext.dataview.List',
        'Ext.field.Search',
        'Ext.util.DelayedTask'
    ],
    
    config: {
        /**
         * @cfg {Object} Navigation View
         */
        navigationView: null,
        
        /**
         * @cfg {String} current Search
         */
        searchValue: null,
        
        /**
         * @cfg {String} value field
         */
        valueField: "id",
        
        /**
         * @cfg {String} title
         */
        title: "Auswahl",
        
        /**
         * handler if creation of new 
         * records are allowed
         */
        pickerToolbarItems: null
    },
    
    showPicker: function() {
        var self = this;
        var navigationView = self.getNavigationView();
        var store = self.getStore();
        
        if ( navigationView !== null && store !== null) {
        
           var toolbarItems = [{
                    xtype: 'searchfield',
                    placeholder: 'Suche',
                    flex: 1,
                    listeners: {
                        keyup: function(field, key, opts) {
                            self.searchDelayed(field.getValue());
                        },
                        clearicontap: function() {
                            self.searchDelayed(null);
                        }
                        
                    }
                }
           ];

           // add additional items
           var additionalToolbarItems=self.getPickerToolbarItems();
           if ( additionalToolbarItems ) {
                toolbarItems = toolbarItems.concat(additionalToolbarItems);
           }
        
           navigationView.push({
              title: self.getTitle(),
              xtype : 'container',
              listeners: {
                  scope: self, 
                  show: self.firstSearch
              },
              items: [{
                docked: 'top',
                xtype: 'toolbar',                
                items: toolbarItems
              },
              {
                xtype: 'list',
                height: '100%',
                flex: 1, 
                store: store,
                itemTpl: '{' + self.getDisplayField() + '}',
                listeners: {
                    select: self.onListSelect,
                    itemtap: self.onListTap,
                    scope: self
                }                  
              }]
               
           });           
        } else {
            return self.callParent(arguments);
        }
    },
    
   initialize: function() {
        var self = this;        
        self.callParent(arguments);
        
        self.searchTask = Ext.create('Ext.util.DelayedTask', function() {
            self.search();
        });
   },
   
   searchDelayed: function(searchValue) {
       this.setSearchValue(searchValue);
       this.searchTask.delay(500);
   },
      
   search: function() {
       var self = this;
       var storeInst = self.getStore();
       var searchValue = self.getSearchValue();
       var searchField = self.getDisplayField();
       
       var options = {
           params : {
              limit: 100
           }
       };
       
       if ( !Ext.isEmpty(searchValue) ) {
         options.filters = [{
            property: searchField,
            value: self.searchValue
         }];         
       }          
       storeInst.load(options);
   },
   
   firstSearch: function() {
      this.search();  
   },
     
   onListTap: function() {
       var self = this;
       var navigationView = self.getNavigationView();
       if ( navigationView !== null ) {
           navigationView.pop();
       } else {
           self.callParent(arguments);
       }       
   },
      
   applyValue: function(value) {
        var record = value,
            index, store;
       
        //we call this so that the options configruation gets intiailized, so that a store exists, and we can
        //find the correct value
        this.getOptions();

        store = this.getStore();
        if ((value !== undefined && value !== null && !value.isModel) && store) {
            if (typeof value === 'object') {
                value = value[this.getValueField()];
            }
        
            index = store.find(this.getValueField(), value, null, null, null, true);

            if (index == -1) {
                index = store.find(this.getDisplayField(), value, null, null, null, true);
            }

            record = store.getAt(index);
        }

        return record;
    }
});