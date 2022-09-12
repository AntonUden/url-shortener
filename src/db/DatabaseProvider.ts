export default abstract class DatabaseProvider {
	protected codeLength: number;

	constructor(codeLength: number) {
		this.codeLength = codeLength;
	}

	abstract getURL(code: string): Promise<string | null>;

	abstract createURL(url: string): Promise<string | null>;
}