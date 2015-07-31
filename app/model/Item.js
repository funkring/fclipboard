/*global Ext:false*/
Ext.define('Fclipboard.model.Item', {
   extend: 'Fclipboard.model.BasicItem',   
   config: {      
       proxy: {
            type: 'pouchdb',
            database: 'fclipboard',
            domain: [['template','=',false],['section','=',20]]
       }       
   }
});