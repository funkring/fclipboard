/*global Ext:false*/

Ext.define('Fclipboard.store.PricelistItemStore', {
    extend: 'Ext.data.Store',    
    config: {        
        model: 'Fclipboard.model.PricelistItem',
        
        sorters: [{
                       property: 'category',
                       direction: 'ASC'
                  },
                  {
                       property: 'sequence',
                       direction: 'ASC'
                  }],
                  
        grouper: function(record) {
            return record.get('category');
        } 
    }
});
