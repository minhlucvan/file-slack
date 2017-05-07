import {
    Component,
    OnInit
} from '@angular/core';

import { FormBuilder, FormGroup, FormControl ,Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { Router } from "@angular/router";

@Component({
    selector: 'login',
    providers: [
    ],
    styleUrls: ['./login.component.scss'],
    templateUrl: './login.component.html'
})
export class LogInComponent implements OnInit {

    public logInForm: FormGroup;
    public signUpForm: FormGroup;
    
    constructor(
        private formBuilder: FormBuilder,
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private router: Router
    ) { }

    public ngOnInit() {
        this.signUpForm = this.formBuilder.group({
            'name':       ['', [ Validators.required ]],
            'email':      ['', [ Validators.required, Validators.email ]],
            'password':   ['', [ Validators.required, Validators.minLength(6)] ],
            'repassword': new FormControl('', [ Validators.required, this.checkRepassword.bind(this)])
        });

        this.logInForm = this.formBuilder.group({
            'email': ['', [Validators.required, Validators.email]],
            'password':  ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    public checkRepassword(){
       let matched = (!this.signUpForm)?false:(this.signUpForm.controls.password.value == this.signUpForm.controls.repassword.value);
       if(matched){
        return null;
       } 

       return Observable.of({ matched: 're-password is not matched.' }); // errors

    }

    onPasswordChange( password ){
        this.signUpForm.controls.repassword.setValue('');
        if(!password){
            this.signUpForm.controls.repassword.disable();
        } else {
            this.signUpForm.controls.repassword.enable();
        }
    }

    public signUp(){ 
       let data = this.signUpForm.getRawValue();
       this.afAuth.auth.createUserWithEmailAndPassword(data.email, data.password)
                       .then( this.initUserData.bind(this, data))
                       .then( this.sendVeify.bind(this, data))
                       .catch(console.error);
       
       console.log('signup request', data);                
    }

    public initUserData( data ){
        let user = this.afAuth.auth.currentUser;
        return user.updateProfile({ displayName: data.name, photoURL: user.photoURL});
    }

    public sendVeify(){
        var user = this.afAuth.auth.currentUser;
        
        user.sendEmailVerification()
            .then( this.onVerifySent.bind(this) )
            .catch( console.error );

    } 

    public onVerifySent( res ){
        console.log('verify email sent', res);
    }

    public logIn(  ){
        let data = this.logInForm.getRawValue();
        console.log('login request', data);    
        this.afAuth.auth.signInWithEmailAndPassword(data.email, data.password)
                        .then(this.onLogedIn.bind(this))
                        .catch( console.error );
    }

    public onLogedIn( res ){
        console.log('user logged in', res );
        this.router.navigate(['/']);
    }
}
