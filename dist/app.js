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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FS = __importStar(require("fs"));
const Server_1 = __importDefault(require("./Server"));
require('console-stamp')(console, '[yyyy-mm-dd HH:MM:ss.l]');
if (!FS.existsSync("./data")) {
    FS.mkdirSync("./data");
}
if (!FS.existsSync("./data/links")) {
    FS.mkdirSync("./data/links");
}
if (!FS.existsSync("./data/config.json")) {
    console.log("Creating default configuration");
    let defaultConfig = {
        port: 80,
        link_length: 6,
        max_links_per_hour: 100
    };
    FS.writeFileSync("./data/config.json", JSON.stringify(defaultConfig, null, 4), 'utf8');
}
const config = JSON.parse(FS.readFileSync("./data/config.json", 'utf8'));
new Server_1.default(config);
//# sourceMappingURL=app.js.map