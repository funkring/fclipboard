/*global Ext:false*/
Ext.define('Fclipboard.model.PricelistItem', {
   extend: 'Ext.data.Model',
   config: {
       fields: ['product_id','name','uom','code','category','sequence']
   }
});