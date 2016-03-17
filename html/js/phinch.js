var colors = ["#E3A93C", "#99D8C7", "#FCECDC", "#F29D9C", "#E2639A"]
//Palette credit: ghake's Warm Rainbow on colourlovers.com

//This visualization takes place within the context of a circle. Specify the center here.
var centerx = 500;
var centery = 500;
var radius = 500;

$("document").ready(function(){
    //Category,Event Name,Gender,Age,Marital Status,Session ID,Device,Client Time,City,State,Latitude,Longitude,Zip Code
    var dataset = [];
    var cities = new Array(); //Associative Array <String, Array>
    var categories = new Array(); //Associative <String, Integer>
    var datapoint;
    var dollars = 0;
    var pixels = radius*Math.PI*5/12;
    var citycount = 0;

    d3.csv("../../data/viztwo_data.csv", function(input){
        for(var i in input){
            datapoint = input[i];
            if (datapoint["Event Name"] == "Fund Project"){
                dataset.push(datapoint);
            }
        }
        
        var count;
        for(var i in dataset){
            datapoint = dataset[i];
            var city = datapoint["City"];
            var state = datapoint["State"];
            var id = city+" QQ "+state;
            if(cities[id] == null){
                count = 1;
                cities[id] = [count];
                cities[id][count] = datapoint;
            }else{
                count = cities[id][0];
                cities[id][0] += 1;
                cities[id][count+1] = datapoint;
            }
        }

        var highest = new Set();
        var others = new Set();

        for(var key in cities){
            if(cities[key][0] < 50){
                delete cities[key];
            }else{
                citycount += 1;
                cities[key].splice(0, 1);
                cities[key].sort(compData);
                for(var i = 0; i < cities[key].length; i++){
                    if(i < 5){
                        highest.add(cities[key][i]);
                    }else{
                        others.add(cities[key][i]);
                    }
                    datapoint = cities[key][i]["Category"];
                    if(categories[datapoint] == null){
                        categories[datapoint] = parseInt(cities[key][i]["Amount"]);
                    }else{
                        categories[datapoint] += parseInt(cities[key][i]["Amount"]);
                    }
                    dollars += parseInt(cities[key][i]["Amount"]);
                }
                
              
            }
        }

        var citypixelperdollar = (pixels - citycount*5)/dollars;

        drawViz(categories, cities, dollars, citypixelperdollar, highest, others);
    });

    function drawViz(categories, cities, dollars, cityppd, highest, others){
        var svg = d3.select("#content").append("svg")
                    .attr("width", 1200)
                    .attr("height", 1000)
                    .attr("id", "viz");

        //Draw the category bars
        var starta = 105; //Start angle
        var startar;
        var enda = 125; //End angle
        var endar;
        var mida = (starta+enda)/2;
        var midar;
        var tempa = 0;
        var startp = [500, 500];
        var endp = [500, 500]; //Start and end points
        var midp = [500, 500];
        var linepoints = new Array();
        var money;
        var thickness;
        var count = 0;
        var catcolors = new Array();

        for(var category in categories){

            money = categories[category];
            //First, find the thickness
            //Thickness = 50*(ratio of dollars spent on this category)
            thickness = Math.floor(250*money/dollars);

            tempa = starta-90;
            startar = tempa * Math.PI /180;
            tempa = enda-90;            
            endar = tempa * Math.PI /180;
            tempa = mida-90;
            midar = tempa * Math.PI /180;
                        
            //Start and end points are .5(thickness) from the edge of the circle
            startp[0] = Math.floor(centerx-(radius-thickness*.5)*Math.sin(startar));
            startp[1] = Math.floor(centery-(radius-thickness*.5)*Math.cos(startar));
            endp[0] = Math.floor(centerx-(radius-thickness*.5)*Math.sin(endar));
            endp[1] = Math.floor(centery-(radius-thickness*.5)*Math.cos(endar));
            midp[0] = Math.floor(centerx-(radius-thickness*4)*Math.sin(midar));
            midp[1] = Math.floor(centery-(radius-thickness*4)*Math.cos(midar));

            svg.append("path")
                .attr("d", "M"+startp[0]+","+startp[1]+" A"+midp[0]+","+midp[1]+" 0 0,0 "+endp[0]+","+endp[1])
                .attr("stroke", colors[count])
                .attr("stroke-width", thickness)
                .classed("category", true)
                .attr("id", category);

            linepoints[category] = getPoints(starta, enda, thickness);
            catcolors[category] = colors[count];

            starta += 32;
            enda += 32;
            mida += 32;
            count += 1;
        }

        var dollars;
        var red;
        var green;
        var blue;
        var color = "#";
        var angle = 70;
        var radians = (angle+90)*Math.PI/180;
        var cityradius;
        var citycenter = [0, 0];
        var centers = new Array();
        var datapoint;
        
        //Draw the city dots
        for(var city in cities){
            var myname = city;
            dollars = 0;
            red = 0;
            green = 0;
            blue = 0;
            color = "#";
            for(var i = 0; i < cities[city].length; i++){
                datapoint = cities[city][i];
                dollars += parseInt(datapoint["Amount"]);
                red += parseInt(catcolors[datapoint["Category"]].substring(1,3), 16);//*parseInt(datapoint["Amount"]);
                green += parseInt(catcolors[datapoint["Category"]].substring(3,5), 16);//*parseInt(datapoint["Amount"]);
                blue += parseInt(catcolors[datapoint["Category"]].substring(5,7), 16);//*parseInt(datapoint["Amount"]);
            }

            cityradius = Math.floor(dollars*cityppd/2);
            red = Math.floor(red/(cities[city].length));
            green = Math.floor(green/(cities[city].length));
            blue = Math.floor(blue/(cities[city].length));
            color = color+red.toString(16)+green.toString(16)+blue.toString(16);

            angle -= cityradius/(2*Math.PI*radius)*360;   
            radians = (angle + 90)*Math.PI/180;

            citycenter[0] = Math.floor(centerx+radius*Math.sin(radians));
            citycenter[1] = Math.floor(centery+radius*Math.cos(radians));

            if (citycenter[1] - cityradius < bottomy){
                citycenter[1] = bottomy + cityradius;
            }

            if(centers[city] == null){
                centers[city] = [citycenter[0], citycenter[1]];
            }

            svg.append("circle")
                .attr("cx", citycenter[0])
                .attr("cy", citycenter[1])
                .attr("r", cityradius)
                .attr("fill", color)
                .attr("stroke", color)
                .attr("stroke-width", 1)
                .style("z-index", 3)
                .classed("city", true)
                .attr("id", city);

            var fontsize = 10+Math.floor(cityradius/6);
            var bottomy = citycenter[1] + cityradius + 7;

            var idsplit = city.split(" QQ ");
            var cityname = idsplit[0] + ", " + idsplit[1];

            svg.append("text")
                .attr("x", citycenter[0] + cityradius + 15)
                .attr("y", citycenter[1] + 5)
                .text(cityname)
                .attr("fill", "#ffffff")
                .style("font-size", fontsize)
                .classed("name "+cityname, true);

            angle -= (pixels/radius/2*4) + (cityradius/(2*Math.PI*radius))*360;
        }


        //Draw the lines
        var goodpoints = new Array();
        var catpoint;
        var index;
        var midpoint = [0, 0];
        for(var city in cities){
            goodpoints = pointCopy(linepoints);
            for(var i = 0; i < cities[city].length; i++){
                datapoint = cities[city][i];
                color = catcolors[datapoint["Category"]];

                index = Math.floor(Math.random()*goodpoints[datapoint["Category"]].length);
                catpoint = goodpoints[datapoint["Category"]][index];
    
                citycenter = centers[city];

                var classname = ".line."+city.replace(/ /g,'')+"."+datapoint["Category"]+"."+datapoint["Amount"];

                svg.append("path")
                    .attr("d", "M"+catpoint[0]+","+catpoint[1]+" C"+centerx+","+centery+" "+citycenter[0]+","+citycenter[1]+" "+citycenter[0]+","+citycenter[1])
                    .attr("stroke", color)
                    .attr("fill", "none")
                    .attr("stroke-width", 1)
                    .classed("line "+city.replace(/ /g,'')+" "+datapoint["Category"]+" "+datapoint["Amount"], true);

                if(!highest.has(datapoint)){
                    $(classname).css("display", "none");
                }
            }
        }


        //Draw the legend
        var legend = d3.select("#content").append("svg")
                        .attr("width", 1050)
                        .attr("height", 100)
                        .attr("id", "legend");

        var x = 20;
        var textx = x+95;
        for(var category in catcolors){
            legend.append("rect")
                .attr("height", 70)
                .attr("width", 190)
                .attr("y", 15)
                .attr("x", x)
                .attr("fill", catcolors[category]);

            legend.append("text")
                .attr("height", 70)
                .attr("width", 190)
                .attr("y", 55)
                .attr("x", textx)
                .text(category)
                .attr("text-anchor", "middle")
                .attr("fill", "#000000")
                .classed("leger", true);

            x += 206;
            textx += 206;
        }

        //Add listeners
        var catclick = false;
        var cityclick = false;
        var catselect;
        
        var hiddencat = [];
        var hiddencity = [];
        var showncity = [];
        var shownhidden = [];

        $(".category").mouseenter(function(event){
            if(!catclick){
                var cat = event.target.id;
                $(".line").each(function(index, line){
                    if (!$(this).hasClass(cat) && $(this).css("display") != "none"){
                        $(this).fadeOut("fast");
                        hiddencat.push(this);
                    }
                });

                if(cityclick){
                    for(var i in showncity){
                        if(!$(showncity[i]).hasClass(cat)){
                            $(showncity[i]).fadeOut("fast");
                            shownhidden.push(showncity[i]);
                        }
                    }
                }
            }
        });
        $(".category").mouseleave(function(event){
            while (hiddencat.length > 0 && !catclick){
                $(hiddencat.pop()).fadeIn("fast");
            }

            if(cityclick && !catclick){
                while(shownhidden.length > 0){
                    $(shownhidden.pop()).fadeIn("fast");
                }
            }
        });

        $(".category").click(function(event){
            var cat = event.target.id;
            catclick = true;
            catselect = cat;
            $(".line").each(function(index, line){
                if (!$(this).hasClass(cat) && $(this).css("display") != "none"){
                    $(this).fadeOut("fast");
                    hiddencat.push(this);
                }
            });

            if(cityclick){
                for(var i in showncity){
                    if(!$(showncity[i]).hasClass(cat)){
                        $(showncity[i]).fadeOut("fast");
                        shownhidden.push(showncity[i]);
                    }
                }
            }
        });

        $(".city").mouseenter(function(event){
            if(!cityclick){
                var city = event.target.id;
                city = city.replace(/ /g,"");
                $(".line").each(function(index, line){
                    if(catclick){
                        if (!$(this).hasClass(city) && $(this).css("display") != "none"){
                            $(this).fadeOut("fast");
                            hiddencity.push(this);
                        }

                        if ($(this).hasClass(city) && $(this).css("display") == "none" && $(this).hasClass(catselect)){
                            $(this).fadeIn("fast");
                            showncity.push(this);
                        }
                    }else{
                        if (!$(this).hasClass(city) && $(this).css("display") != "none"){
                            $(this).fadeOut("fast");
                            hiddencity.push(this);
                        }

                        if ($(this).hasClass(city) && $(this).css("display") == "none"){
                            $(this).fadeIn("fast");
                            showncity.push(this);
                        }
                    }
                });
            }
        });

        $(".city").mouseleave(function(event){
            while(showncity.length > 0 && !cityclick){
                $(showncity.pop()).fadeOut("fast");
            }
            while(hiddencity.length > 0 && !cityclick){
                $(hiddencity.pop()).fadeIn("fast");
            }
        });

        $(".city").click(function(event){
            if(!cityclick){
                var city = event.target.id;
                cityclick = true;
                cityselect = city;
                city = city.replace(/ /g,"");
                if(catclick){
                    $(".line").each(function(index, line){
                        if (!$(this).hasClass(city) && $(this).css("display") != "none"){
                            hiddencity.push(this);
                            $(this).fadeOut("fast");
                        }

                        if ($(this).hasClass(city) && $(this).css("display") == "none" && $(this).hasClass(catselect)){
                            showncity.push(this);
                            $(this).fadeIn("fast");
                        }
                    });
                }else{
                    $(".line").each(function(index, line){
                        if (!$(this).hasClass(city) && $(this).css("display") != "none"){
                            hiddencity.push(this);
                            $(this).fadeOut("fast");
                        }

                        if ($(this).hasClass(city) && $(this).css("display") == "none"){
                            showncity.push(this);
                            $(this).fadeIn("fast");
                        }
                    });
                }
            }
        });

        $("#reset").click(function(){
            cityclick = false;
            catclick = false;
            shownhidden = [];
            catselect = "";
            while(showncity.length > 0){
                $(showncity.pop()).fadeOut("fast");
            }
            while(hiddencity.length > 0){
                $(hiddencity.pop()).fadeIn("fast");
            }
            while(hiddencat.length > 0){
                $(hiddencat.pop()).fadeIn("fast");
            }
            
        });
    }

    function getPoints(angle1, angle2, thickness){
    //Given the start and end angles, as well as the thickness, returns a set of points along the edge of that line
        var points = [];
        var rad;
        var point = [0, 0];
        for(var a = angle1; a <= angle2; a += 0.1){
            rad = (a-90)*Math.PI/180; 
            point[0] = Math.floor(centerx-(radius-thickness*0.5)*Math.sin(rad));
            point[1] = Math.floor(centery-(radius-thickness*0.5)*Math.cos(rad));
            points.push([point[0], point[1]]);
        }
        return points;
    }

    function pointCopy(copyme){
        var copy = new Array();
        for(var i in copyme){
            copy[i] = copyme[i];
        }
        return copy;
    }

    function compData(a, b){
        //Compares data points based on amount donated
        if (parseInt(a["Amount"]) > parseInt(b["Amount"])){
            return -1;
        }else if (parseInt(a["Amount"]) < parseInt(b["Amount"])){
            return 1;
        }else{
            return 0;
        }
    }
});
