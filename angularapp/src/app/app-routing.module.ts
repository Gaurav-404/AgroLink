import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { SellernavComponent } from './components/sellernav/sellernav.component';
import { SelleraddchemicalComponent } from './components/selleraddchemical/selleraddchemical.component';
import { SellerviewchemicalComponent } from './components/sellerviewchemical/sellerviewchemical.component';
import { SellereditchemicalComponent } from './components/sellereditchemical/sellereditchemical.component';
import { SellerviewfeedbackComponent } from './components/sellerviewfeedback/sellerviewfeedback.component';
import { SellerviewrequestsComponent } from './components/sellerviewrequests/sellerviewrequests.component';
import { FarmernavComponent } from './components/farmernav/farmernav.component';
import { FarmeraddcropComponent } from './components/farmeraddcrop/farmeraddcrop.component';
import { FarmerviewcropComponent } from './components/farmerviewcrop/farmerviewcrop.component';
import { FarmereditcropComponent } from './components/farmereditcrop/farmereditcrop.component';
import { FarmerviewchemicalComponent } from './components/farmerviewchemical/farmerviewchemical.component';
import { FarmermyrequestComponent } from './components/farmermyrequest/farmermyrequest.component';
import { FarmeraddfeedbackComponent } from './components/farmeraddfeedback/farmeraddfeedback.component';
import { FarmerviewfeedbackComponent } from './components/farmerviewfeedback/farmerviewfeedback.component';
import { ErrorComponent } from './components/error/error.component';
import { authGuard } from './components/authguard/auth.guard';
import { FarmerhomeComponent } from './components/home/farmerhome/farmerhome.component';
import { SellerhomeComponent } from './components/home/sellerhome/sellerhome.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  {
    path: 'seller',
    component: SellernavComponent,
    canActivate: [authGuard],
    data: { roles: ['Seller', 'Admin'] },
    children: [
      { path: 'add-chemical', component: SelleraddchemicalComponent },
      { path: 'view-chemical', component: SellerviewchemicalComponent },
      { path: 'edit-chemical/:id', component: SellereditchemicalComponent },
      { path: 'requests', component: SellerviewrequestsComponent },
      { path: 'feedbacks', component: SellerviewfeedbackComponent },
      { path: '', component: SellerhomeComponent },
      { path: 'home', component: SellerhomeComponent }  
    ]
  },

  {
    path: 'farmer',
    component: FarmernavComponent,
    canActivate: [authGuard],
    data: { roles: ['Farmer', 'Admin'] },
    children: [
      { path: 'add-crop', component: FarmeraddcropComponent },
      { path: 'my-crop', component: FarmerviewcropComponent },
      { path: 'edit-crop/:id', component: FarmereditcropComponent },
      { path: 'agrochemicals', component: FarmerviewchemicalComponent },
      { path: 'my-requests', component: FarmermyrequestComponent },
      { path: 'add-feedback', component: FarmeraddfeedbackComponent },
      { path: 'view-feedbacks', component: FarmerviewfeedbackComponent },
      { path: '', component: FarmerhomeComponent },
      { path: 'home', component: FarmerhomeComponent }    
    ]
  },

  { path: '404', component: ErrorComponent, data: { message: '404 - Page Not Found' } },
  { path: '500', component: ErrorComponent, data: { message: '500 - Server Error' } },
  { path: 'error', component: ErrorComponent, data: { message: 'Something Went Wrong' } },
  { path: '**', component: ErrorComponent, data: { message: '404 - Page Not Found' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
