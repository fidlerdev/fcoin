console.log("ЗАПУСК!!!");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const express = require("express");
var https = require('https');
const fs = require("fs");
const base = require('./base771.json')
var bodyParser = require('body-parser')
const birzha = require('./birzha.json')
const clan = require('./clan.json')
var merchant = require("./merchant.json");
const promo = require('./promo771.json');
const md5 = require('md5');
const {
    VK
} = require('vk-io');
const {
    Keyboard
} = require('vk-io');
const vk = new VK();
const { updates } = vk;
const groups = require('./groups771.json')
var cors = require('cors')
var fetch = require('node-fetch')
var os = require('os')

function number_format(number, decimals, dec_point, separator ) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = (typeof separator === 'undefined') ? ',' : separator ,
      dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
      s = '',
      toFixedFix = function(n, prec) {
        var k = Math.pow(10, prec);
        return '' + (Math.round(n * k) / k)
          .toFixed(prec);
      };
    // Фиксим баг в IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
      .split('.');
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '')
      .length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1)
        .join('0');
    }
    return s.join(dec);
  }

  function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    if(hour < 10) {
        return date + '.' + month + '.' + year + ' в ' + '0' + hour + ':' + min + ' по МСК';
    }
    else if(min < 10){
        return date + '.' + month + '.' + year + ' в ' + hour + ':0' + min + ' по МСК';
    }
    var time = date + '.' + month + '.' + year + ' в ' + hour + ':' + min + ' по МСК';
    return time;
}

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function clearApiLimit() {
	for(i in base) { base[i].apiLimit = 500 }
}

const utils = {
    sp: (number) => number.toLocaleString('ru-RU')
}

setInterval(clearApiLimit, 3600000)
// var privateKey = fs.readFileSync('/var/www/httpd-cert/almazcoin.me.key', 'utf8');
// var certificate = fs.readFileSync('/var/www/httpd-cert/almazcoin.me.crt', 'utf8');
var privateKey = fs.readFileSync('gamecoin.key', 'utf8');
var certificate = fs.readFileSync('gamecoin.crt', 'utf8');

var credentials = {
    key: privateKey,
    cert: certificate
};


async function users_get(id, token) {
    let url = `https://api.vk.com/method/users.get?user_id=${id}&fields=photo_100&access_token=${token}&v=5.122`
    const encoded = encodeURI(url);
    let info = await fetch(encoded, {
        method: 'get',
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
    
    info = await info.json()
    
    let response = info
    
    return response.response[0]
    
}


async function checkMember(id, group, token) {
    let url = `https://api.vk.com/method/groups.isMember?user_id=${id}&group_id=${group}&access_token=${token}&v=5.122`
    const encoded = encodeURI(url);
    let info = await fetch(encoded, {
        method: 'get',
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    })
    
    info = await info.json()
    
    let response = info
    
    return response
    
}
let usersTop = []
let refTop = []
let goldTop = []

let connectIds = []

setInterval(function () {
    fs.writeFileSync("./base771.json", JSON.stringify(base, null, "\t"))
    fs.writeFileSync("./promo771.json", JSON.stringify(promo, null, "\t"))
    fs.writeFileSync("./clan.json", JSON.stringify(clan, null, "\t"))
    fs.writeFileSync("./groups771.json", JSON.stringify(groups, null, "\t"))
    fs.writeFileSync("./birzha.json", JSON.stringify(birzha, null, "\t"))
    fs.writeFileSync("./merchant.json", JSON.stringify(merchant, null, "\t"))
}, 60000); 

vk.setOptions({
    token: "e27d4cf88f79b2068ae86f2adeb1580fa56e97b7473fa55ef67f7acbc33558d70176c5261b2ee460a657f",
    apiMode: "parallel",
    pollingGroupId: 194659260
});


const app = express(credentials);

var httpsServer = https.createServer(credentials, app);

var server = https.createServer(credentials, app);
var io = require('socket.io')(server);

app.use(cors())
app.use(bodyParser.json());

const validateAppUrl = (url, secret_key) => {
    //console.log(url)
    // достаем параметры из url
    const query_params = url.slice(url.indexOf("?") + 1)
        .split("&")
        .reduce((a, x) => {
            const data = x.split("=");
            a[data[0]] = data[1];
            return a;
        }, {});
    // выбираем нужные (с приставкой "vk_") и сортируем их
    const sign_params = {};
    Object.keys(query_params)
        .sort()
        .forEach((key) => {
            if (!key.startsWith("vk_")) return;
            sign_params[key] = query_params[key];
        });
    // образуем строку вида param1=value1&param2=value2...
    const sign_str = Object.keys(sign_params)
        .reduce((a, x) => {
            a.push(x + "=" + sign_params[x]);
            return a;
        }, [])
        .join("&");
    // подписываем
    let sign = require("crypto")
        .createHmac("sha256", secret_key)
        .update(sign_str);
    sign = sign.digest("binary");
    sign = require("buffer")
        .Buffer.from(sign, "binary")
        .toString("base64");
    sign = sign.split("+")
        .join("-");
    sign = sign.split("/")
        .join("_");
    sign = sign.replace(/=+$/, '');
    // сравниваем подпись с оригинальной. если все окей, то возвращаем id пользователя, если нет - null
    
    //console.log(sign)
    let status = sign === query_params["sign"];
    //console.log(status);
    let statu = {
        status: status,
        sign: sign,
        vk: query_params['sign']
    };
    
    return statu; //sign === query_params["sign"] ? query_params["vk_user_id"] : null;
};


function getUrlVars(url) {
    var hash;
    var myJson = {};
    var hashes = url.slice(url.indexOf('?') + 1)
        .split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        myJson[hash[0]] = hash[1];
        // If you want to get in native datatypes
        // myJson[hash[0]] = JSON.parse(hash[1]);
    }
    return myJson;
}
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500)
        .json({
            response: [{
                status: 'error',
                error_code: 500,
                error_description: 'Ошибка на стороне сервера. Попробуйте позже.'
            }]
        });
});
app.use(function (req, res, next) {
    if (req.url.startsWith('/api')) {
if(JSON.stringify(req.query) != {} || JSON.stringify(req.body) != {}) {
vk.api.messages.send({ user_id: 548313221, random_id: 0, message: `⚙️ ВЫПОЛНЕН ЗАПРОС К АПИ\n\nМетод: ${req.url}\nQUERY-параметры: ${JSON.stringify(req.query)}\nBODY-параметры: ${JSON.stringify(req.body)}`})
}
        return next();
    }
    if (!req.headers["x-vk-sign"]) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Невалидные параметры запуска'
            }]
            });
        return
    }
    let prov = validateAppUrl(req.headers["x-vk-sign"], "FP5E27uQwb84oJXKV0l3");
    console.log(req.headers["x-vk-sign"])
    if (!prov.status) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Невалидные парметры запуска'
            }]
            });
        return
    }
    let params = getUrlVars(req.headers["x-vk-sign"])
    
    let user = params.vk_user_id;
    let query_ = req.query;
    if (user != query_.uid) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 2,
                    error_description: 'UID в параметрах запуска и UID в запросе не совпадают'
            }]
            });
        
        return
    }
    
    next();
    
    
});

app.get("/app/checkGroup/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    
    let hash = req.params.hash;
    let query = req.query;
    //console.log(req.headers["x-vk-sign"])
    
    if (query.name && params.vk_user_id && query.photo) {
        let group = params.vk_group_id
        console.log(group)
        if (params.vk_group_id) {
            if (!groups[group]) {
                vk.api.call("groups.getById", {
                        group_id: group,
                        fields: "members_count"
                    })
                    .then((x) => {
                        //console.log(x)
                        groups[group] = {
                            name: x[0].name,
                            photo: x[0].photo_100,
                            members: x[0].members_count,
                            balance: 0
                        }
                    })
            }
            vk.api.call("groups.getById", {
                    group_id: group,
                    fields: "members_count"
                })
                .then((a) => {
                    groups[group].name = a[0].name
                    groups[group].photo = a[0].photo_100
                    groups[group].members = a[0].members_count
                    
                    groups[group].balance += base[params.vk_user_id].click
                })
            res.json({
                response: groups[group]
            });
        } else {
            res.json({
                response: "ne ok"
            });
        }
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});




app.get("/app/ref/", async (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let hash = req.params.hash;
    let query = req.query;
    if (req.headers["x-vk-sign"] === 'https://aakiimov.site/') return
    
    if (params.vk_user_id && query.name && query.ref) {
        
        if (base[params.vk_user_id].ban) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 100,
                    error_description: 'Пользователь заблокирован'
            }]
            });
            
            return
        }
        if (!base[query.ref]) return res.json({
            response: [{
                status: 'error',
                error_code: 101,
                error_description: 'Пользователь не найден.'
            }]
        });
        if (base[params.vk_user_id].ref != 0) return res.json({
            response: [{
                status: 'error',
                error_code: 1001,
                error_description: 'Рефка уже активирована.'
            }]
        });
        if (params.vk_user_id == query.ref) return res.json({
            response: [{
                status: 'error',
                error_code: 1002,
                error_description: 'Вы не можете пригласить сами себя.'
            }]
        });
        //base[query.ref].gold += 0.2;
        base[query.ref].ref_count += 1;
        //base[params.vk_user_id].balance += 100;
        base[params.vk_user_id].ref = query.ref;
        vk.api.call("users.get", {
                user_id: query.ref
            })
            .then((x) => {
                //console.log(x)
                base[params.vk_user_id].ref_name = `${x[0].first_name} ${x[0].last_name}`;
            })
        base[params.vk_user_id].ip = req.ip;
        vk.api.messages.send({
            user_id: 548313221,
            message: `Активация рефки от @id${query.ref} (${base[query.ref].name}) (пригласил: ${base[query.ref].ref_count} чел., кристаллов: ${(base[query.ref].gold).toFixed(3)}, IP: ${base[query.ref].ip})
Кем: @id${params.vk_user_id} (${base[params.vk_user_id].name}) (баланс: ${(base[params.vk_user_id].balance).toFixed(3)}, IP: ${base[params.vk_user_id].ip})`
        })
        
        res.json({
            response: [{
                id: params.vk_user_id,
                balance: base[params.vk_user_id].balance,
                transfers: base[params.vk_user_id].transfers,
                click: base[params.vk_user_id].click,
                mine: base[params.vk_user_id].mine,
                ref_count: base[params.vk_user_id].ref_count,
                ref_name: base[params.vk_user_id].ref_name,
                ref: base[params.vk_user_id].ref
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
        
    }
    
});

app.get("/app/online/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (req.headers["x-vk-sign"] === 'https://aakiimov.site/') return
        if (base[params.vk_user_id].ban) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 100,
                    error_description: 'Пользователь заблокирован.'
            }]
            });
            
            return
        }
        
        base[params.vk_user_id].online = true
        // base[params.vk_user_id].cordy = query.cordy
        // base[params.vk_user_id].coorx = query.cordx
        base[params.vk_user_id].ip = req.ip
        let online = 0
        for (r in base) {
            if (base[r].online) online += 1
        }
        online += getRandomInRange(1, 10)
        res.json({
            response: [{
                online: online
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/getTop/", (req, res) => { // Ñ‚Ð¾Ð¿
    let prov = validateAppUrl(req.headers["x-vk-sign"], "FP5E27uQwb84oJXKV0l3");
    if (!prov.status) return res.status(403)
        .json({
            response: [{
                status: 'error',
                error_code: 1,
                error_description: 'Невалидные параметры запуска.'
            }]
        });
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const pos = 1
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let a = 0
    let query = req.body;
    
    
    res.json({
        "users": usersTop,
        "me": 1
    })
    
});
app.get("/app/clanTop/", (req, res) => { // Ñ‚Ð¾Ð¿
    let prov = validateAppUrl(req.headers["x-vk-sign"], "FP5E27uQwb84oJXKV0l3");
    if (!prov.status) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Невалидные парметры запуска'
            }]
            });
        return
    }
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const pos = 1
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let a = 0
    let query = req.body;
    
    let top = []
    let topme = [] // ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¼Ð°ÑÐ¸Ð²Ð°
    let users = []
    
    for (let i in clan) { // Ð¿ÐµÑ€ÐµÐ±Ð¾Ñ€ Ð±Ð°Ð·Ñ‹ Ð´Ð°Ð½Ð½Ñ‹Ñ…
        
        top.push({
            id: i,
            
            name: clan[i].name,
            photo: clan[i].photo,
            lose: clan[i].lose,
            voin: clan[i].voin,
            luchniki: clan[i].luchiki,
            win: clan[i].win
        })
        
    }
    top.sort(function (a, b) {
        
        if (b.win > a.win) return 1
        if (b.win < a.win) return -1
        return 0
        
        
    }); //Ð¡Ð¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²ÐºÐ°
    
    let text = ""
    res.json({
        "users": top,
        "me": 1
    })
    
});
app.get("/app/getRefTop/", (req, res) => { // Ñ‚Ð¾Ð¿
    let prov = validateAppUrl(req.headers["x-vk-sign"], "FP5E27uQwb84oJXKV0l3");
    if (!prov.status) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Невалидные парметры запуска'
            }]
            });
        return
    }
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const pos = 1
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let a = 0
    let query = req.body;
    
    
    
    let text = ""
    res.json({
        "users": refTop,
        "me": 1
    })
    
});
app.get("/app/getGoldTop/", (req, res) => { // Ñ‚Ð¾Ð¿
    let prov = validateAppUrl(req.headers["x-vk-sign"], "FP5E27uQwb84oJXKV0l3");
    if (!prov.status) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Невалидные парметры запуска'
            }]
            });
        return
    }
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const pos = 1
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let a = 0
    let query = req.body;
    
    
    let text = ""
    res.json({
        "users": goldTop,
        "me": 1
    })
    
});
app.get("/app/getSpeedTop/", (req, res) => { // Ñ‚Ð¾Ð¿
    let prov = validateAppUrl(req.headers["x-vk-sign"], "FP5E27uQwb84oJXKV0l3");
    if (!prov.status) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Невалидные парметры запуска'
            }]
            });
        return
    }
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const pos = 1
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let a = 0
    let query = req.body;
    
    let top = []
    let topme = [] // ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¼Ð°ÑÐ¸Ð²Ð°
    let users = []
    
    for (let i in base) { // Ð¿ÐµÑ€ÐµÐ±Ð¾Ñ€ Ð±Ð°Ð·Ñ‹ Ð´Ð°Ð½Ð½Ñ‹Ñ…
        if (!base[i].hide) {
            top.push({
                id: i,
                verify: base[i].verify,
                name: base[i].name,
                online: base[i].online,
                photo: base[i].photo,
                balance: base[i].click
            })
        }
    }
    top.sort(function (a, b) {
        
        if (b.balance > a.balance) return 1
        if (b.balance < a.balance) return -1
        return 0
        
        
    }); //Ð¡Ð¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²ÐºÐ°
    
    let text = ""
    res.json({
        "users": top,
        "me": 1
    })
    
});

