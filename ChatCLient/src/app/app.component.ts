import { Component, AfterViewInit } from '@angular/core';
import { Message } from "./message";
import { User } from "./user";
import { MessagingService } from "./messaging.service"
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';


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
            this.setCookie(socketObject.newName);
          }
          this.onlineUsers = socketObject.users;
          this.messages = socketObject.messages;

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
          if (socketObject.nameChanged) {
            // User changed their name.
            console.log("User changed their name.");
            this.setCookie(socketObject.newName);
          }
          this.onlineUsers = socketObject.users;
          
          if (socketObject.errorMessage)
            window.alert(socketObject.errorMessage);
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
    public nameChanged: boolean, public colorChanged: boolean, public newName: string) {}
}