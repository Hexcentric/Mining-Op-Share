var Ops = new Meteor.Collection("Ops");
Rocks = new Meteor.Collection("Rocks")
RockPrices = new Meteor.Collection("RockPrices")
Players = new Meteor.Collection("Players")
Hauls = new Meteor.Collection("Hauls")

//var propagate = function () {
    

var calcCash = function(    ) {
    if (Session.get("using_op")) {
	var op = Ops.findOne({_id:Session.get("using_op")})
	console.log(op.boss,Meteor.userId());
	if (op.boss==Meteor.userId()) {
	    Session.set("isBoss",true);
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
		    var ratio = parseFloat(miners[i].effort) / parseFloat(totalEffort)
		    var cash = (totalCash * ratio).toFixed(2)
		    var rockets = {}
		    for (j=0;j<rocks.length;j++) {
			var rock = rocks[j]
			rockets[rock.name] = ratio*rock.num
		    };
		    cash = isNaN(cash)? 0:cash;
		    miners[i].cash = cash
		    miners[i].rocks = rockets;
		};
		
		Hauls.update(Haul._id, {$set:
					{cash:totalCash
					 ,miners:miners
					 ,rocks:rocks}
				       });
	    });
	    playerCash = {};
	    Players.find({op:op._id}).forEach(function (player) {
		playerCash[player.name] = [0,{}];
	    })
	    Hauls.find({op:op._id}).forEach(function (haul) {
		var miners = haul.miners;
		for (i=0;i<miners.length;i++) {
		    var name = miners[i].name
		    var cash = miners[i].cash;
		    var rocks = miners[i].rocks;
		    playerCash[name][0] += parseFloat(cash)
		    var keys = Object.keys(rocks);
		    for (j=0;j<keys.length;j++) {
			if (playerCash[name][1][keys[j]]) {
			    playerCash[name][1][keys[j]] += parseFloat(rocks[keys[j]])
			} else {
			    playerCash[name][1][keys[j]] = parseFloat(rocks[keys[j]])
			};
		    };
		}
	    });
	    var miners = Hauls.findOne({op:op._id}).miners;
	    for (i=0;i<miners.length;i++) {
		var miner = miners[i].name;
		var player = Players.findOne({name:miner,op:op._id});
		if (player.payType=="Cash") {
		    var cash = playerCash[miner][0].toFixed(2);
		    Players.update(player._id,{$set:
					       {payout:cash}
					      });
		} else {
		    var rocks = playerCash[miner][1];
		    Players.update(player._id,{$set:
					       {payout:rocks}
					      });
		};
	    };
	};
    };
};

