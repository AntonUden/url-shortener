import IMySQLConfig from "../interfaces/IMySQLConfig";
import DBProvider from "./DatabaseProvider";
import MySQL, { Connection, FieldPacket, RowDataPacket, Pool } from "mysql2";
import Utils from "../server/Utils";

export default class MySQLDatabaseProvider extends DBProvider {
	private _pool: Pool;

	constructor(codeLength: number, mysql: IMySQLConfig) {
		super(codeLength);

		console.log("Creating connection pool " + mysql.username + "@" + mysql.host + ":" + mysql.port);
		this._pool = MySQL.createPool({
			"host": mysql.host,
			"port": mysql.port,
			"user": mysql.username,
			"password": mysql.password,
			"database": mysql.database,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0
		});

	}

	getURL(code: string): Promise<string> {
		return new Promise(async (resolve, reject) => {
			let url: string | null = null;
			this._pool.query("SELECT url FROM urls WHERE code = ?", [code]).on("result", (row: RowDataPacket) => {
				url = row.url;
			}).on("error", (err) => reject(err)).on("end", () => resolve(url));
		});
	}

	createURL(url: string): Promise<string> {
		return new Promise(async (resolve, reject) => {
			let code: string | null = null;
			try {
				code = await this.generateId();
			} catch (err) {
				reject(err);
				return;
			}

			this._pool.query("INSERT INTO urls (code, url) VALUES (?, ?)", [code, url]).on("error", (err) => {
				reject(err);
			}).on("end", () => {
				resolve(code);
			});
		});
	}

	private generateId(): Promise<string | null> {
		return new Promise(async (resolve, reject) => {
			for (let i = 0; i < 100; i++) {
				try {
					let generatedCode = Utils.randomString(this.codeLength);
					let existingUrl = await this.getURL(generatedCode);
					if (existingUrl == null) {
						resolve(generatedCode);
						return;
					}
				} catch (err) {
					reject(err);
				}
			}
			resolve(null);
		});
	}

}