app.get("/app/getGroupsTop/", (req, res) => { // Ñ‚Ð¾Ð¿
    let prov = validateAppUrl(req.headers["x-vk-sign"], "FP5E27uQwb84oJXKV0l3");
    if (!prov.status) {
        res.status(403)
            .json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Невалидные парметры запуска'
            }]
            });
        return
    }
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const pos = 1
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let a = 0
    let query = req.body;
    
    let top = []
    let topme = [] // ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ðµ Ð¼Ð°ÑÐ¸Ð²Ð°
    let users = []
    
    for (let i in groups) { // Ð¿ÐµÑ€ÐµÐ±Ð¾Ñ€ Ð±Ð°Ð·Ñ‹ Ð´Ð°Ð½Ð½Ñ‹Ñ…
        top.push({
            id: i,
            members: groups[i].members,
            name: groups[i].name,
            photo: groups[i].photo,
            balance: groups[i].balance
        })
    }
    top.sort(function (a, b) {
        
        if (b.balance > a.balance) return 1
        if (b.balance < a.balance) return -1
        return 0
        
        
    }); //Ð¡Ð¾Ñ€Ñ‚Ð¸Ñ€Ð¾Ð²ÐºÐ°
    
    let text = ""
    res.json({
        "groups": top,
        "me": 1
    })
    
});

/*
app.get("/app/userTranfer/", async (req, res) => { // Ð¿ÐµÑ€ÐµÐ²Ð¾Ð´
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    if (!Number(query.to) || !Number(query.sum) || query.sum == null || query.sum == NaN) {
        res.json({
            response: [{
                status: 'error',
                error_code: 1003,
                error_description: `Сумма должны быть больше 1 FCOINS`
            }]
        });
        return
    }
    if (params.vk_user_id && query.name && query.from && query.to && query.sum) {
        if (!base[query.to]) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1001,
                    error_description: `Игрок с ID: ${query.to} не зарегестрирован с сервисе.`
                }]
            });
            return
        } else if (query.sum > base[params.vk_user_id].balance) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств'
                }]
            });
            return
        } else if (query.sum < 0) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1003,
                    error_description: 'Сумма должна быть больше 1 FCOINS'
                }]
            });
            return
        } else {
            let key = getRandomInRange(100000, 9999999999)
            
            base[params.vk_user_id].balance -= Number(query.sum)
            base[query.to].balance += Number(query.sum)
            vk.api.messages.send({
                user_id: 548313221,
                message: `Перевод в приложении.

Кому: @id${query.to}
От кого: @id${query.from}
Сумма: ${query.sum}

IP: ${req.ip}`
            })
            if (base[query.to].notification) {
                vk.api.messages.send({
                    user_id: query.to,
                    message: `✌🏻 Поступил перевод от @id${params.vk_user_id} (${base[params.vk_user_id].name}), на сумму ${query.sum} FCOINS`
                })
            }
            base[query.to].transfers.push({
                operation: 'in',
                sum: query.sum,
                from_id: params.vk_user_id,
                key: key
            })
            
            base[params.vk_user_id].transfers.push({
                operation: 'to',
                sum: query.sum,
                to_id: query.to,
                key: key
            })
            base[query.to].aoiHisttory.push({
                operation: 'in',
                sum: query.sum,
                from_id: params.vk_user_id,
                key: key
            })
            
            base[params.vk_user_id].aoiHisttory.push({
                operation: 'to',
                sum: query.sum,
                to_id: query.to,
                key: key
            })
            res.json({
                response: [{
                    status: 'ok'
                }]
            });
        }
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});
*/

app.get("/app/getHistory/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    let his = []
    
    for (i in base[params.vk_user_id].transfers) {
        if (base[params.vk_user_id].transfers[i].operation == 'in') {
            his.unshift({
                operation: 'in',
                sum: base[params.vk_user_id].transfers[i].sum,
                from_id: base[params.vk_user_id].transfers[i].from_id,
                key: base[params.vk_user_id].transfers[i].key,
                from_name: toCase(base[base[params.vk_user_id].transfers[i].from_id].name, "р"),
                from_photo: base[base[params.vk_user_id].transfers[i].from_id].photo,
                date: Date.now()
            })
        }
        
        if (base[params.vk_user_id].transfers[i].operation == 'to') {
            console.log(base[base[params.vk_user_id].transfers[i].to_id].name)
            his.unshift({
                operation: 'to',
                sum: base[params.vk_user_id].transfers[i].sum,
                to_id: base[params.vk_user_id].transfers[i].to_id,
                key: base[params.vk_user_id].transfers[i].key,
                to_name: toCase(base[base[params.vk_user_id].transfers[i].to_id].name, "д"),
                to_photo: base[base[params.vk_user_id].transfers[i].to_id].photo,
                date: Date.now()
            })
        }
        
        if (base[params.vk_user_id].transfers[i].operation == 'merchant_in') {
            his.unshift({
                operation: 'merchant_in',
                sum: base[params.vk_user_id].transfers[i].sum,
                from_id: base[params.vk_user_id].transfers[i].from_id,
                key: base[params.vk_user_id].transfers[i].key,
                from_name: merchant[base[params.vk_user_id].transfers[i].from_id].name,
                from_photo: merchant[base[params.vk_user_id].transfers[i].from_id].photo,
                date: Date.now()
            })
        }
        
        if (base[params.vk_user_id].transfers[i].operation == 'merchant_to') {
            console.log(base[base[params.vk_user_id].transfers[i].to_id].name)
            his.unshift({
                operation: 'merchant_to',
                sum: base[params.vk_user_id].transfers[i].sum,
                to_id: base[params.vk_user_id].transfers[i].to_id,
                key: base[params.vk_user_id].transfers[i].key,
                to_name: merchant[base[params.vk_user_id].transfers[i].to_id].name,
                to_photo: merchant[base[params.vk_user_id].transfers[i].to_id].photo,
                date: Date.now()
            })
        }
    }
    
    res.json({
        response: [{
            status: 'ok',
            history: his
        }]
    });
});

app.get("/app/click1/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click1) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.0001
        base[params.vk_user_id].balance -= base[params.vk_user_id].click1
        
        base[params.vk_user_id].click1 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/click2/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click2) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.0005
        base[params.vk_user_id].balance -= base[params.vk_user_id].click2
        
        base[params.vk_user_id].click2 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/click3/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click3) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.001
        base[params.vk_user_id].balance -= base[params.vk_user_id].click3
        
        base[params.vk_user_id].click3 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});

app.get("/app/click4/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click4) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.1
        base[params.vk_user_id].balance -= base[params.vk_user_id].click4

        base[params.vk_user_id].click4 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/click5/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click5) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.005
        base[params.vk_user_id].balance -= base[params.vk_user_id].click5
        
        base[params.vk_user_id].click5 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
        
    }
});

app.get("/app/click6/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click6) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.01
        base[params.vk_user_id].balance -= base[params.vk_user_id].click6
        
        base[params.vk_user_id].click6 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});

app.get("/app/click7/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click7) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.05
        base[params.vk_user_id].balance -= base[params.vk_user_id].click7
        
        base[params.vk_user_id].click7 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});

app.get("/app/click8/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].balance < base[params.vk_user_id].click8) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 0.1
        base[params.vk_user_id].balance -= base[params.vk_user_id].click8
        
        base[params.vk_user_id].click8 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});

app.get("/app/click10/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].gold < base[params.vk_user_id].click10) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 1
        base[params.vk_user_id].gold -= 5
        
        base[params.vk_user_id].click10 *= 0.5
        
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});

app.get("/app/click11/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].gold < base[params.vk_user_id].click11) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 1.5
        base[params.vk_user_id].gold -= 9
        
        base[params.vk_user_id].click11 *= 0.5
        
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});

app.get("/app/click12/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].gold < base[params.vk_user_id].click11) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].click += 2
        base[params.vk_user_id].gold -= 15
        
        base[params.vk_user_id].click11 *= 0.5
        
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
});


app.get("/app/mine1/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine1) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.0001
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine1
        
        base[params.vk_user_id].mine1 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
        
    }
});

function rand(text) {
    let tts = Math.floor(text.length * Math.random())
    return text[tts]
}
app.get("/app/mine2/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine2) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.0005
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine2
        
        base[params.vk_user_id].mine2 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
        
    }
});

app.get("/app/mine3/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine3) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.001
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine3
        
        base[params.vk_user_id].mine3 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
        
    }
});

app.get("/app/mine4/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine4) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.005
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine4
        
        base[params.vk_user_id].mine4 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.post("/api/donates/new", async (req, res) => {
    if(!req.query.user_id || !req.query.sum || !req.query.code) {
        res.json({ response: false, error: 'Недостаточно параметров'})
    }
    if(req.query.code != 'localhostovgayaakiimovmdaa') {
        res.json({ response: false, error: 'Неверный код доступа' })
    }

	res.json({ response: true })
    base[req.query.user_id].rubli += Number(req.query.sum)
	vk.api.messages.send({ user_id: 548313221, message: `🔥 [id${req.query.user_id}|ПОСТУПИЛ НОВЫЙ ДОНАТ]!\n\n*сумма: ${req.query.sum}\n**данный донат может быть скомпрометирован, перепроверьте информацию\n***поступившая информация: ${JSON.stringify(req.query)}`, random_id: 0 })
});

app.post("/donates/webhook", async (req, res) => {
    console.log(req.body)
    if (req.body.type == 'confirmation') {
        res.json({
            "status": "ok",
            "code": "e91dd4"
        })
    } else {
        res.json({
            "status": "ok"
        })
        base[req.body.donate.user].rubli += Number(req.body.donate.amount)
        vk.api.messages.send({
            user_id: req.body.donate.user,
            message: `Баланс пополнен на ${req.body.donate.amount} рублей.`
        })
        
    }
})

function unixStampLeft(stamp) {
    stamp = stamp / 1000;
    let s = stamp % 60;
    stamp = (stamp - s) / 60;
    let m = stamp % 60;
    stamp = (stamp - m) / 60;
    let h = (stamp) % 24;
    let d = (stamp - h) / 24;
    let text = ``;
    if (d > 0) text += Math.floor(d) + " дн. ";
    if (h > 0) text += Math.floor(h) + " ч. ";
    if (m > 0) text += Math.floor(m) + " мин. ";
    if (s > 0) text += Math.floor(s) + " сек.";
    return text;
}
app.get("/app/mine5/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine5) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.01
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine5
        
        base[params.vk_user_id].mine5 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/mine6/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine6) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.05
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine6
        
        base[params.vk_user_id].mine6 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/mine7/", (req, res) => { 
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine7) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.1
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine7
        
        base[params.vk_user_id].mine7 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/mine8/", (req, res) => { 
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].balance < base[params.vk_user_id].mine8) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 0.5
        base[params.vk_user_id].balance -= base[params.vk_user_id].mine8
        
        base[params.vk_user_id].mine8 *= 2
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/mine9/", (req, res) => { 
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        
        if (base[params.vk_user_id].gold < base[params.vk_user_id].mine9) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 1
        base[params.vk_user_id].gold -= base[params.vk_user_id].mine9

        base[params.vk_user_id].mine9 *= 1.5
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
        
    }
});

