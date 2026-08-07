# Git & Deployment Workflow Rule

CRITICAL RULE:
- NEVER run `git push`, `npm run deploy`, or any command that deploys or pushes code to a remote repository/production environment UNLESS the user EXPLICITLY requests it in their prompt (e.g. "push to main", "zet live", "deploy").
- Completing a task or executing an implementation plan MUST ONLY include local edits, local tests, and optional local git commits.
- Live deployment is ALWAYS a separate step requiring explicit user prompt.
