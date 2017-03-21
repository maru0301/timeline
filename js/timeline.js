////////////////////////////////////////////////////////////////////////////////////
// TimeLine Class
////////////////////////////////////////////////////////////////////////////////////

class TimeLine {

	constructor()
	{
		this.ERROR_ID_VERSION_GET_ERROR 		= "サーバーバージョン情報が取得出来ませんでした";
		this.ERROR_ID_REALM_GET_ERROR 			= "バージョン情報が取得出来ませんでした";
		this.ERROR_ID_CHAMPION_IMG_GET_ERROR 	= "チャンピオンイメージ情報が取得出来ませんでした";
		this.ERROR_ID_SUMMONER_SPELL_GET_ERROR 	= "チーム情報が取得出来ませんでした";
		this.ERROR_ID_ITEM_IMG_GET_ERROR 		= "アイテムイメージ情報が取得出来ませんでした";
		this.ERROR_ID_TEAM_GET_ERROR 			= "チーム情報が取得出来ませんでした";
		this.ERROR_ID_MASTERY_IMG_GET_ERROR 		= "マスタリーイメージ情報が取得出来ませんでした";
		this.ERROR_ID_MATCH_DETAILS_GET_ERROR	= "試合情報が取得出来ませんでした";
		this.ERROR_ID_MATCH_TIMELINE_GET_ERROR	= "タイムライン情報が取得出来ませんでした";

		this.VERSION = "";
		this.CDN_URL = "";

		this.JSON_DATA_CHAMP_IMG = new Array();
		this.JSON_DATA_TIMELINE = {};

		this.CANVAS_CHAMPION_IMG = new Array();
		this.CANVAS_MAP_IMG = "";
	}

	GetMatchData(data)
	{
		var set_data = {};

		set_data.gameVer = data.gameVersion;
		
		return set_data;
	}

