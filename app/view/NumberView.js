/*global Ext:false*, Fclipboard:false, futil*/

Ext.define('Fclipboard.view.NumberView', {
    extend: 'Ext.Container',
    xtype: 'numberview',
    cls: 'NumberView',
    config: {
        value: null,
        clsValue: 'NumberView',
        info: null,
        clsInfo: 'NumberInfoView'
    },
    
    updateView: function() {
        var numText = this.getValue() || '';
        var infoText = this.getInfo();
        var html = '<div class="' + this.getClsValue() + '">'+ numText +'</div>';
        if (infoText) {
            html += '<div class="' + this.getClsInfo() + '">'+infoText+'</div>';
        }
        this.setHtml(html);
    },
    
    updateValue: function(value) {
        this.updateView();
    },
    
    updateInfo: function(info) {
        this.updateView();
    }
    
});