import {
    Component,
    OnInit,
    Input,
    OnChanges
} from '@angular/core';
import { Observable } from 'rxjs';

import { FirebaseApp } from 'angularfire2';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseService } from "../providers/firebase.service";
import { ActivatedRoute } from "@angular/router";

import * as firebase from 'firebase';
import * as moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

@Component({
    selector: 'topic',
    providers: [
    ],
    styles: [''],
    templateUrl: './topic.component.html'
})
export class TopicComponent implements OnInit, OnChanges {

    public topic;

    public cid = '';
    public tid = '';

    public fileUrl = 'javascript:void(0);';
    public comment: String;

    private subs = [];

    constructor(
        private app: FirebaseApp,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService,
        private route: ActivatedRoute
    ) { }

    public ngOnInit() {
        this.route.params.subscribe( params => {

            this.cid = params['chanel'];
            this.tid = params['topic'];
            this.loadTopic();
        });
    }

    public loadTopic(){
        this.db.object(`/chanels/${this.cid}/topics/${this.tid}`).subscribe(topic => {
            if(!topic) { return; }
            topic.created = moment( new Date(topic.created) ).fromNow();
            this.topic = topic;
            if (!topic.comments) { topic.comments = []; }
            this.topic.comments = Object.keys( topic.comments ).map(key => ({ key, ...topic.comments[key]})); 
            this.topic.comments = this.topic.comments.reverse().map(cmt => {
                cmt.created =  moment( new Date(cmt.created) ).fromNow();
                return cmt;
            });
            this.getFileUrl( );
        });
    }

    public ngOnChanges( changes ){
        
    }

    public getFileUrl( ){
         console.log( this.db.app.storage );
         this.db.app.storage().ref().child( this.topic.file ).getDownloadURL().then( url => {
             this.fileUrl = url;
         } )
    }

    public sendComment(){
        if( !this.comment ){ return; }
        var commentObj = {
            content: this.comment,
            author: {
                uid: this.afAuth.auth.currentUser.uid,
                name: this.afAuth.auth.currentUser.displayName || this.afAuth.auth.currentUser.email,
            },
            created: firebase.database.ServerValue.TIMESTAMP
        };

        this.db.list(`/chanels/${this.cid}/topics/${this.tid}/comments/`).push( commentObj ).then(res => {
            this.comment = '';
        });
    }

}
