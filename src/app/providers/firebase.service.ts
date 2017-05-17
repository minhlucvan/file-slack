import { Injectable } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from "angular2-notifications";
import { Http, RequestOptions, Headers } from "@angular/http";

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB9xXETv567zWyhbut_QEu9wbN0kPfW8VM",
    authDomain: "file-slack.firebaseapp.com",
    databaseURL: "https://file-slack.firebaseio.com",
    projectId: "file-slack",
    storageBucket: "file-slack.appspot.com",
    messagingSenderId: "210753911904"
};

const SERVER = {
    apiKey: "AAAAMRHpfGA:APA91bFNe0hv-szjwrwwzoGpPkTMvznp2_G0xQHoIXteSUihOjRngIVmi7A3DVNSTDPIYPE0FH_47XOBlJJ9v4U3HW6c4dhEOd9c7dx30e9_5g5a6_qjFw6eXTa0THY3xWE3o3BN2SeR"
}

@Injectable()
export class FirebaseService {
    permissionGranted: boolean;
    msgToken;
    static API_CONFIG = FIREBASE_CONFIG;

    public currentChanelId: BehaviorSubject<string> =  new BehaviorSubject('1');
    public chanels: BehaviorSubject<any> =  new BehaviorSubject(null)

    constructor(
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private noty: NotificationsService,
        private http: Http
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

        this.initMessaging();
    }

    public initMessaging(){

        this.registerSw();

        this.db.app.messaging().requestPermission().then(() => {
            this.permissionGranted = true;
        })
        .catch(() => {
            this.permissionGranted = false;
            this.noty.warn("Notification disabled",'you canot get new notifications from server.')
        });

        this.db.app.messaging().onMessage(( payload ) => {
            console.log(payload);
        });
    }

    public registerSw(){
        if ('serviceWorker' in navigator) {
            console.log('register SW');
            navigator.serviceWorker.register('/assets/firebase-messaging-sw.js')
            .then((registration)  => {
                console.log('use sw');
                this.db.app.messaging().useServiceWorker(registration );
                this.connectMsgServer();
            }).catch(function(err) {
                console.log('Service worker registration failed, error:', err);
            });
        }
    }

    public connectMsgServer(){
        console.log('connect msg server');
        this.db.app.messaging().onTokenRefresh(() => {
            this.getMsgToken();
        });

        this.getMsgToken();
    }

    public getMsgToken(){
        console.log('get msg token');
        this.db.app.messaging().getToken().then(( token ) => {
            console.log('msg token',token);
        })
        .catch(( err ) => {
                console.log( 'msg token err',err );
        });
    }
    public pushNotify( payload ){
        if( !this.permissionGranted ){
            this.noty.warn('push notification is disabled', 'please turn it on to do this.');
            this.initMessaging();
        }

        let headers: Headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'key=' + SERVER.apiKey
            });
        let options = new RequestOptions({ headers: headers });
        var body = {
            data: {
                title: 'afaf',
                content: 'dbskadbkas'
            },
            to: '/'
        };

        this.http.post('https://fcm.googleapis.com/fcm/send', JSON.stringify(body), options).subscribe((res) => {

        })

    }
};