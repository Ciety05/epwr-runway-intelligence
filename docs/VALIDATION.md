# Walidacja 2026-10-09

- 9/9 testów Node.js: kierunki i progi, stabilizacja i odrzucanie oscylacji, luki, początek od aktualnej minuty, przyszły dzień od północy, granice liczenia lotów, anulowania, Warsaw, DST 23/25h, nieprawidłowe jednostki i odpowiedź.
- Sprawdzenie składni app.js i model.js.
- Rzeczywista odpowiedź Open-Meteo: 168 godzin, jednostki kn i unixtime, data 2026-10-09. Ponowienie pobrania w przeglądarce zakończone LIVE / PROGNOZA.
- Pierwsze pobranie w przeglądarce nie powiodło się: interfejs poprawnie pokazał NIEDOSTĘPNA, brak prognozy i opcjonalny przycisk DEMO; nie udawał pogody LIVE.
- Podgląd w przeglądarce aplikacji: szerokości 375, 390, 430, 768 i 1440 px. Brak poziomego przepełnienia całej strony. Przewijane listy okresów i tabela godzinowa.
- Pomiar elementów KPI: identyczna współrzędna Y, wysokość i rozmiar fontu liczby oraz godziny na wszystkich pięciu szerokościach (36 px telefon, 34 px tablet, 40 px desktop).
- Ręczne testy w przeglądarce: wybór jutra zaczyna od 00:00, wybór ostatniego okresu pokazuje Brak, przełącznik całego dnia i wyszukiwarka poprawnie filtrują fikcyjne loty.
- Zapisano podgląd telefonu i desktopu do akceptacji.
- Przegląd wizualny podglądu telefonu i desktopu.

Ograniczenia: testy rozmiarów wykonano w przeglądarce aplikacji, nie na fizycznym iPhonie ani w Safari. Uruchomienie osobnego headless Chrome zostało zablokowane przez środowisko; testy interfejsu wykonano przez dostępną przeglądarkę. Nie testowano LIVE przylotów, bo brak zatwierdzonego feedu. Żaden test nie potwierdza operacyjnego wyboru pasa przez ATC.
