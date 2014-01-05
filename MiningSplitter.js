Ops = new Meteor.Collection("Ops")
Rocks = new Meteor.Collection("Rocks")
RockPrices = new Meteor.Collection("RockPrices")
Players = new Meteor.Collection("Players")
Hauls = new Meteor.Collection("Hauls")

if (Meteor.isClient) {
    Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});
    Session.set("add_rock",false);
    Session.set("show_hauls",true);
    Session.set("show_players",false);  
    Session.set("show_ops",true);
    Session.set("selected_op",undefined);
    Session.set("using_op",undefined);
    Session.set("selected_rock",undefined);
    Session.set("selected_player",undefined);
    Session.set("edit_price",undefined);
    Meteor.subscribe("Rocks");
    Meteor.subscribe("RockPrices");
    Meteor.subscribe("Players");
    Meteor.subscribe("Ops");
//    Ops.insert({name:"First"
//		,members:[Meteor.userId()]
//	       });
    console.log(Ops.find({}).count());
//
//    Meteor.users.update(Meteor.userId(),{$set:
//					 {op:1}
//					});
    Handlebars.registerHelper('session', function(key,extras) {
	return Session.get(key);
    });
    Template.rockPriceDisplay.rock = function () {
	return RockPrices.find({},{sort: {value:-1}});
    };	
    Template.addRock.rock = function () {
	return Rocks.find({});
    };
    Template.Main.showHideRocks = function () {
	return Session.get("add_rock")?"Hide":"Show";
    };
    Template.opDisplay.operations = function () {
	var returning = [];
	console.log("oplen",Ops.find({}).count());
	Ops.find({}).forEach(function (op) {
	    var members = op.members;
	    var user = Meteor.userId();
	    console.log(user);
	    for (i=0;i<members.length;i++) {
		if (user==members[i]) {
		    console.log(members[i]);
		    returning.push(op);
		    break;
		};
	    };
	});
	console.log("len",returning.length);
	return returning;
    };
    Template.Main.showHideHauls = function () {
	return Session.get("show_hauls")?"Hide":"Show";
    };
    Template.Main.showHidePlayers = function () {
	return Session.get("show_players")?"Hide":"Show";
    };
    Template.players.players = function () {
	var players = Players.find({});
	var returning = [];
	players.forEach(function () {
	});
	return returning;
    };
    Template.editPrice.nameFinder = function () {
	return RockPrices.findOne({_id:Session.get("selected_rock")}).name;
    };
    Template.operation.events({
	'click' : function () {
	    if (Session.equals("selected_op",this._id)) {
		
		Session.set("selected_op",undefined);
	    } else {
		Session.set("selected_op",this._id);
	    };
	}
    });
    Template.operation.selected = function () {
	return Session.equals("selected_op",this._id) ? "selected" : '';
    };
    Template.Main.events({
	'click input.showAddRock' : function () {
	    Session.set("add_rock",true^Session.get("add_rock"));
	},
	'click input.showHauls' :function () {
	    Session.set("show_hauls",true^Session.get("show_hauls"));
	},
	'click input.showPlayers' :function () {
	    Session.set("show_players",true^Session.get("show_players"));
	},
	    
    });
    Template.opDisplay.events({
	'click input.addOp' : function () {
	    var opName = document.getElementById("newOpName").value;
	    console.log(opName);
	    Ops.insert({name:opName
			,boss:Meteor.userId()
			,members:[Meteor.userId()]
		       });
	    }
    });
    Template.rock.selected = function () {
	return Session.equals("selected_rock",this._id) ? "selected" : '';
    };
    Template.player.selected = function () {
	return Session.equals("selected_player",this._id) ? "selected" : '';
    };
    Template.players.playerName = function () {
	return Players.findOne({_id:Session.get("selected_player")});
    };
    Template.players.addEdit = function () {
	if (Session.get("selected_player")) {
	    return "Edit";
	} else {
	    return "Add";
	};
    };
    Template.players.events({
	'click input.AddPlayer' : function () {
	    breaker = true;
	    newPlayerName = document.getElementById("newPlayerName").value;
	    Players.insert({name:newPlayerName
			    ,role:document.getElementById("playerRole").value
			   });
	},
	'click input.EditPlayer' : function () {
	    playerName = document.getElementById("newPlayerName").value;
	    playerRole = document.getElementById("playerRole").value;
	    Players.update(Session.get("selected_player"),{$set:
							   {name:playerName
							    ,role:playerRole}
							  })
	},
	'click input.removePlayer' : function () {
	    Players.remove(Session.get("selected_player"));
	    Session.set("selected_player",undefined);
	}
    });
    Template.rock.events({
	'click': function () {
	    if (Session.equals("selected_rock",this._id)) {
		Session.set("edit_price",undefined);
		Session.set("selected_rock",undefined);
	    } else {
		Session.set("edit_price",this._id);
		Session.set("selected_rock",this._id);
	    };
	}
    });
    Template.player.events({
	'click': function () {
	    if (Session.equals("selected_player",this._id)) {
		Session.set("selected_player",undefined);
	    } else {
		Session.set("selected_player",this._id);
	    };
	}
    });
    Template.addRock.events({
	'click input.addRock' : function () {
	    rock = document.getElementById("rockDropDown").value;
	    value = document.getElementById("addRockPrice").value;
	    for(var i = 0, m = null; i < rockDefaults.length; ++i) {
		if(rockDefaults[i].name != rock) {
		    continue; 
		};
		density = rockDefaults[i].density;
		defaultValue = rockDefaults[i].price;
		break;
	    };
	    var val = value? value:defaultValue;
	    RockPrices.insert({name:rock,
			       density:density,
			       price: val,
			       value:(val/density).toFixed(2)
			       });
	}
    });
    Template.editPrice.events({
	'click input.editRock' : function () {
	    RockPrices.update(Session.get("selected_rock"),{$set:
							    {price:document.getElementById("newPrice").value}
							   });
	}
    });
}

