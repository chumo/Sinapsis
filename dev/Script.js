
    var renderPath = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("basis");

    var wColor = d3.scale.linear()
          .domain([-0.5,0.5])
          .range(['green','blue']);

    //SVGs
    var svgW = W*1;
    var svgH = H*2;
    var svg = d3.select('#container')
                .append('svg')
                .attr('id','svg')
                .attr('width',svgW)
                .attr('height',svgH);

    svg.append('g')
        .attr('id','layer1')
        .selectAll('circle1')
      .data(_.range(28*28))
        .enter()
        .append('circle')
        .attr('class','circle1')
        .attr('r',1)
        .attr('cx',function(d){return svgW/2+400*Math.cos(2*Math.PI*d/(28*28))})
        .attr('cy',function(d){return svgW/2+400*Math.sin(2*Math.PI*d/(28*28))})

    var axons12 = svg.selectAll('line12')
      .data(_.range(784))
        .enter()
        .append('line')
        .attr('class','line12')
        .attr('x1',function(d,i){return svgW/2+400*Math.cos(2*Math.PI*i/784)})
        .attr('y1',function(d,i){return svgW/2+400*Math.sin(2*Math.PI*i/784)})
        .attr('x2',function(d,i){return svgW/2+200*Math.cos(2*Math.PI*Math.trunc((i+2)/3.92)/200)})
        .attr('y2',function(d,i){return svgW/2+200*Math.sin(2*Math.PI*Math.trunc((i+2)/3.92)/200)})
        .style('stroke-width',1)
        .style('stroke',function(d,i){return wColor(w12[0][i]);})
        .style('stroke-opacity',function(d,i){return 2*Math.abs(w12[0][i]);});

    for (var j = 1; j < w12.length; j++) {
      axons12.transition().delay(j*100).duration(100).ease('linear')
        .style('stroke',function(d,i){return wColor(w12[j][i]);})
        .style('stroke-opacity',function(d,i){return 2*Math.abs(w12[j][i]);});
    }



    svg.selectAll('circle2')
      .data(_.range(200))
        .enter()
        .append('circle')
        .attr('class','circle2')
        .attr('r',2)
        .attr('cx',function(d){return svgW/2+200*Math.cos(2*Math.PI*d/200)})
        .attr('cy',function(d){return svgW/2+200*Math.sin(2*Math.PI*d/200)})

    var axons23 = svg.selectAll('line23')
      .data(_.range(200))
        .enter()
        .append('line')
        .attr('class','line23')
        .attr('x1',function(d){return svgW/2+200*Math.cos(2*Math.PI*d/200)})
        .attr('y1',function(d){return svgW/2+200*Math.sin(2*Math.PI*d/200)})
        .attr('x2',function(d){return svgW/2+50*Math.cos(2*Math.PI*Math.trunc((d+10)/20)/10)})
        .attr('y2',function(d){return svgW/2+50*Math.sin(2*Math.PI*Math.trunc((d+10)/20)/10)})
        .style('stroke-width',1)
        .style('stroke',function(d,i){return wColor(w23[0][i]);})
        .style('stroke-opacity',function(d,i){return 2*Math.abs(w23[0][i]);});

        for (var j = 1; j < w23.length; j++) {
          axons23.transition().delay(j*2000).duration(2000).ease('linear')
            .style('stroke',function(d,i){return wColor(w23[j][i]);})
            .style('stroke-opacity',function(d,i){return 2*Math.abs(w23[j][i]);});
        }

    svg.selectAll('circle3')
      .data(_.range(10))
        .enter()
        .append('circle')
        .attr('class','circle3')
        .attr('r',4)
        .attr('cx',function(d){return svgW/2+50*Math.cos(2*Math.PI*d/10)})
        .attr('cy',function(d){return svgW/2+50*Math.sin(2*Math.PI*d/10)})
