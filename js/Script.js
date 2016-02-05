  // geometrical parameters
  var pix = 10; //diameter of the pixels
  var svgW = 3*(pix * 28);
  var svgH = 3*(pix * 28);
  var pixOffR = 1.5;
  var pixOnR = (pix/2);
  var hiddenNeuronR = 2;
  var outputNeuronR = 35;
  var hiddenR = 220;
  var outputR = 350;
  var brushR2 = 300;
  var LhiddenBar = 70;
  var sinapsis23maxR = 6;

  // animation parameters
  var TpixEnd = 200; // duration to fade a input pixel after its sinapsis has started
  var Dpix = 100; // delay between consecutive pixel sinapsis
  var Tsinapsis12 = 1000; // duration of sinapsis between input layer and hidden layer
  var ThiddenBar = 100; // duration of transition of bars at hidden layer
  var Tsinapsis23Blow = 500; // duration of sinapsis 23 signal blow
  var Tsinapsis23Expand = 500; // duration of sinapsis between hidden layer and output layer
  var Tsinapsis23Rotate = 2000; // duration of rotation of signal thru output layer

    var s12Scale = d3.scale.linear()
                    .range([8,0.5])
                    .domain([0,1]);

    var s3Scale = d3.scale.linear()
                    .range([20,55])
                    .domain([0,1]);

    var valueScale = d3.scale.linear()
                        .range([-1,1])
                        .domain([pixOffR,pixOnR]);

    var renderPath = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("basis");

    // var wColor = d3.scale.linear()
    //       .domain([-0.5,0.5])
    //       .range(['green','blue']);

    var drag = d3.behavior.drag()
                  .on("drag", dragged)
                  .on("dragend", dragended);

    // globals
    var totalTime = Infinity;
    var t0;

    function dragged() {
      var coords = d3.mouse(this);

      d3.select('#inputPanel')
        .selectAll('circle')
       .filter(function(d,i){
         var thisPixel = d3.select(this);
         var cx = thisPixel.attr('cx');
         var cy = thisPixel.attr('cy');
         var dist2 = Math.pow(cx-coords[0],2) + Math.pow(cy-coords[1],2);
         return dist2 < brushR2;
       })
       .attr('r',function(d,i){
         var thisPixel = d3.select(this);
         var cx = thisPixel.attr('cx');
         var cy = thisPixel.attr('cy');
         var r = thisPixel.attr('r');
         var dist2 = Math.pow(cx-coords[0],2) + Math.pow(cy-coords[1],2);
         return _.max([r, pixOnR*Math.sqrt(1-dist2/brushR2)]);
       })
       .attr('class','pixOn')
       .style('fill','blue');
    }

    function dragended() {
      // needed for pulsing
      t0 = new Date();

      // build the input data (ON pixels are +1 all the way to OFF pixels, which are -1)
      data = new Array(784);
      d3.select('#inputPanel')
        .selectAll('circle')
        .each(function(d,i){
          // data[i] = (d3.select(this).attr('class') == 'pixOn') ? 1 : -1;
          var thisPixel = d3.select(this);
          var value = thisPixel.attr('r');
          data[i] = valueScale(value);
        });

      // animate w12 sinapsis
      var newPixels = d3.selectAll('.pixOn');//.filter(function(d){return d3.select(this).style('fill')=='rgb(0, 0, 0)'});

      var numPixOn = 0;
      newPixels.each(function(d,i){
        numPixOn += 1;
        var thisPixel = d3.select(this);

        var cx = thisPixel.attr('cx');
        var cy = thisPixel.attr('cy');
        var item = i;
        var row = +thisPixel.attr('id').split('_')[1];
        var col = +thisPixel.attr('id').split('_')[2];
        var j = row + col * 28;

        //indicate the active pixel
        thisPixel
          .transition().duration(TpixEnd).ease('linear').delay(Dpix*item)
          .style('fill','gray');

        //enter sinapsis circles
        svg.append('circle')
              .attr('class','sinapsis12')
              .attr('r',1)
              .attr('cx',cx)
              .attr('cy',cy)
              .style('stroke-width',s12Scale(w12TransposeReg[j]))
            .transition().duration(Tsinapsis12).ease('linear').delay(Dpix*item)
              .attr('r',hiddenR)
              .attr('cx',svgW/2)
              .attr('cy',svgW/2)
            .remove();

        out2 = _.map(out2,function(d, i){return d + w12[i][j] + data[j] * w12[i][j];});
        out2Reg = _.map(out2,function(d){return 1 / (1 + Math.exp(-d));});

        d3.selectAll('.lineBar')
          .transition().duration(ThiddenBar).delay(Tsinapsis12 + Dpix * item)
          .attr('x2',function(d,i){
            return LhiddenBar * out2Reg[i];
          });

      });

      // animate w23 sinapsis
      var Gsinapsis23 = svg.append('g').attr('transform','translate('+(svgW/2)+','+(svgW/2)+')');

      var sinapsis23 = Gsinapsis23.selectAll('sinapsis23')
              .data(out2Reg)
              .enter()
              .append('circle')
              .attr('class','sinapsis23')
              .attr('r',0)
              .attr('cx',function(d,i){return (hiddenR + d * LhiddenBar) * Math.cos(2*Math.PI*i/200);})
              .attr('cy',function(d,i){return (hiddenR + d * LhiddenBar) * Math.sin(2*Math.PI*i/200);});

      sinapsis23 //blowing signals
            .transition().duration(Tsinapsis23Blow).delay(Tsinapsis12 + Dpix * numPixOn + ThiddenBar)
            .attr('r',function(d){return sinapsis23maxR*d;});

      sinapsis23 //expanding signals
            .transition().duration(Tsinapsis23Expand).delay(Tsinapsis12 + Dpix * numPixOn + ThiddenBar + Tsinapsis23Blow)
            .attr('cx',function(d,i){return outputR * Math.cos(2*Math.PI*i/200);})
            .attr('cy',function(d,i){return outputR * Math.sin(2*Math.PI*i/200);});

      Gsinapsis23 //rotating signals (must split in two rotations for the transition to work)
            .transition().ease('cubic-in').duration(Tsinapsis23Rotate/2).delay(Tsinapsis12 + Dpix * numPixOn + ThiddenBar + Tsinapsis23Blow + Tsinapsis23Expand)
            .attr('transform','translate('+(svgW/2)+','+(svgW/2)+')rotate(180)')
            .transition().ease('cubic-out').duration(Tsinapsis23Rotate/2).delay(Tsinapsis12 + Dpix * numPixOn + ThiddenBar + Tsinapsis23Blow + Tsinapsis23Expand + Tsinapsis23Rotate/2)
            .attr('transform','translate('+(svgW/2)+','+(svgW/2)+')rotate(358.2)');

      sinapsis23 //blowing signals
            .transition().duration(Tsinapsis23Blow).delay(Tsinapsis12 + Dpix * numPixOn + ThiddenBar + Tsinapsis23Blow + Tsinapsis23Expand + Tsinapsis23Rotate)
            .attr('r',0)
            .remove();

      //compute layer3 activation
      var out3 = _.map(w23,function(d,i){return bias3[i]+d.dot(out2Reg);});

      // compute layer3 output (softmax)
      var max3 = _.max(out3);
      var nominators = _.map(out3,function(d) {return Math.exp(d - max3); });
      var denominator = nominators.sum();
      var output = _.map(nominators,function(d) {return d / denominator; });

      maxIndex = 0;
      output.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});
      outputTrans = _.map(output,function(d){return 1/(1-Math.log10(d));});
      // console.log(maxIndex);
      // console.log(output)

      // obsolete way
      // maxIndex = 0;
      // var nnOutput = nn(data, w12, bias2, w23, bias3);
      // nnOutput.reduce(function(p,c,i){if(p<c) {maxIndex=i; return c;} else return p;});
      // console.log('maxIndex: '+maxIndex);

      // animate output layer
      d3.selectAll('.outputCircle')
          .data(outputTrans)
        .transition().duration(Tsinapsis23Rotate).delay(Tsinapsis12 + Dpix * numPixOn + ThiddenBar + Tsinapsis23Blow + Tsinapsis23Expand)
          .style('fill',function(d){
            var grc = String((1-d)*255);
            return 'rgb('+grc+','+grc+','+grc+')';})
            // return 'rgb(0,0,'+grc+')';})
          .attr('r',function(d){return s3Scale(d);});

      totalTime = Tsinapsis12 + Dpix * numPixOn + ThiddenBar + Tsinapsis23Blow + Tsinapsis23Expand + Tsinapsis23Rotate;
      predictedCircle = d3.selectAll('.outputCircle').filter(function(d,i){return i==maxIndex;});

      d3.selectAll('.outputText')
          .data(outputTrans)
        .transition().duration(Tsinapsis23Rotate).delay(Tsinapsis12 + Dpix * numPixOn + ThiddenBar + Tsinapsis23Blow + Tsinapsis23Expand)
          .style('fill',function(d){
            var grc = String(d*255);
            return 'rgb('+grc+','+grc+','+grc+')';});
            // return 'rgb(0,0,'+grc+')';});


      // remove drag behavior to prevent writing a second time before reseting
      svg.on('.drag', null);
      resetButton.style('display','none');
      // svg.on('click',function(){svg.call(drag);})
      // svg.on('click',reset)

    }


    //pulsing animation of the predicted digit
    // predictedCircle = d3.selectAll('.outputCircle').filter(function(d,i){return i==-1;});
    d3.timer(function(t){
      var dt = new Date() - t0;
      if (dt > totalTime) {
        var factor = 3*Math.sin(t/100);
        predictedCircle
            .attr('r',function(d){return s3Scale(outputTrans[maxIndex]) + factor;});
        resetButton.style('display','inline');
      }
    });

    //SVGs
    var svg = d3.select('#container')
                .append('svg')
                .attr('id','svg')
                .attr('width',svgW)
                .attr('height',svgH)
              .call(drag);

    //pixels
    var inputPanel = svg.append('g').attr('id','inputPanel')
    inputPanel.selectAll('circle')
      .data(_.range(28*28))
      .enter()
      .append('circle')
      .attr('id',function(d){return 'RowCol_'+String(d % 28)+'_'+String(Math.trunc(d/28));})
      .attr('class','pixOff')
      .attr('r',pixOffR)
      .attr('cx',function(d){return (pix * 28) + pix/2 + Math.trunc(d/28)*pix;})
      .attr('cy',function(d){return (pix * 28) + pix/2 + d % 28*pix;});

    //hidden layer
    var hidden = svg.selectAll('hiddenNeuron')
            .data(_.range(200))
            .enter()
            .append('g')
            .attr('class','hiddenNeuron')
            .attr('transform',function(d){
              var cx = svgW/2 + hiddenR * Math.cos(2*Math.PI*d/200);
              var cy = svgW/2 + hiddenR * Math.sin(2*Math.PI*d/200);
              var ang = 360 * d/200;
              return 'translate('+cx+','+cy+')rotate('+ang+')';
            });

    //circles of hidden layer
    hidden
        .append('circle')
        .attr('class','hiddenCircle')
        .attr('r',hiddenNeuronR)
        .attr('cx',0)
        .attr('cy',0);

    //radial bars that will encode the output of layer 2
    hidden
        .append('line')
        .attr('class','lineBar')
        .attr('x1',0)
        .attr('x2',0)
        .attr('y1',0)
        .attr('y2',0);

    //compute output2 from empty input (all -1)
    var out2 = _.map(w12,function(d,i){return bias2[i]-d.sum();});
    var out2Reg = _.map(out2,function(d){return 1 / (1 + Math.exp(-d));});

    //initial bars at the hidden layer
    d3.selectAll('.lineBar')
      .attr('x2',function(d,i){
        return LhiddenBar * out2Reg[i];
      });

    //needed later to encode stroke-width of circles in sinapsis12
    var w12Transpose = _.zip.apply(_,w12);
    var w12TransposeReg = _.map(w12Transpose,function(d){return 1 / (1 + Math.exp(-d.sum()));});

    //output layer
    var outputDigits = svg.selectAll('outputDigit')
            .data(_.range(10))
            .enter()
            .append('g')
            .attr('class','outputDigit')
            .attr('transform',function(d){
              var cx = svgW/2 + outputR * Math.cos(2*Math.PI*d/10);
              var cy = svgW/2 + outputR * Math.sin(2*Math.PI*d/10);
              return 'translate('+cx+','+cy+')'
            });

    outputDigits.append('circle')
            .attr('class','outputCircle')
            .attr('r',outputNeuronR)
            .attr('cx',0)
            .attr('cy',0);

    outputDigits.append('text')
            .attr('class','outputText')
            .attr('x',0)
            .attr('y',14)
            .text(function(d){return d;});

    // restart button
    var resetButton = svg.append('g')
      .attr('transform','translate('+(svgW/2)+','+(svgW/3.5)+')')
        .append('image')
        .attr('id','resetButton')
        .attr('alt','reset')
        .attr('width',(svgW/10))
        .attr('height',(svgW/10))
        .attr('x',(-svgW/20))
        .attr('y',(-svgW/20))
        .attr('xlink:href','images/reset.svg')
        .style('display','none')
        .on('click',reset);

    function reset(){
      // hide reset button
      resetButton.style('display','none');

      // restore drag behavior
      svg.call(drag);

      // stop pulsing
      totalTime = Infinity;

      // reset output values to the empty input situation
      out2 = _.map(w12,function(d,i){return bias2[i]-d.sum();});
      out2Reg = _.map(out2,function(d){return 1 / (1 + Math.exp(-d));});

      // reset view to initial situation
      d3.select('#inputPanel')
          .selectAll('circle')
          .transition()
          .attr('class','pixOff')
          .style('fill','green')
          .attr('r',pixOffR);

      d3.selectAll('.lineBar')
                .transition()
                .attr('x2',function(d,i){
                  return LhiddenBar * out2Reg[i];
                });

      d3.selectAll('.outputCircle')
                .transition()
                .attr('r',outputNeuronR)
                .style('fill','white');

      d3.selectAll('.outputText')
                .transition()
                .style('fill','black');


    }
