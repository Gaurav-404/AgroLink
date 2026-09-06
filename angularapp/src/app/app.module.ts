import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ErrorComponent } from './components/error/error.component';
import { SelleraddchemicalComponent } from './components/selleraddchemical/selleraddchemical.component';
import { SellerviewchemicalComponent } from './components/sellerviewchemical/sellerviewchemical.component';
import { SellerviewfeedbackComponent } from './components/sellerviewfeedback/sellerviewfeedback.component';
import { FarmeraddcropComponent } from './components/farmeraddcrop/farmeraddcrop.component';
import { FarmeraddfeedbackComponent } from './components/farmeraddfeedback/farmeraddfeedback.component';
import { FarmereditcropComponent } from './components/farmereditcrop/farmereditcrop.component';
import { FarmermyrequestComponent } from './components/farmermyrequest/farmermyrequest.component';
import { FarmernavComponent } from './components/farmernav/farmernav.component';
import { FarmerviewchemicalComponent } from './components/farmerviewchemical/farmerviewchemical.component';
import { FarmerviewcropComponent } from './components/farmerviewcrop/farmerviewcrop.component';
import { FarmerviewfeedbackComponent } from './components/farmerviewfeedback/farmerviewfeedback.component';
import { HomeComponent } from './components/home/home.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { SellereditchemicalComponent } from './components/sellereditchemical/sellereditchemical.component';
import { SellernavComponent } from './components/sellernav/sellernav.component';
import { SellerviewrequestsComponent } from './components/sellerviewrequests/sellerviewrequests.component';
import { LoginComponent } from './components/login/login.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './Interceptors/auth.interceptor';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { FarmerhomeComponent } from './components/home/farmerhome/farmerhome.component';
import { SellerhomeComponent } from './components/home/sellerhome/sellerhome.component';

import { AgGridModule } from 'ag-grid-angular';   // ← ADD THIS

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ErrorComponent,
    SelleraddchemicalComponent,
    SellerviewchemicalComponent,
    SellerviewfeedbackComponent,
    FarmeraddcropComponent,
    FarmeraddfeedbackComponent,
    FarmereditcropComponent,
    FarmermyrequestComponent,
    FarmernavComponent,
    FarmerviewchemicalComponent,
    FarmerviewcropComponent,
    FarmerviewfeedbackComponent,
    HomeComponent,
    LoginComponent,
    RegistrationComponent,
    SellereditchemicalComponent,
    SellernavComponent,
    SellerviewrequestsComponent,
    FarmerhomeComponent,
    SellerhomeComponent,
    ChatbotComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AgGridModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }