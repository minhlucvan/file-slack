import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef
} from '@angular/core';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { Router, ActivatedRoute } from "@angular/router";
import { NotifyService } from '../providers/notify.service';
import { NotificationsService } from 'angular2-notifications';

import * as firebase from 'firebase';
import * as moment from 'moment';
import 'moment/locale/vi';
import { FirebaseService } from "../providers/firebase.service";

moment.locale('vi');

@Component({
    selector: 'chat',
    styleUrls: ['./chat.component.scss'],
    templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit, AfterViewInit {

    chats: any[];
    _subscription = {};
    chatId: string;
    yourId: string;
    me: firebase.User;
    you: any;
    hasChat: boolean = false;
    chatInput: string = '';
    hasPartner = true;
    hasInit = false;
    sending = false;

    @ViewChild('chatPanel')
    chatPanelRef: ElementRef;

    constructor(
        private formBuilder: FormBuilder,
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private route: ActivatedRoute,
        private router: Router,
        private noty: NotificationsService,
        private firebaseService: FirebaseService
    ) { }

    public ngOnInit() {
        this.me = this.afAuth.auth.currentUser;
        //this.db.list('/chats/').remove();
        this._subscription['router'] = this.route.params.subscribe((params) => {
            this.yourId = params['uid'];
            this.firebaseService.ignoreMsgNotify[this.yourId] = true;
            this.loadPartner();
        });
    }

    ngAfterViewInit(): void {
        this.scrollChatPanel();
    }

    loadPartner(){
        this._subscription['loadpartner'] = this.db.object(`/users/${this.yourId}/`)
        .subscribe( data => {
            if(!data.$exists()){
                this.hasPartner = false;
            }
            this.hasPartner = true;
            this.you = data;
            this.loadData();
            this._subscription['loadpartner'].unsubscribe();
        });
    }

    public loadData() {
        this._subscription['loaddata'] = this.db.object(`/users/${this.me.uid}/chats/${this.yourId}`).subscribe((data) => {
            if (!data.chatId) {
                this.hasChat = false;
                this.initData();
                console.log('non exists', data);
                return;
            }
            console.log('exists');
            this.hasChat = true;
            this.chatId = data.chatId;
            this.loadChat();
        });
    }

    public loadChat() {
        if (!this.chatId) { return; }

        this._subscription['loadchat'] = this.db.list(`/chats/${this.chatId}/messages/`).subscribe((chats) => {
            this.chats = chats.map( c => { 
                if(typeof c.created == 'number'){
                    c.created = moment( new Date( c.created ) ).fromNow();
                }
    
                console.log(c.created);
                if( !c.author ){
                    c.author = "Minh";
                } 
                c.authorChar = c.author[0];
                c.isMe = (c.uid == this.me.uid);
                if( !c.avatar ){
                    if( c.isMe ){
                        c.avatar = "http://placehold.it/50/FA6F57/fff&text=ME";
                    } else {
                        c.avatar = 'http://placehold.it/50/55C1E7/fff&text=' + c.authorChar;
                    }
                }

                return c;   
            });

            this.scrollChatPanel();
        });

    }

    public scrollChatPanel( ms: number = 100){
        setTimeout(() => {
            try {
                this.chatPanelRef.nativeElement.scrollTop = this.chatPanelRef.nativeElement.scrollHeight;
            } catch(err) { console.error(err); }
        }, ms);
    }

    public initData() {
        if(this.hasInit){
            return;
        }
        this.hasInit = true;

        let data = {
            publish: true,
            members: {
                [this.me.uid]: {
                    uid: this.me.uid
                },
                [this.yourId]: {
                    uid: this.yourId
                }
            },
        };

        this.db.list('/chats/').push(data).then(res => {
            console.log('init chat');
            this.chatId = res.key;
            return res.key;
        })
        .then(() => {
            console.log('init me');
            return this.db.object(`/users/${this.me.uid}/chats/${this.yourId}`).set({ chatId: this.chatId });
        })
        .then(() => {
            console.log('init partner');
            return this.db.object(`/users/${this.yourId}/chats/${this.me.uid}`).set({ chatId: this.chatId });
        })
        .then(() => {
            this.hasChat = true;
            console.log(this.chatId);
        });

    }

    public send() {
        if (!this.hasChat) {
            this.noty.info('pelase wait...', 'conversation is not ready yet.');
            return;
        }

        if( this.sending ){ return; };

        this.sending = true;
        this.db.list(`/chats/${this.chatId}/messages/`).push({
             content: this.chatInput,
             author: this.me.displayName,
             uid: this.me.uid,
             created: firebase.database.ServerValue.TIMESTAMP })
            .then(res => {
                if(this.you && this.you.msg && this.you.msg.web){
                    this.firebaseService.pushNotify(this.afAuth.auth.currentUser.displayName, this.chatInput, {
                        to: this.you.msg.web
                    });
                }
                this.chatInput = '';
                this.sending = false;
            })

    }

    public ngOnDestroy(){
        this.firebaseService.ignoreMsgNotify[this.yourId] = false;
        var keys = Object.keys(this._subscription);
        keys.forEach((key) => {
            this._subscription[key].unsubscribe();
        })
    }


}
