/*global Ext:false, PouchDB:false, DBUtil:false, Config:false, openerplib:false, futil:false, Fclipboard:false, markdown:false*/
Ext.define('Fclipboard.controller.ItemTabCtrl', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.XTemplate',      
        'Ext.field.Hidden',
        'Ext.field.Select',
        'Ext.form.FieldSet',
        'Ext.proxy.PouchDBUtil',
        'Fclipboard.util.Config',
        'Ext.util.DelayedTask'
    ],
    config: {
        refs: {
            mainView: '#mainView',
            itemTab: '#itemTab',
            itemList: '#itemList',
            itemInfo: '#itemInfo',
            parentItemButton: '#parentItemButton',
            editItemButton: '#editItemButton',
            newItemButton: '#newItemButton',
            itemSearch: '#itemSearch'         
            
        },
        control: {           
            mainView: {
               deletedRecord: 'deletedRecord',
               newRecord: 'newRecord',
               reinitialize: 'reinitialize'
            },
            editItemButton: {
                tap: 'editCurrentItem'   
            },
            newItemButton: {
                tap: 'newItem'
            },
            parentItemButton: {
                tap: 'parentItem'  
            },         
            itemSearch: {
                keyup : 'searchItemKeyUp',
                clearicontap: 'searchItemClearIconTap'                
            },
            itemTab: {
                activate: 'itemTabActivate'
            },
            itemList: {
                itemtap: 'selectItem',
                select: 'itemListSelect',
                initialize: 'itemListInitialize'
            },
            itemInfo: {
                tap: 'editCurrentItem'
            }
        }
    },
    
    initState: function() {
        this.path = [];
        this.itemSearch = null;
        this.pricelist = null;
        this.record = null;
    },
           
    init: function() {
        var self = this;        
        self.callParent(arguments);
        self.initState();
        
        self.itemSearchTask = Ext.create('Ext.util.DelayedTask', function() {
            self.searchItems();
        });
        
    },
        
    reinitialize: function() {
        this.initState();
        this.loadItem();
    },
    
    deletedRecord: function(record) {
        if ( this.record === record ) {
            this.parentItem();
        }  
    },
    
    newRecord: function(record) {
        if ( record === null || record instanceof Fclipboard.model.BasicItem ) {
            this.loadItem();
        } 
    },
    
    itemTabActivate: function(tab, options) {        
        this.loadItem();
    },
    
    itemListInitialize: function(itemList) {
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
    
          
    itemListSelect: function(list, record) {
        list.deselect(record);
    },
      
    searchItemKeyUp: function(field, key, opts) {
        this.searchItemDelayed(field.getValue());
    },
    
    searchItemClearIconTap: function() {
        this.searchItemDelayed(null);
    },
    
    searchItemDelayed: function(text) {
        this.itemSearch = text;
        this.itemSearchTask.delay(Config.getSearchDelay());    
    },   
    
    searchItems: function() {
       var itemStore = Ext.StoreMgr.lookup("ItemStore");
       // filter
       if ( !Ext.isEmpty(this.itemSearch) ) {
           itemStore.filter([{
              property: 'name',
              value: this.itemSearch,
              anyMatch: true
           }]);
       } else {
           itemStore.clearFilter();
       }
    },
    
    loadItemChilds: function(callback) {
       var self = this;
       var domain = [['parent_id','=',self.record !== null ? self.record.getId() : null]];
       
       // define optiones      
       var afterLoadCallbackCount = 0;
       var options = {
           params : {
               domain : domain
           },
           callback: function() {
               if ( ++afterLoadCallbackCount >= 2 ) {
                   if (callback) {
                        callback();
                   }
                   
                   // filter if search was active
                   if ( !Ext.isEmpty(this.itemSearch) ) {
                       self.searchItems();
                   }
                }
           }
       };
       
       // load header item
       var headerItemStore = Ext.StoreMgr.lookup("HeaderItemStore");
       headerItemStore.load(options);
             
       // load items
       var itemStore = Ext.StoreMgr.lookup("ItemStore");
       itemStore.load(options);     
    },
          
    createItem: function(title, folder_only) {
        var self = this;
        
        // check doubletap 
        if ( futil.isDoubleTap() ) {
            return;
        }
        
        var formItems = [{
                            xtype: 'textfield',
                            name: 'name',
                            label: 'Name',
                            required: true
                        }];
                        
        if ( !folder_only ) {
            formItems.push({
                        xtype: 'listselect',
                        autoSelect: false,
                        name: 'template_id',
                        label: 'Vorlage',
                        navigationView: self.getMainView(),
                        store: 'ItemTemplateStore',
                        displayField: 'name'                
                    });
        }
        
        formItems.push({
            xtype: 'textareafield',
            name: 'valt',
            label: 'Beschreibung',
            maxRows: Config.getMaxRows()
        });
        
         // new view         
        var itemForm = Ext.create("Fclipboard.view.FormView",{
            title: title || 'Neue Arbeitsmappe',        
            xtype: 'formview',       
            scrollable: false,
            saveHandler: function(view, callback) {
                var db = Config.getDB();
                
                // get values
                var values = view.getValues();
                values.fdoo__ir_model = 'fclipboard.item';
                values.section = 20;
                values.dtype = null;
                values.parent_id = self.record !== null ? self.record.getId() : null;
                values.template = false;
                
                // get template
                var template_id = values.template_id;
                
                // post value function
                var postValues = function() {
                    db.post(values, function(err, res) {
                        if( !err ) {
                           var newDocId = res.id;
                           if ( template_id ) {
                               // 
                               futil.startLoading("Erstelle Struktur");
                               //
                               DBUtil.deepChildCopy(db, res.id, template_id, "parent_id", {template:false}, function(err,res) {                                  
                                  //
                                  futil.stopLoading();
                                  //                            
                                  if (!err && template_id) {
                                    // open view if template was defined
                                    callback(err,function() { 
                                       self.selectId(newDocId, function() {
                                           self.editCurrentItem(); 
                                       });
                                    });
                                  } else {                                    
                                    // do error callback
                                    callback(err);
                                  }
                               });
                            } else {
                               // do normal callback
                               // and select new doc
                               callback(err, function() {
                                  self.selectId(newDocId);
                               });
                            }
                        } else {
                            // do error callback
                            callback(err);
                        }                    
                    });
                };
                
                // load template                
                if ( template_id ) {
                    db.get(template_id).then(function (template) {
                        // set values to copy
                        values.rule_ids = template.rule_ids;
                        // save and copy childs
                        postValues();                    
                        
                    }).catch(function(err) {
                        callback(err);  
                    });
                } else {
                    //save 
                    postValues();
                }
             
            }, 
            items: formItems,
            editable: true,
            deleteable: true
        });
        
        // show form
        self.getMainView().push(itemForm);
    },
       
    loadItem: function(callback) {
        var self = this;

        // init
        self.itemSearchTask.cancel();       
        self.itemSearch = null;
        self.pricelist = null;
         
        // validate components
        var db = Config.getDB();
               
        // final callback
        var handleCallback = function(err) {
            self.loadHeaderValues(self.record, function(items, values) {
                // build info
                var info = {};

                // build path                
                if ( self.record ) {
                   var path = [];
                   if ( self.path ) {
                       Ext.each(self.path, function(parentItem) {
                           path.push(parentItem.get('name'));
                       });
                   }
                   path.push(self.record.get('name'));
                   info.path = path.join(" / ");
                                    
                   var text = self.record.get('valt');
                   if ( text ) {
                    try {
                        info.text = markdown.toHTML(text);
                    } catch (err) {
                        info.text = text;
                    }
                   }
                   
                }
                
                
                // create info cols                
                info.infoFields = [];
                info.allFields = [];
                Ext.each(items, function(item) {
                   if ( item.item ) {
                       var val = Config.valueToString(values[item.name], item.vtype);
                       if (!val) {
                           return;
                       }   
                       
                       var fieldData = {
                          "label" : item.label,
                          "value" : val 
                       };
                       
                       info.allFields.push(fieldData);
                       if ( !info.header ) {
                            info.header = val;
                       } else { 
                           info.infoFields.push(fieldData);             
                       }
                    }
                });
                
                
                if ( !self.infoTemplate ) {
                    if ( futil.screenHeight() < 700 ) {
                        self.infoTemplate = new Ext.XTemplate(
                            '<tpl if="path">',
                                '<div class="fclipboard-path">{path} <tpl if="header">({header})</tpl></div>',
                            '</tpl>',
                            '<tpl if="text">',
                                '<div class="fclipboard-info">{text}</div>',
                            '</tpl>');
                    } else {
                        self.infoTemplate = new Ext.XTemplate(
                            '<tpl if="path">',
                                '<div class="fclipboard-path">{path}</div>',
                            '</tpl>',
                            '<tpl if="text">',
                                '<div class="fclipboard-info">{text}</div>',
                            '</tpl>',
                            '<tpl if="header">',
                                '<div class="fc-info-container">',                                    
                                    '<tpl for="allFields">',
                                        '<div class="fc-info-field">',
                                            '<div class="fc-info-label">',
                                                '{label}',
                                            '</div>',
                                            '<div class="fc-info-value">',
                                                '{value}',
                                            '</div>',
                                        '</div>',                                
                                    '</tpl>',
                                    '<div class="fc-info-last"></div>',        
                                '</div>',                
                            '</tpl>');
                    }
                }
        
                // set info
                var html = self.infoTemplate.apply(info);
                self.getItemInfo().setHtml(html);
                             
                // update buttons
                var noRecord = self.record === null;        
                self.getParentItemButton().setHidden(noRecord);
                self.getEditItemButton().setHidden(noRecord);        
                             
                // callback    
                if ( callback ) {
                     callback();               
                }
            });
        };
                
        // check for callback
        var afterLoadCallback = function() {
            if ( self.record ) {
                // search pricelist
                DBUtil.findFirstChild(Config.getDB(), self.record.getId(), "parent_id", [["rtype","=","pricelist_id"]], function(err, doc) {
                   // check error or no pricelist found
                   if ( err || !doc || !doc.pricelist_id ) {  
                      handleCallback(err);
                   } else {
                      db.get(doc.pricelist_id, function(err, pricelist) {
                          // set pricelist
                          self.pricelist = !err && pricelist || null;                                                            
                          handleCallback(err);
                      });
                   } 
                });
            
            // if no record search no pricelist
            } else {
               handleCallback();
            }
        };
        
        // load childs
        self.loadItemChilds(afterLoadCallback);      
    },
    
    editCurrentItem: function() {
        if ( this.record ) {
            this.editItem(this.record);
        } 
    },    
    
    selectId: function(itemId, callback) {
        var self = this;
        var store = Ext.getStore("ItemStore");
        
        store.load({
            params : {
               domain : [["_id","=",itemId]]
            },    
            scope: self,
            callback: function(itemRecords, operation, success) {
                self.setItem(itemRecords[0], callback);
            }
        });            
            
    },       
    
    loadHeaderValues: function(record, callback) {
    
        // if record is null,
        // return
        if ( !record ) {
            callback(null,null);
            return;
        }
    
        var self = this;
        var db = Config.getDB();
        var store = Ext.getStore("HeaderItemStore");
        
        store.load({
            params : {
               domain : [["parent_id","=",record.getId()]]
            },    
            scope: self,
            callback: function(itemRecords, operation, success) {
                if (success) {
                
                    var items = [{
                        xtype: 'textfield',
                        name: 'name',
                        label: 'Name',
                        required: true
                    }];
                    
                    var values = {
                        name: record.get('name') 
                    };
                    
                    
                    // check show view funciton
                    var callbackBarrier = new futil.Barrier( function() {
                        
                        items.push({
                            xtype: 'textareafield',
                            name: 'valt',
                            label: 'Beschreibung',
                            maxRows: Config.getMaxRows()
                        });
                        
                        callback(items, values);
                    });        
                    
                    // build mask                    
                    Ext.each(itemRecords, function(itemRecord) {                        
                        var name = itemRecord.getId();
                        var data = itemRecord.getData();
                        var dtype = data.dtype;
                        var field = null;
                        var vtype = null;
                        
                        if ( dtype ) {
                            switch (dtype) {                                
                                case "i":
                                    field = {
                                        xtype: 'numberfield'
                                    };
                                    vtype = "vali";
                                    values[name]=data.vali;
                                    break;
                                case "f":
                                    field = {
                                        xtype: 'textfield'
                                    };
                                    vtype = "valf";
                                    values[name]=data.valf;
                                    break;
                                case "c":
                                    field = {
                                        xtype: 'textfield'
                                    };
                                    vtype="valc";
                                    values[name]=data.valc;
                                    break;
                                case "t":
                                    field = {
                                        xtype: 'textareafield'
                                    };
                                    vtype = "valt";
                                    values[name]=data.valt;
                                    break;
                                case "b":
                                    field = {
                                        xtype: 'togglefield'
                                    };
                                    vtype = "valb";
                                    values[name]=data.valb;
                                    break;    
                                case "d":
                                    field = {
                                        xtype: 'datepickerfield'                                       
                                    };
                                    vtype = "vald";
                                    values[name]=data.vald;
                                    break; 
                            }
                            
                        } else { 
                            var rtype = data.rtype;
                            switch (rtype) {
                                case "partner_id":
                                    field = {
                                        xtype: 'listselect',
                                        autoSelect: false,
                                        navigationView: self.getMainView(),
                                        store: 'PartnerStore',
                                        displayField: 'name',    
                                        title: data.name,                                   
                                        pickerToolbarItems: [{
                                            xtype: 'button',
                                            iconCls: 'add',
                                            align: 'right',
                                            action: 'newPartner'      
                                        }]
                                    };
                                    vtype = "partner_id";
                                    values[name]=data.partner_id;
                                    break;
                                    
                                case "pricelist_id":
                                    field = {
                                        xtype: 'listselect',
                                        title: data.name,
                                        autoSelect: false,
                                        navigationView: self.getMainView(),
                                        store: 'PricelistStore',
                                        displayField: 'name'
                                    };
                                    vtype = "pricelist_id";
                                    values[name]=data.pricelist_id;
                                    break;
                            }
                        }
                        
                        // finalize field
                        if ( field ) {
                            field.name = name;
                            field.label = data.name;
                            field.item = data;
                            field.vtype = vtype;
                            
                            if ( data.required ) {
                                field.required = true;
                            }
                            items.push(field);
                            
                            // check if is an model value                                                    
                            if (field.xtype == 'listselect' && values[name]) {
                                var store = Ext.getStore(field.store);
                                var proxy = store.getProxy();
                                if ( proxy instanceof Ext.proxy.PouchDB ) {
                                    // increment barrier
                                    callbackBarrier.add();
                                    proxy.readDocument(values[name], function(err, rec) {
                                        values[name] = rec;
                                        // test barrier
                                        callbackBarrier.test();
                                    });                            
                                }
                            }
                               
                        }
                    }); 
                    
                    // test barrier
                    callbackBarrier.test();
                }
            }
        });
    },
    
           
    editItem: function(record, noselect) {
        // edit only if non type
        if ( !record || record.dtype ) {
            return;
        }

        var self = this;
        var db = Config.getDB();
        var store = Ext.getStore("HeaderItemStore");
        
        var showView = function(items, values) {
              var view = Ext.create("Fclipboard.view.FormView", {
                    title: values.name,
                    record: record,
                    scrollable: true,      
                    items: items,
                    editable: true,
                    deleteable: true,
                    saveHandler: function(view, callback) {
                    
                            var newValues = view.getValues();
                            var db = Config.getDB();
                            
                            db.get(record.getId()).then(function(doc) {     
                                                     
                                //field update
                                var updateItemIndex=0;
                                var updateItem = function() {
                                    if ( updateItemIndex < items.length ) {
                                        
                                        // get field data
                                        var item = items[updateItemIndex++];
                                        //var field = view.query("field[name='"+item.name+"']");
                                        
                                        // check field exist and 
                                        // item was from a record
                                        if ( item.item ) {
                                            db.get(item.name).then(function(doc) {
                                                doc[item.vtype]=newValues[item.name];
                                                // update 
                                                db.put(doc).then(function(res) {
                                                    updateItem();
                                                }).catch(function(err) {
                                                    callback(err);
                                                });     
                                                                                                   
                                            }).catch(function(err) {
                                                callback(err);      
                                            });
                                            
                                        } else {
                                            updateItem(); 
                                        }
                                    } else {
                                        //***********************************
                                        //finished
                                        //***********************************
                                         if ( noselect ) {
                                            // if no select only load
                                            self.loadItem(callback);      
                                        } else {
                                            self.selectId(record.getId(), callback);
                                        }
                                    }
                                };
                            
                                // update name
                                doc.name = newValues.name;
                                doc.valt = newValues.valt;
                                db.put(doc).then(function(res) {
                                    updateItem();
                                }).catch(function(err) {
                                    callback(err);
                                });
                            }).catch(function(err) {
                                callback(err);
                            });
                        }
                });
                
                // set values
                view.setValues(values);
                
                // show view
                self.getMainView().push(view);      
        };
     
        self.loadHeaderValues(record, showView); 
    },
              
    getMatchingRules: function() {
        var self = this;        
        var matching = [];
                
        if ( self.record ) {
            var rules = self.record.get('rule_ids');
            
            // get parent rules
            if ( !rules && self.path ) {
                Ext.each(self.path, function(parent_record) {
                    var parent_rules = parent_record.get('rule_ids');
                    if ( parent_rules ) {
                        rules = parent_rules;
                    } 
                });
            }
            
            // process rules
            if (rules) {        
                Ext.each(rules, function(rule) {
                    //TODO: real xpath
                    var pathLength = self.path && self.path.length || 0;
                    if ( rule.xpath == "/" && pathLength === 0 ) {
                        matching.push(rule);
                    } else if ( rule.xpath == "/*/" && pathLength == 1  ) {
                        matching.push(rule);
                    } else if ( rule.xpath == "/*//" && pathLength >= 1  ) {
                        matching.push(rule);
                    }
                });
            }        
        }
        
        return matching;
    },
    
    setItem: function(item, callback) {
        var self = this;
            
        if (self.record !== null && self.record !== item && (item === null || item.getId() !== self.record.getId()) ) {
            self.path.push(self.record);
        }
      
        self.record = item;
        self.loadItem(callback);
    },
    
    selectItem: function(list, index, element, record) {
        var self = this;        
                
        //check for product selection
        if ( record.get('rtype') == "product_id" && record.get('section') == 20 ) {
            var store = Ext.getStore("ItemStore");
            Config.showNumberInput(element, record.get('valf'), record.get('name'),
                // Handler 
                function(view, newValue) {
                    if ( newValue !== 0.0 ) {
                        record.set('valf',newValue);                                     
                    } else {
                        store.remove(record);                  
                    }
                    store.sync();
                },
                // Edit Handler
                function(view, newValue) {
                    self.editItem(record, true);
                }                
            );
        } else {
           self.setItem(record);
        }
    },
    
    parentItem: function() {
        var parentRecord = null;
        if ( this.path.length > 0 ) {
            parentRecord = this.path.pop();           
        } 
        this.record = parentRecord;
        this.loadItem();
    },
    
    newItem: function() {  
        var self = this;        
        var rules = self.getMatchingRules();
        
        //TODO real rule processing
        if ( rules.length == 1 ) {       
            var rule = rules[0];
            if ( rule.type == "folder" ) {
                self.createItem(rule.name, true);
            } else if ( rule.type == "product") {
                self.addProduct(rule.name);
            }        
        } else {
        
            if ( !self.record || !self.pricelist ) {        
                self.createItem();
            } else {
            
                var itemStore = Ext.getStore("ItemStore");
                var productItems = [];
                
                Ext.each(itemStore.data.all,function(item)  {
                    if ( item.get('rtype') == 'product_id') {
                        productItems.push(item);
                    }
                });
              
                if ( itemStore.data.all.length === 0 ) {
                     var newItemPicker = Ext.create('Ext.Picker',{
                        doneButton: 'Erstellen',
                        cancelButton: 'Abbrechen',
                        modal: true,
                        slots:[{
                            name: 'option',
                            title: 'Element',
                            displayField: 'name',
                            valueField: 'option',
                            data: [
                                {
                                    "name" : "Produkt",
                                    "option" : 1
                                },
                                {
                                    "name" : "Ordner",
                                    "option" : 0  
                                }
                            ]
                        }],               
                        listeners: {
                            change: function(picker,button) {
                                var option = picker.getValue().option;
                                if ( option === 1) {
                                    self.addProduct();                                
                                } else {
                                    self.createItem();
                                }
                            }
                        } 
                    });
                    
                    Ext.Viewport.add(newItemPicker);
                    newItemPicker.show();
                    
                } else if ( productItems.length === 0 ) {
                    self.createItem();
                } else {
                    self.addProduct();
                }
            }
            
        }  
    },
    
    addProduct: function(title) {
        var self = this;
        
        // check doubletap 
        if ( futil.isDoubleTap() ) {
            return;
        }
            
        futil.startLoading("Lade Preisliste");
        if ( self.pricelist && self.record) {
            var db = Config.getDB();
            
            // order 
            var order = {};
            var orderItems = {};
            
            //show pricelist view
            var showPriceListView = function() {
                 var view = Ext.create("Fclipboard.view.PricelistView", {

                       title: title || self.pricelist.name,
                       pricelist: self.pricelist,
                       order: order,
                       
                       listeners: {
                            "show" : function() {
                              futil.stopLoading();
                            }    
                       },
                                                     
                       saveHandler: function(view, callback) {
                          var update = [];
                          var newOrder = view.getOrder();
                          // update create new                     
                          Ext.iterate(newOrder, function(product_id, line) {                                    
                                if ( product_id in orderItems ) {
                                    var doc = orderItems[product_id];
                                    if ( doc.valf !== line.qty || doc.name !== line.name ) {
                                        if ( line.qty === 0.0 ) {
                                            // delete
                                            update.push({
                                                _id : doc._id,
                                                _rev : doc._rev,
                                                _deleted : true
                                            });   
                                        } else {
                                            doc.name=line.name;
                                            doc.valf=line.qty;
                                            doc.code=line.code;
                                            doc.valc=line.uom;  
                                            doc.sequence=line.sequence; 
                                            doc.group=line.category;                                             
                                            update.push(doc);
                                        }
                                    }
                                } else if ( line.qty !== 0.0 ) {
                                    update.push({
                                        fdoo__ir_model : "fclipboard.item",
                                        product_id : product_id,
                                        name : line.name,  
                                        parent_id : self.record.getId(),
                                        section : 20,
                                        rtype : "product_id",
                                        dtype : "f",
                                        valf : line.qty,
                                        code : line.code,
                                        valc : line.uom,
                                        sequence : line.sequence,
                                        group : line.category                                           
                                     });
                                }
                          });
                          
                          // update and do callback
                          db.bulkDocs(update, function(err, res) {
                              callback(err);
                          });
                           
                       }
                   });
                       
                self.getMainView().push(view);   
            };
            
            
            // search current items
            var store = Ext.getStore("ItemStore");
            Ext.each(store.data.all, function(item) {
                    var doc = item.raw;
                    //create order line
                    order[doc.product_id]={
                        name : item.get('name'),
                        qty : item.get('valf'),
                        uom : item.get('valc'),
                        code : item.get('code'),
                        product_id : item.get('product_id'),
                        sequence: item.get('sequence'),
                        category: item.get('group')
                    };                    
                    orderItems[doc.product_id]=doc;
            }); 
         
            showPriceListView();
        }
    }
    
});