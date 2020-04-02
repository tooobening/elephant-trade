//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    //map frame dimensions
    var width = 960,
    height = 501;

    //create new svg container for the map
    var map = d3.select("body")
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
        //translate europe TopoJSON
        var worldCountries = topojson.feature(world, world.objects.ne_10m_admin_0_countries); //change the 2nd par corresponds to the key name after the 'object' key in .topojson
        var attrCountries = topojson.feature(attr, attr.objects.AttributesCountries).features;

        //examine the results
        console.log(worldCountries);
        console.log(attrCountries);

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

        // add base map to map (put these codes below after the gratLines to show on top of the gratLines!)
        var countries = map.append("path")
            .datum(worldCountries) //.geojson
            .attr("class", "countries")
            .attr("d", path);

        //add attr regions to map
        var attr = map.selectAll(".attr")
            .data(attrCountries)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "attr " + d.properties.NAME; //DO add space after attr"_" !!!?
            })
            .attr("d", path);
    };
};