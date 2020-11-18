export class Cookie {

    constructor() {
    }

    public setUsername(username: string) {
        document.cookie = username;
    }

    public getUsernameFromCookie() {
        return document.cookie;
    }

    public isUserCurrentUser(username: string) {
        return username == document.cookie;
    }
}