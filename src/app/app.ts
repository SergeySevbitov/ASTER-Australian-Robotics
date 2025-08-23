import {Component, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {Button} from './components/button/button';
import {BgMap} from './components/bg-map/bg-map';

type Section = {
  id: number;
  title: string;
  subtitle: string;
  html: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, Button, BgMap, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  @ViewChild('slides', {static: false})
  private slidesRef?: ElementRef<HTMLElement>;
  protected visibleMap: Record<number, boolean> = {};
  protected selectedSectionId = signal<number>(0);
  protected isSliding = signal(true);

  protected readonly currentIndex = signal(0);

  ngOnInit(): void {
    queueMicrotask(() => this.setupScrollObserver());
  }

  protected goTo(index: number): void {
    const clamped = Math.max(0, Math.min(index, 3));
    const el = document.getElementById('slide-' + clamped);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
      this.currentIndex.set(clamped);
    }
  }

  protected next(): void {
    this.goTo(this.currentIndex() + 1);
  }

  protected prev(): void {
    this.goTo(this.currentIndex() - 1);
  }

  private setupScrollObserver(): void {
    const container = this.slidesRef?.nativeElement ?? document.querySelector('.sections__list');
    if (!container) return;
    const options: IntersectionObserverInit = {root: container as Element, threshold: 0.6};
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = (entry.target as HTMLElement).id.replace('slide-', '');
          const idx = Number(id);
          if (!Number.isNaN(idx)) {
            this.currentIndex.set(idx);
            this.visibleMap[idx] = true;
            this.selectedSectionId.set(idx);
            this.isSliding.set(true);
            setTimeout(() => this.isSliding.set(false), 300);
          }
        } else {
          const id = (entry.target as HTMLElement).id.replace('slide-', '');
          const idx = Number(id);
          if (!Number.isNaN(idx)) this.visibleMap[idx] = false;
        }
      }
    }, options);
    (container as HTMLElement).querySelectorAll('.sections__item').forEach((el) => observer.observe(el));
  }
}
