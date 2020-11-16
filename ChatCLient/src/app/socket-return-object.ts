import { Message } from "./message";
import { User } from "./user";

export class SocketReturnObject {
    constructor(public messages: Message[], public errorMessage: string, public users: User[],
      public nameChanged: boolean, public colorChanged: boolean, public currentUserName:string, public newName: string) {}
}