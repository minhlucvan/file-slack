import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AngularFireAuth } from "angularfire2/auth";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AngularFireAuth, private router: Router)
     {}

    canActivate() {
        return this.authService.authState.map((user) => {
            if(user && !user.isAnonymous){
                return true;
            }
            
            this.router.navigate(['/login']);
            return false;
        });
    }
}