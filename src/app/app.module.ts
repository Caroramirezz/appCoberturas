import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MaterialModule } from './material/material.module';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DetalleComponent } from './trades/pages/detalle/detalle.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DialogComponent } from './trades/pages/dialog/dialog.component';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon'
import { EditClientsDialog } from './admin/clients/edit/edit-clients.component';
import { PlattsComponent } from './platts/platts.component';
import { BloombergComponent } from './bloomberg/bloomberg.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DialogComponent,
    EditClientsDialog,
    PlattsComponent,
    BloombergComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatIconModule,
    MaterialModule,
    FlexLayoutModule,   
    HttpClientModule ,
    NgxSpinnerModule,
    MatDatepickerModule,    
    ToastrModule.forRoot(), // ToastrModule added
    DynamicDialogModule,        
  ],  
  entryComponents:[
    DetalleComponent
    
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-es'},
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    DialogService,
  ],  
  bootstrap: [AppComponent]
})
export class AppModule { }