$(document).ready(function() {
	var category = ["Environment", "Games", "Fashion", "Technology", "Sports"];
    var categoryShort = ["Env", "Games", "Fashion", "Tech", "Sports"];

    var margin = { top: 50, right: 0, bottom: 100, left: 30 },
        width = 960 - margin.left - margin.right + 24,
        height = 430 - margin.top - margin.bottom,
        gridSize = Math.floor((width - 24) / 24),
        legendElementWidth = gridSize*2,
        buckets = 9,
        bucketVals = [3900, 4300, 4700, 5100, 5500, 5900, 6300, 6700, 7100], // 3512 - 6955
        colors = ["#e5e4e2","#b6b6b4","#848482","#726e6d","#666362","#5c5858","#504a4b","#3d3c3a","#0c090a"],
        catcolors = ["#009966","#6666CC","#CC3366","#CCFF66","#CC6633"], // category colors
        days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12a"];

    var svg = d3.selectAll("div").filter(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    var timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * (gridSize + 1); })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

    var dataset; // time_donation.csv data
    var sqcolor; // color for each square
    var brkdwns; // pixel breakdown for sections for each square
    var txtinfo; // textual info for donation amounts
    var percents; // percentages for gradient fill

    d3.csv("time_donation.csv", function(data) {
        dataset = data;
        extractInfo();
        drawChart();
    });

    function extractInfo() {
        sqcolor = [];

        for (i = 0; i < dataset.length; i++) {
            num = dataset[i]["amt"];
            for (j = 0; j < bucketVals.length; j++) {
                if (num < bucketVals[j]) {
                    sqcolor.push(j);
                    break;
                }
            }
        }

        brkdowns = [];

        for (k = 0; k < dataset.length; k++) {
            toAdd = [0,0,0,0,0];
            scale = (1.0 * gridSize) / (1.0 * (dataset[k]["amt"]));

            toAdd[0] = scale * (1.0 * (dataset[k]["e_amt"]));
            toAdd[1] = scale * (1.0 * (dataset[k]["g_amt"]));
            toAdd[2] = scale * (1.0 * (dataset[k]["f_amt"]));
            toAdd[3] = scale * (1.0 * (dataset[k]["t_amt"]));
            toAdd[4] = scale * (1.0 * (dataset[k]["s_amt"]));
        }

        txtinfo = [];

        for (l = 0; l < dataset.length; l++) {
            txt = ["","","","","",""];

            txt[0] = "Total: $" + (dataset[l]["amt"]).toString();
            txt[1] = category[0] + ": $" + (dataset[l]["e_amt"]).toString();
            txt[2] = category[1] + ": $" + (dataset[l]["g_amt"]).toString();
            txt[3] = category[2] + ": $" + (dataset[l]["f_amt"]).toString();
            txt[4] = category[3] + ": $" + (dataset[l]["t_amt"]).toString();
            txt[5] = category[4] + ": $" + (dataset[l]["s_amt"]).toString();

            txtinfo.push(txt);
        }

        percents = [];

        for (m = 0; m < dataset.length; m++) {
            raw = [0,0,0,0,0];
            clean = [0,0,0,0,0];

            total = dataset[m]["amt"] * 1.0;
            sum = dataset[m]["e_amt"] * 1.0;
            raw[0] = sum / total;
            sum += dataset[m]["g_amt"] * 1.0;
            raw[1] = sum / total;
            sum += dataset[m]["f_amt"] * 1.0;
            raw[2] = sum / total;
            sum += dataset[m]["t_amt"] * 1.0;
            raw[3] = sum / total;
            raw[4] = 1.0;

            clean[0] = raw[0] / 2;
            clean[1] = (raw[0] + raw[1]) / 2;
            clean[2] = (raw[1] + raw[2]) / 2;
            clean[3] = (raw[2] + raw[3]) / 2;
            clean[4] = (raw[3] + raw[4]) / 2;

            percents.push(clean);
        }
    }

    function drawChart() {
        var cards = svg.selectAll(".hour")
          .data(dataset);

        //cards.append("title");
        var div = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);

        cards.enter().append("rect")
            .attr("x", function(d) { return (d.hour - 1) * (gridSize + 1); })
            .attr("y", function(d) { return (d.day - 1) * (gridSize + 1); })
            .attr("rx", 4)
            .attr("ry", 4)
            //.attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", function(d,i) { return colors[sqcolor[i]]; })
            .on("mouseover", function(d, i) {      
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html((txtinfo[i][0])+"<br/>"+(txtinfo[i][1])+"<br/>"+(txtinfo[i][2])+"<br/>"+(txtinfo[i][3])+"<br/>"+(txtinfo[i][4])+"<br/>"+(txtinfo[i][5]))  
                    .style("left", (d3.event.pageX + 30) + "px")     
                    .style("top", (d3.event.pageY + 20) + "px");

                //d3.select(this).style("fill", catcolors[0]);

                var gradient = svg.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "0%")
                    .attr("spreadMethod", "pad");

                gradient.append("svg:stop")
                    .attr("offset", percents[i][0])
                    .attr("stop-color", catcolors[0])
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", percents[i][1])
                    .attr("stop-color", catcolors[1])
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", percents[i][2])
                    .attr("stop-color", catcolors[2])
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", percents[i][3])
                    .attr("stop-color", catcolors[3])
                    .attr("stop-opacity", 1);

                gradient.append("svg:stop")
                    .attr("offset", percents[i][4])
                    .attr("stop-color", catcolors[4])
                    .attr("stop-opacity", 1);    

                d3.select(this).style('fill', 'url(#gradient)');
                })                  
            .on("mouseout", function(d, i) {       
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0); 
                d3.select(this).style('fill', function(d) { return colors[sqcolor[i]]} );  
            });

        var legend = svg.selectAll(".legend")
          .data(bucketVals);

        legend.enter().append("g")
          .attr("class", "legend");

        legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i + (3.25 * gridSize); })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

        legend.append("text")
            .attr("class", "mono")
            .text(function(d, i) { return "< " + bucketVals[i]; })
            .attr("x", function(d, i) { return legendElementWidth * i + (3.25 * gridSize); })
            .attr("y", height + gridSize);

        var legend = svg.selectAll(".categoryLegend")
          .data(categoryShort);

        legend.enter().append("g")
          .attr("class", "categoryLegend");

        legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i + (7.25 * gridSize); })
            .attr("y", height + 50)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return catcolors[i]; });

        legend.append("text")
            .attr("class", "mono")
            .text(function(d, i) { return categoryShort[i]; })
            .attr("x", function(d, i) { return legendElementWidth * i + (7.55 * gridSize); })
            .attr("y", height + 50 + gridSize);    
    }
});

