#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const migrationsDir = path.join(repoRoot, "supabase", "migrations");
const reportPath = path.join(repoRoot, "docs", "supabase-migration-risk-report.md");

const args = new Set(process.argv.slice(2));
const linked = args.has("--linked");
const writeReport = args.has("--write-report");
const failOnPending = args.has("--fail-on-pending");

const highRiskSignals = [
  { label: "drops database objects", pattern: /\bdrop\s+(table|schema|column|type|function|view|policy|trigger|extension)\b/i },
  { label: "deletes or truncates data", pattern: /\b(delete\s+from|truncate\s+table)\b/i },
  { label: "drops table columns", pattern: /\balter\s+table\b[\s\S]{0,400}\bdrop\s+column\b/i },
  { label: "renames schema objects", pattern: /\brename\s+(table|column|constraint|to)\b/i },
  { label: "adds not-null constraints", pattern: /\bset\s+not\s+null\b/i },
  { label: "revokes privileges", pattern: /\brevoke\b/i },
  { label: "adds security definer code", pattern: /\bsecurity\s+definer\b/i },
];

const mediumRiskSignals = [
  { label: "changes RLS policies", pattern: /\b(create|alter|drop)\s+policy\b|\benable\s+row\s+level\s+security\b|\bdisable\s+row\s+level\s+security\b/i },
  { label: "changes storage/auth schemas", pattern: /\b(storage|auth)\./i },
  { label: "changes grants", pattern: /\bgrant\b/i },
  { label: "alters tables", pattern: /\balter\s+table\b/i },
  { label: "changes functions", pattern: /\b(create\s+or\s+replace\s+function|create\s+function|drop\s+function)\b/i },
  { label: "changes triggers", pattern: /\b(create|drop)\s+trigger\b/i },
  { label: "changes publications or realtime identity", pattern: /\bpublication\b|\breplica\s+identity\b/i },
];

function parseJsonPayload(text) {
  const startCandidates = [text.indexOf("["), text.indexOf("{")].filter((index) => index >= 0);
  if (startCandidates.length === 0) {
    throw new Error("No JSON payload found in Supabase CLI output.");
  }

  const start = Math.min(...startCandidates);
  const open = text[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === open) {
      depth += 1;
    } else if (char === close) {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(text.slice(start, i + 1));
      }
    }
  }

  throw new Error("Could not parse complete JSON payload from Supabase CLI output.");
}

function powerShellQuote(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function runSupabase(args) {
  if (process.platform === "win32") {
    return spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        `supabase ${args.map(powerShellQuote).join(" ")}`,
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 16,
      },
    );
  }

  return spawnSync("supabase", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
}

async function getLocalMigrations() {
  if (!existsSync(migrationsDir)) {
    throw new Error(`Missing migrations directory: ${migrationsDir}`);
  }

  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
  const migrations = [];
  const invalid = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".sql")) {
      continue;
    }

    const match = /^(\d{14})_(.*)\.sql$/.exec(entry.name);
    if (!match) {
      invalid.push(entry.name);
      continue;
    }

    const filePath = path.join(migrationsDir, entry.name);
    const sql = await fs.readFile(filePath, "utf8");
    migrations.push({
      version: match[1],
      name: match[2],
      file: entry.name,
      path: filePath,
      hash: createHash("sha256").update(sql).digest("hex"),
      sql,
    });
  }

  migrations.sort((a, b) => a.version.localeCompare(b.version) || a.file.localeCompare(b.file));
  return { migrations, invalid };
}

function getDuplicateVersions(migrations) {
  const byVersion = new Map();
  for (const migration of migrations) {
    const list = byVersion.get(migration.version) ?? [];
    list.push(migration.file);
    byVersion.set(migration.version, list);
  }

  return [...byVersion.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([version, files]) => ({ version, files }));
}

function getDuplicateHashes(migrations) {
  const byHash = new Map();
  for (const migration of migrations) {
    const list = byHash.get(migration.hash) ?? [];
    list.push(migration.file);
    byHash.set(migration.hash, list);
  }

  return [...byHash.values()].filter((files) => files.length > 1);
}

function queryRemoteMigrations() {
  const sql = "select version, coalesce(name, '') as name from supabase_migrations.schema_migrations order by version;";
  const result = runSupabase(["db", "query", "--agent=no", "--linked", "-o", "json", sql]);

  if (result.status !== 0) {
    throw new Error([
      "Supabase linked migration query failed.",
      result.error?.message,
      (result.stdout ?? "").trim(),
      (result.stderr ?? "").trim(),
    ].filter(Boolean).join("\n"));
  }

  return parseJsonPayload(`${result.stdout ?? ""}\n${result.stderr ?? ""}`).map((row) => ({
    version: String(row.version),
    name: row.name ?? "",
  }));
}

function classifyMigration(migration) {
  const signals = [];
  for (const signal of highRiskSignals) {
    if (signal.pattern.test(migration.sql)) {
      signals.push(signal.label);
    }
  }

  if (signals.length > 0) {
    return { level: "high", signals };
  }

  for (const signal of mediumRiskSignals) {
    if (signal.pattern.test(migration.sql)) {
      signals.push(signal.label);
    }
  }

  return {
    level: signals.length > 0 ? "medium" : "low",
    signals,
  };
}

