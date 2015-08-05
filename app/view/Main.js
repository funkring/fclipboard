/*global Ext:false*, Fclipboard:false, futil*/

Ext.define('Fclipboard.view.Main', {
    extend: 'Ext.navigation.View',
    xtype: 'main',
    id: 'mainView',
    requires: [
        'Ext.TitleBar', 
        'Ext.TabPanel',
        'Ext.dataview.List',
        'Ext.field.Search',
        'Ext.util.DelayedTask',
        'Ext.field.Password',
        'Ext.field.Text',
        'Fclipboard.view.ScrollList'
    ],
    config: {
        // **********************************************************
        //  Defaults
        // **********************************************************
        
        title: 'Dokumente',
        record: null,        

        // **********************************************************
        //  Navigation Bar
        // **********************************************************
        
        navigationBar: {
            items: [
                {
                    xtype: 'button',
                    id: 'deleteRecord',
                    iconCls: 'trash',
                    align: 'right',
                    action: 'deleteRecord',  
                    hidden: true
                }, 
                {
                    xtype: 'button',
                    id: 'saveViewButton',
                    text: 'OK',                                  
                    align: 'right',
                    action: 'saveView',
                    hidden: true                
                }      
            ]
        },           
        
        listeners : {
            activeitemchange : function(view, newCard) {
                var saveButton = view.down('button[action=saveView]');
                var deleteButton = view.down('button[action=deleteRecord]');
                
                if ( newCard instanceof Fclipboard.view.FormView ) {
                    saveButton.show();
                    
                    var record = newCard.getRecord();
                    if (newCard.getDeleteable() && record && !record.phantom ) {
                        deleteButton.show();
                    } else {
                        deleteButton.hide();
                    }
                } else if ( newCard.getSaveHandler && newCard.getSaveHandler() ) {
                     saveButton.show();
                } else {
                    saveButton.hide();
                    deleteButton.hide();
                }
            }
        },
             
           
        // **********************************************************
        // View Items
        // **********************************************************
                
        items: [
            {                
                xtype: 'tabpanel',
                tabBarPosition: 'bottom',      
                id: 'mainPanel',
                
                listeners: {
                    activeitemchange: function(view, value, oldValue, opts) {
                        Ext.getCmp("mainView").validateComponents();  
                    }  
                },
                                                                        
                items: [   
                    {
                        title: 'Dokumente',
                        id: 'itemTab',
                        iconCls: 'home',
                        items: [{
                            docked: 'top',
                            xtype: 'toolbar',
                            ui: 'neutral',
                            items: [
                                {
                                    xtype: 'button',
                                    id: 'parentItemButton',
                                    ui: 'back',
                                    text: 'Zurück',       
                                    align: 'left',
                                    action: 'parentItem'  
                                },                               
                                {
                                    xtype: 'searchfield',
                                    placeholder: 'Suche',
                                    id: 'itemSearch',
                                    flex: 1,
                                    listeners: {
                                        keyup: function(field, key, opts) {
                                            Ext.getCmp('mainView').fireEvent('searchItem',field.getValue());
                                        },
                                        clearicontap: function() {
                                            Ext.getCmp('mainView').fireEvent('searchItem',null);
                                        }
                                    }                       
                                },
                                {
                                    xtype: 'button',
                                    id: 'editItemButton',
                                    iconCls: 'settings',                
                                    align: 'right',
                                    action: 'editItem'   
                                }, 
                                {
                                    xtype: 'button',
                                    id: 'newItemButton',
                                    iconCls: 'add',
                                    align: 'right',
                                    action: 'newItem'      
                                }
                                                         
                            ]                           
                        },             
                        {
                             layout: 'vbox',
                             height: '100%',
                             items: [
                                {
                                    xtype: 'container',
                                    id: 'itemInfo',
                                    cls: 'ItemInfo'
                                },
                                {
                                    xtype: 'list',
                                    flex: 1,
                                    store: 'ItemStore',
                                    scrollToTopOnRefresh: false,
                                    grouped: true,
                                    id: 'itemList',
                                    cls: 'ItemList',
                                    listeners: {
                                        select: function(list, record) {
                                            list.deselect(record);
                                        }
                                    }          
                                }
                             ]
                        }
                      ]            
                    },
                    {
                        title: 'Partner',                        
                        id: 'partnerTab',
                        iconCls: 'team',        
                        items: [{
                            docked: 'top',                            
                            xtype: 'toolbar',
                            ui: 'neutral',
                            items: [                                
                                {
                                    xtype: 'searchfield',
                                    placeholder: 'Suche',
                                    id: 'partnerSearch',
                                    flex: 1,
                                    listeners: {
                                        keyup: function(field, key, opts) {
                                            Ext.getCmp('mainView').fireEvent('searchPartner',field.getValue());
                                        },
                                        clearicontap: function() {
                                            Ext.getCmp('mainView').fireEvent('searchPartner',null);
                                        }
                                    }
                                },
                                {
                                    xtype: 'button',
                                    id: 'newPartnerButton',
                                    iconCls: 'add',
                                    align: 'right',
                                    action: 'newPartner'      
                                }                              
                            ]                           
                        },
                        {
                            xtype: 'list',
                            id: 'partnerList',
                            height: '100%',
                            store: 'PartnerStore',
                            grouped: true,
                            //disableSelection:true,                            
                            cls: 'PartnerList',
                            itemTpl: '{name}'                       
                        }]
                    },
                    {
                        title: 'Abgleich',
                        id: 'syncTab',
                        iconCls: 'refresh',
                        items:  [
                            {
                                docked: 'top',                            
                                xtype: 'toolbar',
                                ui: 'neutral',
                                items: [
                                    {
                                        xtype: 'button',
                                        id: 'editConfigButton',
                                        text: 'Einstellungen',
                                        align: 'left',
                                        action: 'editConfig'   
                                    },
                                    {
                                        xtype: 'button',
                                        id: 'resetSync',
                                        text: 'Zurücksetzen',
                                        align: 'left',
                                        action: 'resetSync'  
                                    }, 
                                    {
                                        xtype: 'spacer',
                                        flex: 1
                                    },
                                    {
                                        xtype: 'button',
                                        id: 'syncButton',
                                        text: 'Starten',
                                        align: 'right',
                                        action: 'sync'                
                                    }                           
                                ]                           
                            },                          
                            {
                                xtype: 'scrolllist',
                                id: 'logList',
                                height: '100%',
                                store: 'LogStore',                         
                                cls: 'LogList',
                                itemTpl: '{message}'                                 
                            }                
                        ]
                        
                    }                   
                ]
            }
        ]
    },
    
    // init
   constructor: function(config) {
        var self = this;        
        self.callParent(config);  
                
        var itemList = Ext.getCmp("itemList");  
        if ( futil.screenWidth() < 700 ) {
            itemList.setItemTpl(Ext.create('Ext.XTemplate', 
                                '<tpl if="t==1">',
                                    '<div class="col-75">{code} {name} {uom}</div>',
                                    '<div class="col-25-right {cls}">{qty}</div>',
                                    '<div class="col-last"></div>',
                                '<tpl else>',
                                    '{name}',
                                '</tpl>',
                                {
                                  apply: function(values, parent) {
                                     // determine type
                                     values.t = 0;
                                     // check type
                                     if ( values.rtype === "product_id") {
                                         values.t = 1;
                                         values.qty = futil.formatFloat(values.valf);
                                         values.uom = values.valc;
                                     }
                                     return this.applyOut(values, [], parent).join('');
                                  }      
                                }));
        
        } else {
            itemList.setItemTpl(Ext.create('Ext.XTemplate', 
                                '<tpl if="t==1">',
                                    '<div class="col-10">{code}</div>',
                                    '<div class="col-70">{name}</div>',
                                    '<div class="col-10">{uom}</div>',
                                    '<div class="col-10-right {cls}">{qty}</div>',
                                    '<div class="col-last"></div>',
                                '<tpl else>',
                                    '{name}',
                                '</tpl>',
                                {
                                  apply: function(values, parent) {
                                     // determine type
                                     values.t = 0;
                                     // check type
                                     if ( values.rtype === "product_id") {
                                         values.t = 1;
                                         values.qty = futil.formatFloat(values.valf);
                                         values.uom = values.valc;
                                     }
                                     return this.applyOut(values, [], parent).join('');
                                  }      
                                }));
        }
        
         
   },
        
   validateComponents: function() {
       var self = this;
   
       var activeItem = Ext.getCmp("mainPanel").getActiveItem();
       var title = activeItem.title || activeItem.getInitialConfig().title;
       var itemRecord = self.getRecord();              
       var itemData = itemRecord && itemRecord.data || null;

       var syncTabActive = (activeItem.getId() == "syncTab");
       var itemTabActive = (activeItem.getId() == "itemTab");
       var attachmentTabActive = (activeItem.getId() == "attachmentTab");
       
       // override title with name from data       
       if ( (itemTabActive || attachmentTabActive) && itemData !== null ) {
           title = itemData.name;
           if ( attachmentTabActive ) {
               title = title + " / Anhänge ";
           } 
       } 
    
       Ext.getCmp('parentItemButton').setHidden(itemRecord === null);
       Ext.getCmp('editItemButton').setHidden(itemRecord === null);
      
       
       // reset title      
       self.setTitle(title);
       this.getNavigationBar().setTitle(this.getTitle());  
   },
           
   pop: function() {
       this.callParent(arguments);
       this.validateComponents();
   },
   
   leave: function() {
       var self = this;
       self.pop();
       
       var activeItem = Ext.getCmp("mainPanel").getActiveItem();
       var itemTabActive = (activeItem.getId() == "itemTab");
       if ( itemTabActive ) {
          self.fireEvent('parentItem');
       } else {
          self.fireEvent('doDataReload');
       }
   }
   
});
