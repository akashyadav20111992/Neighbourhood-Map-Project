//https://discussions.udacity.com/t/filtering-my-list-of-locations-with-ko/38858
//https://discussions.udacity.com/t/triggering-marker-bounce-w-list-binding/41089/6
//https://developers.google.com/maps/documentation/javascript/examples/marker-animations
//https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282#onerror
var map;
//hard coded locations
var locations = [
  {id : 1 , title: "Home", location: {lat: 28.159818, lng: 76.813626}},
  {id : 2 , title: "Cinema", location: {lat: 28.191354, lng: 76.813860}},
  {id : 3 , title: "McDonald's", location: {lat: 28.196682, lng: 76.812181}},
  {id : 4 , title: "HDFC Bank", location: {lat: 28.205816, lng: 76.808195}},
  {id : 5 , title: "Modern Public School", location: {lat: 28.208898, lng: 76.808729}},
];
// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 28.159818, lng: 76.813626},
    zoom: 14,
    //mapTypeControl: false
  });



  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      map : map,
      position : position,
      title : title,
      animation : google.maps.Animation.DROP,
      id : i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    bounds.extend(markers[i].position);
    // Create an onclick event to open an infowindow and add bounce at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
      bounce(this);
    });
  }
  map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
//Also loads wiki links to infowindow
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    var abc = [];
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function(){
      abc.push("failed to get wikipedia resources");
      infowindow.setContent('<div>' + marker.title + '<br>' + marker.position + '<br>' + abc + '</div>');
    },8000);
    $.ajax({
      url : wikiUrl,
      dataType : "jsonp",
      success : function(response){
        var articleList = response[1];
        for(var i=0;i<1;i++){
          articleStr = articleList[i];
          var url = 'http://en.wikipedia.org/wiki/' + articleStr;
          abc.push(url);
          infowindow.setContent('<div>' + marker.title + '<br>' + marker.position + '<br>' + '<a href="' + abc +'">'+ abc + '</a>' + '</div>');
        }
        clearTimeout(wikiRequestTimeout);
      }
    });
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}
//makes the marker bounce on click
function bounce(marker){
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function(){
    marker.setAnimation(null);
  }, 3000);
}
//handles the google map api error
googleError = function(){
  $("#map").append("<p>unable to load google map</p>");
}
// ViewModel of knockout
var ViewModel = function(){
  var self = this;
  this.listings = ko.observableArray();
  this.filterBar = ko.observable();
  for(var i=0;i<locations.length;i++){
    this.listings.push(locations[i]);
  }
  //search the typed string in filterBar within list of titles of locations
  //and makes them visible or invisible
  this.search = function(typed){
    self.listings([]);
    for(var i=0;i<locations.length;i++){
      if(locations[i].title.toLowerCase().indexOf(typed.toLowerCase()) >= 0){
        self.listings.push(locations[i]);
        markers[i].setVisible(true);
      }
      else{
        markers[i].setVisible(false);
      }
    }
  }
  this.filterBar.subscribe(self.search);
  //this makes the marker on map to bounce and open infowindow while it is clicked on the list
  this.listHitMarker = function(){
    for(var i=0;i<locations.length;i++){
      if(locations[i].id === this.id){
        google.maps.event.trigger(markers[i], 'click');
      }
    }
  }
}
ko.applyBindings(new ViewModel());
