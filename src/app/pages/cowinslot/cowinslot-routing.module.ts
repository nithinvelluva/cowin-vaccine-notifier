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
            loadChildren: () => import('../tabs/home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'alert',
        children: [
          {
            path: '',
            loadChildren: () => import('../tabs/alert/alert.module').then(m => m.AlertPageModule)
          }
        ]
      },
      {
        path: '',
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