import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, switchMap, startWith, shareReplay, Subject, scan, map, Observable, merge, combineLatest,} from 'rxjs';
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
  adoptedDogs$!: Observable<Dog[]>;
  wishlistDogs$!: Observable<Dog[]>;
  filteredWishlist$!: Observable<Dog[]>;

  private adoptSubject = new Subject<Dog>();
  passSubject = new Subject<void>();
  wishlistSubject = new Subject<Dog>();
  raceFilterControl = new FormControl<string>('');

  httpClient = inject(HttpClient);



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

    this.adoptedDogs$ = this.adoptSubject.pipe(
      scan((acc, dog) => [...acc, dog], [] as Dog[])
    );

    this.wishlistDogs$ = this.wishlistSubject.pipe(
      scan((acc, dog) => [...acc, dog], [] as Dog[]),
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

  adopt(dog: Dog) {
    this.adoptSubject.next(dog);
  }
  pass() {
    this.passSubject.next();
  }

  addToWishlist(dog: Dog) {
    this.wishlistSubject.next(dog);
  }  
  
}
