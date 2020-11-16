import { Component, AfterViewInit, HostListener } from '@angular/core';
import { Message } from "./message";
import { User } from "./user";
import { SocketReturnObject } from './socket-return-object';
import { MessagingService } from "./messaging.service";
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { Cookie } from './cookie';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'DollarsChatClient';

  public onlineUsers: User[];
  public messages: Message[];
  public renderMessages: boolean = false;
  public cookie: Cookie;
  


  constructor (private breakpointObserver: BreakpointObserver) {
    
  }

  ngOnInit() {
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

  public updateStateFromMesssages(data) {
    console.log("Parent updating state from messages.");
    this.messages = data.messages;
    this.cookie = data.cookie;
    this.onlineUsers = data.users;
  }

  public updateStateFromUsers(data) {
    console.log("Parent updating state from users.");
    this.messages = data.messages;
    this.cookie = data.cookie;
    this.onlineUsers = data.users;
    this.renderMessages = data.renderMessages;
  }

  public updateUsers(users: User[]) {
    this.onlineUsers = users;
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
