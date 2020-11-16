export class Cookie {
    
    constructor( private username: string) {}

    public setUsername(username: string) {
        document.cookie = username;
    }

    public getUsernameFromCookie() {
        return this.username;
    }

    public isUserCurrentUser(username: string) {
        return username == document.cookie;
    }
}