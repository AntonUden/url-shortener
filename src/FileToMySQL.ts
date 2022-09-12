import * as FS from "fs";

let files: string[] = FS.readdirSync("./data/links/");
console.log(files);

files.forEach(key => {
	let url = FS.readFileSync("./data/links/" + key);

	console.log("INSERT INTO urls (code, url) VALUES(\"" + key + "\", \"" + url + "\");");
});