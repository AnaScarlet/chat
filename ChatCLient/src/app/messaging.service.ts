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
  }

  sendUserRejoin(username: string) {
    this.socket.emit("user-rejoin", username);
  }

  getMessage() {
    return this.socket.fromEvent("message");
}

  joinUser() {
    return this.socket.fromEvent("user-join");
  }

  userRejoin() {
    return this.socket.fromEvent("user-rejoin");
  }

  leaveUser() {
    return this.socket.fromEvent("user-leave");
  }

}
