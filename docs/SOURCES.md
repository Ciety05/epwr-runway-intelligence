# Źródła danych — weryfikacja 2026-10-09

## Oficjalne przyloty i rozkład EPWR

1. Tablica przylotów Portu Lotniczego Wrocław:
   https://airport.wroclaw.pl/pasazer/odwoze-odbieram/przyloty/
2. Oficjalny rozkład lotów:
   https://airport.wroclaw.pl/pasazer/odlatuje/rozklad-lotow/
3. Kontakt operatora:
   https://airport.wroclaw.pl/kontakt/

To źródła operatora lotniska do ręcznego sprawdzania informacji. Rozkład i tablica statusów mają różne zadania: planowane godziny nie gwarantują rzeczywistego czasu przylotu. Lotnisko sugeruje weryfikację rozkładu u przewoźnika. Publiczna strona nie stanowi sama w sobie potwierdzenia prawa do redystrybucji.

W sprawdzonych stronach i wyszukiwaniu w domenie nie potwierdzono udokumentowanego publicznego API, licencji na automatyczną redystrybucję, gwarancji dostępności ani horyzontu danych. To wynik ograniczonej weryfikacji, nie twierdzenie, że operator nie oferuje płatnego lub partnerskiego feedu. Nie wdrożono scrapera, nie odgadywano endpointów i nie korzystano z prywatnych zapytań strony.

Najbardziej wiarygodna droga do LIVE: uzgodnić z operatorem dostęp do oficjalnego feedu i warunki wykorzystania albo wybrać licencjonowanego dostawcę po potwierdzeniu pokrycia WRO i praw wyświetlania. Przed integracją potwierdzić:
- udokumentowany format, identyfikatory i strefę czasową;
- rozkład 7-dniowy versus statusy dnia bieżącego, aktualizacje, odwołania, codeshare;
- licencję, atrybucję, cache, limity i dostępność;
- timestamp źródła i limit świeżości, deduplikację codeshare;
- bezpieczny serwer dla kluczy (nigdy w statycznym frontendzie);
- stan NIEDOSTĘPNE zamiast 0 w KPI, gdy feed nie działa.

Ta wersja nie ma adaptera LIVE lotów: każde zliczenie i każdy lot są jawnie DEMO. Loty DEMO nie są kopiami oficjalnego rozkładu.

## Pogoda

Dokumentacja: https://open-meteo.com/en/docs
Warunki: https://open-meteo.com/en/terms
Atrybucja: https://open-meteo.com/ — CC BY 4.0.

Udokumentowany endpoint:
https://api.open-meteo.com/v1/forecast

Parametry: latitude=51.1027, longitude=16.8858, hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m, wind_speed_unit=kn, timeformat=unixtime, timezone=Europe/Warsaw, forecast_days=7.

Darmowy endpoint jest przeznaczony do użytku niekomercyjnego. Warunki określają limity <10 000 wywołań dziennie, 5 000 na godzinę, 600 na minutę; brak gwarancji nieprzerwanej dostępności. Przed wykorzystaniem komercyjnym wybrać właściwy plan. Nie podawać klucza płatnego API w kodzie klienta.

Prognoza na 10 m nie jest METAR ani pomiarem na progu pasa. Kierunek wiatru oznacza kierunek, z którego wieje. Unix epoch usuwa zależność od strefy ustawionej na urządzeniu i zachowuje obie powtarzające się godziny podczas DST. LIVE opisuje połączenie z dostawcą prognozy, nie decyzję o używanym pasie.

## Publikacja

Brak wdrożenia Pages, workflow wdrożeniowego, sekretów i zmian ustawień repozytorium. PR służy do przeglądu i akceptacji.
