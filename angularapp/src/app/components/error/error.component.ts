import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  message: string = 'Something Went Wrong';

  constructor(private route: ActivatedRoute) {
    // Read the message from route data
    const routeData = this.route.snapshot.data;
    if (routeData['message']) {
      this.message = routeData['message'];
    }
  }
}