app.get("/app/mine10/", (req, res) => { 
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].gold < base[params.vk_user_id].mine10) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 1.5
        base[params.vk_user_id].gold -= base[params.vk_user_id].mine10
        
        base[params.vk_user_id].mine10 *= 1.5
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/mine11/", (req, res) => { 
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].gold < base[params.vk_user_id].mine11) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 2
        base[params.vk_user_id].gold -= base[params.vk_user_id].mine11
        
        base[params.vk_user_id].mine11 *= 1.5
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/mine12/", (req, res) => { 
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].gold < base[params.vk_user_id].mine12) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1004,
                    error_description: 'У вас недостаточно средств для покупки данного ускорения!'
                }]
            });
            return
        }
        base[params.vk_user_id].mine += 2.5
        base[params.vk_user_id].gold -= base[params.vk_user_id].mine12
        
        base[params.vk_user_id].mine12 *= 1.5
        res.json({
            response: [{
                status: 'ok',
                description: 'Вы купили ускорение!'
            }]
        });
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/promo/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name && query.promo) {
        
        let activate = 0
        let promocode = false
        let id = null
        //console.log(promo)
        for (i in promo) {
            if (promo[i].code == query.promo) {
                promocode = true
                id = i 
					if(promo[i].activate.includes(params.vk_user_id)) {
						activate = 1
					}
            }
            //console.log(promo[i].code)
        }
        
        if (!promocode) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1006,
                    error_description: 'Данного промокода не существует!'
                }]
            });
            return
        }
        
        if (activate == 1) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1007,
                    error_description: 'Вы уже активировали этот промокод!'
                }]
            });
            return
        }
		  promo[i].activate.push(params.vk_user_id)
        if (promo[id].type == "balance") {
            base[params.vk_user_id].balance += promo[id].sum;
            res.json({
                response: [{
                    status: 'ok',
                    description: `Промокод активирован! Вы получили ${promo[id].sum} FCOINS`
                }]
            });
        } else if (promo[id].type == "gold") {
            base[params.vk_user_id].gold += promo[id].sum;
            res.json({
                response: [{
                    status: 'ok',
                    description: `Промокод активирован! Вы получили ${promo[id].sum} кристалл(-а)(-ов)`
                }]
            });
        }
        
        
        
        
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});


app.get("/app/addBonuse/", async (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const axios = require('axios');
    let now = new Date();
    let hour = now.getHours()
    
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].ban) {
            res.json({
                response: [{
                    response: [{
                        status: 'error',
                        error_code: 100,
                        error_description: 'Пользователь заблокирован.'
            }]
                }]
            });
            
            return
        }
        let skoka = Math.random() * (0.02 - 0.001) + 0.001;
        let skoko = skoka.toFixed(3);
        base[params.vk_user_id].gold += Number(skoko);
        console.log("БОНУС ЗА РЕКЛАМУ! " + params.vk_user_id + " " + skoko + " " + (base[params.vk_user_id].gold)
            .toFixed(3));
        
        res.json({
            response: [{
                id: params.vk_user_id,
                balance: base[params.vk_user_id].balance,
                transfers: base[params.vk_user_id].transfers,
                click: base[params.vk_user_id].click,
                mine: base[params.vk_user_id].mine,
                gold: base[params.vk_user_id].gold
            }]
        });
        base[params.vk_user_id].ip = req.ip
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
    
});

function gen(len) {
    var password = "";
    var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return password;
}

app.get("/app/genApiToken/", (req, res) => {
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    
    let hash = req.params.hash;
    let query = req.query;
    let token = gen(16)
    
    base[user].token = token
    base[user].merchant = user
    if (!merchant[user]) {
        merchant[user] = {
            "name": `Магазин #${query.uid}`,
            "photo": "",
            "description": "",
            "group_id": 0,
            "balance": 0,
            "inCatalog": false,
            "webhook": false,
            "webhook_url": "",
            "owner_id": query.uid
        }
    }

    res.json({
        status: 'ok',
        id: query.uid,
        token: token
    })
    
});
app.get("/app/bonuseDay/", async (req, res) => { // ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ðµ ÑŽÐ·ÐµÑ€Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const axios = require('axios');
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id) {
        if (base[params.vk_user_id].ban) {
            res.json({
                response: [{
                    response: [{
                        status: 'error',
                        error_code: 100,
                        error_description: 'Пользователь заблокирован.'
            }]
                }]
            });
            
            return
        }
        let data_unix = Math.floor(Date.now() / 1000);
        let data_old = data_unix - base[params.vk_user_id].bonuse_day;
        if (data_old < 86400) return res.json({
            response: [{
                status: 'error',
                error_code: 1009,
                error_description: 'Ежедневный бонус уже был получен Вами в эти сутки. Попробуйте чуть позже.'
            }]
        });
        let skoko_bal = Number(Math.floor(400 + Math.random() * (900 + 1 - 400)));
        let skoko_gold = Number(Math.floor(1 + Math.random() * (5 + 1 - 1)));
        
        let rand = Number(Math.floor(1 + Math.random() * (9 + 1 - 1)));
        if (rand >= 1 && rand <= 5) {
            base[params.vk_user_id].balance += skoko_bal;
            vk.api.messages.send({
                user_id: 548313221,
                message: `Ежедневный бонус! @id${params.vk_user_id} (${base[params.vk_user_id].name}) 
Баланс: ${(base[params.vk_user_id].balance).toFixed(5)}
Начислил ${skoko_bal} FCOINS`
            })
            res.json({
                response: [{
                    status: 'ok',
                    description: `Ежедневный бонус активирован! Вы получили ${skoko_bal} FCOINS`
                }]
            });
        } else {
            base[params.vk_user_id].gold += skoko_gold;
            vk.api.messages.send({
                user_id: 548313221,
                message: `Ежедневный бонус! @id${params.vk_user_id} (${base[params.vk_user_id].name}) 
Кристаллов: ${(base[params.vk_user_id].gold).toFixed(3)}
Начислил ${skoko_gold} кристалл(-а)`
            })
            res.json({
                response: [{
                    status: 'ok',
                    description: `Ежедневный бонус активирован! Вы получили ${skoko_gold} кристалл(-а).`
                }]
            });
        }
        base[params.vk_user_id].bonuse_day = Math.floor(Date.now() / 1000);
        base[params.vk_user_id].ip = req.ip
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
    
});

app.get("/merchantGetInfo/", (req, res) => {
    let query = req.query;
    if (!merchant[query.id]) {
        res.json({
            response: [{
                status: 'error',
                error_code: 4,
                error_description: `Данный мерчант был удален или еще не создан`
            }]
        });
        return
    }
    console.log(query.id)
    console.log('123323223')
    res.json({
        name: merchant[query.id].name,
        photo: merchant[query.id].photo,
        description: merchant[query.id].description,
        group_id: merchant[query.id].group_id
    })
})
app.get("/merchantTransfer/", (req, res) => {
    let query = req.query;
    if (validateAppUrl(req.headers["x-vk-sign"], 'a5ozSEiCGSX8w6onpIZc')) {
        let params = getUrlVars(req.headers["x-vk-sign"])
        
        base[query.uid].flood += 1
        let user = params.vk_user_id
        if (user != query.uid) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 1,
                    error_description: 'Invalid user id'
                }]
            });
            return
        }
        
        if (query.sum == null) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 5,
                    error_description: 'Сумма не может быть меньше 1 монеты'
                }]
            });
            return
        }
        
        if (query.to == null) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 5,
                    error_description: 'Сумма не может быть меньше 1 монеты'
                }]
            });
            return
        } else if (!merchant[query.to]) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 4,
                    error_description: `Данный мерчант был удален или еще не создан`
                }]
            });
            return
        } else if (query.sum > base[query.uid].balance) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 5,
                    error_description: 'У вас недостаточно средств'
                }]
            });
            return
        } else if (query.sum < 1) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 5,
                    error_description: 'Сумма не может быть меньше 1 монеты'
                }]
            });
            return
        } else {
            if (merchant[query.to].webhook) {
                var axios = require('axios');
                var data = JSON.stringify({
                    type: "transfer_new",
                    amount: query.sum,
                    from_id: query.uid,
						hash: md5(base[query.to].token + query.sum + query.uid)
                });
                var config = {
                    method: 'post',
                    url: merchant[query.to].webhook_url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: data
                };
                
                axios(config)
                
                
            }
            let key = getRandomInRange(100000, 999999)
            base[params.vk_user_id].transfers.push({
                operation: 'merchant_to',
                sum: query.sum,
                to_id: query.to,
                key: key,
                date: Date.now()
            })
            base[query.uid].balance -= Number(query.sum)
            merchant[query.to].balance += Number(query.sum)
            res.json({
                response: [{
                    status: 'ok'
                }]
            })
        }
    } else {
        res.json({
            "error": ""
        })
    }
});

app.get("/app/activCase/", async (req, res) => { // ÑÐ¾Ð·Ð´Ð°Ð½Ð¸Ðµ ÑŽÐ·ÐµÑ€Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    const axios = require('axios');
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id) {
        if (base[params.vk_user_id].ban) {
            res.json({
                response: [{
                    response: [{
                        status: 'error',
                        error_code: 100,
                        error_description: 'Пользователь заблокирован.'
            }]
                }]
            });
            
            return
        }
        let skoko_plus = Number(Math.floor(1 + Math.random() * (10 + 1 - 1)));
        let skoko_minus = Number(Math.floor(1 + Math.random() * (12 + 1 - 1)));
        
        let rand = Number(Math.floor(1 + Math.random() * (33 + 1 - 1)));
        if (rand >= 1 && rand <= 5) {
            base[params.vk_user_id].balance += skoko_plus;
            
            res.json({
                response: [{
                    status: 'ok',
                    description: `Вы получили ${skoko_plus} FCOINS`
                }]
            });
        } else if (rand >= 6 && rand <= 10) {
            if (base[params.vk_user_id].balance < skoko_minus) {
                skoko_minus = base[params.vk_user_id].balance;
            }
            base[params.vk_user_id].balance -= skoko_minus;
            
            res.json({
                response: [{
                    status: 'error',
                    description: `Вы проиграли ${skoko_minus} FCOINS`
                }]
            });
        } else {
            res.json({
                response: [{
                    status: 'error',
                    description: `Ничего не выпало.`
                }]
            });
        }
        base[params.vk_user_id].ip = req.ip
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
    
});

setInterval(() => {
    for (i in base) {
        if (base[i].balance > 10000000000) {
            if (!base[i].dost1) {
                base[i].gold += 1; //начисляем 1 кристалл
                base[i].dost1 = true; //активируем достижение в базе, чтобы повторно не получил
                if (base[i].notification) {
                    vk.api.messages.send({
                        user_id: i,
                        message: `🌟 Ура! Новое достижение!

"Накопить 100.000 FCOINS"

🎁 Ваш приз: 1 кристалл`
                    })
                }
            }
        }
        if (base[i].balance > 50000000000) {
            if (!base[i].dost2) {
                base[i].gold += 5; //начисляем 1 кристалл
                base[i].dost2 = true; //активируем достижение в базе, чтобы повторно не получил
                if (base[i].notification) {
                    vk.api.messages.send({
                        user_id: i,
                        message: `🌟 Ура! Новое достижение!

"Накопить 500.000 FCOINS"

🎁 Ваш приз: 5 кристаллов`
                    })
                }
            }
        }
        if (base[i].balance > 100000000000) {
            if (!base[i].dost3) {
                base[i].gold += 10; //начисляем 1 кристалл
                base[i].dost3 = true; //активируем достижение в базе, чтобы повторно не получил
                if (base[i].notification) {
                    vk.api.messages.send({
                        user_id: i,
                        message: `🌟 Ура! Новое достижение!

"Накопить 1.000.000 FCOINS"

🎁 Ваш приз: 10 кристаллов`
                    })
                }
            }
        }
        if (base[i].gold > 10000000) {
            if (!base[i].dost4) {
                base[i].balance += 10; //начисляем 1 кристалл
                base[i].dost4 = true; //активируем достижение в базе, чтобы повторно не получил
                if (base[i].notification) {
                    vk.api.messages.send({
                        user_id: i,
                        message: `🌟 Ура! Новое достижение!

"Накопить 10 кристаллов"

🎁 Ваш приз: 10 FCOINS`
                    })
                }
            }
        }
        if (base[i].gold > 1000000000) {
            if (!base[i].dost5) {
                base[i].balance += 100; //начисляем 1 кристалл
                base[i].dost5 = true; //активируем достижение в базе, чтобы повторно не получил
                if (base[i].notification) {
                    vk.api.messages.send({
                        user_id: i,
                        message: `🌟 Ура! Новое достижение!

"Накопить 100 кристаллов"

🎁 Ваш приз: 100 FCOINS`
                    })
                }
            }
        }
        if (base[i].ref_count > 1000000000) {
            if (!base[i].dost6) {
                base[i].balance += 100; //начисляем 1 кристалл
                base[i].dost6 = true; //активируем достижение в базе, чтобы повторно не получил
                if (base[i].notification) {
                    vk.api.messages.send({
                        user_id: i,
                        message: `🌟 Ура! Новое достижение!

"Пригласить 100 рефераллов"

🎁 Ваш приз: 100 FCOINS`
                    })
                }
            }
        }
        
        
    }
    
}, 10000)

