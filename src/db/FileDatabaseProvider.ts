import * as FS from "fs";
import Utils from "../server/Utils";
import DBProvider from "./DatabaseProvider";

export default class FileDatabaseProvider extends DBProvider {
	constructor(codeLength: number) {
		super(codeLength);
	}

	getURL(code: string): Promise<string> {
		return new Promise((resolve, reject) => {
			try {
				let file = this.getPath(code);

				if (!FS.existsSync(file)) {
					resolve(null);
					return;
				}

				let url = FS.readFileSync(file, 'utf8')

				resolve(url);
			} catch (err) {
				reject(err);
			}
		});
	}

	createURL(url: string): Promise<string | null> {
		return new Promise((resolve, reject) => {
			let id = this.generateId();

			if (id == null) {
				resolve(null);
				return;
			}

			try {
				FS.writeFileSync("./data/links/" + id, url, 'utf8');
				resolve(id);
			} catch (err) {
				reject(err);
			}
		});
	}

	private generateId(): string {
		// Max 10k attempts
		for (let i = 0; i < 10000; i++) {
			let id = Utils.randomString(this.codeLength);
			if (FS.existsSync("./data/links/" + id)) {
				console.warn("Id already exists " + id);
				continue;
			}
			return id;
		}

		return null;
	}

	private getPath(code: string): string {
		return "./data/links/" + code;
	}
}