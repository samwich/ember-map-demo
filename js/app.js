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
};

App.markerView = Em.View.extend({
	click: function (e) {
		
	}
});

App.markers = Em.ArrayProxy.create({
	content: []
});

App.Marker = Ember.Object.extend({
	latLng: null,
	lat: function () {return this.latLng.lat()}.property('latLng'),
	lng: function () {return this.latLng.lng()}.property('latLng'),
	bar: "bar"
});

App.mapController = Em.Object.create({
	markersForMapBinding: "App.markers.content",
	markersDisplayed: [],
	handleClick: function (x) {
		this.markersForMap.pushObject( App.Marker.create({latLng: x.latLng}) );
	},
	markersForMapDidChange: function () {
		var that = this;
		$.each(this.markersDisplayed, function (i, m) {m.setMap(null);});
		$.each(this.markersForMap, function  (i, ll) {
			var marker = new google.maps.Marker({
				position: ll.get('latLng')
			});
			that.markersDisplayed.pushObject(marker);
			marker.setMap(App.map);
		});
	}.observes('markersForMap.@each')
});

App.ListView = Em.View.extend({
	contentBinding: "App.markers.content",
	foo: "foo"
});

$().ready(function () {
  App.initMap();
});
