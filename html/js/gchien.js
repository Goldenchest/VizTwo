$("document").ready(function() {

var titleElem = d3.select("body")
				.append("h1");

var svg = d3.select("body")
			.append("svg")
			.attr("width", 960)
			.attr("height", 680)
			.attr("id", "statesvg");
			
d3.select("body")
	.append("div")
	.attr("id", "tooltip");

var states = ["HI", "AK", "FL", "SC", "GA", "AL", "NC", "TN", "RI", "CT", "MA",
"ME", "NH", "VT", "NY", "NJ", "PA", "DE", "MD", "WV", "KY", "OH", 
"MI", "WY", "MT", "ID", "WA", "DC", "TX", "CA", "AZ", "NV", "UT", 
"CO", "NM", "OR", "ND", "SD", "NE", "IA", "MS", "IN", "IL", "MN", 
"WI", "MO", "AR", "OK", "KS", "LA", "VA"];

var sportsData = [];
var sportsStats = [];
var techData = [];
var techStats = [];
var envData = [];
var envStats = [];
var fashionData = [];
var fashionStats = [];
var gameData = [];
var gameStats = [];

d3.select("body").append("div").attr("id", "dataset-picker");

d3.csv("../../data/viztwo_data.csv", function(d) {
	for (var i=0; i<50000; i++) {
		var currRow = d[i];
		var currCat = currRow.Category;
		if (currCat == 'Sports') {
			sportsData.push(currRow);
		}
		else if (currCat == 'Technology') {
			techData.push(currRow);
		}
		else if (currCat == 'Environment') {
			envData.push(currRow);
		}
		else if (currCat == 'Fashion') {
			fashionData.push(currRow);
		}
		else if (currCat == 'Games') {
			gameData.push(currRow);
		}
	}
	var datasets = [sportsData, techData, envData, fashionData, gameData];
	var dataKeys = ["Sports", "Tech", "Environment", "Fashion", "Game"];
	var mapTitles = generateMapTitles(dataKeys);
	allStats = extractData(datasets, dataKeys);
	
	var datasetpicker = d3.select("#dataset-picker")
							.selectAll(".dataset-button")
							.data(dataKeys)
							.enter()
							.append("input")
							.attr("value", function(d) { return d + " Donations"; })
							.attr("type", "button")
							.attr("class", "dataset-button")
							.on("click", function(d) {
								updateMap(d, allStats, states, svg, titleElem, mapTitles, false);
							});
							
	updateMap("Sports", allStats, states, svg, titleElem, mapTitles, true);
});

function generateMapTitles(dataKeys) {
	var titles = {};
	for (var i=0; i<dataKeys.length; i++) {
		var currKey = dataKeys[i];
		titles[currKey] = "Average amount of money donated to " + currKey;
	}
	return titles;
}

function extractData(datasets, dataKeys) {

	var sportsData  = datasets[0];
	var techData    = datasets[1];
	var envData     = datasets[2];
	var fashionData = datasets[3];
	var gameData    = datasets[4];

	var allData = {
		Sports: sportsData,
		Tech: techData,
		Environment: envData,
		Fashion: fashionData,
		Game: gameData
	};
	var allStats = {
		Sports: sportsData,
		Tech: techData,
		Environment: envData,
		Fashion: fashionData,
		Game: gameData
	};
	
	for (var i=0; i<dataKeys.length; i++) {
		var currKey = dataKeys[i];
		var currDataset = allData[currKey];
		var processedStats = {}; // array indexed by state name
		for (var s=0; s<states.length; s++) {
			var currState = states[s];
			processedStats[currState] = {}; // initialize Stats for each state
			processedStats[currState].numUsers = 0;
			processedStats[currState].numDonators = 0;
			processedStats[currState].avgDonated = 0;
		}
		for (var j=0; j<currDataset.length; j++) {
			var currRow = currDataset[j];
			var state = currRow.State;
			var currAmt = parseInt(currRow.Amount);
			processedStats[state].numUsers += 1;
			if (!isNaN(currAmt)) {
				processedStats[state].numDonators += 1;
				var prevAvg = processedStats[state].avgDonated;
				var newNumDonators = processedStats[state].numDonators;
				processedStats[state].avgDonated += (currAmt - prevAvg)/newNumDonators;
			}
		}
		allStats[currKey] = processedStats;
	}
	return allStats;
}

function updateMap(dataKey, allStats, states, svg, titleElem, mapTitles, isFirstGeneration) {
	titleElem.text(mapTitles[dataKey]);
	var colors = ["#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
	var dataset = allStats[dataKey];
	var maxDonationAvg = getMaxDonationAvg(dataset, states);
	var colorScale = d3.scale.quantile()
						.domain([0, maxDonationAvg])
						.range(colors);
	var quantiles = colorScale.quantiles();
					
	var stateColors = {};
	var stateData = {};
	
	for (var s=0; s<states.length; s++) {
		var stateName = states[s];
		var numUsers = dataset[stateName].numUsers;
		var numDonators = dataset[stateName].numDonators;
		var avgDonated = dataset[stateName].avgDonated;
		var color = colors[0];
		for (var i=0; i<quantiles.length; i++) {
			if (avgDonated < quantiles[i]) {
				color = colors[i];
				break;
			}
		}
		stateColors[stateName] = color;
		stateData[stateName] = {};
		stateData[stateName].numUsers = numUsers;
		stateData[stateName].numDonators = numDonators;
		stateData[stateName].avgDonated = avgDonated;
	}
	uStates.draw("#statesvg", stateData, stateColors, generateTooltip, isFirstGeneration);
	updateLegend(svg, colors, quantiles, maxDonationAvg);
}

function updateLegend(svg, colors, quantiles, maxDonationAvg) {
	var legendElementWidth = 800/(quantiles.length+1);
	var legendElementHeight = 30;
	var yOffset = 620;
	
	var legend = svg.selectAll(".legend")
					.data(quantiles.concat([maxDonationAvg]), function(d) { return d; });
	
	legend.enter()
			.append("g")
			.attr("class", "legend");
					
	legend.append("rect")
			.attr("x", function(d, i) { return legendElementWidth * i; })
			.attr("y", yOffset)
			.attr("width", legendElementWidth)
			.attr("height", legendElementHeight)
			.style("fill", function(d, i) { return colors[i]; })
			
	var firstGeneration = legend.select("text").empty();
	
	legend.selectAll("text").remove();
	
	legend.append("text")
			.attr("class", "legendlabel")
			.text(function(d) { return "< $" + d.toFixed(2); })
			.attr("x", function(d, i) { return legendElementWidth * i; })
			.attr("y", yOffset+legendElementHeight+12);
	
	legend.exit().remove();
}

function getMaxDonationAvg(dataset, states) {
	var maxAmt = 0;
	for (var s=0; s<states.length; s++) {
		currState = states[s];
		currAmt = dataset[currState].avgDonated;
		if (currAmt > maxAmt) {
			maxAmt = currAmt;
		}
	}
	return maxAmt;
}

function generateTooltip(stateName, stateID, stateData) {
	return "<h4>"+stateName+"</h4><table>"+
		"<tr><td>Number of Users</td><td>"+(stateData[stateID].numUsers)+"</td></tr>"+
		"<tr><td>Number of Donators</td><td>"+(stateData[stateID].numDonators)+"</td></tr>"+
		"<tr><td>Average Amount Donated: $</td><td>"+(stateData[stateID].avgDonated.toFixed(2))+"</td></tr>"+
		"</table>";
}
});