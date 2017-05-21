import {
    Component,
    OnInit,
    Input
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseService } from "../providers/firebase.service";
import { Router } from "@angular/router";
import * as firebase from 'firebase';
import { NotificationsService } from "angular2-notifications";


@Component({
    selector: 'post',
    providers: [
    ],
    styles: [''],
    templateUrl: './post.component.html'
})
export class PostComponent implements OnInit {
    currentChanelName: any;

    public topic;
    public currentChanelId;
    public chanels;

    public file: File;
    public postForm: FormGroup;

    constructor(
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService,
        private router: Router,
        private formBuilder: FormBuilder,
        private noty: NotificationsService
    ) { }

    public ngOnInit() {
        this.postForm = this.formBuilder.group({
            'title': ['', [ Validators.required ]],
            'chanel': [this.currentChanelId || '', [ Validators.required ]],
            'content': ['', [ Validators.required ]]
        })

        this.firebaseService.currentChanelId.subscribe(id => {
            this.currentChanelId = id;
            this.postForm.controls.chanel.setValue(id);
        });

        this.firebaseService.chanels.subscribe( chanels => {
            this.chanels = chanels;
        })
    }

    public selectFile( event ){
        var files = event.srcElement.files;
        this.file = files[0];
    }

    public post(){
        var data = this.postForm.getRawValue();
        
        if(!this.firebaseService.canPostTo(data.chanel)){
            this.noty.warn('xin loi', 'ban khong co quen dang len kenh nay');
            return;
        }
        console.log(data);
        const chanel = this.chanels.find(c => (c.$key == data.chanel));

        data.author = {
            name: this.afAuth.auth.currentUser.displayName,
            uid: this.afAuth.auth.currentUser.uid
        }

        data.created = firebase.database.ServerValue.TIMESTAMP;

        data.public = true;

        data.comments = {};    

        var topics = this.db.list(`/chanels/${data.chanel}/topics/`);

        this.appState.loader.next(true);
        topics.push(data).then(res => {

            var firebase = this.db.app;
            var storageRef = firebase.storage().ref();

            data.key = res.key;
            data.file = `/topics/${data.chanel}/${res.key}/${this.file.name}`;
            var fileRef = storageRef.child( data.file );
            return fileRef.put(this.file);
        }).then(res => {
            return this.db.object(`/chanels/${data.chanel}/topics/${data.key}/file`).set(data.file)
        }).then(res => {
            this.noty.success('post bai thanh cong', this.postForm.getRawValue().title);
            this.appState.loader.next(false);
            this.firebaseService.pushNotify(this.afAuth.auth.currentUser.displayName, `da dang mot bai moi len nhom ${chanel.name}`, '');
            return this.router.navigate(['/topic', data.chanel, data.key]);
        }).catch(( err ) => {
            let msg = "loi khong xac dinh.";
            if( err && err.message){
                msg = err.message;
            }
            this.noty.error('khong the post bai', msg);
            this.appState.loader.next(false);
        });
    }


}
