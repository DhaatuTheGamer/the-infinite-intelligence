# Workflow & Standards

## Development Lifecycle
1.  **Research**: Validate API capabilities and UI patterns.
2.  **Strategy**: Define track plans in `conductor/tracks/<track_id>/plan.md`.
3.  **Execution**: Implement features with surgical precision.
4.  **Validation**: Test logic in `vitest` and manual UI verification.

## Git Standards
- **Commits**: Clear, concise, and focused on "why" (e.g., `feat: add sequential collaboration mode`).
- **Branching**: Use feature branches for major tracks.

## AI Safety & Security
- **API Keys**: Never commit `.env` files. Use the `VITE_` prefix for client-side keys.
- **Safety Settings**: Enforce Gemini safety filters to prevent harmful output.
