import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Feedback } from 'src/app/models/feedback.model';
import { FeedbackService } from 'src/app/services/feedback.service';

@Component({
  selector: 'app-farmeraddfeedback',
  templateUrl: './farmeraddfeedback.component.html',
  styleUrls: ['./farmeraddfeedback.component.css']
})
export class FarmeraddfeedbackComponent implements OnInit {
  feedback:Feedback={
      UserId:Number(localStorage.getItem("userId")),
      FeedbackText:"",
      Date:new Date(),
  }
  constructor(
    private ser: FeedbackService,
    private rt: Router,
    private ac: ActivatedRoute
  ) {}
  
  
  
  ngOnInit(): void {
      
  }
  AddFeedback() {
    this.ser.sendFeedback(this.feedback).subscribe({
      next: () => this.rt.navigate(['/farmer/view-feedbacks']),
      error: (err) => {
        console.error('Failed to add feedback', err);
        // Edge case: some servers still yield status 200 in error branch
        if (err?.status === 200) {
          this.rt.navigate(['/farmer/view-feedbacks']);
        }
      }
    });
  }



}