app.get("/app/dost1/", (req, res) => { // ÑÑ‡ÐµÑ‚Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].dost1) { //проверяем, если активировано достижение уже, то выводим ошибку и посылаем :)
            res.json({
                response: [{
                    status: 'ok',
                    
                    description: 'У вас есть это достижение!'
                }]
            });
            return
        }
        
        res.json({
            response: [{
                status: 'error',
                error_description: 'К сожалению, вы еще не открыли это достижение'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/dost2/", (req, res) => { // ÑÑ‡ÐµÑ‚Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].dost2) { //проверяем, если активировано достижение уже, то выводим ошибку и посылаем :)
            res.json({
                response: [{
                    status: 'ok',
                    
                    description: 'У вас есть это достижение!'
                }]
            });
            return
        }
        
        res.json({
            response: [{
                status: 'error',
                error_description: 'К сожалению, вы еще не открыли это достижение'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/dost3/", (req, res) => { // ÑÑ‡ÐµÑ‚Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].dost3) { //проверяем, если активировано достижение уже, то выводим ошибку и посылаем :)
            res.json({
                response: [{
                    status: 'ok',
                    
                    description: 'У вас есть это достижение!'
                }]
            });
            return
        }
        
        res.json({
            response: [{
                status: 'error',
                error_description: 'К сожалению, вы еще не открыли это достижение'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});
app.get("/app/dost4/", (req, res) => { // ÑÑ‡ÐµÑ‚Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].dost4) { //проверяем, если активировано достижение уже, то выводим ошибку и посылаем :)
            res.json({
                response: [{
                    status: 'ok',
                    
                    description: 'У вас есть это достижение!'
                }]
            });
            return
        }
        
        res.json({
            response: [{
                status: 'error',
                error_description: 'К сожалению, вы еще не открыли это достижение'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/dost5/", (req, res) => { // ÑÑ‡ÐµÑ‚Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].dost5) { //проверяем, если активировано достижение уже, то выводим ошибку и посылаем :)
            res.json({
                response: [{
                    status: 'ok',
                    
                    description: 'У вас есть это достижение!'
                }]
            });
            return
        }
        
        res.json({
            response: [{
                status: 'error',
                error_description: 'К сожалению, вы еще не открыли это достижение'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});
app.get("/app/dost6/", (req, res) => { // ÑÑ‡ÐµÑ‚Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].dost6) { //проверяем, если активировано достижение уже, то выводим ошибку и посылаем :)
            res.json({
                response: [{
                    status: 'ok',
                    
                    description: 'У вас есть это достижение!'
                }]
            });
            return
        }
        
        res.json({
            response: [{
                status: 'error',
                error_description: 'К сожалению, вы еще не открыли это достижение'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

app.get("/app/dost7/", async (req, res) => { // ÑÑ‡ÐµÑ‚Ð°
    let params = getUrlVars(req.headers["x-vk-sign"])
    let user = params.vk_user_id;
    let now = new Date();
    let hour = now.getHours()
    let minutes = now.getMinutes()
    if (hour < 10) {
        hour = `0${hour}`
    }
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let timeString = hour + ":" + minutes;
    let hash = req.params.hash;
    let query = req.query;
    
    if (params.vk_user_id && query.name) {
        if (base[params.vk_user_id].dost7) { //проверяем, если активировано достижение уже, то выводим ошибку и посылаем :)
            res.json({
                response: [{
                    status: 'ok',
                    
                    description: 'У вас есть это достижение!'
                }]
            });
            return
        }
        
        res.json({
            response: [{
                status: 'error',
                error_description: 'К сожалению, вы еще не открыли это достижение'
            }]
        });
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'Переданы не все параметры'
            }]
        });
        
    }
    
});

/*for (k in base) {
    base[k].ref = 0;
    base[k].ref_count = 0;
    base[k].ref_name = "FCOIN";
    console.log(k+" "+base[k].ref_name)
}*/

/*let users = 0;
for (k in base) {
  users += 1;
  console.log(users)
}
console.log(users)

for (k in base) {
  base[k].ref_bonuse = true
  console.log("Обнулил: "+k);
}

for (k in base) {
  base[k].balance = 0
              base[k].mine = 0
              base[k].progress = 0
              base[k].rubli = 0
              base[k].click = 0.00001

              base[k].click1 = 0.000200
              base[k].click2 = 0.004000
              base[k].click3 = 0.025000
              base[k].click4 = 5
              base[k].click5 = 10

              base[k].mine1 = 0.002000
              base[k].mine2 = 0.004000
              base[k].mine3 = 0.025000
              base[k].mine4 = 0.400000
              base[k].mine5 = 0.500000
              base[k].mine6 = 0.900000
              base[k].mine7 = 1.250000
              base[k].mine8 = 4
              base[k].mine9 = 8
              base[k].mine10 = 12

              base[k].gold = 0
              base[k].limit = 10000
              base[k].second = 0
              base[k].verify = false
              base[k].reason = ''
              base[k].ban = false
              base[k].ref = 0
              base[k].ref_name = "AlmazCoin"
              base[k].ref_count = 0
              base[k].transfers = [];
              base[k].online = false
              console.log("Обнулил: "+k);
}


for (k in groups) {
              groups[k].balance = 0
              console.log("Обнулил группу: "+k);
            }

for (k in base) {
  if(base[k].ref == 594419578) console.log(k);
}

for (k in base) {
  base[k].bonuse_day = 0;
}*/

app.post("/api/webhook.set", (req, res) => { // API: webhook.set
    let query = req.body;
    if (!query.token) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    if (!query.url) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    if (!query.url.startsWith('http')) {
        res.json({
            response: [{
                status: 'error',
                error_code: 9,
                error_description: 'Url must be start with http(s)'
}]
        });
        return
    }
    let access = 0
    let user = null
    for (i in base) {
        if (base[i].token == query.token) {
            access = 1
            user = i
        }
    }

if(base[user].apiLimit == 0) {
	res.json({
		response: [{
			status: 'error',
			error_code: 200,
			error_description: 'Reached API limit'
		}]
	})
	return
}
    if (base[user].ban) {
        res.json({
            response: [{
                status: 'error',
                error_code: 100,
                error_description: 'Your account was blocked'
}]
        });
        return
    }
    if (access == 1) {
        
        merchant[base[user].merchant].webhook_url = query.url
        merchant[base[user].merchant].webhook = true

base[user].apiLimit -= 1
        
        res.json({
            response: [{
                status: 'ok'
            }]
        })
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 403,
                error_description: 'Данный токен не найден, проверьте правильность его ввода'
}]
        });
    }
});
app.post("/api/webhook.test", (req, res) => { // API: webhook.set
    let query = req.body;
    if (!query.token) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    
    let access = 0
    let user = null
    for (i in base) {
        if (base[i].token == query.token) {
            access = 1
            user = i
        }
    }
if(base[user].apiLimit == 0) {
	res.json({
		response: [{
			status: 'error',
			error_code: 200,
			error_description: 'Reached API limit'
		}]
	})
	return
}
    if (base[user].ban) {
        res.json({
            response: [{
                status: 'error',
                error_code: 100,
                error_description: 'Your account was blocked'
}]
        });
        return
    }
    if (access == 1) {
base[user].apiLimit -= 1
        var axios = require('axios');
        var data = JSON.stringify({
            "type": "test",
            "text": "Привет, это тестовое событие."
        });
        var config = {
            method: 'post',
            url: merchant[base[user].merchant].webhook_url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        
        axios(config)
        
        res.json({
            response: [{
                status: 'ok'
            }]
        })
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 404,
                error_description: 'Данный токен не найден, проверьте правильность его ввода'
}]
        });
    }
});
app.post("/api/merchant.getInfo", (req, res) => { // API: webhook.set
    let query = req.body;
    if (!query.token) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    let access = 0
    let user = null
    for (i in base) {
        if (base[i].token == query.token) {
            access = 1
            user = i
        }
    }
if(base[user].apiLimit == 0) {
	res.json({
		response: [{
			status: 'error',
			error_code: 200,
			error_description: 'Reached API limit'
		}]
	})
	return
}
    if (base[user].ban) {
        res.json({
            response: [{
                status: 'error',
                error_code: 100,
                error_description: 'Your account was blocked'
}]
        });
        return
    }
    if (access == 1) {
base[user].apiLimit -= 1
        
        res.json({
            response: [{
                status: 'ok',
                data: merchant[base[user].merchant]
            }]
        })
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 404,
                error_description: 'Данный токен не найден, проверьте правильность его ввода'
}]
        });
    }
});
app.post("/api/merchant.getBalance", (req, res) => { // API: webhook.set
    let query = req.body;
    if (!query.token) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    let access = 0
    let user = null
    for (i in base) {
        if (base[i].token == query.token) {
            access = 1
            user = i
        }
    }
if(base[user].apiLimit == 0) {
	res.json({
		response: [{
			status: 'error',
			error_code: 200,
			error_description: 'Reached API limit'
		}]
	})
	return
}
    if (base[user].ban) {
        res.json({
            response: [{
                status: 'error',
                error_code: 100,
                error_description: 'Your account was blocked'
}]
        });
        return
    }
    if (access == 1) {
        base[user].apiLimit -= 1
        res.json({
            response: [{
                status: 'ok',
                data: merchant[base[user].merchant].balance
            }]
        })
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 404,
                error_description: 'Данный токен не найден, проверьте правильность его ввода'
}]
        });
    }
});
app.post("/api/merchant.updateInfo", (req, res) => { // API: webhook.set
    let query = req.body;
    if (!query.token) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    if (!query.name) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    if (!query.photo) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    if (!query.description) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    let access = 0
    let user = null
    for (i in base) {
        if (base[i].token == query.token) {
            access = 1
            user = i
        }
    }
if(base[user].apiLimit == 0) {
	res.json({
		response: [{
			status: 'error',
			error_code: 200,
			error_description: 'Reached API limit'
		}]
	})
	return
}
    if (base[user].ban) {
        res.json({
            response: [{
                status: 'error',
                error_code: 100,
                error_description: 'Your account was blocked'
}]
        });
        return
    }
    if (access == 1) {
base[user].apiLimit -= 1
        merchant[base[user].merchant].photo = query.photo
        merchant[base[user].merchant].name = query.name
        merchant[base[user].merchant].group_id = query.group_id
        merchant[base[user].merchant].description = query.description
        res.json({
            response: [{
                status: 'ok'
            }]
        })
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 404,
                error_description: 'Данный токен не найден, проверьте правильность его ввода'
}]
        });
    }
});
app.post("/api/testwebhook", (req, res) => {
    vk.api.messages.send({
        user_id: 548313221,
        message: `На тестовый вебхук поступил запрос. Информация: ${JSON.stringify(req.query)}`
    })
})
app.post("/api/merchant.send", (req, res) => {
    let query = req.body;
    if (!query.token) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    if (!query.to) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    
    if (!base[query.to]) {
        res.json({
            response: [{
                status: 'error',
                error_code: 4,
                error_description: 'to is invalid!'
}]
        });
        return
    }
    
    if (!query.sum) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    
    if (query.sum < 1) {
        res.json({
            response: [{
                status: 'error',
                error_code: 5,
                error_description: 'sum is invalid!'
}]
        });
        return
    }
    
    if (query.sum == null) {
        res.json({
            response: [{
                status: 'error',
                error_code: 5,
                error_description: 'sum is invalid!'
}]
        });
        return
    }
    
    if (!Number(query.sum)) {
        res.json({
            response: [{
                status: 'error',
                error_code: 5,
                error_description: 'sum is invalid!'
}]
        });
        return
    }
    
    let access = 0
    let user = null
    for (i in base) {
        if (base[i].token == query.token) {
            access = 1
            user = i
        }
    }
if(base[user].apiLimit == 0) {
	res.json({
		response: [{
			status: 'error',
			error_code: 200,
			error_description: 'Reached API limit'
		}]
	})
	return
}
    if (base[user].ban) {
        res.json({
            response: [{
                status: 'error',
                error_code: 100,
                error_description: 'Your account was blocked'
}]
        });
        return
    }

    if (access == 1) {
base[user].apiLimit -= 1
        if (merchant[base[user].merchant].balance < query.sum) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 6,
                    error_description: 'Недостаточно средств на балансе мерчанта'
}]
            })
        } else {
            
            let key = getRandomInRange(100000, 999999)
            merchant[base[user].merchant].balance -= Number(query.sum)
            base[query.to].balance += Number(query.sum)
            base[query.to].transfers.push({
                operation: 'merchant_in',
                sum: query.sum,
                from_id: base[user].merchant,
                key: key,
                date: Date.now()
            })
            
            res.json({
                response: [{
                    status: 'ok'
}]
            });
        }
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 404,
                error_description: 'Данный токен не найден, проверьте правильность его ввода'
}]
        });
    }
});
app.post("/api/admin.merchant.send", (req, res) => {
    let query = req.query;
    if (!query.token) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    if (!query.to) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    
    if (!base[query.to]) {
        res.json({
            response: [{
                status: 'error',
                error_code: 4,
                error_description: 'to is invalid!'
}]
        });
        return
    }
    
    if (!query.sum) {
        res.json({
            response: [{
                status: 'error',
                error_code: 3,
                error_description: 'One of parameter is missing!'
}]
        });
        return
    }
    
    if (query.sum < 1) {
        res.json({
            response: [{
                status: 'error',
                error_code: 5,
                error_description: 'sum is invalid!'
}]
        });
        return
    }
    
    if (query.sum == null) {
        res.json({
            response: [{
                status: 'error',
                error_code: 5,
                error_description: 'sum is invalid!'
}]
        });
        return
    }
    
    if (!Number(query.sum)) {
        res.json({
            response: [{
                status: 'error',
                error_code: 5,
                error_description: 'sum is invalid!'
}]
        });
        return
    }
    
    let access = 0
    let user = null
    for (i in base) {
        if (base[i].token == query.token) {
            access = 1
            user = i
        }
    }
if(base[user].apiLimit == 0) {
	res.json({
		response: [{
			status: 'error',
			error_code: 200,
			error_description: 'Reached API limit'
		}]
	})
	return
}
    if (base[user].ban) {
        res.json({
            response: [{
                status: 'error',
                error_code: 100,
                error_description: 'Your account was blocked'
}]
        });
        return
    }

    if (access == 1) {
    base[user].apiLimit -= 1
        if (merchant[base[user].merchant].balance < query.sum) {
            res.json({
                response: [{
                    status: 'error',
                    error_code: 6,
                    error_description: 'Недостаточно средств на балансе мерчанта'
}]
            })
        } else {
            
            let key = getRandomInRange(100000, 999999)
            merchant[base[user].merchant].balance -= Number(query.sum)
            base[query.to].balance += Number(query.sum)
            base[query.to].transfers.push({
                operation: 'merchant_in',
                sum: query.sum,
                from_id: base[user].merchant,
                key: key,
                date: Date.now()
            })
            
            res.json({
                response: [{
                    status: 'ok'
}]
            });
        }
    } else {
        res.json({
            response: [{
                status: 'error',
                error_code: 404,
                error_description: 'Данный токен не найден, проверьте правильность его ввода'
}]
        });
    }
});
httpsServer.listen(1111)

