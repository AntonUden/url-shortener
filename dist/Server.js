"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const FS = __importStar(require("fs"));
class Server {
    constructor(config) {
        this._config = config;
        this._createLinkRateLimit = (0, express_rate_limit_1.default)({
            windowMs: 60 * 60 * 1000,
            max: config.max_links_per_hour,
            standardHeaders: true,
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        });
        this._express = (0, express_1.default)();
        this._express.set("port", config.port);
        this._http = new http_1.default.Server(this._express);
        this._express.use('/', express_1.default.static(__dirname + '/../client'));
        this._express.use(body_parser_1.default.text());
        this._express.all("/s/:id", (req, res) => __awaiter(this, void 0, void 0, function* () {
            let id = "" + req.params.id;
            if (!id.match(/^[0-9a-zA-Z]+$/)) {
                res.status(400).send("400: Invalid id");
                return;
            }
            let file = "./data/links/" + id;
            console.log(file);
            if (!FS.existsSync(file)) {
                res.status(404).send("404: Link not found");
                return;
            }
            let url = FS.readFileSync(file, 'utf8');
            res.redirect(301, url);
        }));
        this._express.post("/api/create_link", this._createLinkRateLimit, (req, res) => __awaiter(this, void 0, void 0, function* () {
            let url = "" + req.body;
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
        }));
        this._http.listen(config.port, function () {
            console.log("Listening on port: " + config.port);
        });
    }
    generateId() {
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
    randomString(length) {
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = length; i > 0; --i)
            result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    // https://stackoverflow.com/a/49185442
    isURL(str) {
        return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
    }
}
exports.default = Server;
//# sourceMappingURL=Server.js.map