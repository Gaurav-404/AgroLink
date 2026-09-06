import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef;
  
  currentSlide = 0;
  totalSlides = 5;
  autoSlideInterval: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngAfterViewInit() {
    // Initialize first slide
    this.updateSlidePosition();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlidePosition();
    
    // Reset auto-slide timer
    this.resetAutoSlide();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.updateSlidePosition();
    
    // Reset auto-slide timer
    this.resetAutoSlide();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.updateSlidePosition();
    
    // Reset auto-slide timer
    this.resetAutoSlide();
  }
  updateSlidePosition() {
    if (this.carouselTrack) {
      console.log('Updating slide position to:', this.currentSlide);
      const track = this.carouselTrack.nativeElement;
      track.style.transform = `translateX(-${this.currentSlide * 20}%)`;
      track.style.transition = 'transform 0.5s ease-in-out';
    } else {
      console.error('carouselTrack is not defined! Check if #carouselTrack is in the template');
    }
  }

  resetAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.startAutoSlide();
    }
  }
}