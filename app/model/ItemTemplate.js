/*global Ext:false*/
Ext.define('Fclipboard.model.ItemTemplate', {
   extend: 'Fclipboard.model.BasicItem',
   config: {       
       proxy: {
            type: 'pouchdb',
            database: 'fclipboard',
            domain: [['template','=',true]]      
       }       
   }
});