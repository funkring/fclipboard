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
        //  Navigation Bar
        // **********************************************************
        
        navigationBar: {
            items: [                
                {
                    xtype: 'button',
                    id: 'deleteRecordButton',
                    iconCls: 'trash',
                    align: 'right',
                    action: 'deleteRecord',  
                    hidden: true
                }, 
                {
                    xtype: 'button',
                    id: 'saveRecordButton',
                    text: 'Speichern',                                  
                    align: 'right',
                    action: 'saveRecord',
                    hidden: true                
                }      
            ]
        },           
                     
           
        // **********************************************************
        // View Items
        // **********************************************************
                
        items: [
            {              
                title: 'Fclipboard',
                xtype: 'tabpanel',
                tabBarPosition: 'bottom',      
                id: 'mainPanel',
                                                                        
                items: [   
                    {
                        title: 'Ablage',
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
                                    flex: 1              
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
                                    flex: 1
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
                                        id: 'resetSyncButton',
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
                                itemTpl: Ext.create('Ext.XTemplate', 
                                            '<tpl switch="prio">',
                                            '<tpl case="2">',
                                                '<span style="color:orange;">{message}</span>',                                                
                                            '<tpl case="3">',
                                                '<span style="color:red;">{message}</span>',
                                            '<tpl default>',
                                                '{message}',
                                            '</tpl>')                               
                            }                
                        ]
                        
                    }                   
                ]
            }
        ]
    }
   
});
