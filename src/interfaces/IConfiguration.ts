import IMySQLConfig from "./IMySQLConfig";

export default interface IConfiguration {
	port: number,
	link_length: number,
	max_links_per_hour: number,
	max_link_length: number,
	db_provider: string,
	mysql: IMySQLConfig
}