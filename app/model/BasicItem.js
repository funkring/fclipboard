/*global Ext:false*/
Ext.define('Fclipboard.model.BasicItem', {
   extend: 'Ext.data.Model',
   requires: [
       'Ext.proxy.PouchDB'
   ],
   config: {
       fields: ['name','code','template','parent_id','dtype','rtype',
                'section','code','sequence', 'required',
                'product_id', 'pricelist_id', 'partner_id',
                'valc','valt','valf','vali','valb','vald','group'],
//       belongsTo: [{model:'Fclipboard.model.Partner', associationKey:'partner_id'}],
       identifier: 'uuid',
       proxy: {
            type: 'pouchdb',
            database: 'fclipboard',
            resModel: 'fclipboard.item'
       }       
   }
});