if (Meteor.isClient) {
    Accounts.ui.config({passwordSignupFields: 'USERNAME_ONLY'});
    Session.set("using_op",undefined);
    Session.set("isBoss",false);
    var setNull = function () {
	Session.set("add_rock",false);
	Session.set("show_hauls",false);
	Session.set("show_players",false);  
	Session.set("show_ops",false);
	Session.set("selected_op",undefined);
	Session.set("selected_rock",undefined);
	Session.set("selected_player",undefined);
	Session.set("edit_price",undefined);
	Session.set("selected_haul");
    };
    setNull();
    Session.set("shosw_ops",true);
    Meteor.subscribe("Rocks");
    Meteor.subscribe("RockPrices");
    Meteor.subscribe("Players");
    Meteor.subscribe("Ops");
    Meteor.subscribe("Hauls");
    Meteor.subscribe("userdata");
    window.setInterval(calcCash,5000);
    Handlebars.registerHelper('session', function(key,extras) {
	return Session.get(key);
    });
    Template.rockPriceDisplay.rock = function () {
	return RockPrices.find({op:Session.get("using_op")},{sort: {value:-1}});
    };	
    Template.addRock.rock = function () {
	return Rocks.find({},{sort:{name:1}});
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
    Template.Main.showHideHauls = function () {
	return Session.get("show_hauls")?"Hide":"Show";
    };
    Template.Main.showHidePlayers = function () {
	return Session.get("show_players")?"Hide":"Show";
    };
    Template.editPrice.nameFinder = function () {
	return RockPrices.findOne({_id:Session.get("selected_rock")}).name;
    };
    Template.editPrice.priceFinder = function () {
	return RockPrices.findOne({_id:Session.get("selected_rock")}).price;
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
	    if (!Ops.findOne({name:opName})) {
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
				,payType:"Cash"
				,payout:0
				,rocks:{}
			       });
		window.setTimeout(addHaul,1000);
		setNull()
	    };
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
	    setNull();
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
    Template.players.selected = function (spot, value) {
	if (Players.findOne({_id:Session.get("selected_player")})) {
	    if (spot=="role") {
		return (value==Players.findOne({_id:Session.get("selected_player")}).role)?"selected":""; 
	    } else {
		return (value==Players.findOne({_id:Session.get("selected_player")}).payType)?"selected":"";	    
	    };
	};
    };
    Template.player.pay = function (player) {
	if (player.payType=="Cash") {
	    return player.payout;
	} else {
	    var retStr = "";
	    var rocks =Object.keys(player.payout);
	    for (i=0;i<rocks.length;i++) {
		retStr += rocks[i] +": "+player.payout[rocks[i]]+"<br>"
	    };
	    return retStr;
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
	if (Session.get("selected_haul")){
	    var haul = Hauls.findOne({_id:Session.get("selected_haul")})
	    var miners = haul.miners;
	    var Miners = Players.find({op:Session.get("using_op")});
	    return miners;
	};
    };
//	if (miners.length < Miners.count()) {
//	    Miners.forEach(function(miner) {
//		breaker = true;
//		for (i=0;i<miners.length;i++) {
//		    if (miners[i].name==miner.name) {
//			breaker = false;
//		    };
//		};
//		if (breaker) {
////		    miners.push({name:miner.name,effort:0,cash:0,rocks:{}})
//		};
//	    });
//	    Hauls.update(haul._id,{$set:
//				   {miners:miners}
//				  });
//	};
    var dynamicSort = function(property) {
	var sortOrder = 1;
	if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
	}
	return function (a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
	}
    }
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
	return rocks.sort(dynamicSort("name"));
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
    newPlayer = function (newPlayerName) {
//	if (!Players.findOne({op:Session.get("using_op"),name:newPlayerName})) {
	    var opMembers = Ops.findOne({_id:Session.get("using_op")}).members
	    opMembers.push(newPlayerName);
	    Ops.update(Session.get("using_op"),{$set:
						{members:opMembers}
	   				       });
	    Hauls.find({op:Session.get("using_op")}).forEach(function(haul) {
		var miners = haul.miners;
		miners.push({name:newPlayerName,effort:0,cash:0,rocks:{}});
		Hauls.update(haul._id,{$set:
				       {miners:miners
					,totalEffort:haul.totalEffort}
				      });
	    });
//	};
//	window.setTimeout(calcCash,1000);
    };
    Template.players.events({
	'click input.AddPlayer' : function () {
	    breaker = true;
	    newPlayerName = document.getElementById("newPlayerName").value;
	    payPref = document.getElementById("payout").value;
	    Players.insert({name:newPlayerName
			    ,role:document.getElementById("playerRole").value
			    ,op:Session.get("using_op")
			    ,payType:payPref
			    ,payout:("Cash"==payPref)?0:{}
			   });
	    window.setTimeout(function () {newPlayer(newPlayerName)}
					   ,3000);
//		calcCash();
//		window.setTimeout(calcCash,1000);
	},
	'click input.EditPlayer' : function () {
	    playerName = document.getElementById("newPlayerName").value;
	    playerRole = document.getElementById("playerRole").value;
	    payPref = document.getElementById("payout").value;
	    Players.update(Session.get("selected_player"),{$set:
							   {name:playerName
							    ,role:playerRole
							    ,payType:payPref
							   ,payout:(payPref=="Cash")?0:{}}
							  })
	    
	},
	'click input.removePlayer' : function () {
	    var player = Players.findOne({_id:Session.get("selected_player")}).name;
	    Players.remove(Session.get("selected_player"));
	    var oldMiners = haul.miners;
	    var newMiners = [];
	    var newEffort = 0;
	    for (i=0;i<oldMiners.length;i++) {
		if (oldMiners[i].name!=player) {
		    newMiners.push(oldMiners[i])
		    newEffort += oldMiners[i].effort
		};
	    };
	    
	    Hauls.find({op:Session.get("using_op")}).forEach(function (haul) {
		Hauls.update(haul._id,{$set:
				       {miners:newMiners
					,totalEffort:newEffort}
				      });
	    });
	    Ops.update(Session.get("using_op"),{$set:
						{miners:newMiners}
					       });
	    Session.set("selected_player",undefined);
//	    window.setTimeout(calcCash,1000);
	},
	'click input.makeBoss' : function () {
	    var newBoss = Meteor.users.findOne({username:Players.findOne({_id:Session.get("selected_player")}).name})
	    var name = Players.findOne({_id:Session.get("selected_player")}).name;
	    console.log(name,Meteor.users.findOne({username:"Bobby"}));
	    console.log(newBoss);
	    Ops.update(Session.get("using_op"), {$set:
						 {boss:newBoss._id}
						});
	    Session.set("isBoss",false);
	    setNull();
	}
    });
    var addHaul = function () {
	var op = Session.get("using_op")
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
	    miners.push({name:player.name,effort:1,cash:0,rocks:{}})
	});
	var number = Hauls.find({op:op}).count()+1;
	Hauls.insert({number:number,op:op,miners:miners,number:number,rocks:rocks,cash:0,totalEffort:0});
    };
    Template.hauls.events({
	'click input.addNewHaul' : function () {
	    addHaul();
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
	    value = parseFloat(document.getElementById("addRockPrice").value);
	    for(var i = 0, m = null; i < rockDefaults.length; ++i) {
		if(rockDefaults[i].name != rock) {
		    continue; 
		};
		density = rockDefaults[i].density;
		defaultValue = rockDefaults[i].price;
		break;
	    };
	    var val = value? parseFloat(value):parseFloat(defaultValue);
	    RockPrices.insert({name:rock,
			       density:density,
			       price: val,
			       value:parseFloat((val/density).toFixed(2)),
			       op:Session.get("using_op")
			      });
	}
    });
    Template.editPrice.events({
	'click input.editRock' : function () {
	    var nuPrice = parseFloat(document.getElementById("newPrice").value);
	    var density = RockPrices.findOne(Session.get("selected_rock")).density;
	    RockPrices.update(Session.get("selected_rock"),{$set:
							    {price:nuPrice
							     ,value:nuPrice/density}
							   });
//	    window.setTimeout(calcCash,1000)
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
	}
    });
}

