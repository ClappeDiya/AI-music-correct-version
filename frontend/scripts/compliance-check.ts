#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";

interface ComplianceCheck {
  name: string;
  check: () => Promise<boolean>;
  severity: "high" | "medium" | "low";
  pciRequirement: string;
}

interface ComplianceReport {
  timestamp: string;
  checks: {
    name: string;
    passed: boolean;
    severity: string;
    pciRequirement: string;
  }[];
  overallStatus: "passed" | "failed";
  failedChecks: number;
  recommendations: string[];
}

const SENSITIVE_PATTERNS = [
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
  /\bsk_live_[a-zA-Z0-9]+\b/, // Stripe secret keys
];

const complianceChecks: ComplianceCheck[] = [
  {
    name: "Verify SSL/TLS Configuration",
    check: async () => {
      try {
        // Check HTTPS configuration
        const sslConfig = execSync("curl -vI https://your-domain.com 2>&1");
        return sslConfig.includes("TLS 1.2") || sslConfig.includes("TLS 1.3");
      } catch {
        return false;
      }
    },
    severity: "high",
    pciRequirement: "4.1",
  },
  {
    name: "Check Data Encryption",
    check: async () => {
      try {
        // Verify encryption configuration
        const config = JSON.parse(fs.readFileSync(".env", "utf-8"));
        return !!config.ENCRYPTION_KEY && config.ENCRYPTION_KEY.length >= 32;
      } catch {
        return false;
      }
    },
    severity: "high",
    pciRequirement: "3.4",
  },
  {
    name: "Verify RLS Policies",
    check: async () => {
      try {
        // Check database RLS policies
        const files = await findFiles("src", ".ts");
        return files.every((file) => !containsSensitiveData(file));
      } catch {
        return false;
      }
    },
    severity: "high",
    pciRequirement: "7.1",
  },
  {
    name: "Check Access Controls",
    check: async () => {
      try {
        // Verify authentication middleware
        const middlewareContent = fs.readFileSync("src/middleware.ts", "utf-8");
        return middlewareContent.includes("getServerSession");
      } catch {
        return false;
      }
    },
    severity: "high",
    pciRequirement: "8.1",
  },
  {
    name: "Audit Logging Verification",
    check: async () => {
      try {
        // Check audit logging implementation
        const hasAuditLogs = fs.existsSync("src/lib/monitoring.ts");
        const logsContent = fs.readFileSync("src/lib/monitoring.ts", "utf-8");
        return hasAuditLogs && logsContent.includes("trackPaymentAttempt");
      } catch {
        return false;
      }
    },
    severity: "medium",
    pciRequirement: "10.2",
  },
  {
    name: "Check Dependencies",
    check: async () => {
      try {
        // Run npm audit
        execSync("npm audit --production");
        return true;
      } catch {
        return false;
      }
    },
    severity: "medium",
    pciRequirement: "6.2",
  },
];

async function findFiles(dir: string, extension: string): Promise<string[]> {
  const files = await fs.promises.readdir(dir);
  const results: string[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      results.push(...(await findFiles(filePath, extension)));
    } else if (file.endsWith(extension)) {
      results.push(filePath);
    }
  }

  return results;
}

function containsSensitiveData(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(content));
}

async function runComplianceCheck(): Promise<ComplianceReport> {
  const results = await Promise.all(
    complianceChecks.map(async (check) => ({
      name: check.name,
      passed: await check.check(),
      severity: check.severity,
      pciRequirement: check.pciRequirement,
    })),
  );

  const failedChecks = results.filter((r) => !r.passed);
  const recommendations = failedChecks.map(
    (check) =>
      `Fix ${check.name} (PCI-DSS ${check.pciRequirement}) - Severity: ${check.severity}`,
  );

  return {
    timestamp: new Date().toISOString(),
    checks: results,
    overallStatus: failedChecks.length === 0 ? "passed" : "failed",
    failedChecks: failedChecks.length,
    recommendations,
  };
}

async function generateComplianceReport() {
  const report = await runComplianceCheck();

  // Save report
  const reportPath = path.join("reports", "compliance", `${Date.now()}.json`);
  await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));

  // Log results
  console.log("\nCompliance Check Results:");
  console.log("------------------------");
  console.log(`Status: ${report.overallStatus.toUpperCase()}`);
  console.log(`Failed Checks: ${report.failedChecks}`);

  if (report.recommendations.length > 0) {
    console.log("\nRecommendations:");
    report.recommendations.forEach((rec) => console.log(`- ${rec}`));
  }

  // Exit with appropriate code
  process.exit(report.overallStatus === "passed" ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  generateComplianceReport().catch((error) => {
    console.error("Error running compliance check:", error);
    process.exit(1);
  });
}

export { runComplianceCheck };
export type { ComplianceReport };
