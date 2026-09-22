# Security

- Report vulnerabilities privately through GitHub Security Advisories:
  open the **Security** tab of
  [ThyFriendlyFox/GraphComp](https://github.com/ThyFriendlyFox/GraphComp)
  and select **Report a vulnerability**. **Never open a public issue for
  a vulnerability.**
- Acknowledgment within 72 hours; fix-or-plan within 14 days;
  coordinated disclosure after a fix ships.
- Supported: latest minor release, unless stated otherwise.
- GraphComp ships source code that runs in your app. A fix reaches you
  only when you re-add the affected component (`npx shadcn add …`) or
  apply the patch from the advisory.
- Secrets never enter the repo — not code, config, fixtures, or history.
  CI uses Actions secrets; local dev uses untracked `.env` with a
  committed `.env.example`.
- For the agent: security-shaped work overrides normal routing. A
  security fix may ship out-of-band as a patch release at any time,
  without waiting for the weekly cycle.
