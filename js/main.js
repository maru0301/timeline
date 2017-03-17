////////////////////////////////////////////////////////////////////////////////////
// Global

///////////////////////////////////////
/*
var JSON_DATA_CHAMP_IMG = new Array();
var JSON_DATA_TEAM = {};
var JSON_DATA_SUMMONER_SPELL = new Array();
var JSON_DATA_ITEM = new Array();
var JSON_DATA_MASTERY_IMG = new Array();

var MATCH_HISTORY_JSON = {};

var VER_CHAMPION = "";
var VER_SN_SPELLS = "";
var VER_ITEM = "";
var VER_MASTERY = "";

var CDN_URL = "";
*/

var CDN_URL = "";

var JSON_DATA_TIMELINE = {};
var JSON_DATA_CHAMP_IMG = new Array();

////////////////////////////////////////////////////////////////////////////////////
// Error Message
var ERROR_ID_VERSION_GET_ERROR 			= "サーバーバージョン情報が取得出来ませんでした";
var ERROR_ID_REALM_GET_ERROR 			= "バージョン情報が取得出来ませんでした";
var ERROR_ID_CHAMPION_IMG_GET_ERROR 	= "チャンピオンイメージ情報が取得出来ませんでした";
var ERROR_ID_SUMMONER_SPELL_GET_ERROR 	= "チーム情報が取得出来ませんでした";
var ERROR_ID_ITEM_IMG_GET_ERROR 		= "アイテムイメージ情報が取得出来ませんでした";
var ERROR_ID_TEAM_GET_ERROR 			= "チーム情報が取得出来ませんでした";
var ERROR_ID_MASTERY_IMG_GET_ERROR 		= "マスタリーイメージ情報が取得出来ませんでした";
var ERROR_ID_MATCH_DETAILS_GET_ERROR	= "試合情報が取得出来ませんでした";
var ERROR_ID_MATCH_TIMELINE_GET_ERROR	= "タイムライン情報が取得出来ませんでした";

/////////////////////////////////////////////////
//

function errorDlg(msg)
{
	window.alert("エラー:" + msg);
}

////////////////////////////////////////////////////////////////////////////////////
//

