Players = new Meteor.Collection("Players")
Ops = new Meteor.Collection("Ops")
GotRocks = new Meteor.Collection("GotRocks")
RockPrices = new Meteor.Collection("RockPrices")
Hauls = new Meteor.Collection("Hauls")

numFormat = function (Num) {
    var fractional = (Num - parseInt(Num)).toFixed(2).toString();
    var nList = parseInt(Num).toString().split("").reverse();
    retStr = [];
    for (i=0;i<nList.length;i++) {
	if (parseInt(i/3) == i/3 && i!= 0) {
	    retStr.push( ",");
	}
	retStr.push(nList[i]);
    }
    return retStr.reverse().join("")+fractional.slice(1);
};

unFormat = function (Num) {
    return parseFloat(Num.toString().replace(/\,/g,'')).toFixed(2)
};

dynamicSort = function(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    };
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    };
};

calcCash = function () {
    
};

rockDefaults = [{name:"Veldspar",density:0.1,price:13.7}
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

if (Meteor.isClient) {
    Meteor.subscribe("Players");
    Meteor.subscribe("Ops");
    Meteor.subscribe("RockPrices");
    Meteor.subscribe("Hauls");
    Meteor.subscribe("GetRocks");
    Meteor.subscribe("userData");
    Session.set("loginError",undefined);
    Session.set("using_op",undefined);
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
	Session.set("showData",false);
	Session.set("show_jet",false);
    };
    setNull();
    Session.set("show_ops",true);
    window.setInterval(calcCash,1000);
    Handlebars.registerHelper('session', function(key) {
	return Session.get(key);
    });
    Template.Details.usedOp = function () {
	return Ops.findOne({_id:Session.get("using_op")}).name
    };
    Template.Details.opCash = function () {
	return Ops.findOne({_id:Session.get("using_op")}).cash
    };
    Template.Details.cooperative = function () {
	return Ops.findOne({_id:Session.get("using_op")}).splitType=="Cooperative"
    };
    Template.Main.TrustMe = function () {
//	CCPEVE.requestTrust("http://localhost:3000")
//	CCPEVE.requestTrust("https://emops-beta.meteor.com")
    };
    Template.Main.Test = function () {
	return true; //testing purposes ONLY
	try {
//	    CCPEVE
	    return true;
	} catch(err) {
	    return false;
	};
    };
    Template.opDisplay.addEdit = function () {
	return Session.get("selected_op")?"Edit":"Start";
    };
    Template.players.isBoss = function () {
	console.log(Players.findOne({op:Session.get("using_op"),ID:Meteor.userId()}))
	try {
	    return Players.findOne({op:Session.get("using_op"),ID:Meteor.userId()}).boss;
	} catch(err) {
	};
    };
    Template.hauls.isBoss = function () {
	return Players.findOne({op:Session.get("using_op"),ID:Meteor.userId()}).boss;
    };
    Template.haulData.isBoss = function () {
	return Players.findOne({op:Session.get("using_op"),ID:Meteor.userId()}).boss;
    };
    Template.haulData.cooperative = function () {
	return Ops.findOne({_id:Session.get("using_op")}).splitType=="Cooperative";
    };
    Template.haulData.rock = function () {
	return RockPrices.find({op:Session.get("using_op")})
    };
    Template.rockData.cash = function () {
	var haul = Hauls.findOne({_id:Session.get("selected_haul")});
	var rocks = GotRocks.findOne({haul:haul._id})
	var price = RockPrices.findOne({op:Session.get("using_op"),name:this.name}).price;
	if (rocks) {
	    for (i=0;i<rocks.length;i++) {
		if (rocks[i].name==this.name) {
		    return numFormat(price*rocks[i].num);
		};
	    };
	} else {
	    return 0;
	};
    };
    Template.rockData.num = function () {
	var haul = Hauls.findOne({_id:Session.get("selected_haul")});
	var rocks = GotRocks.findOne({haul:haul._id})
	if (rocks) {
	    for (i=0;i<rocks.length;i++) {
		if (rocks[i].name==this.name) {
		    return parseInt(numFormat(rocks[i].number));
		};
	    };
	} else {
	    return 0;
	};
    };
    Template.rockPriceDisplay.isBoss = function () {
	return Players.findOne({op:Session.get("using_op"),ID:Meteor.userId()}).boss;
    };
    Template.haul.Cash = function () {
	return numFormat(this.cash);
    };
    Template.opDisplay.op = function () {
	return Ops.findOne({_id:Session.get("selected_op")});
    };
    Template.rockPriceDisplay.rock = function () {
	return RockPrices.find({op:Session.get("using_op")},{sort: {value:-1}});
    };	
    Template.addRock.rock = function () {
	return rockDefaults.sort(dynamicSort("name"));
    };
    Template.addRock.events({
	'click input.addRock' :function () {
	    var rock = document.getElementById("rockDropDown").value;
	    var price = document.getElementById("addRockPrice").value;
	    for (i=0;i<rockDefaults.length;i++) {
		if (rock==rockDefaults[i].name){
		    var Rock = rockDefaults[i];
		};
	    };
	    if (price != "") {
		Rock.value = price/Rock.density
		Rock.price = price
	    } else {
		Rock.value = Rock.price/Rock.density
		Rock.price = Rock.price;
	    };
	    Rock.op=Session.get("using_op");
	    RockPrices.insert(Rock);
	},
    });
    Template.editPrice.events({
	'click input.editRock': function () {
	    var newPrice = document.getElementById("newPrice").value;
	    var newValue = newPrice/RockPrices.findOne({_id:Session.get("selected_rock")}).density;
	    if (newPrice != "") {
		RockPrices.update(Session.get("selected_rock"),{$set:
								{value:newValue,price:newPrice}});
	    };
	},
    });	
    Template.Main.showHideRocks = function () {
	return Session.get("add_rock")?"Hide":"Show";
    };
    Template.Main.showHideHauls = function () {
	return Session.get("show_hauls")?"Hide":"Show";
    };
    Template.Main.showHidePlayers = function () {
	return Session.get("show_players")?"Hide":"Show";
    };
    Template.Main.showHideJet = function () {
	return Session.get("show_jet")?"Hide":"Show";
    };
    Template.editPrice.nameFinder = function () {
	return RockPrices.findOne({_id:Session.get("selected_rock")}).name;
    };
    Template.editPrice.priceFinder = function () {
	return unFormat(RockPrices.findOne({_id:Session.get("selected_rock")}).price);
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
	},
	'click input.showJet' :function () {
	    Session.set("show_jet",true^Session.get("show_jet"));
	}
    });
    Template.operation.isBoss = function () {
	return (this.boss==Meteor.userId()) ? "Yes":"No";
    };
