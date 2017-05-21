import {
    Component,
    OnInit,
    Input,
    OnChanges
} from '@angular/core';
import { Observable } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseService } from "../providers/firebase.service";
import { ActivatedRoute, Router } from "@angular/router";

import * as firebase from 'firebase';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NotificationsService } from "angular2-notifications";


@Component({
    selector: 'users',
    providers: [
    ],
    styles: [''],
    templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, OnChanges {
    public users = [];

    public pageUsers = [];
    public pages = [];
    public totalPage = 0;
    public currentPage = 0;
    public itemPerPage = 20;

    constructor(
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService,
        private route: ActivatedRoute,
        private router: Router,
        private noty: NotificationsService,
    ) { }

    public ngOnInit() {
        this.db.list('/users').subscribe(users => {
            this.users = users;
            this.totalPage = Math.floor(users.length / this.itemPerPage) + 1;
            this.setPage(1);
        })
    }

    public ngOnChanges(changes) {
    }

    
    public setPage(page) {
        if (page < 1 || page > this.totalPage) { return; }

        this.currentPage = page;
        this.pages = Array(this.totalPage).fill(0).map((v, i) => (i + 1));
        this.pageUsers = this.users.filter((t, i) => (i >= (this.currentPage - 1) * this.itemPerPage && i < (this.currentPage) * this.itemPerPage));
    }

    public setAdmin( uid, name ){
        this.db.object('/users' + uid ).update({
            isAdmin: true
        }).then( res => {
            this.noty.success('Thanh cong', name + 'da co quen admin.');
        }).catch( err => {
            this.noty.error('khong the thuc hien tac vu');
        })
    }

    public removeUser( uid ){
        this.db.list('/users' + uid ).remove()
            .then( res => {
                this.noty.success('thanh cong', 'da xoa nguoi dung.');
            }).catch( err => {
                this.noty.error('khong the xoa nguoi dung nay')
            })
    }

}
