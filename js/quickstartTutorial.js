// Set a map's, of the center of a city, view to our chose coordinates and a zoom level
var mymap = L.map('mapid').setView([45.5428,-122.6544], 5)

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v10', //https://docs.mapbox.com/api/maps/#mapbox-styles
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoieXVuaW5nbGl1IiwiYSI6ImNrNm9tNDFhcDBpejgzZG1sdnJuaTZ4MzYifQ.qYhM3_wrbL6lyTTccNKx_g' //'your.mapbox.access.token'
}).addTo(mymap);

//add a polygon
var polygon = L.polygon([
    [45.5448315,-122.6214334],
    [45.4447168,-122.5884598],
    [45.4447168,-122.6763925],
    [45.5371367,-122.7313516]
]).addTo(mymap);
//add a marker using addTo function: Zoo.
var marker = L.marker([45.510142, -122.715869]).addTo(mymap);
//add a circle using addTo function: Amusement Park
var circle = L.circle([45.473495, -122.66268], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

//add a popup by using leaflet shortcut; openPopup method (for markers only) immediately opens the attached popup.
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//need something more than attaching a popup to an object? using popups as layers!
var popup = L.popup()
    // .setLatLng([45.510142, -122.715869])
    // .setContent("I am a standalone popup.")
    // .openOn(mymap); // simultaneously close the previously popup windows

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())  //? How to avoid printing "Latlng"?
        .openOn(mymap);
}

mymap.on('click', onMapClick);