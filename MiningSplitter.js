var Ops = new Meteor.Collection("Ops");
Rocks = new Meteor.Collection("Rocks")
RockPrices = new Meteor.Collection("RockPrices")
Players = new Meteor.Collection("Players")
Hauls = new Meteor.Collection("Hauls")

//var propagate = function () {
    

var calcCash = function(    ) {
    var op = Ops.findOne({_id:Session.get("using_op")})
    Hauls.find({op:op._id}).forEach(function (Haul) {
	var miners = Haul.miners;
	var totalEffort = Haul.totalEffort;
	var op = Ops.findOne({_id:Session.get("using_op")});
	var rocks = Haul.rocks;
	var totalCash = 0;
	for (i=0;i<rocks.length;i++) {
	    rocks[i].cash = RockPrices.findOne({op:op._id,name:rocks[i].name}).price*rocks[i].num
	    totalCash += rocks[i].cash
	};
	for (i=0;i<miners.length;i++) {
	    miners[i].cash = (totalCash * miners[i].effort / totalEffort).toFixed(2)
	    
	};
	    
	Hauls.update(Haul._id, {$set:
			   {cash:totalCash
			    ,miners:miners
			    ,rocks:rocks}
			  });
    });
    playerCash = {};
    Players.find({op:op._id}).forEach(function (player) {
	playerCash[player.name] = 0;
    })
    
    Hauls.find({op:op._id}).forEach(function (haul) {
	var miners = haul.miners;
	for (i=0;i<miners.length;i++) {
	    var name = miners[i].name
	    var cash = miners[i].cash;
	    playerCash[name] += parseFloat(cash)
	}
    });
    var miners = Hauls.findOne({op:op._id}).miners;
    for (i=0;i<miners.length;i++) {
	var miner = miners[i].name
	Players.update(Players.findOne({name:miner,op:op._id})._id,{$set:
				  {cash:playerCash[miner].toFixed(2)}
				 });
	
    };
};

