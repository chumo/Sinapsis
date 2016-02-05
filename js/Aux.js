Array.prototype.sum = function(){
    return _.reduce(this,function(a,b){return a+b;});
}

Array.prototype.dot = function(B){
    var aux = _.map(this,function(d,i){return d*B[i];});
    return aux.sum();
}

function linspace(a,b,N) {
  var aux = _.range(N);
  return _.map(aux,function(d){return a+d*(b-a)/(N-1);});
}

function interpolateArray(dt, fitCount) { // http://stackoverflow.com/a/26941169/4564295

  var linearInterpolate = function (before, after, atPoint) {
    return before + (after - before) * atPoint;
  };

  var newData = new Array();
  var springFactor = new Number((dt.length - 1) / (fitCount - 1));
  newData[0] = dt[0]; // for new allocation
  for ( var i = 1; i < fitCount - 1; i++) {
    var tmp = i * springFactor;
    var before = new Number(Math.floor(tmp)).toFixed();
    var after = new Number(Math.ceil(tmp)).toFixed();
    var atPoint = tmp - before;
    newData[i] = linearInterpolate(dt[before], dt[after], atPoint);
  }
  newData[fitCount - 1] = dt[dt.length - 1]; // for new allocation
  return newData;
}

function linearRegression(y,x){ // http://stackoverflow.com/a/31566791/4564295
  var lr = {};
  var n = y.length;
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;

  for (var i = 0; i < y.length; i++) {

    sum_x += x[i];
    sum_y += y[i];
    sum_xy += (x[i]*y[i]);
    sum_xx += (x[i]*x[i]);
    sum_yy += (y[i]*y[i]);
  }

  lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
  lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
  lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

  return lr;
}

function normalize(arr) {
  var M = _.max(arr);
  var m = _.min(arr);
  return _.map(arr,function(d){return (d - m)/(M-m);});
}

function AAD(arr) { //Average absolute deviation of an array
  var dev = _.map(arr, function(d){return Math.abs(d-mean(arr))});
  return numeric.sum(dev)/N;
}

function mean(arr) { //mean value
  var N = arr.length
  return numeric.sum(arr)/N;
}


// Interpolator class
function Interpolator(vecX, vecY) {
  this.vecX = vecX;
  this.vecY = vecY;
  this.np = vecX.length;
  this.Y = Y;
};

function Y(X) { //we assume that vecX is increasing monotonically.
  if (X<this.vecX[0]) return this.vecY[0];
  if (X>this.vecX[this.vecX.length-1]) return this.vecY[this.vecY.length-1];
  var pivot = (this.vecX.filter(function(x){return x <= X})).length-1;
  if (pivot == this.np-1) {
    return this.vecY[pivot];
  } else {
    return this.vecY[pivot] + (this.vecY[pivot+1] - this.vecY[pivot])*(X - this.vecX[pivot])/(this.vecX[pivot+1] - this.vecX[pivot]);
  };
};
//////



