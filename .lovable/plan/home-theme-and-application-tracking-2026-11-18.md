# Home theme and application tracking

## What will change
- Restyle the welcome screen using the portal's semantic background, frosted-glass surfaces, and emerald design tokens so it matches the application pages.
- Add the requested CNIC field, formatted entry, validation, and Track Status action on the welcome screen.
- Show the ten requested timeline stages and clearly distinguish the current stage, completed stages, and warning/refused/cancelled outcomes. Show the requested no-record message after a successful lookup with no result.

## Privacy boundary
- Preserve the existing authenticated-only `track_application` lookup and its owner filter. Do not make status lookup public by CNIC alone.
- Ask signed-out visitors to sign in before checking. For signed-in visitors, the existing lookup returns only an application belonging to that account; a different CNIC cannot reveal another applicant's status.

## Technical approach
- Keep the existing TanStack routes, Cloud function, schema, and seven-step application flow unchanged. Implement the interface in the existing welcome route and use its current tracking RPC.
- Define the requested palette in semantic CSS tokens and use the existing glass-card and button styles.
- Verify the welcome screen and both matched/no-match tracking states, plus the project's tests and typecheck.
