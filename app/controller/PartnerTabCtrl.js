/*global Ext:false, PouchDB:false, DBUtil:false, Config:false, openerplib:false, futil:false, Fclipboard:false*/
Ext.define('Fclipboard.controller.PartnerTabCtrl', {
    extend: 'Ext.app.Controller',
    requires: [
        'Fclipboard.util.Config',
        'Ext.proxy.PouchDBUtil',
        'Ext.util.DelayedTask',
        'Fclipboard.view.FormView'
    ],
    config: {
        refs: {
            mainView: '#mainView',
            partnerTab: '#partnerTab',
            partnerList: '#partnerList',            
            partnerSearch: '#partnerSearch'
        },
        control: {
            'button[action=newPartner]': {
                tap: 'newPartner'
            },
            mainView: {
                newRecord: 'recordChange',
                deletedRecord: 'recordChange'
            },        
            partnerTab: {
                activate: 'partnerTabActivate'              
            },
            partnerSearch: {
                keyup: 'partnerSearchKeyUp',
                clearicontap: 'partnerClearIconTap'
            },            
            partnerList: {
                select: 'selectPartner',
                initialize: 'initializeList'
            }
        }
    },
           
    init: function() {
        var self = this;        
        self.callParent(arguments);
        self.searchText = null;
        
        self.partnerSearchTask = Ext.create('Ext.util.DelayedTask', function() {
            self.searchPartner();
        });
           
    },
    
    initializeList: function() {
       this.getPartnerList().setItemTpl(Ext.create('Ext.XTemplate', 
            '{name}<tpl if="infos"><div class="partner-info">{infos}</div></tpl>',
            {
              apply: function(values, parent) {
                 // determine type
                 var addressLine = [];
                 if (values.street) {
                     addressLine.push(values.street);
                 }                 
                 if (values.city) {
                     if (values.zip) {
                         addressLine.push(values.zip + " " + values.city);
                     } else {
                        addressLine.push(values.city);
                     }
                 }
                 
                 values.infos = addressLine.join(" - ");
                 return this.applyOut(values, [], parent).join('');
              }      
            }));
    },
    
    recordChange: function(record) {
        if ( record instanceof Fclipboard.model.Partner ) {
            this.resetSearch();
        }        
    },
    
    partnerTabActivate: function(tab, options) {
       this.resetSearch();
    },
    
    resetSearch: function() {
        this.searchText = null;
        this.getPartnerSearch().setValue(null);
        this.searchPartner();
    },
    
    partnerClearIconTap: function() {
        this.resetSearch();
    },
    
    partnerSearchKeyUp: function(field, key, opts) {
        this.searchPartnerDelayed(field.getValue());
    },
    
    searchPartnerDelayed: function(text) {
        this.searchText = text;
        this.partnerSearchTask.delay(Config.getSearchDelay());
    },
    
    searchPartner: function(callback) {
       var partnerStore = Ext.StoreMgr.lookup("PartnerStore");
       
       var options = {   
           params : {
              limit: Config.getSearchLimit()
           } 
       };
       
       if (callback) {
           options.callback = callback; 
       }
       
       if ( !Ext.isEmpty(this.searchText) ) {
         options.filters = [{
                   property: 'name',
                   value: this.searchText,
                   anyMatch: true
         }];
       }   
       
       //<a href="tel:18475555555">1-847-555-5555</a>
       partnerStore.load(options);
    },
          
    newPartner: function() {
        var newPartner = Ext.create('Fclipboard.model.Partner',{});
        this.editPartner(newPartner);
    },
    
    editPartner: function(record) {
        var self = this;  
        
        // check doubletap 
        if ( futil.isDoubleTap() ) {
            return;
        }
        
        self.getMainView().push({
            title: 'Partner',
            xtype: 'partnerform',
            record: record,
            deleteable: true
        });
    },
    
    selectPartner: function(list, record) {
        list.deselect(record);
        this.editPartner(record);
    }
    
});