function characteristics(arr) {
  // Returns the list of features (coordinates after normalization) and box characteristics
      // resample
      var x = _.map(arr, function(d){return d[0];});
      var y = _.map(arr, function(d){return d[1];});
      var t = _.map(arr, function(d,i){return Math.sqrt(Math.pow(x[i]-x[i-1],2) + Math.pow(y[i]-y[i-1],2));});
      t[0] = 0;
      _.map(t,function(d,i){ if(i > 0) t[i] += t[i-1]; }); // cummulative sum (http://stackoverflow.com/a/11891182/4564295)
      var t_int = linspace(0, t[t.length-1], NS) // regular spaced path // inspired by http://stackoverflow.com/a/24230980/4564295
      var fx = new Interpolator(t,x);
      var fy = new Interpolator(t,y);
      var x_int = _.map(t_int, function(d){return fx.Y(d)});//interpolateArray(x, NS);
      var y_int = _.map(t_int, function(d){return fy.Y(d)});//finterpolateArray(y, NS);

      // horizontalize
      // var lr = linearRegression(y_int, x_int);

      // //var x_hor = x_int;
      // //var y_hor = _.map(y_int, function(d,i){return y_int[i] - (lr.intercept + lr.slope * x_int[i]);});
      // var alpha = Math.atan(lr.slope);
      // var x_hor = _.map(x_int, function(d,i){return x_int[i]*Math.cos(alpha) + y_int[i]*Math.sin(alpha);});
      // var y_hor = _.map(y_int, function(d,i){return -x_int[i]*Math.sin(alpha) + y_int[i]*Math.cos(alpha);});

      // vector of angles
      var v_angs = _.map(t_int, function(d,i){return Math.atan2(y_int[i]-y_int[i-1],x_int[i]-x_int[i-1])});
      v_angs = _.rest(v_angs,1); // drop the first element, then there are NS-1 features

      // substract minimum angle to skip rotations
      var min_ang = _.min(v_angs);
      var v_final = _.map(v_angs, function(d){return d - min_ang;});

      // normalize
      // var x_norm = normalize(x_hor);
      // var y_norm = normalize(y_hor);
      //var v_norm = normalize(v_angs);

      // rotate index to substract phase (phase ~ where the path starts for a given object)
      // var new_0 = _.indexOf(v_norm, _.min(v_norm));
      // var v_final = _.map(v_norm,function(d,i){return v_norm[(i+new_0)%v_norm.length]});

      // add the Average absolute deviation (this feature should be very small for lines as compared to others)
      //v_final.push(AAD(v_angs));

      // // bb object with various calculated characteristics
      // var pP = polyParam(v_angs);
      // //var vertices = _.map(pP,function(d){return {x:(x_int[d]-x_int[0]), y:(y_int[d]-y_int[0])};});
      // var cmX = mean(_.map(pP,function(d){return x_int[d];}));
      // var cmY = mean(_.map(pP,function(d){return y_int[d];}));
      // var vertices = _.map(pP,function(d){return {x:(x_int[d]-cmX), y:(y_int[d]-cmY)};});
      // var bb = {minX: _.min(x),
      //   cX: (_.min(x)+_.max(x))/2, //center of boinding box
      //   maxX: _.max(x),
      //   minY: _.min(y),
      //   cY: (_.min(y)+_.max(y))/2,
      //   maxY: _.max(y),
      //   r: ((_.max(x)-_.min(x))/2 + (_.max(y)-_.min(y))/2)/2,
      //   x1: x[0],
      //   x2: x[x.length-1],
      //   y1: y[0],
      //   y2: y[y.length-1],
      //
      //   diag: Math.sqrt(Math.pow(x[x.length-1]-x[0],2) + Math.pow(y[y.length-1]-y[0],2)),
      //   ang: -90+(180/Math.PI)*Math.atan2(y[y.length-1]-y[0],x[x.length-1]-x[0]),
      //
      //   cmX: cmX,//center of mass
      //   cmY: cmY,
      //   vertices: vertices}; //respect to cmX,cmY

        //angToHoriz: (180/Math.PI)*min_ang};

      // return converted coordinates. bb object is global
      //return x_norm.concat(y_norm);
      return {'features':v_final};//,'bb':bb};
    }

/////////////////////

function exportData(DATA){// downloads a json file with the data

      var json = JSON.stringify(DATA);
      var blob = new Blob([json], {type: "application/json"});

        if (navigator.msSaveBlob) { // IE 10+
          navigator.msSaveBlob(blob, 'DATA.json');
        } else {
          var a = document.createElement("a");
                if (a.download !== undefined) { // feature detection
                    // Browsers that support HTML5 download attribute
                    var url = URL.createObjectURL(blob);

                    a.setAttribute("href", url);
                    a.setAttribute("download", 'DATA.json');
                    a.style.visibility = 'hidden';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  };
                };

              };
