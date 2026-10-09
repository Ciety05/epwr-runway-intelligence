# EPWR Runway Intelligence

Responsywny dashboard w języku polskim: orientacyjna preferencja pasa 29 / 11 według wiatru, 7 dni, stabilizowane okresy, godzinowy wiatr i Arrival Intelligence.

## Podgląd lokalny

Wymagany Node.js 22 lub nowszy. Bez instalowania zależności.

```sh
npm start
```

Otwórz http://127.0.0.1:4173. Alternatywnie uruchom `node server.mjs`. Aplikacja jest statyczna i nie wymaga serwera produkcyjnego. Otwieranie samego index.html przez file:// nie obsługuje modułów.

## Testy

```sh
npm test
npm run check
```

Testy obejmują kierunki, deadband, stabilizację bez cofania zmian, luki danych, granice przedziałów, odwołania lotów, strefę Warsaw, dni DST 23/25h i walidację odpowiedzi.

## Dane i ograniczenia

- Pogoda: Open-Meteo /v1/forecast, wind_speed_10m, wind_direction_10m, wind_gusts_10m; węzły, Unix epoch, Europe/Warsaw, 7 dni. LIVE oznacza pobraną prognozę, nie obserwację. Brak prognozy nie jest neutralną preferencją.
- Odświeżanie co 30 minut oraz ręcznie; timeout 15 sekund. Błąd usuwa oznaczenie LIVE. Syntetyczna pogoda jest dostępna dopiero po świadomym kliknięciu DEMO.
- Przyloty: wyłącznie fikcyjne DEMO, z identyfikatorami DEMO01 itd. Brak skrapowania i brak nieudokumentowanego endpointu. Nie ma podłączonego źródła LIVE lotów.
- Orientacyjne osie 290° i 110°; bez deklinacji magnetycznej. Prędkość <3 kt lub składowa wzdłuż osi <2 kt daje neutralny. Zmiana wymaga 2 kolejnych godzin i wchodzi od drugiej godziny. To heurystyka, nie reguła operacyjna.
- Dziś okno od teraz; przyszłe dni od północy. Okna [początek, koniec), do zmiany albo końca dostępnych danych dnia. Wybór okresu aktualizuje KPI i listę. Liczba oraz godzina/Brak używają tych samych stylów i wspólnej siatki.
- ATC decyduje o używanym pasie. Aplikacja nie uwzględnia NOTAM, prac na pasie, procedur hałasowych, widzialności ani zamknięć. Nie służy do nawigacji.
- Fonty Google są opcjonalne; systemowe fonty działają offline.

Szczegóły w [docs/SOURCES.md](docs/SOURCES.md). Brak wdrożenia i konfiguracji GitHub Pages. Publikacja i scalenie PR wymagają akceptacji właściciela.
