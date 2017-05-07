import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { LogInComponent } from './login'
import { DataResolver } from './app.resolver';
import { AuthGuard } from './providers/AuthGuard';
import { TopicComponent } from "./topic";
import { PostComponent } from "./post";

export const ROUTES: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LogInComponent},
  { path: 'topic/:chanel/:topic', component: TopicComponent, canActivate: [AuthGuard] },
  { path: 'post', component: PostComponent, canActivate: [AuthGuard] },
  { path: '*', component: HomeComponent}
];
