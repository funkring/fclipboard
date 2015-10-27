/*global Ext:false*/
Ext.define('Fclipboard.model.Partner', {
   extend: 'Ext.data.Model',
   requires: [
       'Ext.proxy.PouchDB'
   ],
   config: {
       fields: ['name', 
                'email',
                'mobile',
                'phone',
                'street',
                'sreet2',
                'zip', 
                'city',
                'fax',
                'customer'        
                ],
       identifier: 'uuid',
       proxy: {           
            type: 'pouchdb',
            database: 'fclipboard',
            domain: [['customer','=',true]],
            resModel: 'res.partner'
       },
       deleteChecks: [
       {
          field : "partner_id",
          message: "Ein verwendeter Partner kann nicht gelöscht werden!"
       }]
   } 
});