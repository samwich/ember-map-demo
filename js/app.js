var App = Em.Application.create();

App.MyView = Em.View.extend({
  mouseDown: function() {
    window.alert("hello world!");
  },
});

App.initMap = function () {
  var myOptions = {
    center: new google.maps.LatLng(37.871667, -122.272778),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.map = new google.maps.Map($("#map_canvas")[0],
      myOptions);
  google.maps.event.addListener(App.map, 'click', function(event){
	  App.mapController.handleClick(event);
  });
}

App.mapController = {
	markersForMap: [],
	markersDisplayed: [],
	handleClick: function (x) {
		this.addMarker(x.latLng);
	},
	addMarker: function (ll) {
		this.markersForMap.push(ll);
		this.redrawMarkers();
	},
	redrawMarkers: function () {
		var md = this.markersDisplayed;
		$.each(this.markersDisplayed, function (i, m) {m.setMap(null);});
		$.each(this.markersForMap, function  (i, ll) {
			var marker = new google.maps.Marker({
				position: ll
			});
			md.push(marker);
			marker.setMap(App.map);
		});
	}
}

$().ready(function () {
  App.initMap();
});
