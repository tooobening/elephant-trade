//Step0-- execute script when window is loaded
window.onload = function(){
    //Step1-- SVG dimension variables
    var w = 1000, h = 500;
    var container = d3.select("body") //get the <body> element from the DOM
        .append("svg") //put a new svg in the body
        .attr("width", w) //assign the width
        .attr("height", h) //assign the height
        .attr("class", "container") //always assign a class (as the block name) for styling and future selection
        .style("background-color", "rgba(102,92,65,0.7)"); //same way we would use jQuery's .css() method; only put a semicolon at the end of the block!

    //Step2-- Create a completely new selection ("InnerRect" block) so that u can append other elements to the container
    var innerRect = container.append("rect") //put a new rect in the svg
    .datum(400)
    .attr("width", function(d){ //rectangle width
        return d * 2 +120; 
    }) 
    .attr("height", function(d){ //rectangle height
        return d; //400
    })
    .attr("class", "innerRect") //class name
    .attr("x", 50) //position from left on the x (horizontal) axis
    .attr("y", 50) //position from top on the y (vertical) axis
    .style("fill", "#ffe291"); //fill color
    
    var cityPop = [
        { 
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];
    //Step3-- Scale: Create and apply D3 scale generators for colored, proportionally-sized and -positioned circles in our bubble chart!
    var x = d3.scaleLinear() //create the scale
        .range([90, 810]) //output min and max
        .domain([0, 3]); //input min and max

    //find the minimum value of the array
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    });

    //find the maximum value of the array
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    });

    //scale for circles center y coordinate
    var y = d3.scaleLinear()
        .range([450, 50]) //Reference 'rect' size
        .domain([0, 700000]);
   //color scale generator 
   var color = d3.scaleLinear()
   .range([
       "#3921A9",
       "#0E082A"//https://htmlcolorcodes.com/color-picker/
   ]) //"Unclassed" color scheme: each color derived from interpolation between the two range colors
   .domain([
       minPop, 
       maxPop
   ]);
   //Step4 -- Joining Data and make a Bubble chart
    var circles = container.selectAll(".circles") //but wait--there are no circles yet!
        .data(cityPop) //here we feed in an array
        .enter()//After .data(); No parameters needed; Create an array of placeholders for one markup element per data value in the array
        .append("circle") //add a circle for each datum
        .attr("class", "circles") //apply a class name to all circles
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
            //use the scale generator with the index to place each circle horizontally
            return x(i);
        })
        .attr("cy", function(d){
            return y(d.population);
        })
        .style("fill", function(d, i){ //add a fill based on the color scale generator
            return color(d.population);
        })
    
    //Step5-- Axes: Create y axis generator (meaningful)
    var yAxis = d3.axisLeft(y);//The argument is the scale generator

    //create axis g element and add axis
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)") //x corrdinate is +50 for moving right; +y for moving down
        .call(yAxis); // ???How to replace with "yAxis(axis)";


    //Step6-- Text: Create a text element and add the title
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 500) //Position the text anchor within the 'SVG'container
        .attr("y", 30) //Position the text anchor within the 'SVG' container
        .text("City Populations");
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter() //after .data()! 
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        // .attr("x", function(d,i){
        //     //horizontal position to the right of each circle
        //     return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        // })
        .attr("y", function(d){
            //vertical position centered on each circle
            return y(d.population) -5;
        })
        //Use .text() here if labels are somple, just 1 line
        // .text(function(d){
        //     return d.city + ", Pop. " + d.population;
        // }); 
        
        //Tspan: wrap these labels onto several lines
        var nameLine = labels.append("tspan")
            .attr("class", "nameLine")
            .attr("x", function(d,i){
                //horizontal position to the right of each circle
                return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
            })
            .text(function(d){
                return d.city;
            });

        //create format generator
        var format = d3.format(",");
        //second line of label
        var popLine = labels.append("tspan")
            .attr("class", "popLine")
            .attr("x", function(d,i){
                //horizontal position to the right of each circle
                return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
            })
            .attr("dy", "15") //vertical offset
            .text(function(d){
                return "Population: " + format(d.population); //use format generator to format numbers
            });
    
};

/*other array data
var numbersArray = [1, 2, 3];
var stringsArray = ["one", "two", "three"];
var colorsArray = ["#FF4949", "#A4FF49", "#49FFFF"];
var objectsArray = [
    { 
        city: 'Madison',
        population: 233209
    },
    {
        city: 'Milwaukee',
        population: 594833
    },
    {
        city: 'Green Bay',
        population: 104057
    }
];
var arraysArray = [
    ['Madison', 23209],
    ['Milwaukee', 593833],
    ['Green Bay', 104057]
];
*/