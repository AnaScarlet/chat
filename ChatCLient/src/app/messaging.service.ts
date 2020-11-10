import { Injectable } from '@angular/core';
import { Message } from "./message";
import { User } from "./user";
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { UrlWithStringQuery } from 'url';

@Injectable({
  providedIn: 'root'
})

export class MessagingService {

  constructor(private socket: Socket) { }


  sendMessage(msg: string){
    this.socket.emit("message", msg);
    console.log(`Message sent. \n\tMessage: ${msg}`);
  }

  getMessage() {
    return this.socket.fromEvent("message");
}

  joinUser() {
    return this.socket.fromEvent("user-join");
  }

  leaveUser() {
    return this.socket.fromEvent("user-leave");
  }

}
