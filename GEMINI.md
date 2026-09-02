# Mandatory Git Workflow Rule

Voor ELKE taak, bugfix of feature in dit project moet de AI assistent ALTIJD automatisch de volledige Git workflow doorlopen zonder dat de gebruiker hierom hoeft te vragen:

1. **Pull & Sync**:
   - Voer `git checkout main` en `git pull origin main` uit om up-to-date te starten.

2. **Branch**:
   - Maak een passende feature/fix branch aan: `git checkout -b <type>/<korte-beschrijving>` (of `edweerdt/<taak-beschrijving>`).

3. **Implementatie & Tests**:
   - Voer de codewijzigingen door.
   - Draai altijd `npm test` en zorg dat alle tests slagen.

4. **Commit & Push**:
   - Voeg gewijzigde bestanden toe (`git add`).
   - Maak een duidelijke commit (`git commit -m "<type>(<scope>): <beschrijving>"`).
   - Push direct naar remote (`git push -u origin <branch>`).

5. **Pull Request Link**:
   - Geef aan het einde van het antwoord direct de GitHub PR link naar de gebruiker:
     `https://github.com/edweerdt/GoFitness/compare/main...<branch>?expand=1`
