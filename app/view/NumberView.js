/*global Ext:false*, Fclipboard:false, futil*/

Ext.define('Fclipboard.view.NumberView', {
    extend: 'Ext.Component',
    xtype: 'numberview',
    cls: 'NumberView',
    config: {
        value: null,
        clsValue: 'NumberView',
        info: null,
        clsInfo: 'NumberInfoView',
        handler: null,
        scope: null
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
    },
    
    initialize: function() {
        var self = this;
        self.callParent();

        this.element.on({
            scope      : self,
            tap        : 'onTap'
        });
    },
    
    onTap: function(e) {
        this.fireAction('tap', [this, e], 'doTap');
    },
    
    doTap: function(me, e) {
        var handler = me.getHandler(),
            scope = me.getScope() || me;

        if (!handler) {
            return;
        }

        if (typeof handler == 'string') {
            handler = scope[handler];
        }

        //this is done so if you hide the button in the handler, the tap event will not fire on the new element
        //where the button was.
        e.preventDefault();

        handler.apply(scope, arguments);
    }
});