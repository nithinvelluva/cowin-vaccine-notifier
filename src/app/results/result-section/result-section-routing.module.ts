import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResultSectionPage } from './result-section.page';

const routes: Routes = [
  {
    path: '',
    component: ResultSectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResultSectionPageRoutingModule {}
