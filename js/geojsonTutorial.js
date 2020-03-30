//Part1.AddData: 2 Lines and 1 point:Denvor  
var myLines = [{ //GeoJSON objects may also be passed as an array of valid GeoJSON objects.
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var geojson_Madison = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-89.4012,43.0731]
    }
};
var geojson_Denvor = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.9903,39.7392]
    }
};

//GeoJSON objects are added to the map through a GeoJSON layer
L.geoJSON(geojson_Denvor).addTo(mymap);
L.geoJSON(myLines).addTo(mymap);
// Alternative method to add data to layer
// L.geoJSON().addTo(mymap).addData(myLines)  
//L.geoJSON().addData(myLines).addTo(mymap)


//Part2.Switch Color: States polygons : ND, CO
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            //assign colors by properties 
            case 'Republican': return {color: "#dadaeb"};
            case 'Democrat':   return {color: "#ff7800"}; 
        }
    }
}).addTo(mymap);


//Part3: pointToLayer(L.CircleMarker()) : Madison 
var geojsonMarkerOptions = {
    radius: 15,
    fillColor: "#ffffcc", //Yellow
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(geojson_Madison, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(mymap);


//Part4: filter (by properites (T/F)): Newyork or philadelphia
var someFeatures_NYorPH = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-74.0060, 40.7128] //New York
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-75.1652, 39.9526] //philadelphia 
    }
}];

L.geoJSON(someFeatures_NYorPH, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);