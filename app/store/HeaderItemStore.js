/*global Ext:false*/

Ext.define('Fclipboard.store.HeaderItemStore', {
    extend: 'Ext.data.Store',    
    config: {        
        model: 'Fclipboard.model.HeaderItem',
        sorters: [{
                      property: 'sequence',
                      direction: 'ASC'
                  }]
    }
});