if (Meteor.isClient) {
    change = function (miner) {
//	var nuEffort = document.getElementById(miner.id).value;
//	var miner = miner.id.slice(0,-7);
//	var Haul = Hauls.findOne({_id:Session.get("selected_haul")});
//	var miners = Session.get("miners");
//	for (i=0;i<miners.length;i++) {
//	    if (miners[i].name==miner) {
//		miners[i].effort = nuEffort;
//	    };
//	};
//	Hauls.update(Haul._id,{$set:
//			      {miners:miners}
//			      });
//	Session.set("miners",miners);
//	console.log("DUN");
    };

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
    Session.set("isBoss",false);
    Meteor.subscribe("Rocks");
    Meteor.subscribe("RockPrices");
    Meteor.subscribe("Players");
    Meteor.subscribe("Ops");
    Meteor.subscribe("Hauls");
//    Ops.insert({name:"First"
//		,members:[Meteor.userId()]
//	       });
//
//    Meteor.users.update(Meteor.userId(),{$set:
//					 {op:1}
//					});
    Handlebars.registerHelper('session', function(key,extras) {
	return Session.get(key);
    });
    Template.rockPriceDisplay.rock = function () {
	return RockPrices.find({op:Session.get("using_op")},{sort: {value:-1}});
    };	
    Template.addRock.rock = function () {
	return Rocks.find({});
    };
    Template.Main.showHideRocks = function () {
	return Session.get("add_rock")?"Hide":"Show";
    };
    Template.Main.opCash = function () {
	var cash = 0;
	Hauls.find({op:Session.get("using_op")}).forEach(function (haul) {
	    cash += haul.cash;
	});
	return cash;
    };
    Template.opDisplay.operations = function () {
	var returning = [];
	Ops.find({}).forEach(function (op) {
	    var members = op.members;
	    var user = Meteor.user().username;
	    for (i=0;i<members.length;i++) {
		if (user==members[i]) {
		    returning.push(op);
		    break;
		};
	    };
	});
	return returning;
    };
//    haulRocks = function (number) {
//	console.log("lose")
//	Session.set("haul_rocks_"+number,document.getElementById("showRockCheck"+number).checked);
  //  };
//    Template.haul.haulRocksShown = function (number) {
//	console.log("win");
//	return Session.get("haul_rocks_"+number);
//    };
//    Template.haul.
    Template.Main.showHideHauls = function () {
	return Session.get("show_hauls")?"Hide":"Show";
    };
    Template.Main.showHidePlayers = function () {
	return Session.get("show_players")?"Hide":"Show";
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
    Template.Main.usedOp = function () {
	return Ops.findOne({_id:Session.get("using_op")}).name;
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
	'click input.showOps' : function () {
	    Session.set("show_ops",true^Session.get("show_ops"));
	}
	    
    });
    Template.operation.isBoss = function () {
	return (this.boss==Meteor.userId()) ? "Yes":"No";
    };
    Template.opDisplay.useOrDont = function () {
	return Session.equals("selected_op",Session.get("using_op"))? "Stop Using":"Use";
    };
    Template.opDisplay.events({
	'click input.addOp' : function () {
	    var opName = document.getElementById("newOpName").value;
	    Ops.insert({name:opName
			,boss:Meteor.userId()
			,members:[Meteor.user().username]
			,cash:0
		       });
	    Session.set("using_op",Ops.findOne({name:opName})._id);
	    Session.set("isBoss",true);
	    Session.set("show_ops",false);
	    Players.insert({name:Meteor.user().username
			    ,role:"Hauler"
			    ,op:Session.get("using_op")
			    ,cash:0
			   });
	},
	'click input.useOp' :function () {
	    var opId = Session.get("selected_op") 
	    if (Session.equals("using_op",opId)) {
		Session.set("using_op",undefined);
		Session.set("isBoss",false);
	    } else {
		Session.set("using_op", opId);
		Session.set("show_ops",false);
		if (Meteor.userId() == Ops.findOne({_id:opId}).boss) {
		    Session.set("isBoss",true);
		} else {
		    Session.set("isBoss",false);
		};
	    };
	},
	'click input.remOp' :function () {
	    var opId = Session.get("selected_op")
	    Session.set("selected_op",undefined);
	    Session.set("using_op",undefined);
	    Ops.remove(opId);
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
    Template.players.players = function () {
	return Players.find({op:Session.get("using_op")});
    };
    Template.hauls.hauls = function () {
	return Hauls.find({op:Session.get("using_op")},{sort:
						       {number:1}});
    };
    Template.haul.selected = function () {
	return Session.equals("selected_haul",this._id)?"selected":"";
    };
    Template.miner.r10 = function () {
	var retArray = [];
	for (i=0;i<=1;i=i+0.1) {
	    retArray.push(i.toFixed(1));
	};
	retArray.reverse();
	return retArray;
    };
    Template.haulData.miner = function () {
	var haul = Hauls.findOne({_id:Session.get("selected_haul")})
//	try { 
//	calcCash(haul)
//	} catch(err) {
//	    console.log(err,haul);
//	};
	var miners = haul.miners;
	var Miners = Players.find({op:Session.get("using_op")});
	if (miners.length < Miners.count()) {
	    Miners.forEach(function(miner) {
		breaker = true;
		for (i=0;i<miners.length;i++) {
		    if (miners[i].name==miner.name) {
			breaker = false;
		    };
		};
		if (breaker) {
		    miners.push({name:miner.name,effort:1,cash:0})
		};
	    });
	    Hauls.update(haul._id,{$set:
				   {miners:miners}
				  });
	};
	return miners;
    };
    Template.haulData.rock = function () {
	var rocks = Hauls.findOne({_id:Session.get("selected_haul")}).rocks;
	var Rocks = RockPrices.find({op:Session.get("using_op")});
	if (rocks.length < Rocks.count()) {
	    Rocks.forEach(function (rock) {
		breaker = true;
		for (j=0;j<rocks.length;j++) {
		    if (rocks[j].name == rock.name) {
			breaker = false;
		    };
		};
		if (breaker) {
		    rocks.push({name:rock.name
				,num:0
				,cash:0
			       });
		};
	    });
//	    Hauls.update(Session.get("selected_haul"),{$set:
//						       {rocks:rocks}
//						      });
	};
	return rocks;
    };
    Template.miner.selected = function (miner) {
	return parseFloat(this)== Session.get("miner_Effort")?"selected":"";
    };
    Template.haul.events({
	'click' : function () {
	    if (Session.equals("selected_haul",this._id)) {
		Session.set("selected_haul",undefined);	
	    } else {
		Session.set("selected_haul",this._id);
	    };
	}
    });
	
    Template.players.events({
	'click input.AddPlayer' : function () {
	    breaker = true;
	    newPlayerName = document.getElementById("newPlayerName").value;
	    Players.insert({name:newPlayerName
			    ,role:document.getElementById("playerRole").value
			    ,op:Session.get("using_op")
			    ,cash:0
			   });

	    var opMembers = Ops.findOne({_id:Session.get("using_op")}).members
	    opMembers.push(newPlayerName);
	    Ops.update(Session.get("using_op"),{$set:
						{members:opMembers}
	   					       });
	    Hauls.find({op:Session.get("using_op")}).forEach(function(haul) {
		var miners = haul.miners;
		miners.push({name:newPlayerName,effort:1,cash:0});
		Hauls.update(haul._id,{$set:
				        {miners:miners
					 ,totalEffort:haul.totalEffort+1}
				      });
	    });
	    calcCash();
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
	    var player = Players.findOne({_id:Session.get("selected_player")}).name;
	    Players.remove(Session.get("selected_player"));
	    Hauls.find({op:Session.get("using_op")}).forEach(function (haul) {
		var oldMiners = haul.miners;
		var newMiners = [];
		var newEffort = 0;
		for (i=0;i<oldMiners.length;i++) {
		    if (oldMiners[i].name!=player) {
			newMiners.push(oldMiners[i])
			newEffort += oldMiners[i].effort
		    };
		};
		Hauls.update(haul._id,{$set:
				       {miners:newMiners
					,totalEffort:newEffort}
				      });
	    });
	    Session.set("selected_player",undefined);
	    calcCash();
	}
    });
    Template.hauls.events({
	'click input.addNewHaul' : function () {
	    var op = Session.get("selected_op")
	    var rocks = [];
	    var Rocks = RockPrices.find({op:op})
	    Rocks.forEach(function (rock) {
		rocks.push({name:rock.name
			    ,num:0
			    ,cash:0
			   })
	    });
	    var miners = [];
	    Players.find({op:op}).forEach(function (player){
		miners.push({name:player.name,effort:1,cash:0})
	    });
	    var number = Hauls.find({op:op}).count()+1;
	    Hauls.insert({number:number,op:op,miners:miners,number:number,rocks:rocks,cash:0,totalEffort:0});
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
			       value:(val/density).toFixed(2),
			       op:Session.get("using_op")
			      });
	}
    });
    Template.editPrice.events({
	'click input.editRock' : function () {
	    var nuPrice = document.getElementById("newPrice").value;
	    var density = RockPrices.findOne(Session.get("selected_rock")).density;
	    RockPrices.update(Session.get("selected_rock"),{$set:
							    {price:nuPrice
							     ,value:nuPrice/density}
							   });
	    calcCash()
	}
    });
    Template.haulData.events({
	'click input.applyHaulData' : function () {
	    var haul = Hauls.findOne({_id:Session.get("selected_haul")});
	    var op = Ops.findOne({_id:haul.op});
	    var miners = haul.miners;
	    var totalEffort = 0;
	    var rocks = [];
	    var op = Ops.findOne({_id:Session.get("using_op")});
	    var totalCash = 0;
	    RockPrices.find({op:op._id}).forEach(function (rock) {
		var rockName = rock.name;
		var number = parseInt(document.getElementById(rockName+"_num").value);
		var cash = number * rock.price;
		totalCash += cash;
		rocks.push({name:rockName,num:number,cash:cash});
	    });
	    for (i=0;i<miners.length;i++) {
		miners[i].effort = parseFloat(document.getElementById(miners[i].name+"_effort").value);
		totalEffort += miners[i].effort;
	    };
	    Hauls.update(haul._id,{$set:
			      {cash:totalCash
			       ,miners:miners
			       ,rocks:rocks
			       ,totalEffort:totalEffort
			      }});
	    calcCash();
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
	    return RockPrices.find({});
	});
	Meteor.publish("Players",function () {
	    return Players.find({});
	});
	Meteor.publish("Ops",function () {
	    return Ops.find({});
	});
	Meteor.publish("Hauls",function () {
	    return Hauls.find({});
	});
	RockPrices.allow({
	    insert: function (userID,rock) {
		breaker = true;
		RockPrices.find({}).forEach(function(rocker) {
		    if((rocker.name == rock.name && rocker.op == rock.op) || Ops.findOne({_id:rock.op}).boss!=userID ) {
			breaker = false;
		    };
		});
		return breaker;
	    },
	    remove: function (userID,rock) {
		if (userID == Ops.findOne({_id:rock.op}).boss){
		    return true;
		} else {
		    return false;
		}
	    },
	    update: function (userID,rock) {
		if (userID == Ops.findOne({_id:rock.op}).boss){
		    return true;
		} else {
		    return false;
		}
	    }
	});
	Hauls.allow({
	    insert: function (userId,haul) {	
		if (Ops.findOne({_id:haul.op}).boss ==userId) {
		    return true;
		} else {
		    return false;
		};
	    },
	    update: function (userId,haul) {
		if (Ops.findOne({_id:haul.op}).boss ==userId) {
		    return true;
		} else {
		    return false;
		};
	    },
	    remove: function (userId,haul) {
		if (Ops.findOne({_id:haul.op}).boss ==userId) {
		    return true;
		} else {
		    return false;
		};
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
		if (Ops.findOne({_id:newPlayer.op}).boss != userID) {
		    return false;
		};
		Players.find({}).forEach(function (player) {
		    if (player.name == newPlayer.name && player.op == newPlayer.op) {
			breaker = false;
		    };
		});
		return breaker;
	    },
	    remove: function (userID,player) {
		if (Ops.findOne({_id:player.op}).boss != userID) {
		    return false;
		} else {
		    return true;
		};
	    },
	    update: function (userID,oldPlayer,n,editPlayerCommand) {
		breaker = true;
		editPlayer = editPlayerCommand['$set']
		if (Ops.findOne({_id:oldPlayer.op}).boss != userID) {
		    return false;
		};		
		Players.find({}).forEach(function (player) {
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
	    },
	    update: function (userId,operation) {
		if (operation.boss == userId) {
		    return true;
		}else {
		    return false;
		};
	    },
	    remove: function (userId,operation) {
		if (operation.boss==userId) {
		    return true;
		} else {
		    return false;
		};
	    }
	});
	if (Rocks.find({}).count() != rockDefaults.length) {
	    for (var i=0;i<rockDefaults.length;i++) {
		breaker = true
		RockPrices.find({}).forEach(function(rocker) {
		    if(rocker.name == rock.name && rocker.op == rock.op) {
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
