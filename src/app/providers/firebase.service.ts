import { Injectable } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { BehaviorSubject } from 'rxjs';

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB9xXETv567zWyhbut_QEu9wbN0kPfW8VM",
    authDomain: "file-slack.firebaseapp.com",
    databaseURL: "https://file-slack.firebaseio.com",
    projectId: "file-slack",
    storageBucket: "file-slack.appspot.com",
    messagingSenderId: "210753911904"
};

@Injectable()
export class FirebaseService {
    static API_CONFIG = FIREBASE_CONFIG;

    public currentChanelId: BehaviorSubject<string> =  new BehaviorSubject('1');
    public chanels: BehaviorSubject<any> =  new BehaviorSubject(null)

    constructor(
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase
    ) {
        console.log("construct firebase service");
        this.afAuth.authState.subscribe(this.initConnection.bind(this));
    }

    public initConnection( user ) {
        console.log('init connection');
        if( !user ) { return; }

        var userRef = this.db.object('/presence/'+user.uid).$ref;
        userRef.set( user.toJSON() );

        // Add ourselves to presence list when online.
        var presenceRef = this.db.object("/.info/connected").$ref;

        presenceRef.on('value', (snap) => {
             if (snap.val()) {
                // Remove ourselves when we disconnect.
                userRef.onDisconnect().remove();
                userRef.set( user.toJSON() ); 
            }            
        });


        this.db.list('/options/chanels').subscribe((res) => {
            this.chanels.next(res);
        });
    }
};