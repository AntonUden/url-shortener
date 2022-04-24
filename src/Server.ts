import HTTP from "http";
import Express from "express";
import BodyParser from "body-parser";
import IConfiguration from "./IConfiguration";
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import * as FS from "fs";

export default class Server {
	private _express: Express.Express;
	private _http: HTTP.Server;
	private _config: IConfiguration;

	private _createLinkRateLimit: RateLimitRequestHandler;

	constructor(config: IConfiguration) {
		this._config = config;

		this._createLinkRateLimit = rateLimit({
			windowMs: 60 * 60 * 1000,
			max: config.max_links_per_hour,
			standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
			legacyHeaders: false, // Disable the `X-RateLimit-*` headers
		})

		this._express = Express();
		this._express.set("port", config.port);

		this._http = new HTTP.Server(this._express);

		this._express.use('/', Express.static(__dirname + '/../client'));
		this._express.use(BodyParser.text());

		this._express.all("/s/:id", async (req: Express.Request, res: Express.Response) => {
			let id: string = "" + req.params.id;
			if (!id.match(/^[0-9a-zA-Z]+$/)) {
				res.status(400).send("400: Invalid id");
				return;
			}

			let file: string = "./data/links/" + id;

			console.log(file);

			if (!FS.existsSync(file)) {
				res.status(404).send("404: Link not found");
				return;
			}

			let url = FS.readFileSync(file, 'utf8');

			res.redirect(301, url)
		});

		this._express.post("/api/create_link", this._createLinkRateLimit, async (req: Express.Request, res: Express.Response) => {
			let url: string = "" + req.body;
			if (!this.isURL(url)) {
				res.status(400).send("Bad request");
				return;
			}

			let id = this.generateId();
			if (id == null) {
				res.status(500).send("Failed to generate url");
				return;
			}
			FS.writeFileSync("./data/links/" + id, url, 'utf8');

			console.log("Created url " + id + " pointing towards " + url);

			res.header("Content-Type", 'application/json');
			res.send(JSON.stringify({
				id: id
			}));
		});

		this._http.listen(config.port, function () {
			console.log("Listening on port: " + config.port);
		});
	}

	private generateId(): string {
		// Max 10k attempts
		for (let i = 0; i < 10000; i++) {
			let id = this.randomString(this._config.link_length);
			console.log("./data/links/" + id);
			if (FS.existsSync("./data/links/" + id)) {
				console.warn("Id already exists " + id);
				continue;
			}
			return id;
		}

		return null;
	}

	private randomString(length: number): string {
		let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let result = '';
		for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	}

	// https://stackoverflow.com/a/49185442
	private isURL(str: string): boolean {
		return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
	}
}