//    Template.Main.ship= function () {
//	return headers.get("eve_shiptypeid");
  //  };
    Template.opDisplay.operations = function () {
	var retList = new Array;
	Players.find({username:Meteor.user().username}).forEach(function (Player) {
	    var op = Ops.findOne({_id:Player.op})
	    if (op) {
		op['boss']=Player.boss?"Yes":"No"
		retList.push(op);
	    };
	});
	return retList
    };
    Template.opDisplay.useOrDont = function () {
	return Session.equals("selected_op",Session.get("using_op"))? "Stop Using":"Use";
    };
    Template.rock.selected = function () {
	return Session.equals("selected_rock",this._id) ? "selected" : '';
    };
    Template.player.Role = function () {
	return (this.boss?"[B] ":"")+this.role;
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
	'click input.AddPlayer':function () {
	    var role = document.getElementById("playerRole").value;
	    var name = document.getElementById("newPlayerName").value;
	    var payType = document.getElementById("payout").value;
	    var user = Meteor.users.findOne({username:name});
	    if (user) {
		var id=user.id;
	    } else {
		var id = undefined;
	    };
	    Players.insert({op:Session.get("using_op"),username:name,role:role,payType:payType,payout:(payType=="Cash")?0:[],ID:id,lname:name.toLowerCase(),boss:false});
	},
	'click input.EditPlayer': function () {
	    var role = document.getElementById("playerRole").value;
	    var name = document.getElementById("newPlayerName").value;
	    var payType = document.getElementById("payout").value;
	    var user = Meteor.users.findOne({username:name});
	    if (user) {
		var id=user.id;
	    } else {
		var id = undefined;
	    };
	    Players.update(Session.get("selected_player"),{$set:
				{role:role,payType:payType,ID:user?user._id:undefined,username:name}});
	},
	'click input.removePlayer': function () {
	    Players.remove(Session.get("selected_player"))
	    Session.set("selected_player",false);
	},
	'click input.makeBoss': function () {
	    var player = Session.get("selected_player")
	    var Player = Players.findOne({_id:player});
	    if (Player.id!= Meteor.userId()) {
		Players.update(player,{$set:{boss:!Player.boss}});
	    };
	},
	'click input.playerChange': function () {
	    var player = Players.findOne({op:Session.get("using_op"),ID:Meteor.userId()})
	    Players.update(player._id,{$set:
					    {payType:document.getElementById("payout").value}});
	}
    });
    Template.rock.Value = function () {
	return numFormat(this.value);
    };
    Template.rock.Price = function () {
	return numFormat(this.price);
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
    Template.players.Iselected = function (value) {
	try{
	    return Players.findOne({ID:Meteor.userId(),op:Session.get("using_op")}).payType==value?"selected":"";
	} catch(err) {
	};
    };
    Template.players.players = function () {
	return Players.find({op:Session.get("using_op")},{sort:{lname:1}});
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
	    return Players.find({op:Session.get("using_op")},{sort: {lname:1}});
	    var haul = Hauls.findOne({_id:Session.get("selected_haul")})
	    var miners = haul.miners;
	    miners.sort(dynamicSort("lname"));
	    return miners;
	};
    };
    Template.haulData.events({
	'click input.applyHaulData': function () {
	},
    });
    Template.miner.selected = function (miner) {
	return parseFloat(this)== Session.get("miner_Effort")?"selected":"";
    };
    Template.opDisplay.selected = function (value) {
	if (Session.get("selected_op")){
	    return (Ops.findOne({_id:Session.get("selected_op")}).splitType==value)?"selected":"";
	};
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
    Template.playerpay = function (player) {
	if (player.payType=="Cash") {
	    return numFormat(player.payout);
	} else {
	    return player.payout;
	};
    };
    Template.player.events({
	'click': function () {
	    if (Session.equals("selected_player",this._id)) {
		Session.set("selected_player",undefined);
	    } else {
		Session.set("selected_player",this._id);
	    };
	}
    });

    Template.Login.error = function () {
	return Session.get("loginError");
    };
    Template.Main.Trusted = function () {
	Session.set("username","Bobby")//by en Gravonere");
	return true;
	if (headers.get("eve_trusted")=="Yes") {
	    Session.set("username",headers.get("eve_charname"));
	    return true;
	};
    };
    refresh = function () {
	location.reload()
    };
    Template.Login.hasAcct = function () {
	console.log(Meteor.users.findOne({username:Session.get("username")}))
	if (Meteor.users.findOne({username:Session.get("username")})){
	    return true;
	} else {
	    return false;
	};
    };
    Template.Login.events({
	'click input.Login': function () {
	    console.log("YEA")
	    var username = Session.get("username");
	    var password = document.getElementById("passWord").value;
	    var user = Meteor.users.findOne({username:username});
	    if (user){
		Meteor.loginWithPassword(username,password,function (err) {
		    if (err) {
			Session.set("loginError","Incorrect Password!<br>");
		    } else { 
			Meteor.logoutOtherClients();
		    }		    
		});
	    } else {
		var passCheck = document.getElementById("passCheck").value;
		if (password==passCheck) {
		    var id = Accounts.createUser({username:username,password:password});
		    Players.insert({ID:id,username:username,op:"checker",lname:username.toLowerCase(),payout:0,payType:"Cash",boss:false,role:"Hauler"});
		    Players.find({username:username}).forEach(function (player) {
			console.log(player);
			Players.update(player._id,{$set:{ID:id}});
		    });
		} else {
		    Session.set("loginError","Passwords do not match!<br>");
		};
	    };
	}
    });
    
    Template.opDisplay.events({
	'click input.showData': function () {
	    Session.set("showData",Session.get("showData")^true);
	},
	'click input.StartOp': function () {
	    var opName = document.getElementById("newOpName").value;
	    var splitType = document.getElementById("newOpSplit").value;
	    if (!Ops.findOne({name:opName})) {
		var id = Ops.insert({name:opName,splitType:splitType,cash:0});
		var pid = Players.insert({username:Meteor.user().username,op:id,boss:true,lname:Meteor.user().username.toLowerCase(),payType:"Cash",ID:Meteor.userId(),role:"Hauler",payout:0});
		Session.set("using_op",id);
		Session.set("isBoss",true);
		Session.set("show_ops",false);
		Hauls.insert({number:0,op:id,cash:0})
		Session.set("cooperative",splitType=="Cooperative")
		setNull()
	    };
	},
	'click input.useOp': function () {
	    var op = Session.get("selected_op")
	    if (Session.equals("using_op",op)) {
		Session.set("using_op",undefined);
		Session.set("isBoss",false);
	    } else {
		Session.set("show_ops",false);	
		Session.set("using_op",Session.get("selected_op"));
		Session.set("isBoss",Players.findOne({op:op,ID:Meteor.userId()}).boss);
		var Op = Ops.findOne({_id:op})
		Session.set("cooperative",Op.splitType=="Cooperative")
		setNull()
	    };
	},
	'click input.EditOp': function () {
	    var opName = document.getElementById("newOpName").value;
	    var splitType = document.getElementById("newOpSplit").value;
	    Ops.update(Session.get("selected_op"),{$set:
						   {name:opName,splitType:splitType}});
	},
	'click input.remOp': function () {
	    Ops.remove(Session.get("selected_op"));
	    if (Session.equals("selected_op",Session.get("using_op"))){
		Session.set("using_op",undefined);
	    };
	    Session.set("selected_op",undefined);
	}
    });
    Template.hauls.hauls = function () {
	return Hauls.find({op:Session.get("using_op")});
    };
    Template.hauls.events({
	'click input.addNewHaul':function () {
	    op = Session.get("using_op")
	    Hauls.insert({number:Hauls.find({op:op}).count(),op:op,cash:0});
	},
    });
//    CCPEVE.showFitting('11129:3616;1:24552;1::');
}