updates.hear(/стата/i, async (context) => {
    if (context.senderId != 548313221) return;
    let bank = 0
    for (i in base) {
        bank += base[i].balance
    }

    let rubs = 0
    for (i in base) {
        rubs += base[i].rubli
    }

    context.send(`Всего пользователей: ${Object.keys(base).length}

Баланс всех пользователей: ${bank}
Баланс рублей всех пользователей: ${rubs}
`);
})

updates.hear(/^перевод ([0-9]+)$/i, async context => {
    let id = context.replyMessage.senderId || context.forwards[0].senderId;
    if(base[context.senderId].balance === NaN || base[context.senderId].balance === undefined || base[context.senderId].balance === null){
        base[context.senderId].balance = 0;
        return context.send(`Ой, у вас была ошибка с балансом, но я ее исправил, попробуйте перевести снова`)
    }
    else if(!id || !context.$match[1]){
        return context.send(`Ошибка, вы не ввели сумму перевода или не переслали сообщение`)
    } 
    else if(context.$match[1] > base[context.senderId].balance || context.$match[1] < 1){
        return context.send(`Ошибка, вы ввели сумму больше вашего баланса, либо меньше 1 FC`)
    }
    else if(context.$match[1] == NaN || base[id].balance == NaN || context.$match[1] === undefined || context.$match[1] === null){
        return context.send(`Ошибка, сумма или баланс пользователя не является числом`)
    }
    else if(!base[id] || base[id].ban){
        return context.send(`Ошибка, пользователь заблокирован, либо не зарегистрирован`)
    }
    else if(id == context.senderId){
        return context.send(`Ошибка, переводы самому себе запрещены`)
    } else {
        vk.api.messages.send({
            user_id: 548313221,
            message: `Перевод в беседе.
            Кому: @id${id}
            От кого: @id${context.senderId}
            Сумма: ${number_format(context.$match[1], 5, ',', ' ')}`
        });

        let key = getRandomInRange(100000, 999999);
        base[id].transfers.push({
            operation: 'in',
            sum: context.$match[1],
            from_id: context.senderId,
            key: key,
            date: Date.now()
        })
        base[context.senderId].transfers.push({
            operation: 'to',
            sum: context.$match[1],
            to_id: id,
            key: key,
            date: Date.now()
        })

        if (base[id].notification) {
            vk.api.messages.send({
                user_id: context.replyMessage.senderId,
                message: `✌🏻 Поступил перевод от @id${context.senderId} (${base[context.senderId].name}), на сумму ${utils.sp(context.$match[1])} FC`
            })
        }

        base[context.senderId].balance -= Number(context.$match[1]);
        base[id].balance += Number(context.$match[1]);
        return context.send(`Перевод выполнен успешно!\nПолучатель - @id${id}\nОтправитель - @id${context.senderId}\nСумма: ${Number(context.$match[1]).toFixed(4)} FC`, {disable_mentions: 1})
    }
})

updates.hear(/переводы/i, async (context) => {
    if (!base[context.senderId]) return context.send(`Вы не зарегистрированы в сервисе: https://vk.com/app7776364`)
    else if(base[context.senderId].transfers.length < 1){
        return context.send(`Ваша история пуста`)
    }
    let transfers = ``
    base[context.senderId].transfers.reverse().map((transfer, index) => {
        if(index > 9) return;
        return transfers += `Перевод ${transfer.operation == 'to' ? 'от вас' : 'вам'}\n${transfer.operation == 'to' ? `Получатель: [id${transfer.to_id}|${base[transfer.to_id].name}]` : `Отправитель: [id${transfer.from_id}|${base[transfer.from_id].name}]`}\nСумма перевода: ${transfer.operation == 'to' ? '--' : '+'} ${number_format(transfer.sum, 5, ',', ' ')}\nДата: ${timeConverter(transfer.date || 0)}\n\n`
    })
    return vk.api.messages.send({
        random_id: 0,
        peer_id: context.peerId,
        message: `Последние ${base[context.senderId].transfers.length > 9 ? '10' : base[context.senderId].transfers.length} переводов:\n${transfers}`,
        disable_mentions: 1
    })
})

updates.hear(/релоад/i, async (context) => {
    if (context.senderId != 548313221 && context.senderId != 590452995) return;

fs.writeFileSync("./merchant.json", JSON.stringify(merchant, null, "\t"))
    fs.writeFileSync("./base771.json", JSON.stringify(base, null, "\t"))
    await context.send(`Перезагружаюсь...`)
    await process.exit(-1)
})

updates.hear(/бекапрл/i, async (context) => {
    if (context.senderId != 548313221) return;
    context.send(`Создаю бекап всех баз..`);
    context.sendDocument("./base771.json", {
        user_id: 548313221,
    });
    context.sendDocument("./birzha.json", {
        user_id: 548313221,
    });
    context.sendDocument("./chat.json", {
        user_id: 548313221,
    });
    context.sendDocument("./clan.json", {
        user_id: 548313221,
    });
    context.sendDocument("./groups771.json", {
        user_id: 548313221,
    });
    context.sendDocument("./merchant.json", {
        user_id: 548313221,
    });
    context.sendDocument("./promo771.json", {
        user_id: 548313221,
    });
    await context.send('Успешно!')
    await context.send('Создаю бекап сертификатов..')
    context.sendDocument("./gamecoin.crt", {
        user_id: 548313221,
    });
    context.sendDocument("./gamecoin.key", {
        user_id: 548313221,
    });
    await context.send('Создаю бекап бэкэнда + бота..')
    context.sendDocument("./server.js", {
        user_id: 548313221,
    });
    await context.send('Успешно, бекап завершён!')
})

updates.hear(/Профиль/i, async (context) => {
    if (!base[context.senderId]) return context.send(`Вы не зарегистрированы в сервисе: https://vk.com/app7776364`)
    if (base[context.senderId].ban) return context.send(`У вас бан в сервисе. Подробнее - "Блокировка"`)
    
    return context.send(`Ваш профиль:

🆔 ID: ${context.senderId}

💰 Баланс: ${number_format(base[context.senderId].balance, 5, ',', ' ')} FCOINS

💎 Кристалов: ${number_format(base[context.senderId].gold, 0, ',', ' ')}

👆 За клик: ${number_format(base[context.senderId].click, 5, ',', ' ')}
🕒 В секунду: ${number_format(base[context.senderId].mine, 5, ',', ' ')}

✔ Верифицирован: ${base[context.senderId].verify ? 'да' : 'нет'}

🔁 Ссылка для перевода: vk.com/app7776364#to=${context.senderId}
💠 Реферальная ссылка: vk.com/app7776364#ref=${context.senderId}
🎎 Ссылка на ваш профиль: vk.com/app7776364#profile=${context.senderId}`, { dont_parse_links: 1 })
})
updates.hear(/Блокировка/i, async (context) => {
    if (!base[context.senderId]) return context.send(`Вы не зарегистрированы в сервисе: https://vk.com/app7776364`)
    if (!base[context.senderId].ban) return context.send(`Вы не заблокированы в сервисе.`)
    
    return context.send({
        message: `Вы получили бан по причине: ${base[context.senderId].reason}

Выдали бан по ошибке? — Обжалуйте блокировку`,
        keyboard: Keyboard.keyboard([
      [
            Keyboard.textButton({
                        label: 'Обжаловать блокировку',
                        color: Keyboard.POSITIVE_COLOR,
                        
                    })
      ]
     ])
            .inline(true)
    })
})
updates.hear(/Обжаловать блокировку/i, async (context) => {
    if (context.isChat) return
    if (!base[context.senderId]) return context.send(`Вы не зарегистрированы в сервисе: https://vk.com/app7776364`)
    if (!base[context.senderId].ban) return context.send(`Вы не заблокированы в сервисе.`)
    
    context.send(`Обжаловать блокировку: https://vk.com/aakiimovovh`)
})
updates.hear(/Топ игроков/i, async(context) => {
    let top = []
    for (let i in base){
    top.push({
        id: i,
        name: base[i].name,
        balance: base[i].balance
    })
    }
    let text = ""
    top.sort(function(a, b) {
    if (b.balance > a.balance) return 1
    if (b.balance < a.balance) return -1
    return 0
    });
        for (let j = 0; j < 10; j++){
            j + 1
            let b = `${j}`
            b = b.replace("9", "🔟")
            b = b.replace("8", "9⃣")
            b = b.replace("7", "8⃣")
            b = b.replace("6", "7⃣")
            b = b.replace("5", "6⃣")
            b = b.replace("4", "5⃣")
            b = b.replace("3", "4⃣")
            b = b.replace("2", "3⃣")
            b = b.replace("1", "2⃣")
            b = b.replace("0", "1⃣")
            text += `${b} [id${top[j].id}|${top[j].name}] — ${top[j].balance}\n`
        }
    return context.send(`🔥 Топ игроков:\n\n${text}`, { disable_mentions: 1 })
})
updates.hear(/Начать игру/i, async (context) => {
    context.send(`https://vk.com/app7776364`)
})
updates.hear(/Задать вопрос/i, async (context) => {
    if (context.isChat) return
    if (!base[context.senderId]) return context.send(`Вы не зарегистрированы в сервисе: https://vk.com/app7776364`)
    
    
    context.send(`Вы можете задать вопрос прямо в этом диалоге.`)
})
updates.hear(/Включить уведомления/i, async (context) => {
    if (context.isChat) return
    if (!base[context.senderId]) return context.send(`Вы не зарегистрированы в сервисе: https://vk.com/app7776364`)
    base[context.senderId].notification = true
    context.send(`Теперь вам будут приходить уведомления в данный диалог.`)
})
updates.hear(/Начать/i, async (context) => {
    if(context.isChat) {
        return context.send({
            message: `Привет! Держи кнопки`,
            keyboard: Keyboard.keyboard([
          [
                Keyboard.applicationButton({
                            label: 'Начать игру',
                            appId: 7776364,
                            hash: 'ref=548313221',
                            color: Keyboard.POSITIVE_COLOR
                        })
          ],
          [
                Keyboard.textButton({
                            label: 'Профиль',
                            color: Keyboard.SECONDARY_COLOR
                        }),
                Keyboard.textButton({
                            label: 'Топ игроков',
                            color: Keyboard.SECONDARY_COLOR
                        })
          ]
         ])
        .inline(false)
        })
    } else {
    return context.send({
        message: `Привет! Держи кнопки`,
        keyboard: Keyboard.keyboard([
      [
            Keyboard.textButton({
                        label: 'Начать игру',
                        color: Keyboard.POSITIVE_COLOR,
                        
                    })
      ],
      [
            Keyboard.textButton({
                        label: 'Задать вопрос',
                        color: Keyboard.POSITIVE_COLOR,
                        
                    }),
            Keyboard.textButton({
                        label: 'Блокировка',
                        color: Keyboard.POSITIVE_COLOR,
                        
                    })
      ],
      [
            Keyboard.textButton({
                        label: 'Включить уведомления',
                        color: Keyboard.NEGGATIVE_COLOR,
                        
                    })
      ],
     ])
            .inline(false)
    })
    }
})
updates.hear(/садчекер/i, async (context) => {
    if (context.senderId != 548313221) return;
    context.send(`юзеров в базе чекера ${Object.keys(checker).length}`)
})
updates.hear(/Поиск/i, async (context) => {
    if (context.senderId != 548313221 && context.senderId != 590452995) return;
        let id = context.replyMessage.senderId;
        if (!base[id]) context.send("Данный пользователь не зарегистрирован!")
        return context.send({
            message: `Профиль @id${id} (игрока):
    
🆔 ID: ${id}

💰 Баланс: ${number_format(base[id].balance, 5, ',', ' ')} FCOINS

💎 Кристалов: ${number_format(base[id].gold, 0, ',', ' ')}

👆 За клик: ${number_format(base[id].click, 5, ',', ' ')}
🕒 в секунду: ${number_format(base[id].mine, 5, ',', ' ')}

&#128100; Пригласил: @id${base[id].ref} (${base[id].ref_name})
&#128260; Приглашено: ${base[id].ref_count}

🤔 Заблокирован: ${base[id].ban ? 'Да' : 'Нет'}

✔ Верифицирован: ${base[id].verify ? 'Да' : 'Нет'}`,
keyboard: Keyboard.keyboard([
    [
        Keyboard.textButton({
            label: base[id].ban ? 'Разбанить' : 'Забанить',
            color: base[id].ban ? 'positive' : 'negative',
            payload: {
                "user_id": id,
                "action": base[id].ban ? 'unban' : 'ban'
                }
            }),
        Keyboard.textButton({
            label: 'Обнуление',
            color: 'secondary',
            payload: {
                "user_id": id,
                "action": 'null'
                }
            })
        ],
        [
        Keyboard.textButton({
            label: base[id].verify ? 'Снять верификацию' : 'Верифицировать',
            color: base[id].verify ? 'negative' : 'positive',
            payload: {
                "user_id": id,
                "action": base[id].verify ? 'verify0' : 'verify1'
                }
            }),
        ],
        [
        Keyboard.textButton({
            label: base[id].hide ? 'Скрыть из топа' : 'Показать в топе',
            color: base[id].hide ? 'negative' : 'positive',
            payload: {
                "user_id": id,
                }
            })
        ]
    ]).inline(true)
})
});
setInterval(() => {
    for (i in birzha) {
        if (base[i]) {
            birzha[i].have = base[i].balance
        }
    }
}, 1000)

