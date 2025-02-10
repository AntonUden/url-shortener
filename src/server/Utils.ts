export default class Utils {
	public static randomString(length: number): string {
		let chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz123456789';
		let result = '';
		for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	}
}