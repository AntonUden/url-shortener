import * as FS from "fs";
import IConfiguration from "./IConfiguration";
import Server from "./Server";

require('console-stamp')(console, '[yyyy-mm-dd HH:MM:ss.l]');


if (!FS.existsSync("./data")) {
	FS.mkdirSync("./data");
}

if (!FS.existsSync("./data/links")) {
	FS.mkdirSync("./data/links");
}

if (!FS.existsSync("./data/config.json")) {
	console.log("Creating default configuration");
	let defaultConfig: IConfiguration = {
		port: 80,
		link_length: 6,
		max_links_per_hour: 100
	}
	FS.writeFileSync("./data/config.json", JSON.stringify(defaultConfig, null, 4), 'utf8');
}

const config: IConfiguration = JSON.parse(FS.readFileSync("./data/config.json", 'utf8'));

new Server(config);