function main()
{
	var data = location.href.split("?")[1];
	var text = data.split("=")[1];
	var url = decodeURIComponent(text);

	var index = url.search("#");
	url = url.substr(index);
	index = url.search("/");
	url = url.substr(index+1);
	index = url.search("/");

	var gameRealm = url.substr(0, index);

	url = url.substr(index+1);
	index = url.search('[\?]');

	var gameId = url.substr(0, index);

	url = url.substr(index+1);
	index = url.search('=');
	url = url.substr(index+1);
	index = url.search('&');

	if( index != -1 )
		url = url.substr(0, index);

	var gameHash = url;

	var request = [
		{ error_id: ERROR_ID_MATCH_DETAILS_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchDetails", realm:gameRealm, id:gameId, hash:gameHash },  },
		{ error_id: ERROR_ID_MATCH_TIMELINE_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchTimeline", realm:gameRealm, id:gameId, hash:gameHash },  },
		{ error_id: ERROR_ID_VERSION_GET_ERROR,			url: './php/main.php', data: { func:"GetVersion" },  },
	];

	var jqXHRList = [];

	for( var i = 0, max = request.length ; i < max ; ++i )
	{
		jqXHRList.push($.ajax(
		{
			url: request[i].url,
			type: 'GET',
			dataType: 'json',
			data: request[i].data,
		}));
	}

	$.when.apply(null, jqXHRList).done(function ()
	{
		console.log("Success : Main");

		var json = [];
		var statuses = [];
		var jqXHRResultList = [];
		
		for( var i = 0, max = arguments.length ; i < max ; ++i )
		{
			var result = arguments[i];
			json.push(result[0]);
			statuses.push(result[1]);
			jqXHRResultList.push(result[3]);
		}

		var matchDetailJson = json[0];
		JSON_DATA_TIMELINE = json[1];
		var versionJson = json[2];

		var matchDetailData = { game:{}, teams:[] };
		matchDetailData.game = GetMatchData(matchDetailJson);
		matchDetailData.teams = GetTeamData(matchDetailJson);

		console.log("------- json -------");
		console.log(json);
		console.log("------- matchDetailData -------");
		console.log(matchDetailData);
		console.log("------- matchTimelineJson -------");
		console.log(JSON_DATA_TIMELINE);
		console.log("------- versionJson -------");
		console.log(versionJson);

		var version = GetVersion(matchDetailData.game.gameVer, versionJson);
		InitTimeLine(version, matchDetailData, JSON_DATA_TIMELINE);

	});

	$.when.apply(null, jqXHRList).fail(function ()
	{
		console.log("Fail : Main");
		console.log(jqXHRList);

		for( var i = 0 ; i < jqXHRList.length ; ++i )
		{
			if( jqXHRList[i].statusText === "error" )
			{
				errorDlg(request[i].error_id);
			}
		}
	});
}

function InitTimeLine(version, matchDetailData, matchTimelineJson)
{
	var request = [
		{ error_id: ERROR_ID_REALM_GET_ERROR,			url: './php/main.php', data: { func:"GetRealm" },  },
		{ error_id: ERROR_ID_CHAMPION_IMG_GET_ERROR,	url: './php/main.php', data: { func:"GetChampionImage", ver:version },  },
		{ error_id: ERROR_ID_SUMMONER_SPELL_GET_ERROR,	url: './php/main.php', data: { func:"GetSummonerSpells", ver:version },  },
		{ error_id: ERROR_ID_ITEM_IMG_GET_ERROR,		url: './php/main.php', data: { func:"GetItem", ver:version },  },
		{ error_id: ERROR_ID_MASTERY_IMG_GET_ERROR,		url: './php/main.php', data: { func:"GetMasteryImage", ver:version },  },
//	{ error_id: ERROR_ID_TEAM_GET_ERROR,			url: './json/team.json', data: {},  },
//	{ error_id: ERROR_ID_MATCH_DETAILS_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchDetails", realm:gameRealm, id:gameId, hash:gameHash },  },
	];

	var jqXHRList = [];

	for( var i = 0, max = request.length ; i < max ; ++i )
	{
		jqXHRList.push($.ajax(
		{
			url: request[i].url,
			type: 'GET',
			dataType: 'json',
			data: request[i].data,
		}));
	}

	$.when.apply(null, jqXHRList).done(function ()
	{
		console.log("Success : InitTimeLine");

		var json = [];
		var statuses = [];
		var jqXHRResultList = [];
		
		for( var i = 0, max = arguments.length ; i < max ; ++i )
		{
			var result = arguments[i];
			json.push(result[0]);
			statuses.push(result[1]);
			jqXHRResultList.push(result[3]);
		}
		
		console.log("------- json -------");
		console.log(json);

		var realmJson = json[0];
		var champImgJson = json[1];
		var spellJson = json[2];
		var itemImgJson = json[3];
		var masteryImgJson = json[4];

		var championImgData = new Array();
		var spellImgData = new Array();
		var itemImgImgData = new Array();
		var masteryImgData = new Array();

		// ソート
		for(var key in champImgJson.data)
			JSON_DATA_CHAMP_IMG.push(champImgJson.data[key]);
		
		championImgData.sort(function(a, b)
			{
				if(a.key < b.key) return -1;
				if(a.key > b.key) return 1;
				if(a.key == b.key) return 0;
			}
		);
		
		for(var key in itemImgJson.data)
			itemImgImgData[key] = itemImgJson.data[key];
		
		for(var key in spellJson.data)
		{
			var id = spellJson.data[key].id;
			spellImgData[id] = spellJson.data[key];
		}

		spellImgData.sort(function(a, b)
			{
				if(a.name < b.name) return -1;
				if(a.name > b.name) return 1;
				if(a.name == b.name) return 0;
			}
		);
		
		for(var key in masteryImgJson.data)
		{
			masteryImgData[key] = masteryImgJson.data[key];
		}

		masteryImgData.tree = masteryImgJson.tree;
		
		masteryImgData.sort(function(a, b)
			{
				if(a.name < b.name) return -1;
				if(a.name > b.name) return 1;
				if(a.name == b.name) return 0;
			}
		);

		CDN_URL = realmJson.cdn;

//		ReworkJson();
		console.log("------- championImgData -------");
		console.log(JSON_DATA_CHAMP_IMG);
		console.log("------- spellImgData -------");
		console.log(spellImgData);
		console.log("------- itemImgImgData -------");
		console.log(itemImgImgData);
		console.log("------- masteryImgData -------");
		console.log(masteryImgData);

		InitTimeLineCanvas(version, matchDetailData);
//		UpdateFrame(0);
	});

	$.when.apply(null, jqXHRList).fail(function ()
	{
		console.log("Fail : InitTimeLine");
		console.log(jqXHRList);

		for( var i = 0 ; i < jqXHRList.length ; ++i )
		{
			if( jqXHRList[i].statusText === "error" )
			{
				errorDlg(request[i].error_id);
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////

function ReworkJson()
{
	// 不要なデータ削除
	
	var del_item_id = [
		// Golden Transcendence(Disable)
		3461,
		// Head of Kha'Zix
		3175,
		3410,
		3416,
		3422,
		3455,
		// Arcane Sweeper
		3187,
		3348,
		// Death's Daughter
		//3902,
		// Enchantment
		3671,
		3672,
		3673,
		3675,
		// Muramana
		3043,
		// Overlord's Bloodmail
		3084,
		// undefined
		3632,
		// Rod of Ages (Quick Charge)
		3029,
		// Seer Stone (Trinket)
		3645,
		// Seraph's Embrace
		3040,
		// Siege Teleport
		3633,
		3648,
		// Tear of the Goddess (Quick Charge)
		3073,
		// Total Biscuit of Rejuvenation
		2010,
	];
	// Item
	JSON_DATA_ITEM = JSON_DATA_ITEM.filter(function(v){
		var isAlive = true;
		
		for( var i = 0 ; i < del_item_id.length ; ++i )
		{
			if( del_item_id[i] == v.id )
			{
				isAlive = false;
				break;
			}
		}
		
		return isAlive;
	});
	
	// Mestery
	var mastery_id = new Array();
	
	for( var key in JSON_DATA_MASTERY_IMG.tree )
	{
		var list = JSON_DATA_MASTERY_IMG.tree[key].pop().masteryTreeItems;
		for( var i in list )
			mastery_id.push(list[i].masteryId);
	}
	
	JSON_DATA_MASTERY_IMG = JSON_DATA_MASTERY_IMG.filter(function(v)
	{
		var isAlive = true;
		
		if( $.inArray( v.id, mastery_id ) < 0 )
			isAlive = false;
		
		return isAlive;
	});
	
	// Enchantment系のアイテム名をリネーム
	for( var key in JSON_DATA_ITEM )
	{
		if( JSON_DATA_ITEM[key].name.indexOf("Enchantment") != -1 )
		{
			var base = "";
			var enchant = "";
			
			if( $.inArray( "3711", JSON_DATA_ITEM[key].from ) >= 0)
			{
				base = "Tracker's Knife";
			}
			else if( $.inArray( "3715", JSON_DATA_ITEM[key].from ) >= 0)
			{
				base = "Skirmisher's Sabre";
			}
			else if( $.inArray( "3706", JSON_DATA_ITEM[key].from ) >= 0)
			{
				base = "Stalker's Blade";
			}
			
			if( JSON_DATA_ITEM[key].name.indexOf("Warrior") != -1 )
			{
				enchant = "Warrior";
			}
			else if( JSON_DATA_ITEM[key].name.indexOf("Cinderhulk") != -1 )
			{
				enchant = "Cinderhulk";
			}
			else if( JSON_DATA_ITEM[key].name.indexOf("Runic Echoes") != -1 )
			{
				enchant = "Runic Echoes";
			}
			else if( JSON_DATA_ITEM[key].name.indexOf("Bloodrazor") != -1 )
			{
				enchant = "Bloodrazor";
			}
			
			JSON_DATA_ITEM[key].name = base + " - " + enchant;
		}
		
		if( $.inArray( "Trinket", JSON_DATA_ITEM[key].tags ) >= 0 )
			JSON_DATA_ITEM[key].name = JSON_DATA_ITEM[key].name.replace(/ \(Trinket\)/g, "" );
	}
	
	JSON_DATA_ITEM.sort(function(a, b)
		{
			if(a.name < b.name) return -1;
			if(a.name > b.name) return 1;
			if(a.name == b.name) return 0;
		}
	);
	
	// ItemJson先頭に未選択データ追加
	JSON_DATA_ITEM.unshift({ id : -1, name : "None", tags : "Dummy"} );
}

////////////////////////////////////////////////////////////////////////////////////

function ShowChampionIcon(index, getName)
{
	var target = document.getElementById(getName);
	var newTag;
	
	$("#" + getName).children(getName + "_champion_img").children().remove();
	
	if( document.getElementById(getName + "_champion_img") == null )
	{
		newTag = document.createElement(getName + "_champion_img");
		newTag.id = getName + "_champion_img";
		
		target.appendChild(newTag);
	}
	
	target = document.getElementById(getName + "_champion_img");
	
	newTag = document.createElement("champion_img");
	
	var champ_img = JSON_DATA_CHAMP_IMG[index].image.full;
	var champ_name = JSON_DATA_CHAMP_IMG[index].name;
	
	newTag.innerHTML = "<img src='" + CDN_URL + "/" + VER_CHAMPION + "/img/champion/" + champ_img + "' width='20' height='20' title='" + champ_name +"' class='example3'>";
	
	target.appendChild(newTag);
}

function ShowSpellIcon(data, key, getName, createName)
{
	var target = document.getElementById(getName);
	var newTag;
	
	$("#" + getName).children(createName + "_img").children().remove();
	
	if( document.getElementById(createName + "_img") == null )
	{
		newTag = document.createElement(createName + "_img");
		newTag.id = createName + "_img";
		
		target.appendChild(newTag);
	}
	
	target = document.getElementById(createName + "_img");
	
	newTag = document.createElement("summoner_spell_img");
	
	for( var i in data )
	{
		if( i == key )
		{
			var spell1_img = data[i].image.full;
			var spell1_name = data[i].name;
			
			newTag.innerHTML = "<img src='" + CDN_URL + "/" + VER_SN_SPELLS + "/img/spell/" + spell1_img + "' width='20' height='20' title='" + spell1_name +"' class='example3'>";
		}
	}
	
	target.appendChild(newTag);
}

function ShowItemIcon(data, key, getName, createName)
{
	var target = document.getElementById(getName);
	var newTag;
	
	$("#" + getName).children(createName + "_img").children().remove();
	
	if( document.getElementById(createName + "_img") == null )
	{
		newTag = document.createElement(createName + "_img");
		newTag.id = createName + "_img";
		
		target.appendChild(newTag);
	}
	
	target = document.getElementById(createName + "_img");
	
	newTag = document.createElement("summoner_spell_img");
	
	for( var i in data )
	{
		if( data[i].id == key )
		{
			if( key != -1 )
			{
				var item_img = data[i].image.full;
				var item_name = data[i].name;
				
				newTag.innerHTML = "<img src='" + CDN_URL + "/" + VER_ITEM + "/img/item/" + item_img + "' width='20' height='20' title='" + item_name +"' class='example3'> ";
			}
			else
			{
				// idが-1はNone
				newTag.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;";
			}
		}
	}
	
	target.appendChild(newTag);
}

function ShowMasteryIcon(data, key, getName, createName)
{
	var target = document.getElementById(getName);
	var newTag;
	
	$("#" + getName).children(createName + "_img").children().remove();
	
	if( document.getElementById(createName + "_img") == null )
	{
		newTag = document.createElement(createName + "_img");
		newTag.id = createName + "_img";
		
		target.appendChild(newTag);
	}
	
	target = document.getElementById(createName + "_img");
	
	newTag = document.createElement("mastery_img");
	
	for( var i in data )
	{
		if( data[i].id == key )
		{
			var mastery_img = data[i].image.full;
			var mastery_name = data[i].name;
			
			newTag.innerHTML = "<img src='" + CDN_URL + "/" + VER_MASTERY + "/img/mastery/" + mastery_img + "' width='20' height='20' title='" + mastery_name +"' class='example3'><br />";
		}
	}
	
	target.appendChild(newTag);
}

var imgData = new Array();
function InitTimeLineCanvas(version, matchDetailData)
{
	/*
	var target = document.getElementById("timeline_canvas");
	var ctx = target.getContext('2d');
	var champ_img = [
		"Aatrox.png",
		"Warwick.png",
		"Ahri.png",
		"Caitlyn.png",
		"Nami.png",
		"Irelia.png",
		"Elise.png",
		"Orianna.png",
		"Tristana.png",
		"Lulu.png",
	];

//	var imgData = new Array();
	imgData.push( {src:"./img/minimap.png", img:new Image() });

	for( var i = 0 ; i < 0 ; ++i )
	{
		imgData.push(
			{
				src:cdn_url + "/" + version + "/img/champion/" + champ_img[i],
				img:new Image(),
				reSize:[64,64],
		});
	}

	for(var i = 0 ; i < imgData.length ; ++i)
	{
		imgData[i].img.src = imgData[i].src;
	}

    var loadedCount = 1;
	for(var i = 0 ; i < imgData.length ; ++i)
	{
		imgData[i].img.addEventListener('load', function()
		{
			if(loadedCount == imgData.length)
			{
				var x = 0;
				var y = 0;
				for (var j = 0 ; j < imgData.length ; ++j)
				{
					if( j == 0 )
					{
						target.width = imgData[j].img.width;
						target.height = imgData[j].img.height;
					}

					if(imgData[j].reSize == undefined)
						ctx.drawImage(imgData[j].img, x, y);
					else
						ctx.drawImage(imgData[j].img, 0, 0, imgData[j].img.width, imgData[j].img.height, x, y, imgData[j].reSize[0], imgData[j].reSize[1]);
					
					x = 150 + (250 * Math.floor(j/5));
					y = (70 * (j%5));
					InitTimeLineCanvas2();
				}
			}
			loadedCount++;
		}, false);
	}
	*/
//	ShowMapCanvas();
	var team = [ "blue", "red" ];

	for( var j = 0 ; j < matchDetailData.teams[0].player.length ; ++j )
		InitChampionCanvas(version, team[0] + j + "_canvas", j+1, GetChampionImgName(matchDetailData.teams[0].player[j].championId));
}

function ShowMapCanvas()
{
	var target = document.getElementById("canvas");
	var newTag;

	newTag = document.createElement("canvas");
	newTag.id = "map_canvas";
	newTag.style = "position: absolute; z-index: 0";
	
	target.appendChild(newTag);

	var ctx = newTag.getContext('2d');

	img = new Image();
	img.src = "./img/minimap.png";

	img.addEventListener('load', function()
	{
		newTag.width = this.width;
		newTag.height = this.height;
		ctx.drawImage(this, 0, 0);		
	}, false);
}

function InitChampionCanvas(version, id_name, z_index, champ_name)
{
	var target = document.getElementById("canvas");
	var newTag;

	newTag = document.createElement("canvas");
	newTag.id =  id_name;
	newTag.style = "position: absolute; z-index:" + z_index;

	target.appendChild(newTag);

	var ctx = newTag.getContext('2d');

	img = new Image();
	img.src = CDN_URL + "/" + version + "/img/champion/" + champ_name,
	img.addEventListener('load', function()
	{
		var quality = 0.3;
		newTag.width = this.width * quality;
		newTag.height = this.height * quality;
		ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0 , this.width * quality, this.height * quality);
		/*
		newTag.width = this.width;
		newTag.height = this.height;

		ctx.drawImage(this, 0, 0, newTag.width, newTag.height);
		var quality = 0.3;
		newTag2 = document.createElement("canvas");
		var ctx2 = newTag2.getContext('2d');
		newTag2.id =  id_name + "2";
		newTag2.style = "position: absolute; z-index: "+ z_index;
		newTag2.width = this.width * quality;
		newTag2.height = this.height * quality;
		ctx2.drawImage(newTag, 0, 0, this.width * quality, this.height * quality);
		ctx.drawImage(this, 0, 0, newTag.width, newTag.height, 34, 0 , this.width * quality, this.height * quality);
		// -- back from reduced draw ---
//		ctx.drawImage(newTag2, 0, 0, this.width, this.height);
		target.appendChild(newTag2);
//		target.removeChild(newTag);
	*/
	}, false);
}

////////////////////////////////////////////////////////////////////////////////////

function GetItemMasteryName(data,id)
{
	var name = " ";
	
	if(id <= -1)
		return name;
	
	for( var key in data )
	{
		if( data[key].id == id )
		{
			name = data[key].name;
			break;
		}
	}
	
	return name;
}

function GoldTok(num)
{
	num /= 100; 
	num = Math.round(num);
	num /= 10;

	return num;
}

function GetVersion(ver, json)
{
	var num = json.length;

	while(--num)
	{
		if(ver.indexOf(json[num]) !== -1)
		{
			return json[num];
		}
	}

	num = json.length;
	var str_num = ver.length;

	while(str_num)
	{
		while(--num)
		{
			if(json[num].match(ver))
				return json[num];
		}
		num = json.length;
		str_num--;
		ver = ver.substr(0, str_num);
	}
}

function GetChampionImgName(id)
{
	for( var i = 0 ; i < JSON_DATA_CHAMP_IMG.length ; ++i )
	{
		if ( id == JSON_DATA_CHAMP_IMG[i].id )
			return JSON_DATA_CHAMP_IMG[i].image.full;
	}

}

////////////////////////////////////////////////////////////////////////////////////

function GetMatchDetailData(url)
{
	if(url !== "")
	{
		var index = url.search("#");
		url = url.substr(index);
		index = url.search("/");
		url = url.substr(index+1);
		index = url.search("/");

		var gameRealm = url.substr(0, index);

		url = url.substr(index+1);
		index = url.search('[\?]');

		var gameId = url.substr(0, index);

		url = url.substr(index+1);
		index = url.search('=');
		url = url.substr(index+1);
		index = url.search('&');
		
		if( index != -1)
			url = url.substr(0, index);
		
		var gameHash = url;

		url_path = "https://acs.leagueoflegends.com/v1/stats/game/" + gameRealm + "/" + gameId + "?gameHash=" + gameHash;

		$.ajax(
		{
			url: url_path,
			type: 'GET',
			dataType: 'json',
			scriptCharset: 'utf-8',
			
			success: function (data)
			{
				console.log("GetURL : Success");
				console.log(data);

				MATCH_HISTORY_JSON.game = {};

				MATCH_HISTORY_JSON.game = GetMatchData(data);
				MATCH_HISTORY_JSON.teams = [];
				MATCH_HISTORY_JSON.teams = GetTeamData(data);

				ReflectData(MATCH_HISTORY_JSON);

				console.log(MATCH_HISTORY_JSON);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown)
			{
				console.log("GetURL : Fail");
				console.log(XMLHttpRequest.responseText);
				console.log(textStatus);
				console.log(errorThrown);
			}
		});
	}
}

function GetMatchData(data)
{
	var set_data = {};

	set_data.gameVer = data.gameVersion;
	
	return set_data;
}

function GetTeamData(data)
{
	var set_data = [];

	for( var i = 0 ; i < 2 ; ++i )
	{
		set_data[i] = {};
		set_data[i] = SetTeamDataCommon(data.teams[i]);
		set_data[i].player = [];
		set_data[i].player = GetPlayerData(data, set_data[i].teamId);

		set_data[i].kill = 0;
		set_data[i].gold = 0;
		
		for( var j = 0 ; j < set_data[i].player.length ; ++j )
		{
			set_data[i].kill += set_data[i].player[j].kill;
			set_data[i].gold += set_data[i].player[j].gold;
		}

		var tag = set_data[i].player[0].name;
		var index = tag.search(" ");
		tag = tag.substr(0, index);

		set_data[i].team_name = tag;
	}

	return set_data;
}

function SetTeamDataCommon(data)
{
	var set_data = {};

	set_data.tower = data.towerKills;
	set_data.dragon = data.dragonKills;
	set_data.baron = data.baronKills;
	set_data.rift_herald = data.riftHeraldKills;
	set_data.inhibitor = data.inhibitorKills;
	set_data.ban = data.bans;
	set_data.win = data.win === "Win" ? true : false;
	set_data.teamId = data.teamId;

	return set_data;
}

function GetPlayerData(data, teamId)
{
	var set_data = [];

	for( var i = 0, index = 0 ; i < data.participants.length ; ++i)
	{
		if( teamId == data.participants[i].teamId )
		{
			set_data[index] = {};
			set_data[index].participantId = data.participants[i].participantId;
			set_data[index].championId = data.participants[i].championId;

			set_data[index].spell = [];
			set_data[index].spell[0] = data.participants[i].spell1Id;
			set_data[index].spell[1] = data.participants[i].spell2Id;

			set_data[index].kill = data.participants[i].stats.kills;
			set_data[index].assiste = data.participants[i].stats.assists;
			set_data[index].death = data.participants[i].stats.deaths;
			set_data[index].gold = data.participants[i].stats.goldEarned;
			set_data[index].cs = data.participants[i].stats.totalMinionsKilled;

			set_data[index].items = [];
			set_data[index].items[0] = data.participants[i].stats.item0;
			set_data[index].items[1] = data.participants[i].stats.item1;
			set_data[index].items[2] = data.participants[i].stats.item2;
			set_data[index].items[3] = data.participants[i].stats.item3;
			set_data[index].items[4] = data.participants[i].stats.item4;
			set_data[index].items[5] = data.participants[i].stats.item5;
			set_data[index].trinket = data.participants[i].stats.item6;

			set_data[index].lane = data.participants[i].timeline.lane;

			for( var j = 0 ; j < data.participantIdentities.length ; ++j )
			{
				if( set_data[index].participantId == data.participantIdentities[j].participantId )
				{
					set_data[index].name = data.participantIdentities[j].player.summonerName;
					break;
				}
			}

			set_data[index].mastery = [];
			for( var j = 0 ; j < data.participants[i].masteries.length ; ++j )
				set_data[index].mastery[j] = data.participants[i].masteries[j].masteryId;

			index++;
			continue;
		}
	}

	return set_data;
}

////////////////////////////////////////////////////////////////////////////////////

function UpdateFrame(frame)
{
	console.log("UpdateFrame");
	console.log(JSON_DATA_TIMELINE.frames.length)
	UpdateChampionCanvas(frame , JSON_DATA_TIMELINE);
}

function UpdateChampionCanvas(frame, matchTimelineJson)
{
	var target = document.getElementById("timeline_canvas");
	var ctx = target.getContext('2d');
	console.log(ctx);

	ctx.drawImage(imgData[1].img, 0, 0, imgData[1].img.width, imgData[1].img.height, 0, 0, imgData[1].reSize[0], imgData[1].reSize[1]);

}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

//main();

class Hoge
{
	constructor()
	{
		var data = location.href.split("?")[1];
		var text = data.split("=")[1];
		var url = decodeURIComponent(text);

		var index = url.search("#");
		url = url.substr(index);
		index = url.search("/");
		url = url.substr(index+1);
		index = url.search("/");

		var gameRealm = url.substr(0, index);

		url = url.substr(index+1);
		index = url.search('[\?]');

		var gameId = url.substr(0, index);

		url = url.substr(index+1);
		index = url.search('=');
		url = url.substr(index+1);
		index = url.search('&');

		if( index != -1 )
			url = url.substr(0, index);

		var gameHash = url;

		var request = [
			{ error_id: ERROR_ID_MATCH_DETAILS_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchDetails", realm:gameRealm, id:gameId, hash:gameHash },  },
			{ error_id: ERROR_ID_MATCH_TIMELINE_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchTimeline", realm:gameRealm, id:gameId, hash:gameHash },  },
			{ error_id: ERROR_ID_VERSION_GET_ERROR,			url: './php/main.php', data: { func:"GetVersion" },  },
		];

		var jqXHRList = [];

		for( var i = 0, max = request.length ; i < max ; ++i )
		{
			jqXHRList.push($.ajax(
			{
				url: request[i].url,
				type: 'GET',
				dataType: 'json',
				data: request[i].data,
			}));
		}

		$.when.apply(null, jqXHRList).done(function ()
		{
			console.log("Success : Main");

			var json = [];
			var statuses = [];
			var jqXHRResultList = [];
			
			for( var i = 0, max = arguments.length ; i < max ; ++i )
			{
				var result = arguments[i];
				json.push(result[0]);
				statuses.push(result[1]);
				jqXHRResultList.push(result[3]);
			}

			var matchDetailJson = json[0];
			this.JSON_DATA_TIMELINE = json[1];
			var versionJson = json[2];

			var matchDetailData = { game:{}, teams:[] };
			matchDetailData.game = GetMatchData(matchDetailJson);
			matchDetailData.teams = GetTeamData(matchDetailJson);

			console.log("------- json -------");
			console.log(json);
			console.log("------- matchDetailData -------");
			console.log(matchDetailData);
			console.log("------- matchTimelineJson -------");
			console.log(JSON_DATA_TIMELINE);
			console.log("------- versionJson -------");
			console.log(versionJson);

			var version = this.GetVersion(matchDetailData.game.gameVer, versionJson);
			this.InitTimeLine(version, matchDetailData, JSON_DATA_TIMELINE);
		});

		$.when.apply(null, jqXHRList).fail(function ()
		{
			console.log("Fail : Main");
			console.log(jqXHRList);

			for( var i = 0 ; i < jqXHRList.length ; ++i )
			{
				if( jqXHRList[i].statusText === "error" )
				{
					errorDlg(request[i].error_id);
				}
			}
		});
	}
}
