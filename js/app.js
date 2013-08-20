App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here
});

App.Marker = Ember.Object.extend({
});


App.MapView = Ember.View.extend({
  id: 'map_canvas',
  tagName: 'div',

  attributeBindings: ['style'],
  style:"width:50%; height:200px",
  
  map:null,

  markers:[],
  
  didInsertElement: function() {
    var mapOptions = {
      center: new google.maps.LatLng(37.871667, -122.272778),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var controller = this.get("controller");
    var map = new google.maps.Map(this.$().get(0),mapOptions);
    
    this.set("map",map);
    
    var that = this;
    
    // When clicking on the map, we create our own markerObject and pass it to our controller.
    // The controller handles the marker management.
    // The view handles placing the marker on the map.
    google.maps.event.addListener(map, 'click', function(event){
     

      // at first I had this code here... but the MarkerController takes care of it now.
      // when adding a new marker, all markers are reset to a red icon. 
      // $.each(that.get("markers"), function (i, m) {
      //   m.setIcon("http://maps.google.com/mapfiles/ms/icons/red-dot.png");
      // });

      // the newly added marker gets a green color (selected marker)
      var marker = new google.maps.Marker({
        position: event.latLng,
        //icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        //animation: google.maps.Animation.DROP
      });

      // create a new marker object containing the lat,lng and the googleMarker
      var markerObject = App.Marker.create({
                            lat: event.latLng.lat(),
                            lng: event.latLng.lng(),
                            googleMarker: marker
      });

      //markerObject.set("selected",true);

      // store the google marker object on this view. 
      that.get("markers").pushObject(marker);

      // Instruct the controller that the marker was added.
      controller.addMarker(markerObject);

      google.maps.event.addListener(marker, 'click', function() {
        controller.markerClick(markerObject);
      });

      marker.setMap(that.get("map"));
      
    });
  }
});

// This is our main array controller that does the marker management
// It keeps a list of marker objects in its content

App.IndexController = Ember.ArrayController.extend({
  content: [],
  
  // We add the markr to the ArrayControllers content.
  addMarker: function (marker) {
    this.content.pushObject(marker);
  },

  // When clicking on a marker, we toggle the selected state.  
  markerClick: function(marker) {
    marker.set("selected",!marker.get("selected"));
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
        output = "";

        var toBeRemoved = [];

        for (var i = arr.length -1; i >= 0; i--) {
            toBeRemoved.push(arr[i]);
        }

        for (var i = toBeRemoved.length -1; i >= 0; i--) {
          toBeRemoved[i].googleMarker.setMap(null);
          this.content.removeObject(toBeRemoved[i]);
        }

    }
  },

  // This is called when our content changes (markers added or removed).
  // in this case we highlight the last marker. (should do this differently)
  // highLightSelectedMarkers: function() {

  //   $.each(this.content, function (i, m) {
  //       m.set("selected",false);
  //   });

  //   if (this.content.length>0) {
  //     this.content[this.content.length-1].set("selected",true);
  //   }

  // }.observes('content.@each')
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