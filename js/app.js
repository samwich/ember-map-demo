App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});

App.Event = Ember.Object.extend({});

App.EventController = Ember.ObjectController.extend({
  selected: false,
  eltSelected: function(){
    this.set("selected",!this.get("selected"));
  },
});

App.MarkerView = Ember.View.extend({

  marker: null,

  setup : function(mapEvent,eventCont,mapView){
    console.log("setting up")
    console.log(this.get('content'))
    var marker = new google.maps.Marker({
        position: mapEvent.latLng
    });
    this.set("marker",marker);
    marker.setMap(mapView.get("map"));
    this.set("controller", eventCont);

    var that=this;
    google.maps.event.addListener(marker, 'click', function() {
        console.log("controller:")
        that.get("controller").eltSelected();
    });
  },
  markerIcon: function() {
        if (this.get("controller").get("selected")) {
          this.get("marker").setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
        } else {
          this.get("marker").setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
        }
  }.observes("controller.selected"),

  removed: function(){
    if(this.get("controller").get("model").get("removed")){
      this.marker.setMap(null);
      this.get("parentView").removeObject(this);
    }
  }.observes("controller.content.removed")

})

App.MapView = Ember.ContainerView.extend({

  id: 'map_canvas',
  tagName: 'div',

  attributeBindings: ['style'],
  style:"width:75%; height:300px",
  
  map:null,

  didInsertElement: function() {
    var mapOptions = {
      center: new google.maps.LatLng(37.871667, -122.272778),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(this.$().get(0),mapOptions);
    this.set("map",map);
    
    var that = this;
    
    // When clicking on the map, we create our own markerObject and pass it to our controller.
    // The controller handles the marker management.
    // The view handles placing the marker on the map.
    google.maps.event.addListener(map, 'click', function(event){
      eventCont= that.get("controller").addEvent(event.latLng.lat(), event.latLng.lng());
      child = App.MarkerView.create();
      child.setup(event, eventCont,that);
      that.pushObject(child);
    });
  }
});

// This is our main array controller that does the marker management
// It keeps a list of marker objects in its content
App.IndexController = Ember.ArrayController.extend({
  content: [],
  
  // We add the marker to the ArrayControllers content.
  addEvent: function (lat,lng) {
    // create a new marker object containing the lat,lng and the googleMarker
    var eventObject = App.Event.create({
                            lat: lat,
                            lng: lng
    });

    eventController = App.EventController.create();
    eventController.set('model',eventObject);
    this.content.pushObject(eventController);
    return eventController;
  },

  // This property simply displays the number of selected markers.
  selectedMarkerCounter: function () {
    return this.filterProperty('selected', true).get('length');
  }.property('@each.selected'),


  removeSelectedMarkers: function() {
    arr = this.filterProperty('selected', true);
    if (arr.length==0) {
        output = "nothing selected";
    } else { 
        for (var i = arr.length -1; i >= 0; i--) {
          arr[i].get("model").set("removed",true);
          this.content.removeObject(arr[i]);
        }
    }
  }
});

// we need to have an item-controller in place....
// the selected property is stored on this controller (not on the object)
// this controller simply observes the selected property to set the appropriate icon.
App.MarkerController = Ember.ObjectController.extend({
    markerIcon: function() {
        if (this.get("selected")) {
          this.content.googleMarker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
        } else {
          this.content.googleMarker.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
        }
    }.observes("selected")
});
