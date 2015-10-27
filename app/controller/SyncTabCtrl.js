/*global Ext:false, PouchDB:false, DBUtil:false, openerplib:false, futil:false, Config:false */
Ext.define('Fclipboard.controller.SyncTabCtrl', {
    extend: 'Ext.app.Controller',
    requires: [
        'Fclipboard.util.Config',
        'Ext.proxy.PouchDBUtil',
        'Fclipboard.view.ConfigView'
    ],
    config: {
        refs: {
            mainView: '#mainView',
            syncButton: '#syncButton',
            resetSync: '#resetSyncButton',
            editConfig: '#editConfigButton'
        },
        control: {
            syncButton: {
                tap: 'sync'  
            },
            editConfig : {
                tap: 'editConfig'
            },
            resetSync: {
                tap: 'resetSync'  
            }
        }
    },
    
    init: function() {
        var self = this;        
        self.callParent(arguments);
        self.syncActive = false;
    },
    
    sync: function() {        
        var self = this;
        
        //check double 
        if ( futil.isDoubleTap() ) {
            return;
        }
                
        if ( !self.syncActive ) {
            self.syncActive = true;
        
            // start dialog
            futil.startLoading("Datenabgleich mit Server");
                        
            // clear log
            var log = Config.getLog();
            log.removeAll();
            
            // define callback
            var callback = function(err) {
                self.syncActive = false;
                futil.stopLoading();
                
                if (err) {
                    if ( err === 'Timeout') {
                        log.error("Zeitüberschreitung bei Verbindung zu Server");
                    } else if ( err == 'Offline' ) {
                        log.error("Es kann keine Verbindung zum Server hergestellt werden");
                    } else {
                        log.error(err);                        
                    }
                    log.warning("<b>Synchronisation mit Fehlern abgeschlossen!</b>");
                } else {
                     log.info("<b>Synchronisation beendet!</b>");
                }
                
                 self.getMainView().fireEvent('reinitialize');                
            };
            
            // fetch config and sync
            var db = Config.getDB();
            db.get('_local/config', function(err, config) {
                
                // check config
                if (!err && !(config.host && config.port && config.user && config.db && config.password)) {
                    err = "Ungültige Konfiguration";
                }
            
                if ( !err ) {
                    log.info("Hochladen auf <b>" + config.host + ":" + config.port + "</b> mit Benutzer <b>" + config.user +"</b>");
                    
                    // reload after sync
                    DBUtil.syncOdoo({
                     access : config,
                     stores: [ Ext.getStore("PartnerStore"),
                               Ext.getStore("BasicItemStore"),
                               Ext.getStore("PricelistStore")
                             ],
                     actions: [
                               {
                                  model : "fclipboard.item",
                                  field_id: "root_id",
                                  domain: [["state","!=","release"],["template","=",false]],
                                  action : "action_release"
                               }  
                             ] 
                    }, log, callback );
                } else {
                    callback(err);
                }                
            });
        }  
       
    },
    
    resetSync: function(nextTo) {
        var self = this;
        var log = Config.getLog();
        log.removeAll();
        
        var syncPopover = Ext.create('Ext.Panel',{
            title: "Zurücksetzen",
            floating: true,
            hideOnMaskTap : true,
            modal: true,
            width: '300px',
            defaults: {
                defaults: {
                    xtype: 'button',
                    margin: 10,
                    flex : 1
                } 
            },                      
            items: [
                {
                    xtype: 'fieldset',
                    title: 'Zurücksetzen',
                    items: [
                         {
                             text: 'Synchronisation',
                             handler: function() {
                                 DBUtil.resetSync('fclipboard', function(err) {
                                    if (err) {
                                        log.error(err);
                                    } else {
                                        log.info("Sync-Daten zurückgesetzt!");                                      
                                    }         
                                    
                                    self.getMainView().fireEvent('reinitialize');
                                    syncPopover.hide();                           
                                });
                             }                  
                         },
                         {
                             text: 'Datenbank',
                             handler: function() {
                                  Ext.Msg.confirm('Löschen', 'Soll die Datenbank wirklich gelöscht werden?', function(choice)
                                  {
                                       var callback = function(err) {
                                           if (err) {
                                              log.error(err); 
                                           }
                                           
                                           syncPopover.hide();
                                           log.info("Datenbank zurückgesetzt!");
                                           
                                           self.getMainView().fireEvent('reinitialize');
                                       };    

                                       if( choice == 'yes' ) {
                                             Config.getDB().get('_local/config', function(err, doc) {
                                                DBUtil.resetDB('fclipboard', function(err) {
                                                    if ( doc ) {
                                                        delete doc._rev;
                                                        Config.getDB().put(doc, function(err) {
                                                            callback(err);                                                               
                                                        });                                                                
                                                    } else {
                                                        callback(err);
                                                    }
                                                });    
                                                
                                            });                                           
                                       } else {
                                           syncPopover.hide();
                                       }
                                  });                                 
                             }
                         }
                    ]            
                }
            ]            
        });
        
        if ( nextTo ) {
            syncPopover.showBy(nextTo, 'tl-tr?', false);
        } else {
            syncPopover.show('pop');
        }
    },
    
    editConfig: function(record) {
        var self = this;
        var db = Config.getDB();
        
        var load = function(doc) {
            var configForm = Ext.create("Fclipboard.view.ConfigView",{
                title: 'Konfiguration',
                xtype: 'configform',
                saveHandler: function(view, callback) {
                    var newValues = view.getValues();
                    newValues._id = '_local/config';
                    db.put(newValues).then( function() {
                         callback();
                    });
                }
            });

            configForm.setValues(doc);                    
            self.getMainView().push(configForm);
        };
        
        db.get('_local/config').then( function(doc) {
            load(doc);
        }).catch(function (error) {
            load({});
        });        
        
    }
    
});