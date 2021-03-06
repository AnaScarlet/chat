import { Component, AfterViewInit, HostListener } from '@angular/core';
import { Message } from "./message";
import { User } from "./user";
import { MessagingService } from "./messaging.service"
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { Scroll } from '@angular/router';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'DollarsChatClient';

  public onlineUsers: User[];
  public messages: Message[];

  constructor (private messagingService: MessagingService, private breakpointObserver: BreakpointObserver) {
    
  }

  messageFormControl = new FormControl('', [
  ]);

  matcher = new MyErrorStateMatcher();

  ngOnInit() {
    this.retrieveMessages();
    this.retrieveOnlineUsers();
  }

  ngAfterViewInit(){
    this.breakpointObserver.observe([
      Breakpoints.Medium
    ]).subscribe(result => {
      if (result.matches) {
        this.activateMediumLayout();
      }
    });
    this.breakpointObserver.observe([
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.activateSmallLayout();
      }
    });
    this.breakpointObserver.observe([
      Breakpoints.XSmall
    ]).subscribe(result => {
      if (result.matches) {
        this.activateXSmallLayout();
      }
    });
  
  }

  public retrieveOnlineUsers() {
    this.messagingService.joinUser()
        .subscribe((socketObject: SocketReturnObject) => {
          console.log("Got user join event.");

          // If cookie is set, send it to server
          if (this.getUsernameFromCookie()) {
            console.log("Cookie is already set.");
            this.messagingService.sendUserJoin(this.getUsernameFromCookie());
          }
          else {
            console.log("Cookie is not set.");
            this.setCookie(socketObject.currentUserName);
          }
          this.onlineUsers = socketObject.users;
          this.messages = socketObject.messages;
          this.renderedMessages = this.messages.slice(0, 8);
          this.renderStartIndex = 0;
        });

    this.messagingService.leaveUser()
        .subscribe((users: User[]) => {
          console.log("Leave user observabe: ");
          console.log(users);
          this.onlineUsers = users;
        });

    this.messagingService.userRejoin()
        .subscribe((users: User[]) => {
          console.log("User rejoin confirmation. Online users:");
          console.log(users);
          this.onlineUsers = users;
        });
    
    this.messagingService.userPoll()
        .subscribe((usernameToCheck: string) => {
          console.log("Got user poll.");
          if (this.getUsernameFromCookie() === usernameToCheck) {
            console.log("It was me.");
            this.messagingService.respondToUserPoll(true, usernameToCheck);
          }
          else {
            console.log("Not me.");
            this.messagingService.respondToUserPoll(false, usernameToCheck);
          }
        });
    
    this.messagingService.usersUpdate()
        .subscribe((users: User[]) => {
          console.log("Updated Online users:");
          console.log(users);
          this.onlineUsers = users;
        });
  }

  public retrieveMessages() {
    this.messagingService.getMessage()
        .subscribe((socketObject: SocketReturnObject) => {
          this.messages = socketObject.messages;
          this.renderedMessages = this.messages.slice(0, 8);
          this.renderStartIndex = 0;
          if (socketObject.nameChanged && socketObject.currentUserName === this.getUsernameFromCookie()) {
            // User changed their name.
            console.log("User changed their name.");
            this.setCookie(socketObject.newName);
          }
          this.onlineUsers = socketObject.users;
          console.log("Returned message object:");
          console.log(socketObject);
          if (socketObject.errorMessage && socketObject.currentUserName === this.getUsernameFromCookie()) {
            window.alert(socketObject.errorMessage);
          }
        });
  }

  public sendMessage() {
    this.messagingService.sendMessage(this.messageFormControl.value, this.getUsernameFromCookie());
    this.messageFormControl.setValue("");
  }

  private setCookie(username: string) {
    document.cookie = username;
  }

  private getUsernameFromCookie() {
    return document.cookie;
  }

  public isUserCurrentUser(username: string) {
    return username == document.cookie;
  }

  // private msgIndx = 0;
  // private prevPositionStart = 0;
  public renderedMessages: Message[] = [];
  public renderStartIndex: number = 0;

  public updateRenderedMessages(data) {
    console.log("New messages:");
    this.renderedMessages = this.renderedMessages.concat(this.messages.slice(data.renderStartIndex, data.renderEndIndex));
    console.log(this.renderedMessages);
    console.log("Parent End index: " + data.renderEndIndex);
    // if (data.renderEndIndex >= this.messages.length-1) {
    //   this.renderStartIndex = 0;
    // }
    this.renderStartIndex = data.renderEndIndex;
  }

  // @HostListener('scroll', ['$event'])
  // onScroll(event: Scroll) {
  //   console.log("Scroll event position start = "+event.position[0]);
  //   if (event.position[0] > this.prevPositionStart) {
  //     this.renderedMessages = this.messages.slice(this.msgIndx, this.msgIndx+10);
  //   }    
  //   this.prevPositionStart = event.position[0]
  // }

///////////////// Media Queries from Angular Material //////////////////

  private activateMediumLayout() {
    document.getElementsByTagName("mat-sidenav")[1].setAttribute("style", "min-width: 0");
    document.getElementById("send-button").style.marginRight = "1rem";
  }

  private activateSmallLayout() {
    document.getElementsByTagName("mat-sidenav")[0].setAttribute("style", "min-width: 0");
    document.getElementById("send-button").style.marginRight = "0rem";
  }
  
  private activateXSmallLayout() {
    document.getElementById("main-content").style.gridTemplateRows = "100% 26%";
    document.getElementById("send-button").style.marginLeft = "0.2rem";
    document.getElementById("main-content").style.gridTemplateRows = "100% 26%";
    document.getElementsByTagName("mat-sidenav-container")[0].setAttribute("style",
      "position: absolute; top: 48px; bottom: 0; left: 0; right: 0;");
  }

}


class SocketReturnObject {
  constructor(public messages: Message[], public errorMessage: string, public users: User[],
    public nameChanged: boolean, public colorChanged: boolean, public currentUserName:string, public newName: string) {}
}