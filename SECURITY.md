# Security

## Reporting a problem

If you find a security issue, please don't open a public issue. Use GitHub's private reporting instead: go to the **Security** tab of this repo and click **Report a vulnerability**. A maintainer will reply there.

## If you committed a secret

It happens. Do this right away:

1. Revoke or rotate the key with whoever issued it. Deleting the commit isn't enough, because once a key is pushed to a public fork, assume someone has it.
2. Remove it from your branch and push again.
3. Tell a maintainer in your pull request so we can check nothing else leaked.

## What we do to keep this repo safe

- Only maintainers can merge into `main`, and every change goes through a reviewed pull request.
- Secret scanning with push protection blocks known key formats before they land.
- An automated guard check rejects pull requests that change the repo's workflows or license, add binaries, add `.env` files, or add files over 1 MB.
- Automated workflows run with read-only permissions and never see secrets.
