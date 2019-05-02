var wss = null;

module.exports.WSSOpen = function (socket) {
    wss = socket;
    wss.on("connection", function (ws, req) {
        ws.isAlive = true;
        ws.on("pong", heartbeat);
        ws.subscribes = [];
        ws.period = "0";
        ws.on("message", function (data) {
            let cli_data = JSON.parse(data);
            if (cli_data.type) {
                if (cli_data.type == "Subscribe") {
                    let new_subs = { channel: 0, symbol: "", period: "0" };
                    if (cli_data.chan) {
                        switch (cli_data.chan) {
                            default: new_subs.channel = 0;
                            case "aaa": new_subs.channel = 1; break;
                            case "bbb": new_subs.channel = 2; break;
                            case "ccc": new_subs.channel = 3; break;
                            case "ddd": new_subs.channel = 4; break;
                            case "eee": new_subs.channel = 5; break;
                        }
                    }
                    if (cli_data.period) {
                        new_subs.period = cli_data.period;
                    }
                    if (cli_data.symbol) {
                        new_subs.symbol = cli_data.symbol
                        if (new_subs.channel == 5) {
                            let already_subs = ws.subscribes.findIndex(k => k.channel == new_subs.channel && k.symbol == new_subs.symbol && k.period == new_subs.period);
                            if (already_subs > -1) {
                                ws.subscribes[already_subs] = new_subs;
                            } else {
                                ws.subscribes.push(new_subs);
                            }
                        } else {
                            let already_subs = ws.subscribes.findIndex(k => k.channel == new_subs.channel && k.symbol == new_subs.symbol);
                            if (already_subs > -1) {
                                ws.subscribes[already_subs] = new_subs;
                            } else {
                                ws.subscribes.push(new_subs);
                            }
                        }
                    }
                } else if (cli_data.type == "Unsubscribe") {
                    let channel = 0;
                    if (cli_data.chan) {
                        switch (cli_data.chan) {
                            default: channel = 0;
                            case "aaa": channel = 1; break;
                            case "bbb": channel = 2; break;
                            case "ccc": channel = 3; break;
                            case "ddd": channel = 4; break;
                            case "eee": channel = 5; break;
                        }
                    }
                    if (cli_data.symbol) {
                        let val = ws.subscribes.findIndex(k => (k.channel == channel) & (k.symbol == cli_data.symbol));
                        if (val > -1) {
                            ws.subscribes.splice(val, 1);
                        }
                    }
                } else if (cli_data.type == "Register") {
                    ws.clientid = new Buffer.from(cli_data.id, "base64").toString("ascii");
                    ws.uid = cli_data.uid;
                }
            }
        });
    });
}
module.exports.SendChannel = function (channel, parite, message) {
    if (wss) {
        if (wss.clients) {
            wss.clients.forEach(function (client) {
                if (client.subscribes) {
                    let filter = client.subscribes.filter(k => k.channel == channel && k.symbol == parite);
                    if (filter.length > 0) {
                        client.send(JSON.stringify(message));
                    }
                }
            });
        }
    }
}
module.exports.SendUser = function (clientid, message) {
    if (wss) {
        if (wss.clients) {
            wss.clients.forEach(function (client) {
                if (client.clientid === clientid) {
                    try {
                        client.send(JSON.stringify(message));
                    } catch{ }
                }
            });
        }
    }
}
module.exports.SendUserByUid = function (uid, message) {
    if (wss) {
        if (wss.clients) {
            wss.clients.forEach(function (client) {
                if (client.uid === uid) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    }
}
setInterval(function ping() {
    if (wss) {
        if (wss.clients) {
            wss.clients.forEach(function each(ws) {
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping(noop);
            });
        }
    }
}, 30000);
function noop() { }
function heartbeat() {
    this.isAlive = true;
}