
/**
 * funkring util lib
 */
var futil = {
    comma: ","
};


futil.formatFloat = function(num, digits) {    
    if ( !num) {
        num = 0.0;
    }
    
    if (digits === 0) {
        return num.toString().replace(".",futil.comma);    
    } else if (!digits) {
        digits=2;
    }
    
    return num.toFixed(digits).replace(".",futil.comma);  
};


futil.parseFloat = function(num) {
    if (!num) {
        return 0.0;
    }
    return parseFloat(num.replace(futil.comma,"."));
};


futil.Barrier = function(callback, args) {
  this.callback = callback;
  this.ref = 1;
  
  this.add = function(count) {
    if ( count ) {
        this.ref+=count;   
    } else {
        this.ref++;
    }  
  };
  
  this.test = function() {
    if ( --this.ref === 0 ) {
        this.callback(args);
    }      
  };
    
};
