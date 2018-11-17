// TODO
// Use the data from the openbrewerydb API to display the breweries on the google maps.
// Find a solution for grouping nearby breweries markers together
// If the user clicks on the group then there we generate a list of all items from the selected group (use angular)
// If we select an item from the list then we zoom into brewerie marker.
// And for last if we click on the marker then we show a popup with the name of the bar.

let api  = `https://api.openbrewerydb.org/breweries`;




function fetchData(callback) {
  return fetch(api).then((resp) => {
    return resp.json();
  })
  .then(callback)
  .catch(err => {
    console.error('Problems when fetching data: ', err);
  })
}


// Map parameters
let map;
let markers;
let googleInsance;
const startZoom = 8;
const startCordinates = { 
  lat: 33.524521, 
  lng: -86.774322
};

let centerControl;
let centerControlDiv = document.createElement('div');



/**
   * The CenterControl adds a control to the map that recenters the map on
   * Chicago.
   * @constructor
   * @param {!Element} controlDiv
   * @param {!google.maps.Map} map
   * @param {?google.maps.LatLng} center
   */
  function CenterControl(controlDiv, map, markers) {
    // We set up a variable for this since we're adding event listeners
    // later.
    var control = this;

    // Set the center property upon construction
    control.marker_ = markers;
    control.selected_ = null;
    controlDiv.style.clear = 'both';

    var goCenterUI = document.createElement('div');
    goCenterUI.id = 'goCenterUI';
    goCenterUI.title = 'Click to recenter the map';
    controlDiv.appendChild(goCenterUI);
    markers.forEach(element => {
      // Set CSS for the control border
      var goCenterText = document.createElement('div');
      goCenterText.id = 'goCenterText';
      goCenterText.innerHTML = element.name;
      goCenterText.title = element.id
      goCenterUI.appendChild(goCenterText);

      // Set up the click event listener for 'Center Map': Set the center of
      // the map
      // to the current center of the control.
      goCenterUI.addEventListener('click', function(click) {
        control.getMarker().forEach(element => {
          if(element.name === click.target.innerText) {
            map.setZoom(17);
            map.panTo(new google.maps.LatLng( element.latitude, element.longitude) );
          }
        });
      });

    });



    // Set up the click event listener for 'Set Center': Set the center of
    // the control to the current center of the map.
    // setCenterUI.addEventListener('click', function() {
    //   var newCenter = map.getCenter();
    //   control.setCenter(newCenter);
    // });
  }

  /**
   * Define a property to hold the center state.
   * @private
   */
  CenterControl.prototype.marker_ = null;

  /**
   * Gets the map center.
   * @return {?google.maps.LatLng}
   */
  CenterControl.prototype.getMarker = function() {
    return this.marker_;
  };

  /**
   * Sets the map center.
   * @param {?google.maps.LatLng} Marker
   */
  CenterControl.prototype.setMarker = function(markers, map) {
    this.marker_ = markers;
  };

function initMap() {
  googleInsance = google;
  map = new google.maps.Map(document.getElementById('map'), {
    center: startCordinates,
    zoom: startZoom
  });
  markers = [];

};

angular.module('mapApp', [])
  .controller('MarkersListController', function($scope) {

  function addtomap(element, icon) {
    var infowindow = new google.maps.InfoWindow({
      content: element.name
    });
    var image = 'http://pngimg.com/uploads/beer/beer_PNG2333.png';
  
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(element.latitude, element.longitude),
      map: map,
      name: element.name,
      element_id: element.id,
      latitude: element.latitude,
      longitude: element.longitude,
      icon: {
        size: new google.maps.Size(40, 40),
        scaledSize: new google.maps.Size(40, 40),
        url: image 
    },
    });
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

    markers.push(marker);
  }
  // fetching of user data;
  fetchData((data) => {
      console.log('Loaction data', data);
      data.forEach(element => {
        addtomap(element);
      });
      // Add a marker clusterer to manage the markers.
      markerCluster = new MarkerClusterer(map, markers,
        {
          zoomOnClick: false,
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });
      googleInsance.maps.event.addListener(markerCluster, 'clusterclick', function(cluster) {
        // Create the DIV to hold the control and call the CenterControl()
        // constructor
        // passing in this DIV.

        if (centerControl) {
          // map.controls[google.maps.ControlPosition.RIGHT_TOP].removeAt(0);
          map.controls[google.maps.ControlPosition.RIGHT_TOP].clear();

          centerControlDiv = document.createElement('div');
        }
        centerControl = new CenterControl(centerControlDiv, map, cluster.markers_);
        centerControlDiv.index = 1;
        centerControlDiv.style['padding-top'] = '10px';
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(centerControlDiv);
        
      });
  });


});
