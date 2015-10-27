/*global Ext:false, PouchDB:false, PouchDBDriver:false, openerplib:false, futil:false, Fclipboard:false, Config:false*/
Ext.define('Fclipboard.controller.MainCtrl', {
    extend: 'Ext.app.Controller',
    requires: [
        'Fclipboard.util.Config',
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

        // check for save handler
        var saveHandler = null;
        try { 
            saveHandler = view.getSaveHandler();
        } catch (err) {            
        }        
        
        futil.startLoading("Änderungen werden gespeichert...");
        var record = null;
        
        var reloadHandler = function(err, callback) {
            futil.stopLoading();
            
            var prevView = mainView.getPreviousItem();
            var popCount = 1;
            if (prevView && record) {
                try {
                    prevView.fieldSelectRecord(record);
                    popCount++;
                } catch(err2) {                    
                }
            }
                 
            mainView.fireEvent("newRecord", record);       
            mainView.pop(popCount); 
            
            if (callback) {                
                callback(err);
            }       
        };
        
        // if save handler exist use it
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
                   db.get( record.getId() ).then( function(doc) { 
                        doc._deleted=true;
                        db.put(doc).then( function() {
                            mainView.fireEvent("deletedRecord", record);
                            mainView.pop();
                        });
                   });
                       
               }         
            });
        }        
    }
  
});