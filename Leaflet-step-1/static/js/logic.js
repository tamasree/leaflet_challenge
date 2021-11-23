const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then((response) => {

    console.log(response)

    createMap(response)

});

function createMap(response) {

    // tiles for map    
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var USGS_USImageryTopo = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    function onEachFeature(feature, layer) {

        layer.bindPopup(`<h3> Magnitude :${feature.properties.mag} </h3> <hr> <h4> Place:${feature.properties.place} </h4> <h4> Time:${new Date(feature.properties.time)} </h4>`);

    }

    function circleRadius(magnitude) {

        return magnitude * 4

    }

    function chooseColor(depth) {
        if (depth < 10) return "#99FF99";
        else if (depth > 10 && depth < 30) return "#66FF00";
        else if (depth > 30 && depth < 50) return "#CCCC00";
        else if (depth > 50 && depth < 70) return "#FFCC00";
        else if (depth > 70 && depth < 90) return "#FF9900";
        else return "#FF0000";
    }

    function geojsonMarkerOptions(features) {

        return {
            radius: circleRadius(parseInt(features.properties.mag)),
            fillColor: chooseColor(features.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8

        }
    }
    // create geoJson feature layer for eartquake data

    var earthquakeLayer = L.geoJSON(response, {
        pointToLayer: function (features, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions(features));
        },
        onEachFeature: onEachFeature
    })
    // create basemaps layer

    var baseMaps = {
        "street": street,
        "Topology": topo,
        "USImageryTopo": USGS_USImageryTopo
    };
    // craete overlaymaps layer

    var overelayMaps = {
        "Earthquakes": earthquakeLayer
    }
    // creating map variable

    var map = L.map("map", {
        center: [37.7749, -122.4194],
        zoom: 5,
        layers: [street, earthquakeLayer]
    });
    // control of layers

    L.control.layers(baseMaps, overelayMaps, {
        collapsed: false
    }).addTo(map)


    // legend map

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {

            div.innerHTML +=
                '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);

}



