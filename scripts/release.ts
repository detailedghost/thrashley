import { appendFileSync, writeFileSync } from "node:fs";

export type Bump = "major" | "minor" | "patch";

export interface Commit {
	subject: string;
	author: string;
}

const SECTIONS: [string, string][] = [
	["feat", "🚀 Features"],
	["fix", "🩹 Fixes"],
	["perf", "🔥 Performance"],
	["refactor", "💅 Refactors"],
	["docs", "📖 Documentation"],
	["test", "✅ Tests"],
	["ci", "🤖 CI"],
	["chore", "🏡 Chore"],
	["style", "🎨 Styles"],
];

const CONVENTIONAL = /^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/;
const PR_NUMBER = / \(#(\d+)\)$/;

export function bumpVersion(version: string, bump: Bump): string {
	const parts = version.replace(/^v/, "").split(".").map(Number);
	if (parts.length !== 3 || parts.some(Number.isNaN))
		throw new Error(`Invalid semver: ${version}`);
	const [major, minor, patch] = parts;
	if (bump === "major") return `${major + 1}.0.0`;
	if (bump === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

function entry(scope: string | undefined, text: string, repo: string): string {
	const pr = text.match(PR_NUMBER);
	const body = pr ? text.replace(PR_NUMBER, "") : text;
	const link = pr
		? ` ([#${pr[1]}](https://github.com/${repo}/pull/${pr[1]}))`
		: "";
	return `- ${scope ? `**${scope}:** ` : ""}${body}${link}`;
}

export function renderNotes(
	version: string,
	date: string,
	commits: Commit[],
	repo: string,
): string {
	const groups = new Map<string, string[]>();
	const breaking: string[] = [];
	for (const { subject } of commits) {
		const match = subject.match(CONVENTIONAL);
		if (!match) continue;
		const [, type, scope, bang, text] = match;
		const line = entry(scope, text, repo);
		if (bang) breaking.push(line);
		const section = SECTIONS.find(([key]) => key === type)?.[1];
		if (section) groups.set(section, [...(groups.get(section) ?? []), line]);
	}
	const out = [`## v${version} (${date})`];
	if (breaking.length) out.push("", "### ⚠️ Breaking Changes", "", ...breaking);
	for (const [, section] of SECTIONS) {
		const lines = groups.get(section);
		if (lines) out.push("", `### ${section}`, "", ...lines);
	}
	const authors = [...new Set(commits.map((c) => c.author))].filter(
		(a) => !a.endsWith("[bot]"),
	);
	if (authors.length)
		out.push("", "### ❤️ Thank You", "", ...authors.map((a) => `- ${a}`));
	return `${out.join("\n")}\n`;
}

function git(...args: string[]): string {
	const result = Bun.spawnSync(["git", ...args]);
	if (result.exitCode !== 0)
		throw new Error(`git ${args.join(" ")}: ${result.stderr.toString()}`);
	return result.stdout.toString().trim();
}

function latestTag(): string {
	const tags = git(
		"tag",
		"--list",
		"v[0-9]*.[0-9]*.[0-9]*",
		"--sort=-v:refname",
	);
	return tags.split("\n")[0] || "v0.0.0";
}

function commitsSince(tag: string): Commit[] {
	const range = tag === "v0.0.0" ? "HEAD" : `${tag}..HEAD`;
	const log = git("log", "--format=%s%x1f%an%x1e", range);
	return log
		.split("\x1e")
		.map((record) => record.trim())
		.filter(Boolean)
		.map((record) => {
			const [subject, author] = record.split("\x1f");
			return { subject, author };
		});
}

if (import.meta.main) {
	const bump = process.env.BUMP as Bump;
	if (!["major", "minor", "patch"].includes(bump))
		throw new Error(`BUMP must be major, minor or patch, got "${bump}"`);
	const notesFile = process.env.NOTES_FILE ?? "release-notes.md";
	const previous = latestTag();
	const commits = commitsSince(previous);
	if (!commits.length) throw new Error(`No commits since ${previous}`);
	const version = bumpVersion(previous, bump);
	const date = new Date().toISOString().slice(0, 10);
	writeFileSync(
		notesFile,
		renderNotes(
			version,
			date,
			commits,
			process.env.GITHUB_REPOSITORY ?? "detailedghost/thrashley",
		),
	);
	const output = `tag=v${version}\nprevious=${previous}\n`;
	if (process.env.GITHUB_OUTPUT)
		appendFileSync(process.env.GITHUB_OUTPUT, output);
	process.stdout.write(output);
}
