import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./auth/features/login/login.component')
    },
    {
        path: 'index',
        loadComponent: () => import('./business/features/index/index.component')
    },
    {
        path: 'settings',
        loadComponent: () => import('./business/features/settings/settings.component')
    },
    {
        path: 'finder',
        loadComponent: () => import('./business/features/finder/finder.component')
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