if (Meteor.isServer) {
    Accounts.validateNewUser(function (user) {
	if (Meteor.users.findOne({username:user.username})) {
	    return false;
	} else {
	    return true;
	};
    });
//    Meteor.users.find({}).forEach(function (user) {
//	if (!Players.findOne({username:user.username,op:"checker"})) {
//	    Players.insert({username:user.username,op:"checker",payout:null,lname:user.username.toLowerCase()});
//	};
  //  });
    Meteor.publish("Ops", function () {
	return Ops.find({})
    });
    Meteor.publish("Players", function () {
	return Players.find({})
    })
    Meteor.publish("GotRocks", function () {
	return GotRocks.find({})
    })
    Meteor.publish("RockPrices", function () {
	return RockPrices.find({})
    })
    Meteor.publish("Hauls", function () {
	return Hauls.find({})
    })
    Meteor.publish("userData",function (){
	return Meteor.users.find({});
    });
//    Meteor.publish("user",function () {
//	return Meteor.user.find({_id:this._id})
//    Meteor.publish("userData",function (){
///	return Meteor.users.find({},{fields: {"services":1}});
   // });
    Meteor.methods({
	insertOp: function (userKey,userID,Op) {
	    var user = Meteor.users.findOne({_id:userID});
	    var token = user['services']['resume']['loginTokens'][0];
	    if (token==userKey) {
		Ops.insert(op);
	    };
	},
    });	    
    Meteor.users.allow({
	insert: function () {
	    return false;
	}
    });
    RockPrices.allow({
	insert: function (userID,rock) {
	    if (!Players.findOne({ID:userID}).boss) {
		return false;
	    };
	    breaker = true;
	    RockPrices.find({op:rock.op}).forEach(function (rocker) {
		if (rocker.name==rock.name && rocker.op==rock.op) {
		    breaker = false;
		}
	    });
	    return breaker;
	},
	update: function (userID,rock) {
//	    return false;
	    return Players.findOne({ID:userID,op:rock.op}).boss
	},
	remove: function (userID,rock) {
	    return false;
//	    return !Players.findOne({_id:userID}).boss
	}
    });
    Ops.allow({
	insert: function (userID,op) {
	    return true;
	},
	update: function (userID,operation) {
	    return Players.findOne({ID:userID,op:operation._id}).boss
	},
	remove: function (userID,operation) {
	    return Players.findOne({ID:userID,op:operation._id}).boss
	}
    });
    Players.allow({
	insert: function (userID,player) {
	    var inserter = Players.findOne({ID:userID,op:player.op})
	    if (inserter && inserter.boss && !Players.findOne({username:player.username,op:player.op})) {
		return true;
	    };
	    if (player.op=="checker" || player.boss) {
		return true;
	    } else {
		return false;
	    };
	},
	update: function (userID,player) {
	    var inserter = Players.findOne({ID:userID,op:player.op})
	    if (inserter && inserter.boss || player.id==userID || Meteor.users.findOne({_id:userID}).username==player.username) {
		return true;
	    } else {
		return false;
	    };
	},
	remove: function (userID,player) {
	    var inserter = Players.findOne({ID:userID,op:player.op})
	    if (inserter && inserter.boss) {
		return true;
	    } else {
		return false;
	    };
	}
    });
    Hauls.allow({
	insert: function (userID,Haul) {
	    var inserter = Players.findOne({ID:userID,op:Haul.op})
	    if (inserter && inserter.boss) {
		return true;
	    } else {
		return false;
	    };
	},
    });
}
