---
title: Mirroring a Maven GitHub Package in jFrog
tags: [cicd, monorepo, github]
date: 2024-07-02
---

In our Kotlin monorepo, we recently had a team who wanted to experiment with a Maven package that was published on GitHub Packages.

Unlike most public registries, GitHub Packages requires authentication to read (download) packages. We don't like to introduce new required credentials at the settings level, so rather than adding it using GitHub's instructions, we wanted to mirror it in jFrog Artifactory -- this would allow us to reuse the same credentials all developers already have configured locally.

## Configuring a token in GitHub

First, you'll need to configure a token for authentication in GitHub. Go to _Settings_ > _Developer Settings_ > _Personal access tokens_ > _Tokens (classic)_, then create a new token. The token must be a classic (not fine-grained) token to work for public package authentication. For scopes, select `read:packages` only.

To confirm your token will work properly, you can construct a test CURL command. As an example: in our case, we wanted to use the package `io.hotmic.player.hotmic-android-sdk` housed at GitHub project [hotmic-wp/android-sdk](https://github.com/hotmic-wp/android-sdk). If you go to the project and look at the latest package release, it'll give you some Maven XML describing the `groupId` and `artifactId`:

```xml
<dependency>
  <groupId>io.hotmic.player</groupId>
  <artifactId>hotmic-android-sdk</artifactId>
  <version>1.9.1-alpha1</version>
</dependency>
```````

Given the repo _user_ (`hotmic-wp`), the _repo_ (`android-sdk`), the _groupId_ (`io.hotmic.player`) and the _artifactId_ (`hotmic-android-sdk`), we can ask for the Maven metadata for the package on GitHub:

```console
curl -u "GITHUB_USER_ID:GITHUB_TOKEN" \
  "https://maven.pkg.github.com/hotmic-wp/android-sdk/io.hotmic.player/hotmic-android-sdk/maven-metadata.xml"
```

If this spits out a block of XML describing recent published versions, the token is ready!

## Creating a jFrog Mirror

On the Administration tab of jFrog, go to _Remote_ and select _Create Remote Repository_.

 * Select a name for the mirror (for example, `github-hotmic-wp-android-sdk` would be descriptive in this case).
 * For URL, enter `https://maven.pkg.github.com/USER/REPO` (in this case, `https://maven.pkg.github.com/hotmic-wp/android-sdk`).
 * For the credentials, enter the GITHUB_USER_ID and GITHUB_TOKEN values you used in the example CURL command above.
 * On the _Advanced_ tab, check the _Bypass HEAD requests_ checkbox (this is important for GitHub Packages).

Note that due to the structure of GitHub Packages repos, jFrog's normal "Test" button **will not work!** Don't bother using this feature to validate your credentials. Instead, create your remote repository, and then test it by using a new CURL command. In this case it will be the exact same URI as before, but we'll replace `maven.pkg.github.com/USER/REPO/` with `COMPANY.jfrog.io/artifactory/NEW_REPO_NAME/`. For this request, you'll use your existing jFrog authorization token:

```console
curl -H "Authorization: Bearer YOUR_JFROG_API_TOKEN" \
  https://COMPANY.jfrog.io/artifactory/github-hotmic-wp-android-sdk/io.hotmic.player/hotmic-android-sdk/maven-metadata.xml
```

After a brief pause, this should return the same block of metadata XML that the first CURL command returned. If it did, the jFrog mirror is now ready to use!

## Configuring Gradle

In your `settings.gradle.kts`, add the following to your `repositories` block (replace the credentials with whatever credentials your developers typically use for access to jFrog).

```kotlin
// https://github.com/hotmic-wp/android-sdk
maven(url = uri("https://COMPANY.jfrog.io/artifactory/github-hotmic-wp-android-sdk")) {
    credentials {
        username = System.getenv("JFROG_USERNAME")
        password = System.getenv("JFROG_TOKEN")
    }
    content {
        includeGroup("io.hotmic.player")
    }
}
```

Note the comment above the block: this helps keep track of the original source of truth for the package being used.

## Final thoughts

If you have to consume several GitHub packages this way, a common jFrog pattern is to take multiple remote mirrors and combine them into a single virtual repository. If you go this route, I recommend documenting the sources of truth using comments like above, and judicious `includeGroup()` policies, so that developers in the repo don't need to be jFrog admins to know where their packages are coming from.

Because it will be stored in jFrog for months at a time, you'll want a long-lived API token for your `read:packages` GitHub token. Unfortunately, there's no way to generate such a thing using a GitHub App, so you'll likely need a bot/service account for your GitHub org to generate this. This isn't ideal, as service accounts are somewhat messy; perhaps the [recent announcement](https://github.blog/2024-05-29-github-and-jfrog/) about the GitHub-jFrog collaboration will improve this situation in the future.

Thanks for reading!
