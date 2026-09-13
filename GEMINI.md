# Mandatory Project & Git Workflow Rules

## 1. Ticket Herkenning, Chat Hernoemen & Header (Linear Integratie)
Wanneer de gebruiker een ticketnummer noemt of typt (bijvoorbeeld `GOF-40`):
1. **Ophalen via Linear**: Haal direct via `linear-mcp-server` de officiële details van het ticket op (titel, status, omschrijving, URL).
2. **Chat Hernoemen**: Hernoem de chat/sessie direct naar `[Ticketnummer] + [Ticket titel]` (bijvoorbeeld `GOF-40: Home | Training readiness wordt niet goed getoond op mobiel`).
3. **Prominente Header**: Start het antwoord in de chat ALTIJD direct met een duidelijke H1 header inclusief link:
   `# [GOF-XX: <Titel>](<Linear URL>)`
4. Geef een beknopte toelichting van de ticketvraag en ga direct aan de slag met de implementatie.

## 2. Volledige Ontwikkelworkflow
Voor ELKE taak, bugfix of feature in dit project doorloopt de AI assistent automatisch de volledige workflow:

1. **Pull & Sync**:
   - Voer `git checkout main` en `git pull origin main` uit om up-to-date te starten.

2. **Branch**:
   - Maak een passende feature/fix branch aan met het Linear branch format: `git checkout -b <branchName>` (bijv. `edweerdt/gof-XX-<slug>`).

3. **Implementatie & Tests**:
   - Voer de codewijzigingen door.
   - Draai altijd `npm test` en zorg dat alle tests slagen.

4. **Commit & Push**:
   - Voeg gewijzigde bestanden toe (`git add`).
   - Maak een duidelijke commit (`git commit -m "<type>(<scope>): <beschrijving> (GOF-XX)"`).
   - Push direct naar remote (`git push -u origin <branch>`).

5. **Pull Request Link & Ticket Update**:
   - Deel direct de GitHub PR link in de chat (`https://github.com/edweerdt/GoFitness/compare/main...<branch>?expand=1`).
   - Plaats een samenvattend comment met de PR-link op het Linear ticket.

6. **Acceptatie & Done**:
   - **BELANGRIJK:** Het ticket op Linear mag **PAS op 'Done' gezet worden nadat de gebruiker de wijzigingen/PR expliciet heeft beoordeeld en geaccepteerd**.
