import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultSectionPageRoutingModule } from './result-section-routing.module';

import { ResultSectionPage } from './result-section.page';
import { ResultCardComponent } from '../result-card/result-card.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { SortByPipe } from '../../../pipes/sort.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultSectionPageRoutingModule,
    FontAwesomeModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule
  ],
  declarations: [SortByPipe, ResultSectionPage, ResultCardComponent]
})
export class ResultSectionPageModule { }
