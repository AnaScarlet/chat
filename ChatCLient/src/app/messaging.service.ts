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


  sendMessage(msg: string, username: string){
    this.socket.emit("message", msg, username);
  }

  sendUserJoin(username: string) {
    this.socket.emit("join", username);
  }

  respondToUserPoll(isMe:boolean, username: string) {
    this.socket.emit("user poll", isMe, username);
  }

  getMessage() {
    return this.socket.fromEvent("message");
}

  joinUser() {
    return this.socket.fromEvent("join");
  }

  userRejoin() {
    return this.socket.fromEvent("rejoin");
  }

  leaveUser() {
    return this.socket.fromEvent("leave");
  }

  userPoll() {
    return this.socket.fromEvent("user poll");
  }

  usersUpdate() {
    return this.socket.fromEvent("users update");
  }

}
