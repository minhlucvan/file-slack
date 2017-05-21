import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { LogInComponent } from './login'
import { DataResolver } from './app.resolver';
import { AuthGuard } from './providers/AuthGuard';
import { TopicComponent } from "./topic";
import { PostComponent } from "./post";
import { ProfileComponent } from "./profile";
import { ChatComponent } from "./chat/chat.component";
import { UsersComponent } from "./users";

export const ROUTES: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'chanel/:chanel', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LogInComponent},
  { path: 'topic/:chanel/:topic', component: TopicComponent, canActivate: [AuthGuard] },
  { path: 'post', component: PostComponent, canActivate: [AuthGuard] },
  { path: 'profile/:uid', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'profile/:uid/:state', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: 'chat/:uid', component: ChatComponent,  canActivate: [AuthGuard]},
  { path: 'users', component: UsersComponent,  canActivate: [AuthGuard]},
  { path: '*', component: HomeComponent}
];