	Init(href_url)
	{
		var self = this;

		var data = href_url.split("?")[1];
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
			{ error_id: this.ERROR_ID_MATCH_DETAILS_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchDetails", realm:gameRealm, id:gameId, hash:gameHash },  },
			{ error_id: this.ERROR_ID_MATCH_TIMELINE_GET_ERROR,	url: './php/main.php', data: { func:"GetMatchTimeline", realm:gameRealm, id:gameId, hash:gameHash },  },
			{ error_id: this.ERROR_ID_VERSION_GET_ERROR,			url: './php/main.php', data: { func:"GetVersion" },  },
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
			self.JSON_DATA_TIMELINE = json[1];
			var versionJson = json[2];

			var matchDetailData = { game:{}, teams:[] };
			matchDetailData.game = self.GetMatchData(matchDetailJson);
			matchDetailData.teams = self.GetTeamData(matchDetailJson);

			console.log("------- json -------");
			console.log(json);
			console.log("------- matchDetailData -------");
			console.log(matchDetailData);
			console.log("------- matchTimelineJson -------");
			console.log(self.JSON_DATA_TIMELINE);
			console.log("------- versionJson -------");
			console.log(versionJson);

			self.VERSION = self.GetVersion(matchDetailData.game.gameVer, versionJson);
			self.InitDataJson(matchDetailData, self.JSON_DATA_TIMELINE);
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

	InitDataJson(matchDetailData, matchTimelineJson)
	{
		var self = this;

		var request = [
			{ error_id: this.ERROR_ID_REALM_GET_ERROR,			url: './php/main.php', data: { func:"GetRealm" },  },
			{ error_id: this.ERROR_ID_CHAMPION_IMG_GET_ERROR,	url: './php/main.php', data: { func:"GetChampionImage", ver:this.VERSION },  },
			{ error_id: this.ERROR_ID_SUMMONER_SPELL_GET_ERROR,	url: './php/main.php', data: { func:"GetSummonerSpells", ver:this.VERSION },  },
			{ error_id: this.ERROR_ID_ITEM_IMG_GET_ERROR,		url: './php/main.php', data: { func:"GetItem", ver:this.VERSION },  },
			{ error_id: this.ERROR_ID_MASTERY_IMG_GET_ERROR,		url: './php/main.php', data: { func:"GetMasteryImage", ver:this.VERSION },  },
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
				self.JSON_DATA_CHAMP_IMG.push(champImgJson.data[key]);
			
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

			self.CDN_URL = realmJson.cdn;

	//		ReworkJson();
			console.log("------- championImgData -------");
			console.log(self.JSON_DATA_CHAMP_IMG);
			console.log("------- spellImgData -------");
			console.log(spellImgData);
			console.log("------- itemImgImgData -------");
			console.log(itemImgImgData);
			console.log("------- masteryImgData -------");
			console.log(masteryImgData);

			self.InitTimeLineCanvas(matchDetailData);
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

	InitTimeLineCanvas(matchDetailData)
	{
		this.ShowMapCanvas();

		var team = [ "blue", "red" ];

//		for( var i = 0, index = 1 ; i < team.length ; ++i )
		for( var i = 0, index = 1 ; i < 1 ; ++i )
		{
//			for( var j = 0 ; j < matchDetailData.teams[i].player.length ; ++j, ++index )
			for( var j = 0 ; j < 1 ; ++j, ++index )
				this.InitChampionCanvas(team[i] + j + "_champion_canvas", index, this.GetChampionImgName(matchDetailData.teams[i].player[j].championId));
		}
	}

	InitChampionCanvas(id_name, z_index, champ_name)
	{
		var target = document.getElementById("canvas");
		var newTag;

		newTag = document.createElement("canvas");
		newTag.id =  id_name;
		newTag.style = "position: absolute; z-index:" + z_index;


		target.appendChild(newTag);

		var ctx = newTag.getContext('2d');

		this.CANVAS_CHAMPION_IMG.push(new Image());
		var index = this.CANVAS_CHAMPION_IMG.length - 1;
		this.CANVAS_CHAMPION_IMG[index].src = this.CDN_URL + "/" + this.VERSION + "/img/champion/" + champ_name;

		var self = this;

		this.CANVAS_CHAMPION_IMG[index].addEventListener('load', function()
		{
			var quality = 0.3;
			newTag.width = self.CANVAS_MAP_IMG.width;
			newTag.height = self.CANVAS_MAP_IMG.height;
//			ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0 , this.width * quality, this.height * quality);
		}, false);
	}

	////////////////////////////////////////////////////////////////////////////////////
	
	GetTeamData(data)
	{
		var set_data = [];

		for( var i = 0 ; i < 2 ; ++i )
		{
			set_data[i] = {};
			set_data[i] = this.SetTeamDataCommon(data.teams[i]);
			set_data[i].player = [];
			set_data[i].player = this.GetPlayerData(data, set_data[i].teamId);

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

	SetTeamDataCommon(data)
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

	GetPlayerData(data, teamId)
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
	
	GetVersion(ver, json)
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

	GetChampionImgName(id)
	{
		for( var i = 0 ; i < this.JSON_DATA_CHAMP_IMG.length ; ++i )
		{
			if ( id == this.JSON_DATA_CHAMP_IMG[i].id )
				return this.JSON_DATA_CHAMP_IMG[i].image.full;
		}
	}

	////////////////////////////////////////////////////////////////////////////////////

	ShowMapCanvas()
	{
		var target = document.getElementById("canvas");
		var newTag;

		newTag = document.createElement("canvas");
		newTag.id = "map_canvas";
		newTag.style = "position: absolute; z-index: 0";
		
		target.appendChild(newTag);

		var ctx = newTag.getContext('2d');

		this.CANVAS_MAP_IMG = new Image();
		this.CANVAS_MAP_IMG.src = "./img/minimap.png";

		this.CANVAS_MAP_IMG.addEventListener('load', function()
		{
			newTag.width = this.width;
			newTag.height = this.height;
//			ctx.drawImage(this, 0, 0);
		}, false);
	}

	ShowChampionCanvas()
	{
		var target = document.getElementById("blue0_champion_canvas");
		var ctx = target.getContext('2d');
		console.log(ctx);
//		ctx.translate(100,0);
		ctx.clearRect(0, 0, target.width, target.height);
//		ctx.drawImage(this.CANVAS_CHAMPION_IMG[0], 0, 0, this.CANVAS_CHAMPION_IMG[0].width, this.CANVAS_CHAMPION_IMG[0].height, 100, 0, 12, 12);
	}

	////////////////////////////////////////////////////////////////////////////////////

	UpdateFrame(frame)
	{
		console.log("UpdateFrame");
		console.log(this.JSON_DATA_TIMELINE.frames.length)
		this.UpdateChampionCanvas(frame , this.JSON_DATA_TIMELINE);
	}

	UpdateChampionCanvas(frame, matchTimelineJson)
	{
		this.ShowChampionCanvas();
	}
}

var t = new TimeLine();
t.Init(location.href);
console.log("version : " + t.VERSION);

function Test()
{
	t.UpdateFrame(0);
}

function formatTime (ms)
{
	let min = (ms / 1000 / 60) << 0
	let sec = (ms / 1000) % 60 << 0
	
	return min + ':' + (sec < 10 ? '0' : '') + sec
}

//const log = bunyan.createLogger({ name: 'data-grabber' });
let games = {}
//let gcs = gcloud.storage();
//let matchesBucket = gcs.bucket(process.env.LOL_TIMELINE_GCLOUD_BUCKET)

function connectToSocket ()
{
	console.log('connecting to websocket...');

	$.ajax(
	{
		url: 'http://api.lolesports.com/api/issueToken',
		type: 'GET',
		dataType: 'json',
		data: {},
		
		success: function (json)
		{
			let ws = new WebSocket(`ws://livestats.proxy.lolesports.com/stats?jwt=${json.token}`);
			//let ws = new WebSocket(`ws://localhost/wikis/timeline/index.html:8080`) // used for simulation of livestats server
			console.log(ws);

			ws.onclose = function(env) {
				console.log('websocket has closed. info:');
//				console.log(`  code: ${code}`);
//				console.log(`  message: ${message}`);
				console.log('reconnecting...');
				connectToSocket();
			};

			ws.onerror = function(env) {
				console.log('error reported:');
				console.log(env);
			};

			var json = [];
			ws.onmessage = function(env) {
				if(env && env.data )
				{
					json = JSON.parse(env.data);
					console.log(json);
				}

				Object.keys(json).forEach((key) => {
					let game = json[key]
					if (game === null) return

					if (!games[key])
					{
						console.log(`adding game ${game.realm}-${key}`);
						
						$.ajax(
						{
							var myObject = new FileReader();
	//						myObject = WScript.CreateObject("Scripting.FileSystemObject");
							
							let filePath = `./games/${game.realm}-${key}.json`;
							let fileExisted = myObject.readAsText("AAA.txt", "utf-8");
							games[key] = {
								stream: fs.createWriteStream(filePath, { flags: 'a' }),
								obj: game,
								id: `${game.realm}-${key}`,
								written: myObject.fileExists(filePath + '.finished')
							}

							if (!fileExisted)
							{
								games[key].stream.write(`[\n`)
							}
						}
					}

				});
			};
		},
		error: function (XMLHttpRequest, textStatus, errorThrown)
		{
			console.log(XMLHttpRequest);
		}
	});

	return;

	var request = new XMLHttpRequest();
	request.responseType = 'json';

	request.onreadystatechange = function(env)
	{
		console.log("onreadystatechange");
		if (request.readyState == 4 && request.status == 200)
		{
			//受信完了時の処理
			var result = document.getElementById("result");
//			var text = document.createTextNode(decodeURI(request.responseText));
//			result.appendChild(text);
		}
	}

	request.open('GET', 'http://api.lolesports.com/api/issueToken', true);
	request.send("");
	
	request('http://api.lolesports.com/api/issueToken', { json: true }, (err, res, body) => {
		if (err) log.error(err)

		let ws = new WebSocket(`ws://livestats.proxy.lolesports.com/stats?jwt=${body.token}`)
		// let ws = new WebSocket(`ws://localhost:8080`) // used for simulation of livestats server

		ws.on('close', (code, message) => {
				log.warn('websocket has closed. info:')
				log.warn(`  code: ${code}`)
				log.warn(`  message: ${message}`)
				log.warn('reconnecting...')
				connectToSocket()
		})

		ws.on('error', (err) => {
			log.error('error reported:')
			log.error(err)
		})

		ws.on('message', (msg) => {
			let json = {}
			try {
				json = JSON.parse(msg)
			} catch (e) {
				log.warn('NON-JSON DATA')
				log.warn(msg)
				log.error(e)
			}

			Object.keys(json).forEach((key) => {
				let game = json[key]
				if (game === null) return

				if (!games[key])
				{
					log.info(`adding game ${game.realm}-${key}`)
					let filePath = `${process.cwd()}/games/${game.realm}-${key}.json`
					let fileExisted = fileExists(filePath)
					games[key] = {
						stream: fs.createWriteStream(filePath, { flags: 'a' }),
						obj: game,
						id: `${game.realm}-${key}`,
						written: fileExists(filePath + '.finished')
					}

					if (!fileExisted)
					{
						games[key].stream.write(`[\n`)
					}
				}

				if (games[key].written)
				{
					log.info(`finished file already exists for ${games[key].id} -- won't process again`)
					games[key].stream.destroy()
					return
				}

				log.info(`event received for game ${games[key].id} at time ${formatTime(game.t)}`)

				let isComplete = (game.gameComplete || false)
				games[key].obj = _.merge(games[key].obj, game)
				// special item logic -- the item array isn't a diff, it's the full items the player has
				// lodash.merge tries to merge arrays though, when we just want to outright replace it
				if (game.playerStats)
				{
					Object.keys(game.playerStats).forEach((id) => {
						let player = game.playerStats[id]

						if (player.items) {
							games[key].obj.playerStats[id].items = player.items
						}
					})
				}

				// don't bother writing the data for the first frames where player pos are 0
				if (games[key].obj.playerStats['1'].x !== 0)
				{
					games[key].stream.write(JSON.stringify(games[key].obj) + (isComplete ? '\n' : ',\n'))
				}

				if (isComplete)
				{
					log.info(`finished game ${games[key].id} at time ${formatTime(game.t)}! finishing up...`)

					games[key].stream.end(']\n', () => {
						games[key].stream.destroy()

						let filePath = `${process.cwd()}/games/${games[key].id}.json`

						fs.writeFile(filePath + '.finished', '', (err) => {
							if (err) log.error(err)
							games[key].written = true

							log.info(`uploading file for ${games[key].id}...`)
							matchesBucket.upload(filePath, {
								destination: `matches/${games[key].id}.json`,
								gzip: true,
								public: true
							}, (err) => {
								if (err) log.error(err)
								log.info(`uploaded file for ${games[key].id}!`)
								})
						})
					})
				}
			})
		})
	})
}

function Test2()
{
	connectToSocket();
}