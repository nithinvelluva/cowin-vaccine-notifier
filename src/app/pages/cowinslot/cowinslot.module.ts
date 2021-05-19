import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CowinslotPageRoutingModule } from './cowinslot-routing.module';

import { CowinslotPage } from './cowinslot.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CowinslotPageRoutingModule
  ],
  declarations: [CowinslotPage]
})
export class CowinslotPageModule {}