var rockDefaults = [{name:"Kernite",density:1.2,price:189}
		   ,{name:"Luminous Kernite",density:1.2,price:201}
		   ,{name:"Fiery Kernite",density:1.2,price:210}
		   ,{name:"Scordite",density:.15,price:22}
		   ,{name:"Condensed Scordite",density:.15,price:24}
		   ,{name:"Massive Scordite",density:.15,price:26}
		   ,{name:"Pyroxeres",density:0.3,price:48}
		   ,{name:"Solid Pyroxeres",density:0.3,price:50}
		   ,{name:"Viscous Pyroxeres",density:0.3,price:52}
//		   ,{name:"",density:0,price:0}
		   ];


if (Meteor.isServer) {
    Meteor.startup(function () {
	Meteor.publish("Rocks", function() {
	    return Rocks.find({});
	});
	Meteor.publish("RockPrices", function() {
	    return RockPrices.find({owner:this.userId});
	});
	Meteor.publish("Players",function () {
	    return Players.find({owner:this.userId});
	});
	Meteor.publish("Ops",function () {
	    return Ops.find({});
	});
	RockPrices.allow({
	    insert: function (userID,rock) {
		breaker = true;
		RockPrices.find({}).forEach(function(rocker) {
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
	Meteor.users.allow({
	    update: function () {
		return true;
	    }
	});
	Players.allow({
	    insert: function (userID,newPlayer) {
		breaker = true;
		Players.find({}).forEach(function (player) {
		    if (player.name == newPlayer.name) {
			console.log(player.name,newPlayer.name);
			breaker = false;
		    };
		});
		return breaker;
	    },
	    remove: function (userID,player) {
		return true;
	    },
	    update: function (userID,oldPlayer,n,editPlayerCommand) {
		breaker = true;
		editPlayer = editPlayerCommand['$set']
		Players.find({}).forEach(function (player) {
		    console.log(editPlayer);
		    console.log(player.name,editPlayer['name']);
		    if (player.name == editPlayer['name']) {
			breaker = false;
		    };
		});
		return breaker;
	    }
	});
	Ops.allow({
	    insert: function () {
		return true;
	    }
	});
	if (Rocks.find({}).count() != rockDefaults.length) {
	    for (var i=0;i<rockDefaults.length;i++) {
		breaker = true
		RockPrices.find({}).forEach(function(rocker) {
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
