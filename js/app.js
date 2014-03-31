App = Ember.Application.create();


App.Event = Ember.Object.extend({
  lat: null,
  lng: null
});


App.EventController = Ember.ObjectController.extend({
  selected: false,

  toggleSelected: function(){
    this.set("selected",!this.get("selected"));
  },
});


App.EventsController = Ember.ArrayController.extend({
  content: [],
  itemController: "event",

  addEvent: function (lat,lng) {
    var eventObject = App.Event.create({lat: lat, lng: lng});
    this.addObject(eventObject);
  },

  selectedCounter: function () {
    return this.filterProperty('selected', true).get('length');
  }.property('@each.selected'),

  removeSelected: function() {
    arr = this.filterProperty('selected', true);
    this.removeObjects(arr);
  }
});


App.MapView = Ember.CollectionView.extend({
  mapTagId: "map_canvas",
  map:null,

  itemViewClass: 'App.MarkerView',
  contentBinding: 'App.EventsController',

  tagName: false, //all the html representation is handled by google maps

  //lifecycle hooks
  didInsertElement: function() {
    var mapOptions = {
      center: new google.maps.LatLng(40.440877, -79.958644),
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(document.getElementById(this.mapTagId),
                                   mapOptions);

    var that = this;
    google.maps.event.addListener(this.map, 'click', function(event){
      that.clickMe(event.latLng.lat(), event.latLng.lng());
    });
  },

  //ui
  clickMe: function(lat, lng) {
    this.get("controller").addEvent(lat, lng);
  }
});


App.MarkerView = Ember.View.extend({
  tagName: false, //all the html representation is handled by google maps
  // marker: null,

  iconMap: {
    true: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    false: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
  },
  //lifecyclehooks
  didInsertElement: function() {
    //create google.maps.Marker
    latLng = new google.maps.LatLng(this.content.get("lat"),
                                    this.content.get("lng"));
    markerOptions = {
      position: latLng,
      map: this.get("parentView").get("map"),
      icon: this.iconMap[this.content.selected]
    };
    this.marker = new google.maps.Marker(markerOptions);

    //set marker click listener
    var that=this;
    google.maps.event.addListener(this.marker, 'click', function() {
        that.clickMe();
    });
  },

  willDestroyElement: function() {
    this.marker.setMap(null);
  },

  //ui
  clickMe:function() {
    this.content.toggleSelected();
  },

  //observers
  setIcon: function() {
    this.marker.setIcon(this.iconMap[this.content.selected]);
  }.observes("content.selected")
});
