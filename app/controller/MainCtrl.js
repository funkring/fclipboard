/*global Ext:false, DBUtil:false, PouchDB:false, openerplib:false, futil:false, Fclipboard:false, Config:false*/
Ext.define('Fclipboard.controller.MainCtrl', {
    extend: 'Ext.app.Controller',
    requires: [    
        'Fclipboard.util.Config',
        'Ext.proxy.PouchDBUtil',
        'Fclipboard.view.FormView'
    ],
    config: {
        refs: {
            mainView: '#mainView',
            saveRecordButton: '#saveRecordButton',
            deleteRecordButton: '#deleteRecordButton'
        },
        control: {
            saveRecordButton: {
                tap: 'saveRecord'
            },         
            deleteRecordButton : {
                tap: 'deleteRecord'  
            },
            mainView: {
                initialize: 'mainViewInitialize',         
                reinitialize: 'mainViewInitialize',
                activeitemchange : 'mainActiveItemChange'
            }  
        }
    },
    
    init: function() {
        var self = this;        
        self.callParent(arguments);
    },
    
    mainActiveItemChange: function(view, newCard) {
        if ( newCard instanceof Fclipboard.view.FormView ) {
            this.getSaveRecordButton().show();
            
            var record = newCard.getRecord();
            if (newCard.getDeleteable() && record && !record.phantom ) {
                this.getDeleteRecordButton().show();
            } else {
                this.getDeleteRecordButton().hide();
            }
        } else if ( newCard.getSaveHandler && newCard.getSaveHandler() ) {
            this.getSaveRecordButton().show();
        } else {
            this.getSaveRecordButton().hide();
            this.getDeleteRecordButton().hide();
        }
    },
    
    mainViewInitialize: function() {
        var self = this;
        Config.getDB().info(function(err, info) {
           if (!err) {
            var infoStr = JSON.stringify(info, null, 2);
            Config.getLog().info(infoStr); 
           } else {
            Config.getLog().error(err);
           }
        });
    },
      
    saveRecord: function() {
        var self = this;
        
        //check double 
        if ( futil.isDoubleTap() ) {
            return;
        }

        var mainView = self.getMainView();
        var view = mainView.getActiveItem();
       
        // check fields for errors
        
        var isValid = true;
        var fields = view.query("field");
        
        for (var i=0; i<fields.length; i++) {
            var field = fields[i];
            var value = field.getValue();
            
            if ( value && typeof value == "string") {
                value = field.getValue().trim();
            }
            
            if ( field.getRequired() && (value === null || value === "") )  {
                 fields[i].addCls('invalidField');
                 isValid = false;
            } else {
                fields[i].removeCls('invalidField');
            }
        }
        
        if ( !isValid ) {
            return;
        }
        
        futil.startLoading("Änderungen werden gespeichert...");
        var record = null;
        
        var reloadHandler = function(err, callback) {
            futil.stopLoading();
            
            var prevView = mainView.getPreviousItem();
            var popCount = 1;
            if (prevView && record) {
                // check field select record function
                var fieldSelectRecord = prevView.fieldSelectRecord || prevView.config.fieldSelectRecord;
                if (fieldSelectRecord) {
                    fieldSelectRecord(record);
                    popCount++;
                } 
            }
                 
            mainView.fireEvent("newRecord", record);       
            mainView.pop(popCount); 
            
            if (callback) {                
                callback(err);
            }       
        };
        
        // if save handler exist use it
        var saveHandler = view.saveHandler || view.config.saveHandler;
        if ( saveHandler ) {
            saveHandler(view, reloadHandler);          
        } else {
            // otherwise try to store record
            record = view.getRecord();
            if ( record !== null ) {
                var values = view.getValues(); 
                record.set(values);
                record.save({
                   callback: function() {
                      reloadHandler();
                   }
                });
            } else {
                reloadHandler();
            }
        }
    },
    
    deleteRecord: function() {
        var self = this;
        
        // check doubletap 
        if ( futil.isDoubleTap() ) {
            return;
        }
        
        var mainView =  self.getMainView();
        var view = self.getMainView().getActiveItem();
        var record = view.getRecord();

        if ( record !== null ) {
            Ext.Msg.confirm('Löschen', 'Soll der ausgewählte Datensatz gelöscht werden?', function(choice)
            {
               if(choice == 'yes')
               {                    
                   var db = Config.getDB();
                   var deleteChecks = null;
                   var parentField = null;
                   
                   try {
                        deleteChecks = record.getDeleteChecks();
                   } catch (err) {
                   }
                   
                   try {
                       parentField = record.getParentField();
                   } catch (err) {                       
                   }
                   
                   var deleteFunc = function() {                   
                       db.get( record.getId() ).then( function(doc) { 
                            doc._deleted=true;
                            var deleteCallback = function(err, res) {
                                 if (!err) {
                                     db.put(doc).then( function() {                                        
                                        mainView.fireEvent("deletedRecord", record);
                                        mainView.pop();
                                    });
                                 }
                            };
                            
                            if ( parentField ) {
                                DBUtil.cascadeDelete(db, record.getId(), parentField, deleteCallback);
                            } else {
                                deleteCallback();
                            }
                       });
                   };
                
                   var checkDelete = function(index) {
                       if (!deleteChecks || index >= deleteChecks.length ) {
                           deleteFunc();
                       } else {
                           var delCheck = deleteChecks[index];
                           DBUtil.search(db, [[delCheck.field,'=',record.getId()]], {'include_docs':false}, function(err, res) {
                              if ( !err && res.rows.length > 0 ) {
                                Ext.Msg.alert('Fehler', delCheck.message, Ext.emptyFn);
                              } else {
                                checkDelete(index+1);       
                              }
                           });
                           
                       }
                   };
                    
                   if ( deleteChecks ) {
                    checkDelete(0);
                   } else {
                    deleteFunc();
                   }
                       
               }         
            });
        }        
    }
  
});