function buildComparison(localMigrations, remoteMigrations) {
  const localByVersion = new Map(localMigrations.map((migration) => [migration.version, migration]));
  const remoteByVersion = new Map(remoteMigrations.map((migration) => [migration.version, migration]));
  const localOnly = localMigrations.filter((migration) => !remoteByVersion.has(migration.version));
  const remoteOnly = remoteMigrations.filter((migration) => !localByVersion.has(migration.version));

  return {
    matched: localMigrations.filter((migration) => remoteByVersion.has(migration.version)),
    localOnly,
    remoteOnly,
  };
}

function renderReport({ localMigrations, remoteMigrations, invalid, duplicateVersions, duplicateHashes, comparison, riskRows }) {
  const byRisk = {
    high: riskRows.filter((row) => row.risk.level === "high"),
    medium: riskRows.filter((row) => row.risk.level === "medium"),
    low: riskRows.filter((row) => row.risk.level === "low"),
  };

  const lines = [
    "# Supabase Migration Risk Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Local migrations: ${localMigrations.length}`,
    `- Remote migrations: ${remoteMigrations.length}`,
    `- Matched versions: ${comparison.matched.length}`,
    `- Local-only pending migrations: ${comparison.localOnly.length}`,
    `- Remote-only missing local migrations: ${comparison.remoteOnly.length}`,
    `- Invalid local filenames: ${invalid.length}`,
    `- Duplicate local versions: ${duplicateVersions.length}`,
    `- Duplicate local SQL hashes: ${duplicateHashes.length}`,
    "",
    "## Pending Local Migrations",
    "",
    `- High risk: ${byRisk.high.length}`,
    `- Medium risk: ${byRisk.medium.length}`,
    `- Low risk: ${byRisk.low.length}`,
    "",
  ];

  for (const level of ["high", "medium", "low"]) {
    const rows = byRisk[level];
    lines.push(`### ${level[0].toUpperCase()}${level.slice(1)} Risk`, "");
    if (rows.length === 0) {
      lines.push("None.", "");
      continue;
    }

    lines.push("| Version | File | Signals |", "|---|---|---|");
    for (const row of rows) {
      const signals = row.risk.signals.length > 0 ? row.risk.signals.join(", ") : "schema additive or data-safe pattern";
      lines.push(`| ${row.version} | \`${row.file}\` | ${signals} |`);
    }
    lines.push("");
  }

  if (comparison.remoteOnly.length > 0) {
    lines.push("## Remote-Only Migrations", "", "| Version | Name |", "|---|---|");
    for (const row of comparison.remoteOnly) {
      lines.push(`| ${row.version} | ${row.name || "(blank)"} |`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function printLocalSummary({ localMigrations, invalid, duplicateVersions, duplicateHashes }) {
  console.log("Supabase migration local integrity");
  console.log(`- Local migrations: ${localMigrations.length}`);
  console.log(`- Invalid filenames: ${invalid.length}`);
  console.log(`- Duplicate versions: ${duplicateVersions.length}`);
  console.log(`- Duplicate SQL hashes: ${duplicateHashes.length}`);
}

async function main() {
  const { migrations: localMigrations, invalid } = await getLocalMigrations();
  const duplicateVersions = getDuplicateVersions(localMigrations);
  const duplicateHashes = getDuplicateHashes(localMigrations);

  printLocalSummary({ localMigrations, invalid, duplicateVersions, duplicateHashes });

  if (invalid.length > 0) {
    console.error(`Invalid migration filenames:\n${invalid.map((file) => `- ${file}`).join("\n")}`);
  }

  if (duplicateVersions.length > 0) {
    console.error("Duplicate migration versions:");
    for (const duplicate of duplicateVersions) {
      console.error(`- ${duplicate.version}: ${duplicate.files.join(", ")}`);
    }
  }

  let hasFailure = invalid.length > 0 || duplicateVersions.length > 0;

  if (linked) {
    const remoteMigrations = queryRemoteMigrations();
    const comparison = buildComparison(localMigrations, remoteMigrations);
    const riskRows = comparison.localOnly.map((migration) => ({
      ...migration,
      risk: classifyMigration(migration),
    }));
    const riskCounts = {
      high: riskRows.filter((row) => row.risk.level === "high").length,
      medium: riskRows.filter((row) => row.risk.level === "medium").length,
      low: riskRows.filter((row) => row.risk.level === "low").length,
    };

    console.log("");
    console.log("Linked Supabase migration drift");
    console.log(`- Remote migrations: ${remoteMigrations.length}`);
    console.log(`- Matched versions: ${comparison.matched.length}`);
    console.log(`- Local-only pending: ${comparison.localOnly.length}`);
    console.log(`- Remote-only missing locally: ${comparison.remoteOnly.length}`);
    console.log(`- Pending risk: high=${riskCounts.high}, medium=${riskCounts.medium}, low=${riskCounts.low}`);

    if (comparison.remoteOnly.length > 0) {
      console.error("Remote-only migrations are missing locally:");
      for (const migration of comparison.remoteOnly) {
        console.error(`- ${migration.version}_${migration.name || ""}`);
      }
      hasFailure = true;
    }

    if (failOnPending && comparison.localOnly.length > 0) {
      console.error("--fail-on-pending was set and local-only migrations remain.");
      hasFailure = true;
    }

    if (writeReport) {
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, renderReport({
        localMigrations,
        remoteMigrations,
        invalid,
        duplicateVersions,
        duplicateHashes,
        comparison,
        riskRows,
      }));
      console.log(`- Wrote report: ${path.relative(repoRoot, reportPath)}`);
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
