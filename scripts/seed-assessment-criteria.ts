/**
 * Seed assessment criteria for all 4 templates
 * Run with: pnpm tsx scripts/seed-assessment-criteria.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { assessmentCriteria, assessmentTemplates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL!;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment");
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

// ============================================
// GATE 0: STRATEGIC ASSESSMENT (15 criteria)
// ============================================
const gate0Criteria = [
  {
    criterionCode: "G0-SC-1",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Strategic Alignment",
    description: "Project aligns with government strategic priorities and departmental objectives",
    assessmentQuestion: "Does the project clearly align with current government strategic priorities and departmental objectives?",
    weight: 10.00,
    isCritical: true,
  },
  {
    criterionCode: "G0-SC-2",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Problem Definition",
    description: "Clear articulation of the problem or opportunity being addressed",
    assessmentQuestion: "Is there a clear, evidence-based definition of the problem or opportunity?",
    weight: 8.00,
    isCritical: true,
  },
  {
    criterionCode: "G0-SC-3",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Case for Change",
    description: "Compelling case for why change is needed now",
    assessmentQuestion: "Is there a compelling, evidence-based case for change that justifies the project?",
    weight: 8.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-BC-1",
    dimension: "Strategic",
    category: "Business Case Outline",
    title: "Business Case Outline",
    description: "High-level business case outline prepared",
    assessmentQuestion: "Has a high-level business case outline been prepared covering strategic, economic, commercial, financial, and management dimensions?",
    weight: 7.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-BC-2",
    dimension: "Strategic",
    category: "Business Case Outline",
    title: "Benefits Identification",
    description: "Key benefits identified and described",
    assessmentQuestion: "Have the key benefits been identified and described at a high level?",
    weight: 7.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-BC-3",
    dimension: "Strategic",
    category: "Business Case Outline",
    title: "Cost Estimate",
    description: "High-level cost estimate provided",
    assessmentQuestion: "Is there a high-level cost estimate with appropriate contingency?",
    weight: 6.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-OA-1",
    dimension: "Strategic",
    category: "Options Appraisal",
    title: "Options Identified",
    description: "Range of options identified including do-nothing",
    assessmentQuestion: "Has a range of options been identified, including a do-nothing option?",
    weight: 8.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-OA-2",
    dimension: "Strategic",
    category: "Options Appraisal",
    title: "Initial Options Analysis",
    description: "Initial analysis of options conducted",
    assessmentQuestion: "Has an initial analysis of options been conducted to identify a preferred way forward?",
    weight: 7.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-OA-3",
    dimension: "Strategic",
    category: "Options Appraisal",
    title: "Preferred Option",
    description: "Preferred option identified with rationale",
    assessmentQuestion: "Has a preferred option been identified with clear rationale?",
    weight: 6.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-MG-1",
    dimension: "Management",
    category: "Early Planning",
    title: "Governance Structure",
    description: "Initial governance structure defined",
    assessmentQuestion: "Has an initial governance structure been defined with clear roles and responsibilities?",
    weight: 7.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-MG-2",
    dimension: "Management",
    category: "Early Planning",
    title: "Stakeholder Identification",
    description: "Key stakeholders identified",
    assessmentQuestion: "Have key stakeholders been identified and their interests understood?",
    weight: 6.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-MG-3",
    dimension: "Management",
    category: "Early Planning",
    title: "High-Level Timeline",
    description: "High-level timeline and milestones defined",
    assessmentQuestion: "Has a high-level timeline with key milestones been defined?",
    weight: 5.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-MG-4",
    dimension: "Management",
    category: "Early Planning",
    title: "Risk Identification",
    description: "Major risks identified",
    assessmentQuestion: "Have major risks been identified and initial mitigation strategies considered?",
    weight: 6.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-MG-5",
    dimension: "Management",
    category: "Early Planning",
    title: "Resource Requirements",
    description: "High-level resource requirements identified",
    assessmentQuestion: "Have high-level resource requirements (people, budget, time) been identified?",
    weight: 5.00,
    isCritical: false,
  },
  {
    criterionCode: "G0-MG-6",
    dimension: "Management",
    category: "Early Planning",
    title: "Approval Process",
    description: "Approval process and next steps clear",
    assessmentQuestion: "Is the approval process clear, and are next steps to Gate 1 defined?",
    weight: 4.00,
    isCritical: false,
  },
];

// ============================================
// GATE 1: BUSINESS JUSTIFICATION (30 criteria)
// ============================================
const gate1Criteria = [
  // Strategic Case (6 criteria)
  {
    criterionCode: "G1-SC-1",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Strategic Fit",
    description: "Project demonstrates strong strategic fit with organizational objectives",
    assessmentQuestion: "Does the project demonstrate strong strategic fit with organizational objectives and government priorities?",
    weight: 5.00,
    isCritical: true,
  },
  {
    criterionCode: "G1-SC-2",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Problem Statement",
    description: "Clear, evidence-based problem statement",
    assessmentQuestion: "Is there a clear, evidence-based problem statement supported by data and analysis?",
    weight: 4.00,
    isCritical: true,
  },
  {
    criterionCode: "G1-SC-3",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Case for Change",
    description: "Compelling case for change with evidence",
    assessmentQuestion: "Is there a compelling case for change supported by robust evidence?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-SC-4",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Scope Definition",
    description: "Project scope clearly defined with boundaries",
    assessmentQuestion: "Is the project scope clearly defined with explicit boundaries and exclusions?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-SC-5",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Dependencies",
    description: "Dependencies on other projects identified",
    assessmentQuestion: "Have dependencies on other projects and programs been identified and managed?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-SC-6",
    dimension: "Strategic",
    category: "Strategic Case",
    title: "Stakeholder Support",
    description: "Key stakeholder support secured",
    assessmentQuestion: "Has support from key stakeholders been secured and documented?",
    weight: 4.00,
    isCritical: false,
  },
  
  // Economic Case (6 criteria)
  {
    criterionCode: "G1-EC-1",
    dimension: "Economic",
    category: "Economic Case",
    title: "Options Analysis",
    description: "Comprehensive options analysis conducted",
    assessmentQuestion: "Has a comprehensive options analysis been conducted using appropriate appraisal methods?",
    weight: 5.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-EC-2",
    dimension: "Economic",
    category: "Economic Case",
    title: "Cost-Benefit Analysis",
    description: "Robust cost-benefit analysis completed",
    assessmentQuestion: "Has a robust cost-benefit analysis been completed with monetized benefits where possible?",
    weight: 5.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-EC-3",
    dimension: "Economic",
    category: "Economic Case",
    title: "Value for Money",
    description: "Value for money demonstrated",
    assessmentQuestion: "Does the preferred option demonstrate value for money compared to alternatives?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-EC-4",
    dimension: "Economic",
    category: "Economic Case",
    title: "Sensitivity Analysis",
    description: "Sensitivity analysis conducted on key assumptions",
    assessmentQuestion: "Has sensitivity analysis been conducted on key assumptions and variables?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-EC-5",
    dimension: "Economic",
    category: "Economic Case",
    title: "Risk Quantification",
    description: "Risks quantified in economic analysis",
    assessmentQuestion: "Have risks been quantified and included in the economic analysis?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-EC-6",
    dimension: "Economic",
    category: "Economic Case",
    title: "Optimism Bias",
    description: "Optimism bias adjustments applied",
    assessmentQuestion: "Have appropriate optimism bias adjustments been applied to cost and benefit estimates?",
    weight: 3.00,
    isCritical: false,
  },
  
  // Commercial Case (6 criteria)
  {
    criterionCode: "G1-CC-1",
    dimension: "Commercial",
    category: "Commercial Case",
    title: "Procurement Strategy",
    description: "Procurement strategy defined",
    assessmentQuestion: "Has an appropriate procurement strategy been defined and justified?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-CC-2",
    dimension: "Commercial",
    category: "Commercial Case",
    title: "Market Analysis",
    description: "Market analysis conducted",
    assessmentQuestion: "Has market analysis been conducted to understand supplier capability and capacity?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-CC-3",
    dimension: "Commercial",
    category: "Commercial Case",
    title: "Contract Structure",
    description: "Contract structure and payment mechanisms defined",
    assessmentQuestion: "Have contract structure and payment mechanisms been defined?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-CC-4",
    dimension: "Commercial",
    category: "Commercial Case",
    title: "Risk Allocation",
    description: "Risk allocation strategy defined",
    assessmentQuestion: "Has an appropriate risk allocation strategy been defined between parties?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-CC-5",
    dimension: "Commercial",
    category: "Commercial Case",
    title: "Pricing Mechanism",
    description: "Pricing mechanism defined",
    assessmentQuestion: "Has an appropriate pricing mechanism been defined and justified?",
    weight: 2.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-CC-6",
    dimension: "Commercial",
    category: "Commercial Case",
    title: "Contract Management",
    description: "Contract management approach defined",
    assessmentQuestion: "Has the contract management approach been defined with clear roles and responsibilities?",
    weight: 3.00,
    isCritical: false,
  },
  
  // Financial Case (6 criteria)
  {
    criterionCode: "G1-FC-1",
    dimension: "Financial",
    category: "Financial Case",
    title: "Budget Availability",
    description: "Budget availability confirmed",
    assessmentQuestion: "Has budget availability been confirmed for the full project lifecycle?",
    weight: 5.00,
    isCritical: true,
  },
  {
    criterionCode: "G1-FC-2",
    dimension: "Financial",
    category: "Financial Case",
    title: "Cost Estimates",
    description: "Detailed cost estimates prepared",
    assessmentQuestion: "Have detailed cost estimates been prepared with appropriate contingency?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-FC-3",
    dimension: "Financial",
    category: "Financial Case",
    title: "Affordability",
    description: "Project affordability demonstrated",
    assessmentQuestion: "Has project affordability been demonstrated within available budgets?",
    weight: 4.00,
    isCritical: true,
  },
  {
    criterionCode: "G1-FC-4",
    dimension: "Financial",
    category: "Financial Case",
    title: "Cash Flow",
    description: "Cash flow profile developed",
    assessmentQuestion: "Has a cash flow profile been developed showing expenditure over time?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-FC-5",
    dimension: "Financial",
    category: "Financial Case",
    title: "Funding Sources",
    description: "Funding sources identified",
    assessmentQuestion: "Have all funding sources been identified and confirmed?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-FC-6",
    dimension: "Financial",
    category: "Financial Case",
    title: "Accounting Treatment",
    description: "Accounting treatment determined",
    assessmentQuestion: "Has the appropriate accounting treatment been determined and agreed?",
    weight: 2.00,
    isCritical: false,
  },
  
  // Management Case (6 criteria)
  {
    criterionCode: "G1-MC-1",
    dimension: "Management",
    category: "Management Case",
    title: "Project Plan",
    description: "Detailed project plan developed",
    assessmentQuestion: "Has a detailed project plan been developed with clear milestones and deliverables?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-MC-2",
    dimension: "Management",
    category: "Management Case",
    title: "Governance",
    description: "Governance structure established",
    assessmentQuestion: "Has an appropriate governance structure been established with clear decision-making authority?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-MC-3",
    dimension: "Management",
    category: "Management Case",
    title: "Risk Management",
    description: "Risk management approach defined",
    assessmentQuestion: "Has a comprehensive risk management approach been defined and implemented?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-MC-4",
    dimension: "Management",
    category: "Management Case",
    title: "Benefits Realization",
    description: "Benefits realization plan developed",
    assessmentQuestion: "Has a benefits realization plan been developed with clear metrics and ownership?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-MC-5",
    dimension: "Management",
    category: "Management Case",
    title: "Resource Plan",
    description: "Resource plan developed",
    assessmentQuestion: "Has a resource plan been developed showing required skills and availability?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G1-MC-6",
    dimension: "Management",
    category: "Management Case",
    title: "Change Management",
    description: "Change management approach defined",
    assessmentQuestion: "Has a change management approach been defined to support implementation?",
    weight: 3.00,
    isCritical: false,
  },
];

// ============================================
// PAR: PROJECT ASSESSMENT REVIEW (50 criteria)
// ============================================
// (Use your existing 50 criteria - I'll provide a few examples)
const parCriteria = [
  {
    criterionCode: "SC-1.1",
    dimension: "Strategic",
    category: "Strategic",
    title: "Strategic Alignment",
    description: "Project aligns with strategic objectives",
    assessmentQuestion: "Does the project align with organizational and government strategic objectives?",
    weight: 3.00,
    isCritical: true,
  },
  {
    criterionCode: "SC-1.2",
    dimension: "Strategic",
    category: "Strategic",
    title: "Business Need",
    description: "Clear business need identified",
    assessmentQuestion: "Is there a clear and compelling business need for the project?",
    weight: 2.50,
    isCritical: true,
  },
  // ... (add all your existing 50 criteria here with weights)
  // For brevity, I'm showing just 2 examples
  // You should add all 50 with appropriate weights that sum to 100%
];

// ============================================
// GATE 3: INVESTMENT DECISION (25 criteria)
// ============================================
const gate3Criteria = [
  {
    criterionCode: "G3-CC-1",
    dimension: "Commercial",
    category: "Commercial Strategy",
    title: "Commercial Strategy",
    description: "Comprehensive commercial strategy developed",
    assessmentQuestion: "Has a comprehensive commercial strategy been developed and approved?",
    weight: 6.00,
    isCritical: true,
  },
  {
    criterionCode: "G3-CC-2",
    dimension: "Commercial",
    category: "Commercial Strategy",
    title: "Procurement Approach",
    description: "Procurement approach finalized",
    assessmentQuestion: "Has the procurement approach been finalized and approved?",
    weight: 5.00,
    isCritical: true,
  },
  {
    criterionCode: "G3-CC-3",
    dimension: "Commercial",
    category: "Commercial Strategy",
    title: "Market Engagement",
    description: "Market engagement completed",
    assessmentQuestion: "Has appropriate market engagement been completed to test assumptions?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-CC-4",
    dimension: "Commercial",
    category: "Procurement",
    title: "Procurement Documentation",
    description: "Procurement documentation prepared",
    assessmentQuestion: "Has procurement documentation been prepared and quality assured?",
    weight: 5.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-CC-5",
    dimension: "Commercial",
    category: "Procurement",
    title: "Evaluation Criteria",
    description: "Evaluation criteria defined",
    assessmentQuestion: "Have evaluation criteria been defined and weighted appropriately?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-CC-6",
    dimension: "Commercial",
    category: "Procurement",
    title: "Evaluation Team",
    description: "Evaluation team assembled",
    assessmentQuestion: "Has an appropriately skilled evaluation team been assembled?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-CC-7",
    dimension: "Commercial",
    category: "Contract",
    title: "Contract Terms",
    description: "Contract terms finalized",
    assessmentQuestion: "Have contract terms been finalized and legally reviewed?",
    weight: 5.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-CC-8",
    dimension: "Commercial",
    category: "Contract",
    title: "Payment Mechanisms",
    description: "Payment mechanisms defined",
    assessmentQuestion: "Have payment mechanisms been defined with appropriate incentives?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-CC-9",
    dimension: "Commercial",
    category: "Contract",
    title: "Performance Metrics",
    description: "Performance metrics and KPIs defined",
    assessmentQuestion: "Have performance metrics and KPIs been defined and agreed?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-CC-10",
    dimension: "Commercial",
    category: "Risk Management",
    title: "Risk Allocation",
    description: "Risk allocation finalized",
    assessmentQuestion: "Has risk allocation been finalized and documented in contracts?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-MC-1",
    dimension: "Management",
    category: "Delivery Readiness",
    title: "Delivery Plan",
    description: "Detailed delivery plan prepared",
    assessmentQuestion: "Has a detailed delivery plan been prepared with clear milestones?",
    weight: 5.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-MC-2",
    dimension: "Management",
    category: "Delivery Readiness",
    title: "Resource Availability",
    description: "Resources confirmed and available",
    assessmentQuestion: "Have required resources been confirmed and their availability secured?",
    weight: 4.00,
    isCritical: true,
  },
  {
    criterionCode: "G3-MC-3",
    dimension: "Management",
    category: "Delivery Readiness",
    title: "Governance Arrangements",
    description: "Governance arrangements operational",
    assessmentQuestion: "Are governance arrangements operational and functioning effectively?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-MC-4",
    dimension: "Management",
    category: "Delivery Readiness",
    title: "Stakeholder Engagement",
    description: "Stakeholder engagement plan implemented",
    assessmentQuestion: "Has a stakeholder engagement plan been implemented and is it effective?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-MC-5",
    dimension: "Management",
    category: "Risk and Issues",
    title: "Risk Register",
    description: "Risk register comprehensive and current",
    assessmentQuestion: "Is the risk register comprehensive, current, and actively managed?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-MC-6",
    dimension: "Management",
    category: "Risk and Issues",
    title: "Issue Management",
    description: "Issue management process operational",
    assessmentQuestion: "Is the issue management process operational and effective?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-MC-7",
    dimension: "Management",
    category: "Benefits",
    title: "Benefits Tracking",
    description: "Benefits tracking mechanisms in place",
    assessmentQuestion: "Are benefits tracking mechanisms in place and operational?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-MC-8",
    dimension: "Management",
    category: "Benefits",
    title: "Benefits Ownership",
    description: "Benefits ownership assigned",
    assessmentQuestion: "Has benefits ownership been assigned with clear accountability?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-FC-1",
    dimension: "Financial",
    category: "Financial Readiness",
    title: "Budget Approval",
    description: "Full budget approved",
    assessmentQuestion: "Has the full project budget been approved through appropriate channels?",
    weight: 5.00,
    isCritical: true,
  },
  {
    criterionCode: "G3-FC-2",
    dimension: "Financial",
    category: "Financial Readiness",
    title: "Financial Controls",
    description: "Financial controls established",
    assessmentQuestion: "Have appropriate financial controls been established and tested?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-FC-3",
    dimension: "Financial",
    category: "Financial Readiness",
    title: "Contingency",
    description: "Contingency appropriately sized",
    assessmentQuestion: "Is contingency appropriately sized based on risk assessment?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-TC-1",
    dimension: "Technical",
    category: "Technical Readiness",
    title: "Technical Solution",
    description: "Technical solution validated",
    assessmentQuestion: "Has the technical solution been validated and proven feasible?",
    weight: 4.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-TC-2",
    dimension: "Technical",
    category: "Technical Readiness",
    title: "Technical Standards",
    description: "Technical standards compliance confirmed",
    assessmentQuestion: "Has compliance with relevant technical standards been confirmed?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-TC-3",
    dimension: "Technical",
    category: "Technical Readiness",
    title: "Integration Points",
    description: "Integration points identified and planned",
    assessmentQuestion: "Have integration points been identified and integration approach planned?",
    weight: 3.00,
    isCritical: false,
  },
  {
    criterionCode: "G3-TC-4",
    dimension: "Technical",
    category: "Technical Readiness",
    title: "Technical Assurance",
    description: "Technical assurance completed",
    assessmentQuestion: "Has independent technical assurance been completed with actions addressed?",
    weight: 3.00,
    isCritical: false,
  },
];

async function seedCriteria() {
  console.log("🌱 Starting assessment criteria seeding...\n");

  try {
    // Get template IDs
    const templates = await db.select().from(assessmentTemplates);
    const gate0Template = templates.find(t => t.code === "gate_0");
    const gate1Template = templates.find(t => t.code === "gate_1");
    const parTemplate = templates.find(t => t.code === "par");
    const gate3Template = templates.find(t => t.code === "gate_3");

    if (!gate0Template || !gate1Template || !parTemplate || !gate3Template) {
      throw new Error("❌ Templates not found. Run database migration first.");
    }

    console.log("✅ Found all 4 templates\n");

    // Seed Gate 0 criteria
    console.log("📝 Seeding Gate 0 criteria (15 criteria)...");
    for (const criterion of gate0Criteria) {
      await db.insert(assessmentCriteria).values({
        ...criterion,
        templateId: gate0Template.id,
      });
    }
    console.log("✅ Gate 0 criteria seeded\n");

    // Seed Gate 1 criteria
    console.log("📝 Seeding Gate 1 criteria (30 criteria)...");
    for (const criterion of gate1Criteria) {
      await db.insert(assessmentCriteria).values({
        ...criterion,
        templateId: gate1Template.id,
      });
    }
    console.log("✅ Gate 1 criteria seeded\n");

    // Seed PAR criteria
    console.log("📝 Seeding PAR criteria (50 criteria)...");
    console.log("⚠️  Note: Only 2 example criteria provided. You need to add all 50.");
    for (const criterion of parCriteria) {
      await db.insert(assessmentCriteria).values({
        ...criterion,
        templateId: parTemplate.id,
      });
    }
    console.log("✅ PAR criteria seeded (partial)\n");

    // Seed Gate 3 criteria
    console.log("📝 Seeding Gate 3 criteria (25 criteria)...");
    for (const criterion of gate3Criteria) {
      await db.insert(assessmentCriteria).values({
        ...criterion,
        templateId: gate3Template.id,
      });
    }
    console.log("✅ Gate 3 criteria seeded\n");

    // Summary
    const criteriaCount = await db.select().from(assessmentCriteria);
    console.log("🎉 Seeding complete!");
    console.log(`📊 Total criteria in database: ${criteriaCount.length}`);
    console.log(`   - Gate 0: ${gate0Criteria.length}`);
    console.log(`   - Gate 1: ${gate1Criteria.length}`);
    console.log(`   - PAR: ${parCriteria.length} (need to add ${50 - parCriteria.length} more)`);
    console.log(`   - Gate 3: ${gate3Criteria.length}`);

  } catch (error) {
    console.error("❌ Error seeding criteria:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seedCriteria();