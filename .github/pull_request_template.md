### ️🪄 Changes

-   List significant changes

<!-- Delete this comment if you need '💥 Breaking Changes'
#### 💥 Breaking Changes

-

<!-- (optional) -->

<!-- Delete this comment if you need '🚧 TODO'
### 🚧 TODO

- [ ]

<!-- (optional - recommended for draft PRs) -->

### 🧪 What/How to test this PR

-   Briefly outline what and how to test changes in this PR

### ✅ Checklist

<!-- Please ensure all of these points are covered before marking the PR as ready for review: -->

-   [ ] All linter warnings are resolved and code is formatted (`npm run fix`)
-   [ ] Nothing is broken
    -   Affected projects build and test with successfully (`npm run affected`)
    -   Apps can be served (`npm run dev`)
-   [ ] Package/API versions incremented according to [semantic versioning](https://semver.org/), `package-lock.json` updated (`npm i`)
-   [ ] Changes to ENV variables are reflected in the respective `env.sample` files
-   [ ] Breaking changes flagged

#### Basic

-   [ ] Code is sufficiently documented with comments
-   [ ] Docs updated to reflect changes
-   [ ] All code used for temporary testing removed (`console.log()` etc.)
-   [ ] Outstanding todos marked with `@TODO` comments
-   [ ] All commented out code removed

#### Backend only

<!-- Feel free to remove/ignore this section if the PR only contains frontend changes -->

-   [ ] If the schema changed, migrations are generated and tested

#### Frontend only

<!-- Feel free to remove/ignore this section if the PR only contains backend changes -->

-   [ ] Tested on mobile device
