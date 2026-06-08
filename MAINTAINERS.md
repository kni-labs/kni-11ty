Maintainers Guide — kni-11ty
=================================

This file is for maintainers of the `kni-11ty` template only. It is intentionally removed by the first-run `postinstall` script so template consumers do not keep implementation details in their projects.

If you are maintaining this template, keep these notes up to date.

Quick checklist
---------------

- Template must not contain a committed `src/styles/` directory or a `.stylelintrc.cjs` file if you want first-run seeding to occur for consumers.
- The installer lives at `scripts/kni-cascade-postinstall.js`. Changes to seeding behavior should be made there.
- The installer will: install `kni-cascade`, copy `scss/` into `src/styles/`, copy `.stylelintrc.cjs`, write `postcss.config.js` to include `postcss-pxv()` when available, update `package.json` and `README.md` during interactive init, then remove the `scripts/` folder and this `MAINTAINERS.md` file on success.


Notes on README placeholders
---------------------------

The template `README.md` contains `__PROJECT_NAME__` and `__PROJECT_DESCRIPTION__` placeholders. The installer will replace these during interactive initialization when run in a TTY.

Restoring MAINTAINERS.md for local maintenance
---------------------------------------------

If you want to re-run the installation flow locally while keeping `MAINTAINERS.md`, copy the file into a temp workspace or comment out the deletion code in `scripts/kni-cascade-postinstall.js` while testing. Remember to revert any such changes before committing.

Security & CI notes
-------------------

- The installer uses `pnpm add -D kni-labs/kni-cascade` to pull the cascade on first-run. If you publish this template to a registry or GitHub templates, consider pinning versions or documenting expected behavior for users.
- `pnpm` may prompt about build scripts for some dependencies; maintainers can run `pnpm approve-builds` as needed in CI contexts.

Contact
-------

For questions about the cascade or the installer, contact the owning team.

Development
-----------

For interactive development (watching styles and serving the site) run:

```bash
pnpm start
```

For a one-off CSS compilation:

```bash
pnpm run css:build
```
