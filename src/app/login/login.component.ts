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
import { NotifyService } from '../providers/notify.service';
import { NotificationsService} from 'angular2-notifications';

@Component({
    selector: 'login',
    providers: [
    ],
    styleUrls: ['./login.component.scss'],
    templateUrl: './login.component.html'
})
export class LogInComponent implements OnInit {
    showLoader: boolean;

    public logInForm: FormGroup;
    public signUpForm: FormGroup;
    
    constructor(
        private formBuilder: FormBuilder,
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private router: Router,
        private noty: NotificationsService,
    ) { }

    public ngOnInit() {
        this.signUpForm = this.formBuilder.group({
            'name':       ['', [ Validators.required ]],
            'email':      ['', [ Validators.required], [this.checkEmailExits.bind(this)]],
            'password':   ['', [ Validators.required, Validators.minLength(6)] ],
            'repassword': new FormControl('', [ Validators.required, this.checkRepassword.bind(this)])
        });

        this.logInForm = this.formBuilder.group({
            'email': ['', [Validators.required, Validators.email]],
            'password':  ['', [Validators.required, Validators.minLength(6)]]
        });

        this.appState.loader.subscribe(show => {
            this.showLoader = show;
        });
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
                       .catch((res: any) => {
                           if(res && res.code && res.code == 'auth/invalid-email'){
                               this.noty.error('Sign up error!', res.message);
                           }
                       });

       this.appState.loader.next(true);
       console.log('signup request', data);                
    }

    public initUserData( data ){
        let user = this.afAuth.auth.currentUser;
        return user.updateProfile({ displayName: data.name, photoURL: user.photoURL})
                  .then(() => {
                        return this.db.object('/users/').set({ [user.uid]: {
                            name: data.name,
                            email: data.email
                        }});
                    });
    }

    public sendVeify(){
        var user = this.afAuth.auth.currentUser;
        
        user.sendEmailVerification()
            .then( this.onVerifySent.bind(this) )
            .catch( console.error );

    } 

    public onVerifySent( res ){
        console.log('verify email sent', res);
        this.noty.success('sign up success','now you can log in to your account');
        let values =  this.signUpForm.getRawValue();
        this.logInForm.setValue({ email: values.email, password: ''});
        this.signUpForm.reset();
        this.appState.loader.next(false);

    }

    public logIn(){
        let data = this.logInForm.getRawValue();
        console.log('login request', data);    
        this.afAuth.auth.signInWithEmailAndPassword(data.email, data.password)
                        .then(this.onLogedIn.bind(this))
                        .catch( console.error );
                     
    }

    public onLogedIn( res ){
        console.log('user logged in', res );
        this.router.navigate(['/']);
        this.noty.success('login success!', `welcome ${this.afAuth.auth.currentUser.displayName || this.afAuth.auth.currentUser.email}`);
        this.appState.loader.next(false);
    }

    onError( error ){
        this.noty.error(error.title, error.message);
    }

    public checkRepassword(){
       let matched = (!this.signUpForm)?false:(this.signUpForm.controls.password.value == this.signUpForm.controls.repassword.value);
       if(matched){
        return null;
       } 

       return Observable.of({ matched: true }); // errors

    }

    checkEmailExits( control: FormControl ){
        let emailErrors = Validators.email( control );
        if( emailErrors ) { return  Promise.resolve(emailErrors); };

        return this.afAuth.auth.fetchProvidersForEmail( control.value )
                    .catch(console.error)
                    .then(( providers ) => {
                        if(providers && providers.length && providers.length > 0){
                            return { exist:  true}
                        } 

                        return null;
                    });
    }
}
