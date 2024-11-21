function print_filter(filter) {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}

var data = [
  {date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 100, type: "tab"},
  {date: "2011-11-14T16:20:19Z", quantity: 2, total: 190, tip: 100, type: "tab"},
  {date: "2011-11-14T16:28:54Z", quantity: 1, total: 300, tip: 200, type: "visa"},
  {date: "2011-11-14T16:30:43Z", quantity: 2, total: 90, tip: 0, type: "tab"},
  {date: "2011-11-14T16:48:46Z", quantity: 2, total: 90, tip: 0, type: "tab"},
  {date: "2011-11-14T16:53:41Z", quantity: 2, total: 90, tip: 0, type: "tab"},
  {date: "2011-11-14T16:54:06Z", quantity: 1, total: 100, tip: 0, type: "cash"},
  {date: "2011-11-14T16:58:03Z", quantity: 2, total: 90, tip: 0, type: "tab"},
  {date: "2011-11-14T17:07:21Z", quantity: 2, total: 90, tip: 0, type: "tab"},
  {date: "2011-11-14T17:22:59Z", quantity: 2, total: 90, tip: 0, type: "tab"},
  {date: "2011-11-14T17:25:45Z", quantity: 2, total: 200, tip: 0, type: "cash"},
  {date: "2011-11-14T17:29:52Z", quantity: 1, total: 200, tip: 100, type: "visa"}
];

data.forEach(function(d){
  var tempDate = new Date(d.date);
  d.date = tempDate;
  // console.log(typeof tempDate);
})

var facts = crossfilter(data);

// chart1
var typeDimension = facts.dimension(function(d){ return d.type; }); // set x axis
var typeGroup = typeDimension.group().reduceSum(function(d){ return d.total }); // add together and group

var chart1 = dc.barChart(".chart1")
.margins({top:10, right:20, bottom:20, left: 40})
  .dimension(typeDimension)
  .group(typeGroup)
  .transitionDuration(1500)
  .x(d3.scaleBand().domain(['cash', 'tab', 'visa']))
  .xUnits(dc.units.ordinal)
  .barPadding(0.2)
  .outerPadding(0)
  .yAxis().ticks(5);

// chart2
var totalDimension = facts.dimension(function(d){ return d.total; });
var totalGroup = totalDimension.group(function(d){ return Math.floor(d/100)*100; } );

var chart2 = dc.lineChart(".chart2")
  .margins({top:10, right:20, bottom:20, left: 40})
  .dimension(totalDimension)
  .group(totalGroup)
  .x(d3.scaleLinear().domain([0,301]))
  .xUnits(dc.units.fp.precision(100));
  chart2.yAxis().ticks(5);
  chart2.xAxis().ticks(4);

// chart 3
var dateDimension = facts.dimension(function(d){ return d.date });
var dateGroup = dateDimension.group().reduceSum(function(d){ return d.total; });
var dateGroupTip = dateDimension.group().reduceSum(function(d){ return d.tip });

var minDate = dateDimension.bottom(1)[0].date;
var maxDate = dateDimension.top(1)[0].date;

var chart3 = dc.lineChart(".chart3")
  .margins({top:10, right:20, bottom:20, left: 50})
  .dimension(dateDimension)
  .group(dateGroup, "Total Spent")
  .stack(dateGroupTip, "Tip")
  .yAxisLabel("Transation Amount")
  .renderHorizontalGridLines(true)
  .renderArea(true)
  .legend(dc.legend().x(300).y(10).itemHeight(12).gap(5))
  .x(d3.scaleTime().domain([minDate,maxDate]));
  chart3.yAxis().ticks(5);
  chart3.xAxis().ticks(4);

// chart 4

var all = facts.groupAll();
var sumTotal = all.reduceSum(function(d){ return d.total }).value();

var chart4 = dc.pieChart(".chart4")
  .radius(300)
  .innerRadius(20) // donut
  .dimension(typeDimension)
  // .renderLabel(false)
  .group(typeGroup)
  .title(function(d){ return d.key + ': $'+d.value })
  //.colors(d3.scaleOrdinal(d3.schemePastel2))
  .transitionDuration(1500)
  .label(function(d){ return d.key+':' + Math.round((d.value/sumTotal)*100,0)+'%'; })
  .legend(dc.legend().x(400).y(10).itemHeight(12).gap(5));


dc.renderAll();

// console.log(facts);
//print_filter('dateDimension.top(1)');