import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, switchMap, startWith, shareReplay, Subject, scan, map, Observable, merge, combineLatest, tap, BehaviorSubject,} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

type Dog = {
  image: string;
  breed: string;
  temperament: string;
};

@Component({
  selector: 'app-adopt-me',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adopt-me.component.html',
  styleUrl: './adopt-me.component.scss',
})

export class AdoptMeComponent {
  currentDog$!: Observable<Dog>;
  filteredWishlist$!: Observable<Dog[]>;

  passSubject = new Subject<void>();
  raceFilterControl = new FormControl<string>('');

  private adoptedSubject = new BehaviorSubject<Dog[]>(this.loadFromStorage('adopted'));
  adoptedDogs$ = this.adoptedSubject.asObservable();

  private wishlistSubject = new BehaviorSubject<Dog[]>(this.loadFromStorage('wishlist'));
  wishlistDogs$ = this.wishlistSubject.asObservable();


  httpClient = inject(HttpClient);

  activeTab = 'adopted';
  showTemperament = false;


  ngOnInit() {
    this.currentDog$ = this.passSubject.pipe(
      startWith(0),
      switchMap(() =>
        this.httpClient.get<any[]>('https://api.thedogapi.com/v1/images/search', {
          headers: {
            'x-api-key': 'live_NnPSWm8hsCMV8geOxhDwygB35UwOqe9eHWQEHkwVXuyY8BaET2TXTexHxMjR45jB',
          },
        }).pipe(
          map((res) => ({
            image: res[0].url,
            breed: res[0].breeds?.[0]?.name || 'Mystère',
            temperament: res[0].breeds?.[0]?.temperament || 'Inconnu',
          }))
        )
      ),
      shareReplay(1)
    );

    this.filteredWishlist$ = combineLatest([
      this.wishlistDogs$,
      this.raceFilterControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([dogs, race]) =>
        dogs.filter((dog) =>
          dog.breed.toLowerCase().includes(race?.toLowerCase() || '')
        )
      )
    );   

  }
// les methodes
  adopt(dog: Dog) {
  const current = this.adoptedSubject.getValue();
  const updated = [...current, dog];
  this.adoptedSubject.next(updated);
  localStorage.setItem('adopted', JSON.stringify(updated));
}

removeFromAdopted(dog: Dog) {
  const current = this.adoptedSubject.getValue();
  const updated = current.filter(d => d.image !== dog.image);
  this.adoptedSubject.next(updated);
  localStorage.setItem('adopted', JSON.stringify(updated));
}

  pass() {
    this.passSubject.next();
  }

  addToWishlist(dog: Dog) {
    const current = this.wishlistSubject.getValue();
    const updated = [...current, dog];
    this.wishlistSubject.next(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  }
  
  removeFromWishlist(dog: Dog) {
    const current = this.wishlistSubject.getValue();
    const updated = current.filter(d => d.image !== dog.image);
    this.wishlistSubject.next(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  }
  
  loadFromStorage(key: string): Dog[] {
    const saved = localStorage.getItem(key);
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter(dog => dog.image && dog.breed)
        : [];
    } catch {
      return [];
    }
  }
  
}