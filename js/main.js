(function(){
    var attrArray = ['Personal','Tourism','Commercial','Unknown','Others'];
    var expressed = attrArray[1];//initial attribute
    
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.25,
        chartHeight = 500,
        leftPadding = 10,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
    .range([chartHeight,0])
    .domain([0, 280]);

    
    
    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
    function setMap(){
        //map frame dimensions
        var width = window.innerWidth * 0.703, //make the widths of the chart and map responsive to each other by setting each to a fraction of the browser window's innerWidth property
            height = 500;

        //create new svg container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("class", "chart")            
            .attr("width", chartWidth)
            .attr("height", chartHeight);
 

        //create equal-area projection using tow generators
        var projection = d3.geoCylindricalEqualArea() //https://github.com/d3/d3-geo-projection/
        var path = d3.geoPath()
            .projection(projection);

        //use Promise.all() to parallelize asynchronous data loading (=an array using push to append several data)
        var promises = [];
        promises.push(d3.csv("data/csvData.csv")); //load attributes from csv
        promises.push(d3.json("data/WorldCountries.topojson")); //load background&Choropleth spatial data
        promises.push(d3.json("data/AttrCountries.topojson")); //load background&Choropleth spatial data
        Promise.all(promises).then(callback);

        //define function : callback
        function callback(data){
            csvData = data[0];
            world = data[1];
            attr = data[2];
            console.log('csvData:',csvData);
            
            //place graticule on the map
            setGraticule(map, path);

            //translate world and attr TopoJSON
            var worldCountries = topojson.feature(world, world.objects.ne_10m_admin_0_countries); //change the 2nd par corresponds to the key name after the 'object' key in .topojson
            var attrCountries = topojson.feature(attr, attr.objects.AttributesCountries).features;


            // add base map to map (put these codes below after the gratLines to show on top of the gratLines!)
            var countries = map.append("path")
                .datum(worldCountries) //.geojson
                .attr("class", "countries")
                .attr("d", path);
            //join csv data to GeoJSON enumeration units
            attrCountries = joinData(attrCountries, csvData);
            //create the color scale
            var colorScale = makeColorScale(csvData);
            //add enumeration units to the map
            setEnumerationUnits(attrCountries, map, path,colorScale);
            //add coordinated visualization to the map
            setChart(csvData,chart, colorScale);
            //add dropdown menu for attribute 
            createDropdown(csvData);     
        };  
    };//end of setMap()
    
    function setGraticule(map, path){
        //...GRATICULE BLOCKS FROM MODULE 8
        //create graticule generator 
        var graticule = d3.geoGraticule()
        .step([30, 30]); //place graticule lines every 30 degrees of longitude and latitude
    
        //create graticule background
        var gratBackground = map.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path) //project graticule

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
    };
    
    function joinData(attrCountries, csvData){
        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<csvData.length; i++){
            var csvRegion = csvData[i]; //the current region
            var csvKey = csvRegion.ADM0_A3; //the CSV primary key: ADM0_A3
            //loop through geojson regions to find correct region
            for (var a=0; a<attrCountries.length; a++){

                var geojsonProps = attrCountries[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.ADM0_A3; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvRegion[attr]); //get csv attribute value; use parseFloat() to change the CSV strings into numbers 
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };
            };
        };
        return attrCountries;
    };
    
    function setEnumerationUnits(attrCountries, map, path, colorScale){
        console.log('38',attrCountries)
        var attr = map.selectAll(".attr")
                .data(attrCountries)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "attr " + d.properties.ADM0_A3; //DO add space after attr" " !!!?
                })
                .attr("d", path)
                .style("fill", function(d){
                    console.log('d:',d)
                    return colorScale(d.properties[expressed]);
                })
                .on("mouseover", function(d){
                    highlight(d.properties);
                })
                .on("mouseout", function(d){
                    dehighlight(d.properties);
                })
                .on("mousemove", moveLabel);
        var desc = attr.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');
        
    };
    //Highlight enumeration units and bars
    function highlight(props){
        //change stroke
            var selected = d3.selectAll("." + props.ADM0_A3)
                .style("stroke", "#000") //http://www.colors.commutercreative.com/grid/
                .style("stroke-width", "1.5px");
        setLabel(props);
    };

    //Create dynamic label when retrieval
    function setLabel(props){
        //label content
        var labelAttribute = "<h2>" + props[expressed] +
            "</h2>";

        //create info label div
        var infolabel = d3.select("body")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", props.ADM0_A3 + "_label")
            .html(labelAttribute);

        var attrName = infolabel.append("div")
            .attr("class", "labelname")
            .html("<h2>"+ props.NAME +"</h2>");
    };
      
    //Reset the element style on mouseout
    function dehighlight(props){
        var selected = d3.selectAll("." + props.ADM0_A3)
            .style("stroke", function(){
                return getStyle(this, "stroke")
            })
            .style("stroke-width", function(){
                return getStyle(this, "stroke-width")
            });

        function getStyle(element, styleName){
            var styleText = d3.select(element)
                .select("desc")
                .text();

            var styleObject = JSON.parse(styleText);

            return styleObject[styleName];
        };
        d3.select(".infolabel")
            .remove();
    };
    //Move info label with mouse
    function moveLabel(){
        //get width of label
        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width; //used to set the backup x that will shift the label to the left of the mouse when it approaches the right side of the page 

        //use coordinates of mousemove event to set label coordinates
        var x1 = d3.event.clientX + 10,
            y1 = d3.event.clientY + 0,
            x2 = d3.event.clientX - labelWidth - 10,//backup
            y2 = d3.event.clientY -50;//backup
        //horizontal label coordinate, testing for overflow
        var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
        
        //vertical label coordinate, testing for overflow
        var y = d3.event.clientY >400 ? y2 : y1; 
        // console.log(y)
        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };

    //function to create coordinated bar chart
    function setChart(csvData, chart, colorScale){
        //set bars for each province
        console.log('238',csvData)
        console.log('239',csvData[expressed])
        var bars = chart.selectAll(".bar")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){ //
                return b[expressed]-a[expressed] //2st - 1st orders the bars from greatest
            })
            .attr("class", function(d){
                return "bar " + d.ADM0_A3;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)

            .attr("x", function(d,i){
                return i * (chartInnerWidth / csvData.length) + leftPadding;
            })
            
            .on("mouseover", highlight)
            .on("mouseout", dehighlight)
            .on("mousemove", moveLabel)
            
            //size/resize bars
            .attr("height", function(d){
                return 500 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //color/recolor bars
            .style("fill", function(d){
                var value = d[expressed];
                if(value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            });
        var desc = bars.append("desc") 
            .text('{"stroke": "none", "stroke-width": "0px"}'); //<desc></desc> is child within <rect></rect>
            

        //Contextualize: annotate bars with attribute value and country text as label
        var numbers = chart.selectAll(".numbers")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function(a, b){
                return b[expressed]-a[expressed]
            })
            .attr("class", function(d){
                return "numbers " + d.ADM0_A3;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){
                var fraction = chartInnerWidth / csvData.length;
                return i * fraction + (fraction - 1);
            })
            .attr("y", function(d){
                return yScale(parseFloat(d[expressed]));
            })
            .text(function(d){
                return d[expressed];
            })
            .on("mouseover", highlight)
            .on("mouseout", dehighlight)
        var desc = numbers.append("desc") 
            .text('{"stroke": "none", "stroke-width": "0px"}'); //<desc></desc> is child within <text></text>    
        var names = chart.selectAll(".names")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function(a, b){
                return b[expressed]-a[expressed]
            })
            .attr("class", function(d){
                return "names " + d.ADM0_A3;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){
                return i * (chartInnerWidth / csvData.length)+22})
            .attr("y", function(d){
                return yScale(parseFloat(d[expressed]))-13;
            })
            .text(function(d){
                return d['ADM0_A3'];
            })
            .on("mouseover", highlight)
            .on("mouseout", dehighlight);
        var desc = names.append("desc") 
            .text('{"stroke": "none", "stroke-width": "0px"}'); //<desc></desc> is child within <text></text> 
        // Create a text element for the chart title
        var chartTitle = chart.append("text")
            .attr("x", 10)
            .attr("y", 50)
            .attr("class", "chartTitle")
            .text(expressed +".");
        var chartTitle_P = chart.append("text")
            .attr("x", 10)
            .attr("y", 25)
            .attr("class", "chartTitle_P")
            .text("PURPOSE:");
        //set bar positions, heights, and colors
        // updateChart(bars, csvData.length, colorScale,numbers,names);
    };//end of setChart()
    
    
    //Create a dropdown menu for attribute selection
    function createDropdown(csvData){
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){ //to listen for a "change" interaction on the <select> element
                changeAttribute(this.value, csvData) //value are that of the <select> element
            });
        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true") //ensures that the user cannot mistakenly select option
            .text("Select Attribute");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };//end of createDropdown()
    
    //Dropdown change listener handler
    function changeAttribute(attribute, csvData){
        //step1. change the expressed attribute
        expressed = attribute;
        // console.log(expressed)
        //step2. recreate the color scale
        var colorScale = makeColorScale(csvData);

        //step3. recolor enumeration units
        var attrs = d3.selectAll(".attr")
            // .on("mouseover", highlight)
            // .on("mouseout", dehighlight)
            // .on("mousemove", moveLabel)
            .transition()
            .duration(500) //0.5 second
            .style("fill",function(d){
                var value = d.properties[expressed];
                if(value) {
                    return colorScale(value);
                } else {
                    return "rgb(172, 172, 172)";
                }}
            );

        //step4. Re-sort, resize and recolor bars
        var bars = d3.selectAll(".bar")
            //Re-sort bars
            //.sort() not moved bc it necessarily comes before the class and width attribute assignments in setChart(),
            //which should not be repeated when the attribute is changed
            .sort(function(a, b){  
                return b[expressed] - a[expressed];// greatest>>>least
            })
            .transition()
            .delay(function(d, i){
                return i * 50
            })
            .duration(500); //0.5 second

        var numbers = d3.selectAll(".numbers")
            .sort(function(a, b){  
                return b[expressed] - a[expressed];// greatest>>>least
            })
            .transition()
            .duration(500)
            .delay(function(d, i){
                return i * 50
            });
        var names = d3.selectAll(".names")
            .sort(function(a, b){  
                return b[expressed] - a[expressed];// greatest>>>least
            })
            .transition()
            .duration(500)
            .delay(function(d, i){
                return i * 50
            });
        updateChart(bars, csvData.length, colorScale,numbers,names);
    };//end of changeAttribute()
    
    //function to position, size, and color bars in chart
    function updateChart(bars,n, colorScale,numbers,names){ //called from within both setChart() and changeAttribute()
        //Update title
        var chartTitle = d3.select(".chartTitle")
            .text(expressed);
        var chartTitle_P = d3.select(".chartTitle_P")
            .text("PURPOSE:");

        //Update bars
        bars.attr("x", function(d, i){
                return i * (chartInnerWidth / n) + leftPadding;
            })
            //size/resize bars
            .attr("height", function(d, i){
                return 500 -yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //color/recolor bars
            .style("fill", function(d){
                var value = d[expressed];
                if(value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            })
            // .on("mouseover", highlight)
            // .on("mouseout", dehighlight)
            // .on("mousemove", moveLabel);

        //Update numbers and country labels
        numbers.attr("class", function(d){
                return "numbers " + d.ADM0_A3;
                })
                .attr("text-anchor", "middle")
                .attr("x", function(d, i){
                    var fraction = chartWidth / csvData.length ;
                    return i * fraction + 17;
                })
                .attr("y", function(d){
                    return yScale(parseFloat(d[expressed]));
                })
                .text(function(d){
                    return d[expressed];
                });
        names.attr("class", function(d){
            return "names " + d.ADM0_A3;
            })
            .attr("x", function(d, i){
                var f = chartWidth / csvData.length ;
                return i * f + 17;
            })
            .attr("y", function(d){
                return yScale(parseFloat(d[expressed]))-13;
            })
            .text(function(d){
                return d['ADM0_A3'];
            });
        
    }; 

    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses =  //https://colorbrewer2.org/
        ['#feebe2','#fbb4b9','#f768a1','#c51b8a','#7a0177']
        // ['#f6eff7','#bdc9e1','#67a9cf','#1c9099','#016c59']
        ;

        //create color scale generator
        var colorScale = d3.scaleQuantile()
            .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };

        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);
        //reset domain array to cluster minimums
        domainArray = clusters.map(function(d){
            return d3.min(d);
        });
        //remove first value from domain array to create class breakpoints
        domainArray.shift();

        //assign array of last 4 cluster minimums as domain
        colorScale.domain(domainArray);

        return colorScale;
    };
    
})(); //last line of main.js
