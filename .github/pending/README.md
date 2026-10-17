`ci.yml` belongs in `.github/workflows/`. It waits here until the pushing account's GitHub token has
the `workflow` scope (`gh auth refresh -s workflow`); then `git mv .github/pending/ci.yml .github/workflows/`.
