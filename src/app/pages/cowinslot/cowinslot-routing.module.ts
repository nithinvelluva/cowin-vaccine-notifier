import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CowinslotPage } from './cowinslot.page';

const routes: Routes = [
  {
    path: '',
    component: CowinslotPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            //loadChildren: 'app/pages/tabs/home/home.module#HomePageModule'
            loadChildren: () => import('../tabs/home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'alert',
        children: [
          {
            path: '',
            //loadChildren: '../tabs/alert/alert.module#AlertPageModule'
            loadChildren: () => import('../tabs/alert/alert.module').then(m => m.AlertPageModule)
          }
        ]
      },
      {
        path: '',
        /* children: [
          {
            path: '',
            //loadChildren: 'app/pages/tabs/home/home.module#HomePageModule'
            loadChildren: () => import('../tabs/home/home.module').then(m => m.HomePageModule)
          }
        ] */
        redirectTo: 'home',
        pathMatch: 'full'
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CowinslotPageRoutingModule { }