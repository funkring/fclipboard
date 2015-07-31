/*global Ext:false*/
Ext.define('Fclipboard.model.Pricelist', {
   extend: 'Ext.data.Model',
   requires: [
       'Ext.proxy.PouchDB'
   ],
   config: {
       fields: ['name'],
       identifier: 'uuid',
       proxy: {           
            type: 'pouchdb',
            database: 'fclipboard',
            view:  '_jdoc_fclipboard',
            resModel: 'product.pricelist'
        }
   } 
});