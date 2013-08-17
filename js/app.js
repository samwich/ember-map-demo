var App = Em.Application.create();

App.ApplicationController = Ember.Controller.extend({
	contentBinding: 'App.markers',
	selectionBinding: 'App.markers.selection'
});
App.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

App.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/'
    })
  })
})

App.initMap = function () {
  var myOptions = {
    center: new google.maps.LatLng(37.871667, -122.272778),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.map = new google.maps.Map($("#map_canvas")[0],
      myOptions);
  google.maps.event.addListener(App.map, 'click', function(event){
	  App.mapController.create().handleClick(event);
  });
};

App.MarkerListItemView = Em.View.extend({
	tagName: 'tr',
	classNameBindings: ['isSelected'],
	isSelected: function () {
		return (this.get('content') === App.markers.get('selection'));
	}.property('App.markers.selection'),
	click: function () {
		App.markers.set('selection', this.get('content'));
	}
});

App.markers = Em.ArrayProxy.create({
	content: []
});

App.RemoveButtonView = Ember.View.extend({
	tagName: 'button',
	click: function () {
		this.get('content').removeFromMap();
		this.set('content', null);
	}
});

App.MarkerDetailView = Ember.View.extend({
	contentBinding: 'App.markers.selection'
});

App.Marker = Ember.Object.extend({
	latLng: null,
	latitude: function () {return this.latLng.lat()}.property('latLng'),
	longitude: function () {return this.latLng.lng()}.property('latLng'),
	removeFromMap: function () {
		i = App.markers.get('content').indexOf(this);
		App.markers.removeAt(i);
	},
	markerClick: function () {
		App.markers.set('selection', this);
	}
});

App.mapController = Ember.Object.extend({
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
			ll.marker = marker;
			google.maps.event.addListener(marker, 'click', function() {
				ll.markerClick();
			});
			that.markersDisplayed.pushObject(marker);
			marker.setMap(App.map);
			ll.markerClick();
		});
	}.observes('markersForMap.@each')
});

App.ListView = Em.View.extend({
	contentBinding: "App.markers.content"
});

App.ready = function () {
  App.initMap();
};

App.initialize();
