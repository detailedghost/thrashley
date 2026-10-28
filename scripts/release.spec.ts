import { describe, expect, test } from "bun:test";
import { bumpVersion, renderNotes } from "./release";

describe("bumpVersion", () => {
	test("bumps each part and resets the lower parts", () => {
		expect(bumpVersion("v1.2.3", "patch")).toBe("1.2.4");
		expect(bumpVersion("v1.2.3", "minor")).toBe("1.3.0");
		expect(bumpVersion("v1.2.3", "major")).toBe("2.0.0");
	});

	test("rejects a tag that is not semver", () => {
		expect(() => bumpVersion("v1.2", "patch")).toThrow("Invalid semver: v1.2");
	});
});

describe("renderNotes", () => {
	const repo = "detailedghost/thrashley";

	test("groups Conventional Commits by type and links the PR", () => {
		const notes = renderNotes(
			"1.1.0",
			"2026-10-28",
			[
				{
					subject: "feat(action): add a heading input (#4)",
					author: "Dante Burgos",
				},
				{ subject: "fix(install): retry the download", author: "Dante Burgos" },
				{
					subject: "docs(readme): list the setup modes (#1)",
					author: "dependabot[bot]",
				},
			],
			repo,
		);
		expect(notes).toBe(`## v1.1.0 (2026-10-28)

### 🚀 Features

- **action:** add a heading input ([#4](https://github.com/detailedghost/thrashley/pull/4))

### 🩹 Fixes

- **install:** retry the download

### 📖 Documentation

- **readme:** list the setup modes ([#1](https://github.com/detailedghost/thrashley/pull/1))

### ❤️ Thank You

- Dante Burgos
`);
	});

	test("lists a breaking change in its own section too", () => {
		const notes = renderNotes(
			"2.0.0",
			"2026-10-28",
			[
				{
					subject: "feat(action)!: drop the backend input",
					author: "Dante Burgos",
				},
			],
			repo,
		);
		expect(notes).toContain(
			"### ⚠️ Breaking Changes\n\n- **action:** drop the backend input",
		);
		expect(notes).toContain(
			"### 🚀 Features\n\n- **action:** drop the backend input",
		);
	});

	test("leaves out a subject that is not a Conventional Commit", () => {
		const notes = renderNotes(
			"1.0.1",
			"2026-10-28",
			[{ subject: "Merge branch x", author: "Dante Burgos" }],
			repo,
		);
		expect(notes).not.toContain("Merge branch");
	});
});
