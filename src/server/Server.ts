import HTTP from "http";
import Express from "express";
import BodyParser from "body-parser";
import IConfiguration from "../interfaces/IConfiguration";
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit'
import DatabaseProvider from "../db/DatabaseProvider";

export default class Server {
	private _express: Express.Express;
	private _http: HTTP.Server;
	private _config: IConfiguration;

	private _createLinkRateLimit: RateLimitRequestHandler;

	private _dbProvider: DatabaseProvider;

	constructor(config: IConfiguration, dbProvider: DatabaseProvider) {
		this._config = config;
		this._dbProvider = dbProvider;

		this._createLinkRateLimit = rateLimit({
			windowMs: 60 * 60 * 1000,
			max: config.max_links_per_hour,
			standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
			legacyHeaders: false, // Disable the `X-RateLimit-*` headers
		})

		this._express = Express();
		this._express.set("port", this._config.port);

		this._http = new HTTP.Server(this._express);
		
		this._express.use('/', Express.static(__dirname + '/../../client'));
		this._express.use(BodyParser.text());

		this._express.all("/s/:id", async (req: Express.Request, res: Express.Response) => {
			let id: string = "" + req.params.id;
			if (!id.match(/^[0-9a-zA-Z]+$/)) {
				res.status(400).send("400: Invalid id");
				return;
			}

			try {
				let url: string | null = await this._dbProvider.getURL(id);

				console.log(id + " => " + url);

				if (url == null) {
					res.status(404).send("404: Link not found");
					return;
				}

				res.redirect(301, url)
			} catch (err) {
				res.status(500).send("Failed to fetch url");
				return;
			}
		});

		this._express.post("/api/create_link", this._createLinkRateLimit, async (req: Express.Request, res: Express.Response) => {
			let url: string = "" + req.body;
			if (!this.isURL(url)) {
				res.status(400).send("Bad request");
				return;
			}

			if (url.length > config.max_link_length) {
				res.status(400).send("Url too long");
				return;
			}

			let id = await this._dbProvider.createURL(url);

			if (id == null) {
				res.status(500).send("Failed to generate url");
				return;
			}

			console.log("Created url " + id + " pointing towards " + url);

			res.header("Content-Type", 'application/json');
			res.send(JSON.stringify({
				id: id
			}));
		});

		this._http.listen(this._config.port, () => {
			console.log("Listening on port: " + this._config.port);
		});
	}

	// https://stackoverflow.com/a/49185442
	private isURL(str: string): boolean {
		return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
	}
}