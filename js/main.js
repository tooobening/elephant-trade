(function(){
    var attrArray = ['Educational','Hunting trophy','Law enforcement','Medica','Personal','Circus/travelling exhibition','Scientific','Commercial','Unknown'];
    var expressed = attrArray[5]; 
    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
    function setMap(){
        //map frame dimensions
        var width = 960,
        height = 500;

        //create new svg container for the map
        var map = d3.select("#map")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

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
            console.log(csvData);
            console.log(world);
            console.log(attr);
            
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
            setChart(csvData, colorScale);       
        };  
    };//end of setMap()
    
    function setGraticule(map, path){
        //...GRATICULE BLOCKS FROM MODULE 8
        //create graticule generator 
        var graticule = d3.geoGraticule()
        .step([20, 20]); //place graticule lines every 5 degrees of longitude and latitude
    
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
        //...DATA JOIN LOOPS FROM EXAMPLE 1.1
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
        //...REGIONS BLOCK FROM MODULE 8
        var attr = map.selectAll(".attr")
                .data(attrCountries)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "attr " + d.properties.NAME; //DO add space after attr"_" !!!?
                })
                .attr("d", path)
                .style("fill", function(d){
                    return colorScale(d.properties[expressed]);
                });
    };
    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [ //https://colorbrewer2.org/
            "#feebe2",
            "#fbb4b9",
            "#f768a1",
            "#c51b8a",
            "#7a0177"
        ];

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
    //function to create coordinated bar chart
    function setChart(csvData, colorScale){
        //chart frame dimensions
        var chartWidth = 340,
            chartHeight = 500;//340*460/550

        //create a second svg element to hold the bar chart
        var chart = d3.select("#bar1")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");
        
        //create a scale to size bars proportionally to frame
        var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 120]);  //y-axis output range
        //set bars for each province
        var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){ //
            return a[expressed]-b[expressed] //1st - 2nd orders the bars from smallest to largest
        })
        .attr("class", function(d){
            return "bars " + d.ADM0_A3;
        })
        .attr("width", chartWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartWidth / csvData.length);
        })
        .attr("height", function(d){
            return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed]));
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        })
        
        //Contextualize: annotate bars with attribute value text
        var numbers = chart.selectAll(".numbers")
        .data(csvData)
        .enter()
        .append("text")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "numbers " + d.ADM0_A3;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = chartWidth / csvData.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed])) ;
        })
        .text(function(d){
            return d[expressed];
        });

        //Create a text element for the chart title
        var chartTitle = chart.append("text")
        .attr("x", 10)
        .attr("y", 20)
        .attr("class", "chartTitle")
        .text("Trade for '" + expressed + "' purpose:");    
    };
})(); //last line of main.js