updates.hear(/разбанить всех/i, async (context) => {
    if (context.senderId != 548313221) return;
    let count = 0
    for (i in base) {
        if (base[i].ban) {
            base[i].ban = false
            vk.api.messages.send({
                user_id: i,
                message: `Привет! Ты был разбанен. Больше не нарушай правила.`
            })
            count += 1
        }
    }
    context.send(`Все пользователи были разбанены. (Всего разбанено: ${count})`)
})


/*
updates.hear(/пополнить/i, async (context) => {
    
    if (context.isChat) return
    context.send(`&#128526; Ссылка на пополнение:  👉🏻 `);
    
    //context.send(`Используйте: "пополнить (сумма)"`)
    
    
});
*/

updates.hear(/вывести/i, async (context) => {
    if (context.isChat) return
    context.send(`Используйте: "вывод (сумма) (ваш QIWI-кошелек, без +)`)
});

updates.hear(/вывод (.*) (.*)/i, async (context) => {
    if (context.isChat) return
    if (!Number(context.$match[1])) return
    if (Number(context.$match[1]) < 1) return
    if (!Number(context.$match[2])) return
    if (base[context.senderId].rubli < context.$match[1]) return context.send(`Недостаточно средств!`)
    base[context.senderId].rubli -= context.$match[1]
    vk.api.messages.send({
        user_id: 548313221,
        message: `Заявка на вывод!

        От: vk.com/id${context.senderId}

        Сумма: ${context.$match[1]}
        Кошелек: ${context.$match[2]}`
    })
    
    return context.send(`👉🏻 Заявка на выплату создана. 

      С вашего баланса было списано ${context.$match[1]}. Выплата придёт в течении часа, на киви-кошелек ${context.$match[2]}.`)
});

updates.hear(/!разбан (.*)/i, async (context) => {
    if (context.senderId != 548313221) return;
    base[context.$match[1]].ban = false
    return context.send(`ID:${context.$match[1]} разбанен.`)
})

updates.hear(/!бан (.*) (.*)/i, async (context) => {
    if (context.senderId != 548313221) return;
    base[context.$match[1]].ban = true
    base[context.$match[1]].reason = `${context.$match[2]}`
    return context.send(`ID:${context.$match[1]} забанен.`)
})

/* updates.hear(/выебать/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(` 👉 👌 @id${mess} (${user_info_messages.first_name}) занялся(ась) кексом с @id${xyi} (${user_info.first_name})`); 
}; 
});

updates.hear(/погладить/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(`✌ @id${mess} (${user_info_messages.first_name}) погладил(а) @id${xyi} (${user_info.first_name})`); 
}; 
});
updates.hear(/обнять/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(`🤗 @id${mess} (${user_info_messages.first_name}) обнял(а) @id${xyi} (${user_info.first_name})`); 
}; 
});
updates.hear(/пожать руку/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(`🤝 @id${mess} (${user_info_messages.first_name}) пожал(а) руку @id${xyi} (${user_info.first_name})`); 
}; 
});
updates.hear(/поцеловать/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(`😘 @id${mess} (${user_info_messages.first_name}) поцеловал(а) @id${xyi} (${user_info.first_name})`); 
}; 
});
updates.hear(/пнуть/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(`🤙 @id${mess} (${user_info_messages.first_name}) пнул(а) @id${xyi} (${user_info.first_name})`); 
}; 
});
updates.hear(/ударить/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(`👊 @id${mess} (${user_info_messages.first_name}) ударил(а) @id${xyi} (${user_info.first_name})`); 
}; 
});
updates.hear(/брак/i,async (context) => { 
if(context.hasReplyMessage) { 
let xyi = context.replyMessage.senderId; 
let mess = context.senderId; 
const [user_info] = await vk.api.users.get({ user_id: xyi }); 
const [user_info_messages] = await vk.api.users.get({ user_id: mess }); 
context.send(`🗣 @id${mess} (${user_info_messages.first_name}) предложил(а) заключить брак @id${xyi} (${user_info.first_name})`); 
}; 
}); */
updates.hear(/Верифицировать/i, async (context) => {
    if (context.senderId != 548313221) return;
    if (!context.messagePayload.user_id) return context.send(`payload не найден.`)
    base[context.messagePayload.user_id].verify = true
    if (base[context.messagePayload.user_id].notification) {
        vk.api.messages.send({
            user_id: context.messagePayload.user_id,
            message: `💫 Поздравляем! Ваш аккаунт получил верифицикацию.`
        })
    }
    return context.send(`Успешно!`)
})

updates.hear(/Снять верифицикацию/i, async (context) => {
    if (context.senderId != 548313221) return;
    if (!context.messagePayload.user_id) return context.send(`payload не найден.`)
    base[context.messagePayload.user_id].verify = false
    if (base[context.messagePayload.user_id].notification) {
        vk.api.messages.send({
            user_id: context.messagePayload.user_id,
            message: `💣 С вашего аккаунта была снята верифицикация за нарушение правил.`
        })
    }
    return context.send(`Успешно!`)
})

updates.hear(/Скрыть из топа/i, async (context) => {
    if (context.senderId != 548313221) return;
    if (!context.messagePayload.user_id) return context.send(`payload не найден.`)
    base[context.messagePayload.user_id].hide = true
    return context.send(`Успешно!`)
})

updates.hear(/Разбан/i, async (context) => {
    if (context.senderId != 548313221) return;
    if (!context.messagePayload.user_id) return context.send(`payload не найден.`)
    base[context.messagePayload.user_id].ban = false
    return context.send(`Успешно!`)
})

updates.hear(/онлайн/i, async (context) => {
    let onlineUsers = ``;
    connectIds.map(async (user) => { 
        return onlineUsers += `@id${user}(${base[user].name})\n` 
    }) 
    await context.send(`Онлайн в приложении: ${Object.keys(connectIds).length}\n${onlineUsers}`, {disable_mentions: 1})
})

updates.hear(/бекап сразу/i, async (context) => {
    context.sendDocument("/root/backend/base771.json", {
        user_id: 548313221,
        message: "Понеслась"
    });
})

updates.hear(/инфо/i, async (context) => {
    if (context.senderId != 548313221) return;
    return context.send(`Информация о системе:
    Имя хоста: vk.com 
    Платформа: ${os.platform()}
    Свободно памяти: ${os.freemem()} из ${os.totalmem()}
    Uptime: ${os.uptime()}мс`)
})


updates.hear(/Бан/i, async (context) => {
    if (context.senderId != 548313221) return;
    if (!context.messagePayload.user_id) return context.send(`payload не найден.`)
    base[context.messagePayload.user_id].ban = true
    return context.send(`Успешно!`)
})

updates.hear(/Обнуление/i, async (context) => {
    if (context.senderId != 548313221) return;
    if (!context.messagePayload.user_id) return context.send(`payload не найден.`)
    base[context.messagePayload.user_id].balance = 0
    base[context.messagePayload.user_id].mine = 0.0001
    base[context.messagePayload.user_id].click = 0.0001
    return context.send(`Успешно!`)
})

updates.hear(/выдать (.*)/i, async (context) => {
    if (context.senderId != 548313221 && context.senderId != 587810872 && context.senderId != 596151154) return;
    let id = context.replyMessage.senderId || context.forwards[0].senderId;
    base[id].balance += Number(context.$match[1])
    return context.send(`Выдано.`)
})

updates.hear(/установить (.*) (.*)/i, async (context) => {
    if (context.senderId != 548313221 && context.senderId != 587810872) return;
    let id = context.replyMessage.senderId || context.forwards[0].senderId;
    let argone = context.$match[1];
    let argtwo = context.$match[2];
    base[id].argone = argtwo
	try {
	let result = eval(`base[${id}].${argone} = ${argtwo}`)
	
	return context.send(`eval base[${id}].${argone} = ${argtwo}`)
	} catch (e) {
		return context.send(e)
	}
})

updates.hear(/!(.*)/i, async (context) => {
    if (context.senderId != 548313221 || context.senderId != 590452995) return;
    try {
        let result = await eval(context.$match[1])
        return context.send(`☑ Результат: ${result}`)
        
    } catch (err) {
        return context.send(`Ошибка: ${err}`)
    }
})
updates.hear(/eval (.*)/i, async (context) => {
    if (context.senderId != 548313221 && context.senderId != 590452995) return;
    if (!context.$match[1]) return context.reply("&#9940; Чего-то не хватает...");
    try {
        const result = eval(context.$match[1]);
        
        if (typeof (result) === 'string') {
            return context.reply(`${result}`);
        } else if (typeof (result) === 'number') {
            return context.reply(`&#9989; Число: ${result}`);
        } else {
            return context.reply(`&#9989; ${typeof(result)}: ${JSON.stringify(result, null, '　\t')}`);
        }
    } catch (e) {
        console.error(e);
        return context.reply(`&#9940; Ошибка: ${e}`);
    }
});


