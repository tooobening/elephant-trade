/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var mymap;

//function to instantiate the Leaflet map
function createMap(){

    //add OSM base tilelayer
    mymap = L.map('mapid').setView([40,-100],4)

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10', //https://docs.mapbox.com/api/maps/#mapbox-styles
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoieXVuaW5nbGl1IiwiYSI6ImNrNm9tNDFhcDBpejgzZG1sdnJuaTZ4MzYifQ.qYhM3_wrbL6lyTTccNKx_g' //'your.mapbox.access.token'
    }).addTo(mymap);

    //call getData function
    getData();
};

//function to retrieve the data and place it on the map
//Rather than having to create the data in the script, we bring in our external data and pass it directly to L.geoJson()
function getData(){
    //load the data
    $.getJSON("data/AmtrakStations.geojson", function(response){
            //create a Leaflet GeoJSON layer and add it to the map
            // L.geoJson(response).addTo(mymap);

            //Convert GeoJSON points into Leaflet layers -> showed as a circle marker
            var geojsonMarkerOptions = {
                radius: 10,
                fillColor: "#ffffcc", //Yellow
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            L.geoJson(response, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(mymap);


            //Pop up selected feature
             L.geoJson(response, {
                onEachFeature: function (feature,layer) {
                    var popupContent = ""; //define the string type
                    if (feature.properties) {
                        for (var property in feature.properties) {
                            //select specific properties to be included in the popup window
                            if (property === 'STNNAME' || 
                            property ==="PASS_2012" || 
                            property ==="PASS_2013" || 
                            property ==="PASS_2014" || 
                            property ==="PASS_2015" || 
                            property ==="PASS_2016" || 
                            property ==="PASS_2017" || 
                            property ==="PASS_2018" ){
                                popupContent += "<p>" + property + ": " + feature.properties[property]+ "</p>";   
                            }                        
                        }
                        popupContent += "Unit: per thousand passengers" // this line might be deleted later for better presentation
                        return layer.bindPopup(popupContent)
                    }


                }
             }).addTo(mymap);
        });
};

$(document).ready(createMap);