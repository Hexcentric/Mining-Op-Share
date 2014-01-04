Rocks = new Meteor.Collection("Rocks")
rockPrices = new Meteor.Collection("rockPrices")


if (Meteor.isClient) {
    Meteor.subscribe("Rocks");
    Meteor.subscribe("rockPrices");
    Handlebars.registerHelper('session', function(key,extras) {
	return Session.get(key);
    });
    Template.rockPriceDisplay.rock = function () {
	return rockPrices.find({});
    };	
    Template.addRock.rock = function () {
	return Rocks.find({});
    };
    Template.addRock.events({
	'click input.addRock' : function () {
	    rock = document.getElementById("rockDropDown").value;
	    value = document.getElementById("addRockPrice").value;
	    for(var i = 0, m = null; i < rockDefaults.length; ++i) {
		if(rockDefaults[i].name != rock) {
		    continue; 
		};
		density = rockDefaults[i].density;
		defaultValue = rockDefaults[i].value;
		break;
	    };
	    var val = value? value:defaultValue;
	    rockPrices.insert({name:rock,
			       density:density,
			       price: val,
			       value:val/density
			       });
	}
    });
}

var rockDefaults = [{name:"Kernite",density:1.2,value:189}
		   ,{name:"Luminous Kernite",density:1.2,value:201}
		   ,{name:"Fiery Kernite",density:1.2,value:210}
		   ,{name:"Scordite",density:.15,value:22}
		   ,{name:"Condensed Scordite",density:.15,value:24}
		   ,{name:"Massive Scordite",density:.15,value:26}
		   ,{name:"Pyroxeres",density:0.3,value:48}
		   ,{name:"Solid Pyroxeres",density:0.3,value:50}
		   ,{name:"Viscous Pyroxeres",density:0.3,value:52}];


if (Meteor.isServer) {
  Meteor.startup(function () {
      Meteor.publish("Rocks", function() {
	  return Rocks.find({})
      });
      Meteor.publish("rockPrices", function() {
	  return rockPrices.find({owner:this.userId})
      });
      rockPrices.allow({
	  insert: function (userID,rock) {
	      breaker = true;
	      rockPrices.find({}).forEach(function(rocker) {
		  if(rocker.name == rock.name) {
		      breaker = false;
		  };
	      });
	      return breaker;
	  },
	  remove: function (userID,rock) {
	      return true;
	  },
	  update: function (userID,rock) {
	      return true;
	  }
      });
      if (Rocks.find({}).count() != rockDefaults.length) {
	  for (var i=0;i<rockDefaults.length;i++) {
	      breaker = true
	      rockPrices.find({}).forEach(function(rocker) {
		  if(rocker.name == rock.name) {
		      breaker = false;
		  };
	      });
	      if (breaker) {
		  Rocks.insert(rockDefaults[i]);
	      };
	  };
      };
    // code to run on server at startup
  });
}