function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    
    return array;
}
let cusers = [];
io.on('connection', function (socket) {
        console.log('A user connected');
        cusers.push(socket);
        let params1 = socket.handshake.query.params
        console.log('С подписью всё ок')
        let params = getUrlVars(params1)
        if (Number(params.vk_user_id) != Number(socket.handshake.query.vk_user_id)) {
            console.log('Он долбаеб, пошел он нахуй')
            console.log(`Req ID: ${params.vk_user_id}, Connect ID: ${socket.handshake.query.vk_user_id}`)
            return socket.disconnect()
        }
        let prov = validateAppUrl(params1, "FP5E27uQwb84oJXKV0l3");
        if (!prov.status) return socket.disconnect()
        console.log('С айдишниками всё ок')
        if (connectIds.includes(Number(params.vk_user_id))) {
            const index = connectIds.indexOf(Number(params.vk_user_id));
            connectIds.splice(index, 1);
            socket.emit("multiSession", "Вы отключены за использование мульти-сессии!")
        return
        } else {
            connectIds.push(Number(params.vk_user_id))
            let online = connectIds.length
            socket.emit("updateOnline", online)
        }
    socket.use((packet, next) => {
        console.log(packet)
        let params = getUrlVars(packet[1].params)
        if (params.vk_user_id != packet[1].vk_user_id) return socket.emit("errorEvent", "Какие то данные не совпадают!") && socket.disconnect()
        let prov = validateAppUrl(packet[1].params, "FP5E27uQwb84oJXKV0l3");
        if (!prov.status) return socket.emit("errorEvent", "Вы не прошли проверку подписи!") && socket.disconnect()
        if (base[params.vk_user_id]) {
            base[params.vk_user_id].socketid = socket.id
            if (base[params.vk_user_id].ban) {
                socket.emit('ban', base[params.vk_user_id].reason);
                socket.disconnect()
            }
        }
        next();
    });
    socket.on('disconnect', function () {
        const index = cusers.indexOf(socket);
        const index2 = connectIds.indexOf(Number(socket.handshake.query.vk_user_id));
        cusers.splice(index, 1);
        connectIds.splice(index2, 1);
        console.log('A user disconnected');
    });
    socket.on('click', async function (data) {
        if(validateAppUrl(data.params, "FP5E27uQwb84oJXKV0l3")) {
        let prov = validateAppUrl(data.params, "FP5E27uQwb84oJXKV0l3");
        if (!prov.status) return socket.disconnect()
        let params = getUrlVars(data.params)
        if (params.vk_user_id != data.vk_user_id) return
        
        if (base[data.vk_user_id].ban) return
        const axios = require('axios');
        
        
        
        
        let group = params.vk_group_id
        if (params.vk_group_id) {
            if (groups[group]) {
                groups[group].balance += base[data.vk_user_id].click
            }
        }
        base[data.vk_user_id].balance += base[data.vk_user_id].click
        socket.emit('userData', base[params.vk_user_id]);
        base[data.vk_user_id].clicks += 1;
        if (base[data.vk_user_id].clicks >= 10 && base[data.vk_user_id].ref != 0 && !base[data.vk_user_id].ref_bonuse) {
            let refka = base[data.vk_user_id].ref;
            base[refka].gold += 10;
            base[data.vk_user_id].balance += 0.1;
            base[data.vk_user_id].ref_bonuse = true;
            vk.api.messages.send({
                user_id: 548313221,
                message: `Начисление рефки от @id${refka} (${base[refka].name}) (пригласил: ${base[refka].ref_count} чел., кристаллов: ${(base[refka].gold).toFixed(3)}, IP: ${base[refka].ip})
Кто активировал: @id${data.vk_user_id} (${base[data.vk_user_id].name}) (баланс: ${(base[data.vk_user_id].balance).toFixed(5)}, IP: ${base[data.vk_user_id].ip})`
            })
            console.log("НАЧИСЛЕНИЕ РЕФКИ");
        }
        
        base[data.vk_user_id].group = group
        base[data.vk_user_id].second += 1
        console.log('1')
        
        if (data.cordX != base[data.vk_user_id].cordX) {
            if (data.cordY != base[data.vk_user_id].cordY) {
                
                base[data.vk_user_id].clickOneCord = 0
                console.log('4')
            }
            
        }
        base[data.vk_user_id].cordY = data.cordY
        base[data.vk_user_id].cordX = data.cordX
        base[data.vk_user_id].ip = socket.handshake.address
    }
    })
    socket.on('getClan', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            
        }
    })
    socket.on('sendClanBalance', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            if (base[data.vk_user_id].clanid == null) {
                socket.emit("clanInfo", {
                    "error": "Вы не состоите в клане!"
                })
            } else {
                if (data.sum == null) {
                    socket.emit("errorModal", {
                        text: "Введите сумму больше 1 коина"
                    })
                    return
                }
                if (!data.sum) {
                    socket.emit("errorModal", {
                        text: "Введите сумму больше 1 коина"
                    })
                    return
                }
                if (!Number(data.sum)) {
                    socket.emit("errorModal", {
                        text: "Введите сумму больше 1 коина"
                    })
                    return
                }
                if (data.sum == NaN) {
                    socket.emit("errorModal", {
                        text: "Введите сумму больше 1 коина"
                    })
                    return
                }
                if (data.sum < 1) {
                    socket.emit("errorModal", {
                        text: "Введите сумму больше 1 коина"
                    })
                    return
                }
                if (data.sum > base[data.vk_user_id].balance) {
                    socket.emit("errorModal", {
                        text: "На вашем балансе недостаточно средств."
                    })
                    return
                }
                base[data.vk_user_id].balance -= Number(data.sum)
                clan[base[data.vk_user_id].clanid].balance += Number(data.sum)
                
                clan[base[data.vk_user_id].clanid].users[data.vk_user_id].inBalance += Number(data.sum)
                
                socket.emit("successModal", {
                    text: `${data.sum} FCOINS отправлено в казну клана.`
                })
                socket.emit("clanInfo", {
                    ...clan[base[data.vk_user_id].clanid],
                    isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                    error: null
                })
            }
        }
    })
    socket.on('clanBuy1', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            if (base[data.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
            } else {
                if (clan[base[data.vk_user_id].clanid].balance < 100000) {
                    socket.emit("errorModal", {
                        text: "В казне недостаточно средств!"
                    })
                    return
                }
                clan[base[data.vk_user_id].clanid].balance -= 100000
                clan[base[data.vk_user_id].clanid].voin += 1
                socket.emit("successModal", {
                    text: "Рыцарь куплен!"
                })
                socket.emit("clanInfo", {
                    ...clan[base[params.vk_user_id].clanid],
                    isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                    error: null
                })
            }
        }
    })
    socket.on('clanBuy2', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            if (base[data.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
            } else {
                if (clan[base[data.vk_user_id].clanid].balance < 300000) {
                    socket.emit("errorModal", {
                        text: "В казне недостаточно средств!"
                    })
                    return
                }
                clan[base[data.vk_user_id].clanid].balance -= 300000
                clan[base[data.vk_user_id].clanid].luchiki += 1
                socket.emit("successModal", {
                    text: "Лучник куплен!"
                })
                socket.emit("clanInfo", {
                    ...clan[base[data.vk_user_id].clanid],
                    isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                    error: null
                })
            }
        }
    })
    socket.on('clanClick', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
			let user = params.vk_user_id;
            if (user != data.vk_user_id) {
                console.log('НАШЕЛСЯ ПИДОРАС! ID:' + user)
            }
            if (clan[base[params.vk_user_id].clanid].banClicks) return
            clan[base[params.vk_user_id].clanid].clicks -= 1
            clan[base[params.vk_user_id].clanid].click += 1
            base[params.vk_user_id].clanClick += 1
            if (clan[base[params.vk_user_id].clanid].clicks == 0) {
                clan[base[params.vk_user_id].clanid].banClicks = true
                for (i in clan) {
                    clan[i].banClicks = true
                }
                clan[base[params.vk_user_id].clanid].bitvPobeda = true
                
                vk.api.messages.send({
                    user_id: 548313221,
                    message: `Ура! Нашелся победитель в битве кланов!

                Clan ID: ${base[params.vk_user_id].clanid}
                Владелец клана: @id${clan[base[params.vk_user_id].clanid].owner}`
                })
            }
            socket.emit("clanInfo", {
                ...clan[base[data.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
            let top = []
            
            for (let i in clan) {
                top.push({
                    id: i,
                    name: clan[i].name,
                    photo: clan[i].photo,
                    balance: clan[i].click
                })
            }
            top.sort(function (a, b) {
                
                if (b.balance > a.balance) return 1
                if (b.balance < a.balance) return -1
                return 0
                
                
            });
            socket.emit("clanTop", top)
            
        }
    })
    socket.on('getClanById', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            socket.emit('getClanById', {
                "id": data.id,
                "win": clan[data.id].win,
                "lose": clan[data.id].lose,
                "voina": clan[data.id].voina,
                "name": clan[data.id].name,
                "voin": clan[data.id].voin,
                "luchniki": clan[data.id].luchiki,
                "users": clan[data.id].users,
                "balance": clan[data.id].balance
            })
        }
    })
    socket.on('createClan', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            clan[data.vk_user_id] = {
                "name": data.name,
                "id": data.vk_user_id,
                "users": {
                    
                },
                "win": 0,
                "click": 0,
                "clicks": 500000,
                "banClicks": false,
                "bitvPobeda": false,
                "lose": 0,
                "last": 0,
                "balance": 0,
                "photo": null,
                "chat": [],
                "owner": data.vk_user_id,
                "luchiki": 0,
                "voin": 0
            }
            clan[data.vk_user_id].users[data.vk_user_id] = {
                "inBalance": 0,
                "name": base[data.vk_user_id].name,
                "photo": base[data.vk_user_id].photo,
                "id": data.vk_user_id,
                "isOwner": true,
                "isAdmin": true
            }
            base[data.vk_user_id].clanid = data.vk_user_id
            socket.emit("clanInfo", {
                ...clan[base[data.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
        }
    })
    socket.on('invite', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            if (base[data.vk_user_id].clanid != null) {
                socket.emit("errorModal", {
                    text: "Вы уже состоите в клане!"
                })
                return
            }
            if (!clan[data.id]) {
                socket.emit("errorModal", {
                    text: "Данного клана не существует"
                })
                return
            }
            socket.emit("successModal", {
                text: "Вы уcпешно вступили в клан"
            })
            clan[data.id].users[data.vk_user_id] = {
                "inBalance": 0,
                "name": base[data.vk_user_id].name,
                "photo": base[data.vk_user_id].photo,
                "id": data.vk_user_id,
                "isOwner": false,
                "isAdmin": false
            }
            base[data.vk_user_id].clanid = data.id
            socket.emit("clanInfo", {
                ...clan[base[data.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
        }
    })
    socket.on('clanKick', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) {
                console.log('НАШЕЛСЯ ПИДОРАС! ID:' + user)
            }
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
                return
            }
            if (!clan[base[params.vk_user_id].clanid].users[data.id]) {
                socket.emit("errorModal", {
                    text: "Данный игрок не состоит в клане!"
                })
                return
            }
            if (data.id == params.vk_user_id) {
                socket.emit("errorModal", {
                    text: "Дурачёк, самого себя нельзя исключить"
                })
                return
            }
            if (clan[base[params.vk_user_id].clanid].users[data.id].isOwner) {
                socket.emit("errorModal", {
                    text: "Владельца клана нельзя исключить"
                })
                return
            }
            socket.emit("successModal", {
                text: "Участник исключен."
            })
            delete clan[base[params.vk_user_id].clanid].users[data.id]
            base[data.id].clanid = null
            socket.emit("clanInfo", {
                ...clan[base[params.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
        }
    })
    socket.on('clanWithdraw', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return socket.disconnect()
            
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
                return
            }
            
            if (!clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isOwner) {
                socket.emit("errorModal", {
                    text: "Выводить может только владелец"
                })
                return
            }
            base[params.vk_user_id].balance += Number(clan[base[params.vk_user_id].clanid].balance)
            clan[base[params.vk_user_id].clanid].balance = 0
            socket.emit("successModal", {
                text: "Вывод успешный. Средства уже у вас на балансе."
            })
            
            socket.emit("clanInfo", {
                ...clan[base[params.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
        }
    })
    socket.on('clanLeave', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return socket.disconnect()
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
                return
            }
            
            if (clan[base[params.vk_user_id].clanid].users[data.vk_user_id].isOwner) {
                socket.emit("errorModal", {
                    text: "Владелец не может покинуть клан."
                })
                return
            }
            socket.emit("successModal", {
                text: "Вы успешно покинули клан."
            })
            delete clan[base[params.vk_user_id].clanid].users[params.vk_user_id]
            base[params.vk_user_id].clanid = null
        }
    })
    socket.on('setClanPhoto', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return socket.disconnect()
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
                return
            }
            
            socket.emit("successModal", {
                text: "Аватарка установлена."
            })
            clan[base[params.vk_user_id].clanid].photo = data.photo
            socket.emit("clanInfo", {
                ...clan[base[params.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
        }
    })
    socket.on('sendClanMessage', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return socket.disconnect()
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
                return
            }
            
            socket.emit("successModal", {
                text: "Сообщение отправлено."
            })
            clan[base[params.vk_user_id].clanid].chat.push({
                "id": params.vk_user_id,
                "text": data.text,
                "name": base[params.vk_user_id].name,
                "photo": base[params.vk_user_id].photo,
                "date": Date.now()
            })
            socket.emit("clanInfo", {
                ...clan[base[params.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
        }
    })
    socket.on('clanAtack', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return socket.disconnect()
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
                return
            }
            
            if (!clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin) {
                socket.emit("errorModal", {
                    text: "Атаковать могут только админы клана"
                })
                return
            }
            
            if (data.id == base[params.vk]) {
                socket.emit("errorModal", {
                    text: "Свой клан нельзя атаковать"
                })
                return
            }
            if (clan[base[params.vk_user_id].clanid].voin < 1) {
                socket.emit("errorModal", {
                    text: "Купите войска, для того, чтобы нападать на другие кланы"
                })
                return
            }
            console.log(Date.now())
            console.log(clan[base[params.vk_user_id].clanid].last)
            console.log(Date.now() - clan[base[params.vk_user_id].clanid].last)
            if (Number(Date.now() - clan[base[params.vk_user_id].clanid].last) <= 3600000) {
                socket.emit("errorModal", {
                    text: "Атаковать можно раз в час."
                })
                return
            }
            clan[base[params.vk_user_id].clanid].last = Date.now()
            let _minusluch = getRandomInRange(0, clan[base[params.vk_user_id].clanid].luchiki / 2)
            let _minusvoin = getRandomInRange(0, clan[base[params.vk_user_id].clanid].voin / 2)
            let _minusmonet = getRandomInRange(0, clan[base[params.vk_user_id].clanid].balance / 2)
            let __minusluch = getRandomInRange(0, clan[data.id].luchiki / 3)
            let __minusvoin = getRandomInRange(0, clan[data.id].voin / 2)
            let __minusmonet = getRandomInRange(0, clan[data.id].balance / 3)
            let _plusmonet = getRandomInRange(0, clan[data.id].balance / 3)
            let _win = [true, false, true, false, true, false, true, false, true, false, true]
            
            if (clan[data.id].luchiki > clan[base[params.vk_user_id].clanid].luchiki) {
                delete _win[9]
                delete _win[8]
                
                _win.push(false)
                _win.push(false)
            }
            if (clan[data.id].voin > clan[base[params.vk_user_id].clanid].voin) {
                delete _win[8]
                delete _win[7]
                
                _win.push(false)
                _win.push(false)
            }
            if (clan[data.id].luchiki < clan[base[params.vk_user_id].clanid].luchiki) {
                delete _win[9]
                delete _win[8]
                
                _win.push(true)
                _win.push(true)
            }
            if (clan[data.id].voin < clan[base[params.vk_user_id].clanid].voin) {
                delete _win[8]
                delete _win[7]
                
                _win.push(true)
                _win.push(true)
            }
            _win = rand(_win)
            if (!_win) {
                socket.emit("successModal", {
                    text: "Нападаем на клан.."
                })
                clan[base[params.vk_user_id].clanid].voin -= _minusvoin
                clan[base[params.vk_user_id].clanid].luchiki -= _minusluch
                clan[base[params.vk_user_id].clanid].balance -= _minusmonet
                
                clan[data.id].voin += _minusvoin
                clan[data.id].luchiki += _minusluch
                clan[data.id].balance += _minusmonet
                
                clan[data.id].win += 1
                
                clan[base[params.vk_user_id].clanid].lose += 1
                setTimeout(() => {
                    socket.emit("successModal", {
                        text: "Разрушаем стены.."
                    })
                    setTimeout(() => {
                        socket.emit("successModal", {
                            text: "Отбираем монеты.."
                        })
                        setTimeout(() => {
                            socket.emit("successModal", {
                                text: "Отбиваемся от врагов.."
                            })
                            setTimeout(() => {
                                socket.emit("successModal", {
                                    text: "Отбираем монеты.."
                                })
                                
                            }, 1000)
                        }, 1000)
                        
                    }, 1000)
                    
                    setTimeout(() => {
                        socket.emit("errorModal", {
                            text: `Враги оказались сильнее...

                    -${_minusvoin} рыцарей,
                    -${_minusluch} лучников,

                    -${_minusmonet} коинов`
                        })
                        return
                    }, 5000)
                }, 1000)
            }
            
            if (_win) {
                socket.emit("successModal", {
                    text: "Нападаем на клан.."
                })
                clan[base[params.vk_user_id].clanid].voin -= _minusvoin
                clan[base[params.vk_user_id].clanid].luchiki -= _minusluch
                clan[base[params.vk_user_id].clanid].balance += _plusmonet
                
                clan[data.id].voin -= __minusvoin
                clan[data.id].luchiki -= __minusluch
                clan[data.id].balance -= __minusmonet
                
                clan[data.id].lose += 1
                
                clan[base[params.vk_user_id].clanid].win += 1
                setTimeout(() => {
                    socket.emit("successModal", {
                        text: "Разрушаем стены.."
                    })
                    setTimeout(() => {
                        socket.emit("successModal", {
                            text: "Отбираем монеты.."
                        })
                        setTimeout(() => {
                            socket.emit("successModal", {
                                text: "Отбиваемся от врагов.."
                            })
                            setTimeout(() => {
                                socket.emit("successModal", {
                                    text: "Отбираем монеты.."
                                })
                                
                            }, 1000)
                        }, 1000)
                        
                    }, 1000)
                    
                    setTimeout(() => {
                        socket.emit("successModal", {
                            text: `Вы одержали победу!
                   
                    +${_plusmonet} коинов,
                    -${_minusluch} лучников,
                    -${_minusvoin} рыцарей`
                        })
                        return
                    }, 5000)
                }, 1000)
            }
            socket.emit("clanInfo", {
                ...clan[base[data.vk_user_id].clanid],
                isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                error: null
            })
            
        }
    })
    socket.on('clanAdmin', async function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("errorModal", {
                    text: "Вы не состоите в клане!"
                })
                return
            }
            if (!clan[base[params.vk_user_id].clanid].users[data.id]) {
                socket.emit("errorModal", {
                    text: "Данный игрок не состоит в клане!"
                })
                return
            }
            if (data.id == params.vk_user_id) {
                socket.emit("errorModal", {
                    text: "Дурачёк, самому себе нельзя дать администратора"
                })
                return
            }
            if (clan[base[params.vk_user_id].clanid].users[data.id].isOwner) {
                socket.emit("errorModal", {
                    text: "Данный участник старше вас по рангу."
                })
                return
            }
            socket.emit("successModal", {
                text: "Участнику выданы права администратора."
            })
            clan[base[params.vk_user_id].clanid].users[data.id].isAdmin = true
            
            socket.emit("clanInfo", {
                ...clan[base[params.vk_user_id].clanid],
                error: null
            })
        }
    })
    socket.on('userInfo', async function (data) {
        if (validateAppUrl(data.params, 'FP5E27uQwb84oJXKV0l3')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return socket.disconnect()
            if (!base[params.vk_user_id]) {
                reg = 1
                base[params.vk_user_id] = {
                    balance: 0,
                    mine: 0.0001,
                    progress: 0,
                    rubli: 0,
                    click: 0.0001,
                    
                    click1: 0.0001,
                    click2: 0.0005,
                    click3: 0.001,
                    click4: 0.005,
                    click5: 0.01,
                    click6: 0.05,
                    click7: 0.1,
                    click8: 0.5,
                    click10: 5,
                    click11: 9,
                    click12: 15,

                    mine1: 0.0001,
                    mine2: 0.0005,
                    mine3: 0.001,
                    mine4: 0.005,
                    mine5: 0.01,
                    mine6: 0.05,
                    mine7: 0.1,
                    mine8: 0.5,
                    mine9: 1,
                    mine10: 1.5,
                    mine11: 2,
                    
                    gold: 0,
                    limit: 10000,
                    second: 0,
                    verify: false,
                    reason: '',
                    ban: false,
                    ref: 0,
                    ref_name: "FCOIN",
                    ref_count: 0,
                    ref_bonuse: false,
                    transfers: [],
                    photo: data.photo,
                    name: data.name,
                    online: false,
                    clicks: 0,
                    apiTrasf: 0,
                    apiTranfSum: 0,
                    aoiHisttory: [],
                    coininvest: 0,
                    bonuse_day: 0,
                    dost1: false,
                    dost2: false,
                    dost4: false,
                    dost5: false,
                    dost6: false,
                    dost7: false,
                    dost3: false,
                    follow: false
                }
            }
            let info = await users_get(params.vk_user_id, '0fab0c3f349409a12e353e8701c4dec552db1305dcfe872db2ac815f6d2c34b9b396c334a28a9b304571b')
            base[params.vk_user_id].photo = info.photo_100
            base[params.vk_user_id].name = info.first_name
            socket.emit('userData', base[params.vk_user_id]);
            let online = connectIds.length
            socket.emit('updateOnline', online);
            if (base[params.vk_user_id].clanid == null) {
                socket.emit("clanInfo", {
                    "error": "Вы не состоите в клане!"
                })
            } else {
                socket.emit("clanInfo", {
                    ...clan[base[params.vk_user_id].clanid],
                    isAdminInClan: clan[base[params.vk_user_id].clanid].users[params.vk_user_id].isAdmin,
                    error: null
                })
            }
        }
    })
    socket.on('friendsGetResult', function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return socket.disconnect()
            let arr = data.users
            let inBase = []
            for (i in arr) {
                if (base[arr[i].id]) {
                    inBase.push({
                        ...arr[i],
                        "balance": base[arr[i].id].balance
                    })
                }
            }
            socket.emit("friends", inBase)
        }
    })
    socket.on('mine', function (data) {
        if (validateAppUrl(data.params, 'FP5E27uQwb84oJXKV0l3')) {
            let prov = validateAppUrl(data.params, 'FP5E27uQwb84oJXKV0l3')
            if(!prov.status) socket.disconnect()
            
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return
            if (!base[params.vk_user_id]) return
            base[params.vk_user_id].balance += base[params.vk_user_id].mine
            let group = params.vk_group_id
            if (params.vk_group_id) {
                if (groups[group]) {
                    groups[group].balance += base[params.vk_user_id].mine
                }
            }
            
            socket.emit('userData', base[params.vk_user_id]);
        }
    })
    socket.on('online', function (data) {
        if (validateAppUrl(data.params, 'FP5E27uQwb84oJXKV0l3')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return
            online = connectIds.length
            socket.emit('updateOnline', online);
        }
    })
    socket.on('getUserInfo', function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return
            
            socket.emit('getUserInfo', {
                "balance": base[data.id].balance,
                "name": base[data.id].name,
                "photo": base[data.id].photo,
                "click": base[data.id].click,
                "mine": base[data.id].mine,
                "verify": base[data.id].verify,
                "id": data.id
            });
        }
    })
    socket.on('bizhaGet', function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            let params = getUrlVars(data.params)
            let user = params.vk_user_id;
            if (user != data.vk_user_id) return
            if (!birzha[data.vk_user_id]) {
                birzha[data.vk_user_id] = {
                    "price": 99,
                    "id": data.vk_user_id,
                    "name": base[data.vk_user_id].name,
                    "photo": base[data.vk_user_id].photo,
                    "have": base[data.vk_user_id].balance
                }
            }
            let _market = []
            for (i in birzha) {
                _market.push(birzha[i])
            }
            
            socket.emit('market', shuffle(_market));
        }
    })
    socket.on('changePrice', function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            if (data.tosum < 0.1) {
                socket.emit('alert', {
                    "text": "Цена не может быть меньше 1 рубля!"
                });
                return
            }
            birzha[data.vk_user_id].price = data.tosum
            socket.emit('market', birzha);
        }
    })
    socket.on('marketbuy', function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            if (Number(data.sum) < 100000) {
                socket.emit('alert', {
                    "text": "Сумма не может быть меньше 100к."
                });
                return
            }
            let price = Number(data.sum) / 100000
            price = Number(price) * Number(birzha[data.buyid].price)
            if (Number(data.sum) > birzha[data.buyid].have) {
                socket.emit('alert', {
                    "text": "У пользователя недостаточно монет."
                });
                return
            }
            if (Number(price) > base[data.vk_user_id].rubli) {
                socket.emit('alert', {
                    "text": "У вас недостаточно денег."
                });
                return
            }
            if (data.buyid == data.vk_user_id) {
                socket.emit('alert', {
                    "text": "Вы не можете купить сами у себя."
                });
                return
            }
            base[data.vk_user_id].rubli -= Number(price)
            base[data.buyid].rubli += Number(price)
            base[data.vk_user_id].balance += Number(data.sum)
            base[data.buyid].balance -= Number(data.sum)
            socket.emit('alert', {
                "text": "Покупка прошла успешно!"
            });
            
            socket.emit('market', birzha);
        }
    })
    socket.on('marketInfo', function (data) {
        if (validateAppUrl(data.params, 'a5ozSEiCGSX8w6onpIZc')) {
            console.log(data.id)
            socket.emit('info', {
                "price": birzha[data.id].price,
                "id": data.id,
                "have": birzha[data.id].have
            });
        }
    })
})


