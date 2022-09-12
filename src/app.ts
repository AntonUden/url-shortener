import * as FS from "fs";
import DatabaseProvider from "./db/DatabaseProvider";
import FileDatabaseProvider from "./db/FileDatabaseProvider";
import MySQLDatabaseProvider from "./db/MySQLDatabaseProvider";
import IConfiguration from "./interfaces/IConfiguration";
import Server from "./server/Server";

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
		max_links_per_hour: 100,
		max_link_length: 10000,
		db_provider: "file",
		mysql: {
			host: "127.0.0.1",
			database: "url_shortener",
			username: "root",
			password: "root",
			port: 3306
		}
	}
	FS.writeFileSync("./data/config.json", JSON.stringify(defaultConfig, null, 4), 'utf8');
}

const config: IConfiguration = JSON.parse(FS.readFileSync("./data/config.json", 'utf8'));

var dbProvider: DatabaseProvider = null;

switch (config.db_provider.toLocaleLowerCase()) {
	case "file":
		dbProvider = new FileDatabaseProvider(config.link_length);
		break;

	case "mysql":
		dbProvider = new MySQLDatabaseProvider(config.link_length, config.mysql);
		break;

	default:
		console.error("Invalid db provider: " + config.db_provider);
		process.exit(0);
}

console.log("Using db provider: " + config.db_provider);

new Server(config, dbProvider);