var rockDefaults = [{name:"Veldspar",density:0.1,price:13.7}
		    ,{name:"Concentrated Veldspar",density:0.1,price:14}
		    ,{name:"Dense Veldspar",density:0.1,price:14.9}
		    ,{name:"Kernite",density:1.2,price:189}
		    ,{name:"Luminous Kernite",density:1.2,price:201}
		    ,{name:"Fiery Kernite",density:1.2,price:210}
		    ,{name:"Scordite",density:.15,price:22}
		    ,{name:"Condensed Scordite",density:.15,price:24}
		    ,{name:"Massive Scordite",density:.15,price:26}
		    ,{name:"Pyroxeres",density:0.3,price:48}
		    ,{name:"Solid Pyroxeres",density:0.3,price:50}
		    ,{name:"Viscous Pyroxeres",density:0.3,price:52}
		    ,{name:"Arkonor",density:16,price:3017}
		    ,{name:"Crimson Arkonor",density:16,price:3135}
		    ,{name:"Prime Arkonor",density:16,price:3255}
		    ,{name:"Bistot",density:16,price:2884}
		    ,{name:"Monoclinic Bistot",density:16,price:3048}
		    ,{name:"Triclinic Bistot",density:16,price:3200}
		    ,{name:"Dark Ochre",density:8,price:1194}
		    ,{name:"Onyx Ochre",density:8,price:1300}
		    ,{name:"Obsidian Ochre",density:8,price:1400}
		    ,{name:"Crokite",density:16,price:2775}
		    ,{name:"Crystalline Crokite",density:16,price:2850}
		    ,{name:"Sharp Crokite",density:16,price:2900}
		    ,{name:"Gneiss",density:5,price:847}
		    ,{name:"Iridescent Gneiss",density:5,price:900}
		    ,{name:"Prismatic Gneiss",density:5,price:950}
		    ,{name:"Hedbergite",density:3,price:600}
		    ,{name:"Glazed Hedbergite",density:3,price:660}
		    ,{name:"Vitric Hedbergite",density:3,price:700}
		    ,{name:"Hemorphite",density:3,price:600}
		    ,{name:"Radiant Hemorphite",density:3,price:645}
		    ,{name:"Vivid Hemorphite",density:3,price:700}
		    ,{name:"Jaspet",density:2,price:370}
		    ,{name:"Pristine Jaspet",density:2,price:400}
		    ,{name:"Pure Jaspet",density:2,price:385}
		    ,{name:"Mercoxit",density:40,price:5000}
		    ,{name:"Magma Mercoxit",density:40,price:5200}
		    ,{name:"Vitreous Mercoxit",density:40,price:5400}
		    ,{name:"Omber",density:0.6,price:70}
		    ,{name:"Silvery Omber",density:0.6,price:75}
		    ,{name:"Golden Omber",density:0.6,price:80}
		    ,{name:"Plagioclase",density:0.35,price:47}
		    ,{name:"Azure Plagioclase",density:0.35,price:50}
		    ,{name:"Rich Plagioclase",density:0.35,price:53}
		    ,{name:"Spodumain",density:16,price:2000}
		    ,{name:"Bright Spodumain",density:16,price:2200}
		    ,{name:"Gleaming Spodumain",density:16,price:2400}
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
	Meteor.publish("userdata",function () {
	    return Meteor.users.find({});
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
		    if (player.name == editPlayer['name'] && player.name != oldPlayer.name) {
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
		var rock = rockDefaults[i];
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