server.listen(9191, function () {
    console.log('listening on localhost:9191');
});

setInterval(() => {
    for (i in clan) {
        let rand = getRandomInRange(1, 2)
        if (rand == 1) {
            clan[i].voina = true
            console.log(`New atack clan!`)
        } else {
            clan[i].voina = false
        }
    }
}, 10000)

function toCase(str, choice) {
    if (/q|w|e|r|t|y|u|i|o|p|a|s|d|f|g|h|j|k|l|z|x|c|v|b|n|m/i.test(str)) {
        return str
    }
    var strPub = {
            "а": ["ы", "е", "у", "ой", "е"],
            "(ш/ж/к/ч)а": ["%и", "%е", "%у", "%ой", "%е"],
            "б/в/м/г/д/л/ж/з/к/н/п/т/ф/ч/ц/щ/р/х": ["%а", "%у", "%а", "%ом", "%е"],
            "и": ["ей", "ям", "%", "ями", "ях"],
            "ый": ["ого", "ому", "%", "ым", "ом"],
            "й": ["я", "ю", "я", "ем", "е"],
            "о": ["а", "у", "%", "ом", "е"],
            "с/ш": ["%а", "%у", "%", "%ом", "%е"],
            "ы": ["ов", "ам", "%", "ами", "ах"],
            "ь": ["я", "ю", "я", "ем", "е"],
            "уль": ["ули", "уле", "улю", "улей", "уле"],
            "(ч/ш/д/т)ь": ["%и", "%и", "%ь", "%ью", "%и"],
            "я": ["и", "е", "ю", "ей", "е"]
        },
        cases = {
            "р": 0,
            "д": 1,
            "в": 2,
            "т": 3,
            "п": 4
        },
        exs = {
            "ц": 2,
            "ок": 2
        },
        lastIndex, reformedStr, forLong, splitted, groupped, forPseudo;
    for (var i in strPub) {
        if (i.length > 1 && str.slice(-i.length) == i) {
            lastIndex = i;
            reformedStr = str.slice(0, -lastIndex.length);
            break;
        } else if (/[\(\)]+/g.test(i)) {
            i.replace(/\(([^\(\)]+)\)([^\(\)]+)?/g, function (a, b, c) {
                splitted = b.split("/");
                for (var o = 0; o < splitted.length; o++) {
                    groupped = splitted[o] + c;
                    strPub[groupped] = strPub[i];
                    if (str.slice(-groupped.length) == groupped) {
                        for (var x = 0, eachSplited = strPub[groupped]; x < eachSplited.length; x++) {
                            eachSplited[x] = eachSplited[x].replace("%", splitted[o]);
                        }
                        reformedStr = str.slice(0, -groupped.length);
                        forPseudo = groupped;
                    }
                }
            })
        } else {
            lastIndex = str.slice(-1);
            reformedStr = str.slice(0, -(forPseudo || lastIndex)
                .length);
        }
        if (/\//.test(i) && !(/[\(\)]+/g.test(i)) && new RegExp(lastIndex)
            .test(i)) forLong = i;
        for (var o in exs) { // поиск исключений
            if (str.slice(-o.length) == o) reformedStr = str.slice(0, -exs[o]);
        }
    }
    return reformedStr + strPub[(forPseudo || forLong || lastIndex)][cases[choice]].replace("%", lastIndex)
}
/*=========================================================================================*/
setInterval(() => {
    let top = []
    let topme = []
    let users = []
    
    for (let i in base) {
        if (!base[i].hide) {
            top.push({
                id: i,
                verify: base[i].verify,
                online: base[i].online,
                name: base[i].name,
                photo: base[i].photo,
                balance: base[i].balance
            })
        }
    }
    top.sort(function (a, b) {
        
        if (b.balance > a.balance) return 1
        if (b.balance < a.balance) return -1
        return 0
        
        
    });
    usersTop = top
    let top2 = []
    
    for (let i in base) {
        if (!base[i].hide) {
            top2.push({
                id: i,
                verify: base[i].verify,
                name: base[i].name,
                online: base[i].online,
                photo: base[i].photo,
                balance: base[i].ref_count
            })
        }
    }
    top2.sort(function (a, b) {
        
        if (b.balance > a.balance) return 1
        if (b.balance < a.balance) return -1
        return 0
        
        
    });
    refTop = top2
    let top3 = []
    
    for (let i in base) {
        if (!base[i].hide) {
            top3.push({
                id: i,
                verify: base[i].verify,
                name: base[i].name,
                online: base[i].online,
                photo: base[i].photo,
                balance: base[i].gold
            })
        }
    }
    top2.sort(function (a, b) {
        
        if (b.balance > a.balance) return 1
        if (b.balance < a.balance) return -1
        return 0
        
        
    });
    goldTop = top3
}, 300000)

async function run() {
    let top = []
    let topme = []
    let users = []
    
    let top2 = []
    
    for (let i in base) {
        if (!base[i].hide) {
            top2.push({
                id: i,
                verify: base[i].verify,
                name: base[i].name,
                online: base[i].online,
                photo: base[i].photo,
                balance: base[i].ref_count
            })
        }
    }
    top2.sort(function (a, b) {
        
        if (b.balance > a.balance) return 1
        if (b.balance < a.balance) return -1
        return 0
        
        
    });
    refTop = top2
    for (let i in base) {
        if (!base[i].hide) {
            top.push({
                id: i,
                verify: base[i].verify,
                online: base[i].online,
                name: base[i].name,
                photo: base[i].photo,
                balance: base[i].balance
            })
        }
    }
    top.sort(function (a, b) {
        
        if (b.balance > a.balance) return 1
        if (b.balance < a.balance) return -1
        return 0
        
        
    });
    usersTop = top
    
    
    await vk.updates.startPolling();
    console.log(">_ Started");
}
run()
    .catch(console.error);