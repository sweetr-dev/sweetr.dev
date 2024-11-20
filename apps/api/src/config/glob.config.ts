const dependencyLockGlobs = [
  "**/package-lock.json", // JavaScript/TypeScript - npm lock file
  "**/yarn.lock", // JavaScript/TypeScript - Yarn lock file
  "**/pnpm-lock.yaml", // JavaScript/TypeScript - pnpm lock file

  "**/Pipfile.lock", // Python - Pipenv lock file
  "**/poetry.lock", // Python - Poetry lock file
  "**/requirements.txt", // Python - Often used for dependency freezing

  "**/Gemfile.lock", // Ruby - Bundler lock file

  "**/composer.lock", // PHP - Composer lock file

  "**/pom.xml", // Java - Maven dependency file (often committed for reproducibility)
  "**/build.gradle.lockfile", // Java/Kotlin - Gradle lock file

  "**/packages.lock.json", // C# - NuGet lock file
  "**/project.assets.json", // C# - Dependency lock file for .NET Core

  "**/Cargo.lock", // Rust - Cargo lock file

  "**/go.sum", // Go - Dependency version lock file

  "**/pubspec.lock", // Dart/Flutter - Lock file

  "**/mix.lock", // Elixir - Mix lock file

  "**/stack.lock", // Haskell - Stack lock file
  "**/cabal.project.freeze", // Haskell - Cabal freeze file

  "**/Package.resolved", // Swift - Swift Package Manager lock file

  "**/build.gradle.lockfile", // Kotlin - Gradle lock file (Kotlin uses Gradle too)
];

const testGlobs = ["**/fixtures/**", "*.snap"];

export default {
  ignorableFilesGlob: [...dependencyLockGlobs, ...testGlobs],
};
