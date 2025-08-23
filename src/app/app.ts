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
  protected readonly sections = signal<Array<Section>>([
    {
      id: 0,
      title: 'Next-Generation Robotics<br>for Australia’s Future',
      subtitle: 'Vision & Backing',
      html: `
        <p>We are an Australian company developing advanced robotics solutions to empower local Australian industries and communities with world-class innovation.</p>
        <p>We are backed by leading international venture capital and a team of seasoned professionals with global expertise.</p>
      `,
    },
    {
      id: 1,
      title: 'Accessible, Affordable, Transformative',
      subtitle: 'Mission & Focus',
      html: `
        <p>
          Our mission is to make robotics accessible and impactful, focusing on the areas that matter most to Australian businesses and people:
        </p>
        <p>
          <ul>
            <li><strong>Mining & Resources:</strong> safer operations, automated processes, more efficient exploration.</li>
            <li><strong>Disaster Prevention & Emergency Response:</strong> strengthening resilience, protecting communities, and supporting first responders.</li>
            <li><strong>Education:</strong> fostering early interest in robotics, inspiring young learners through competition, and preparing young Australians with future-ready skills.</li>
            <li><strong>Entertainment, Hospitality</strong>, and <strong>Retail:</strong> Empowering learning and innovation with educational robotics kits and research platforms.</li>
          </ul>
        </p>
      `,
    },
    {
      id: 2,
      title: 'Shaping Australia’s Tomorrow',
      subtitle: 'Future & Commitment',
      html: '<p>With a strong foundation, hands-on technical expertise, and a bold vision, we are redefining how robotics becomes part of everyday life in Australia.</p>',
    },
    {
      id: 3,
      title: 'Work in Progress, Built for Australia',
      subtitle: 'Stay Tuned',
      html: '<p>Our new projects, updates, and releases are on the way, stay tuned as we bring our exciting plans to life in Australia.</p>',
    },
  ]);

  protected readonly currentIndex = signal(0);

  ngOnInit(): void {
    queueMicrotask(() => this.setupScrollObserver());
  }

  protected goTo(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.sections().length - 1));
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
