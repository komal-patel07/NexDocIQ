import Document          from "../models/Document.js";
import { callGeminiRaw } from "../utils/gemini.js";

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const getMockPdfStats = (persona) => {
  if (persona === "student") {
    return {
      isTabular: false,
      primaryMetric: "8 Min", primaryLabel: "Reading Time", primarySubtext: "Estimated study duration",
      secMetric: "2,450", secLabel: "Total Words", secSubtext: "Vocabulary scope",
      thirdMetric: "Grade 10", thirdLabel: "Complexity Level", thirdSubtext: "Flesch index reference",
      fourthMetric: "86%", fourthLabel: "Retention Index", fourthSubtext: "Average focus delta",
      summary: "🎓 **Student Summary**: This study report details onboarding strategy. It maps how database connection steps cause a 64% drop-off in user signups. Adding simple setup guides accelerates the configuration to 12 minutes, which is estimated to increase study-activation actions by 24%!",
      chartLabels: ["Ch 1","Ch 2","Ch 3","Ch 4","Ch 5","Ch 6","Ch 7"],
      indicators: {
        readingEase: { value:"82%", title:"Study Ease Index", desc:"Understandable terminology", total:"Flesch-Kincaid scale", flagged:"No Jargon Spikes", color:"#10b981", bars:[70,75,80,82,85,88,86,84,82,80,75,80,82,84,86,88] },
        retention:   { value:"76%", title:"Memory Retention",  desc:"Focus intensity",           total:"82% core keypoints covered", flagged:"Optimal focus", color:"#3b82f6", bars:[60,65,70,72,75,76,78,75,76,74,70,72,75,76,78,75] },
        jargon:      { value:"0",   title:"Unexplained Jargon",desc:"Complex academic terms",    total:"Simplified analogies active", flagged:"No spikes",    color:"#ff4d4d", bars:[5,2,0,4,1,0,0,3,0,0,2,0,1,0,0,0] },
      },
      activeDeals: [
        { id:1, client:"Introduction Chapter",    email:"Topic: Client Onboarding Basics",    avatar:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&auto=format&fit=crop&q=80", task:"Covers: High-level introduction to onboarding targets.", dueDate:"Pages 1-3", revenue:"3 pgs", status:"Completed" },
        { id:2, client:"Technical Friction Study", email:"Topic: Database Setup Drop-offs",   avatar:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&auto=format&fit=crop&q=80", task:"Covers: Analysis of database setup errors and signup drop-offs.", dueDate:"Pages 4-6", revenue:"3 pgs", status:"In progress" },
        { id:3, client:"Automation Guides Plan",   email:"Topic: Activation Wizards",         avatar:"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=80&auto=format&fit=crop&q=80", task:"Covers: Guidelines for setting up setup guides, predicting 24% uptick.", dueDate:"Pages 7-8", revenue:"2 pgs", status:"Pending" },
      ],
    };
  } else if (persona === "shopkeeper") {
    return {
      isTabular: false,
      primaryMetric: "8 Pages", primaryLabel: "Document Length", primarySubtext: "Supplier strategy guide",
      secMetric: "DesignFlow", secLabel: "Supplier Name", secSubtext: "Lead supplier",
      thirdMetric: "Simple", thirdLabel: "Text Ease", thirdSubtext: "No complicated trade words",
      fourthMetric: "98%", fourthLabel: "Supplier Score", fourthSubtext: "On-time delivery rate",
      summary: "🏪 **Shopkeeper Summary**: This document describes onboarding guides. In trade terms, it tells us that a complex database connection step makes 64% of users walk away from their cart. Adding simple setups speeds up transaction times to 12 minutes, which boosts wholesale orders by 24%!",
      chartLabels: ["Item A","Item B","Item C","Item D","Item E","Item F","Item G"],
      indicators: {
        stock:   { value:"Low stock (5)", title:"Inventory Level", desc:"Stock items to check", total:"Safety limit", flagged:"5 Alert",  color:"#f59e0b", bars:[5,6,4,8,12,14,10,8,7,5,2,4,5,6,8,5] },
        traffic: { value:"92% visitors",  title:"Store Visitors",  desc:"Average traffic density", total:"Walk-ins count", flagged:"Optimal", color:"#10b981", bars:[60,65,70,72,75,76,78,80,82,85,88,90,92,90,85,80] },
        defects: { value:"0.2%",          title:"Returned Goods",  desc:"Defects from shipping", total:"Supplier rate", flagged:"Clean tab", color:"#ff4d4d", bars:[2,1,0,3,0,0,1,0,2,0,0,0,1,0,0,0] },
      },
      activeDeals: [
        { id:1, client:"Supplier Strategy Intro",    email:"Pages 1-3 Summary", avatar:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&auto=format&fit=crop&q=80", task:"Instructions: Guides for onboarding bulk accounts.",                      dueDate:"Sec 1", revenue:"3 pgs", status:"Completed" },
        { id:2, client:"Inventory Connection Steps", email:"Pages 4-6 Summary", avatar:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&auto=format&fit=crop&q=80", task:"Instructions: Fixing supplier database lags to speed up ordering.",       dueDate:"Sec 2", revenue:"3 pgs", status:"In progress" },
        { id:3, client:"Automatic Ordering Plan",    email:"Pages 7-8 Summary", avatar:"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=80&auto=format&fit=crop&q=80", task:"Instructions: Setting up auto-invoices, expecting 24% time saved.",       dueDate:"Sec 3", revenue:"2 pgs", status:"Pending" },
      ],
    };
  } else if (persona === "business") {
    return {
      isTabular: false,
      primaryMetric: "8 Min", primaryLabel: "Reading Duration", primarySubtext: "Average read duration",
      secMetric: "2,450", secLabel: "Word Count", secSubtext: "Optimal wording length",
      thirdMetric: "82%", thirdLabel: "Readability Score", thirdSubtext: "Grade 10 complexity",
      fourthMetric: "68%", fourthLabel: "Information Density", fourthSubtext: "Optimized semantic flow",
      summary: "💼 **Business Summary**: This strategy document details onboarding cycles. In business terms, friction in the database setup process accounts for 64% of product drop-offs. Implementing automated setup wizards decreases user configuration time to 12 minutes, delivering a 24% signup activation bump.",
      chartLabels: ["Ch 1","Ch 2","Ch 3","Ch 4","Ch 5","Ch 6","Ch 7"],
      indicators: {
        ease:      { value:"82%", title:"Reading Ease",     desc:"Flesch-Kincaid scale",      total:"Optimal clarity level",   flagged:"No jargon spikes", color:"#10b981", bars:[70,75,80,82,85,88,86,84,82,80,75,80,82,84,86,88] },
        sentiment: { value:"76%", title:"Sentiment Score",  desc:"Positive tone index",        total:"82% paragraphs positive", flagged:"Optimistic",        color:"#3b82f6", bars:[60,65,70,72,75,76,78,75,76,74,70,72,75,76,78,75] },
        anomalies: { value:"0",   title:"Vocabulary Spikes",desc:"Unexplained technical terms", total:"Clear definitions",      flagged:"Perfect score",     color:"#ff4d4d", bars:[5,2,0,4,1,0,0,3,0,0,2,0,1,0,0,0] },
      },
      activeDeals: [
        { id:1, client:"Introduction Section",   email:"Pages 1-3 Overview", avatar:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&auto=format&fit=crop&q=80", task:"Summary: Details client acquisition strategies and team targets.",              dueDate:"Sec 1", revenue:"3 pgs", status:"Completed" },
        { id:2, client:"Setup Friction Analysis",email:"Pages 4-6 Audit",    avatar:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&auto=format&fit=crop&q=80", task:"Summary: Database configuration steps count as the major drop-off point.",     dueDate:"Sec 2", revenue:"3 pgs", status:"In progress" },
        { id:3, client:"Automation Guides Plan", email:"Pages 7-8 Guidelines",avatar:"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=80&auto=format&fit=crop&q=80",task:"Summary: Details interactive wizard features, expecting 24% signup uptick.",   dueDate:"Sec 3", revenue:"2 pgs", status:"Pending" },
      ],
    };
  } else {
    return {
      isTabular: false,
      primaryMetric: "8 Min", primaryLabel: "Read Time", primarySubtext: "Average reading speed",
      secMetric: "2,450", secLabel: "Word Count", secSubtext: "Total words parsed",
      thirdMetric: "Easy", thirdLabel: "Difficulty", thirdSubtext: "Simple vocabulary",
      fourthMetric: "Optimal", fourthLabel: "Sentiment", fourthSubtext: "Positive tone",
      summary: "👤 **General Summary**: This strategy document details onboarding guides. In simple words, it shows that setting up a database is too hard, making 64% of people quit early. Making a simple helper guide speeds up setup times to 12 minutes, which gets 24% more signups!",
      chartLabels: ["Ch 1","Ch 2","Ch 3","Ch 4","Ch 5","Ch 6","Ch 7"],
      indicators: {
        ease:      { value:"Easy",     title:"Reading Ease",    desc:"Simple terms used",         total:"Flesch-Kincaid scale", flagged:"No Jargon Spikes", color:"#10b981", bars:[70,75,80,82,85,88,86,84,82,80,75,80,82,84,86,88] },
        sentiment: { value:"Positive", title:"Sentiment Score", desc:"General tone of writing",    total:"Friendly phrases",    flagged:"Optimistic",       color:"#3b82f6", bars:[60,65,70,72,75,76,78,75,76,74,70,72,75,76,78,75] },
        anomalies: { value:"0 Spikes", title:"Spelling Errors", desc:"Grammar check results",      total:"Checked dictionary files", flagged:"Perfect score", color:"#ff4d4d", bars:[5,2,0,4,1,0,0,3,0,0,2,0,1,0,0,0] },
      },
      activeDeals: [
        { id:1, client:"Introduction Section",   email:"Pages 1-3 Summary",  avatar:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&auto=format&fit=crop&q=80", task:"Summary: Details client acquisition strategies and team targets.",            dueDate:"Sec 1", revenue:"3 pgs", status:"Completed" },
        { id:2, client:"Setup Friction Analysis",email:"Pages 4-6 Audit",    avatar:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&auto=format&fit=crop&q=80", task:"Summary: Database configuration steps count as the major drop-off point.",   dueDate:"Sec 2", revenue:"3 pgs", status:"In progress" },
        { id:3, client:"Automation Guides Plan", email:"Pages 7-8 Guidelines",avatar:"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=80&auto=format&fit=crop&q=80",task:"Summary: Details interactive wizard features, expecting 24% signup uptick.", dueDate:"Sec 3", revenue:"2 pgs", status:"Pending" },
      ],
    };
  }
};

const getMockCsvStats = (persona) => {
  if (persona === "student") {
    return {
      isTabular: true,
      primaryMetric: "124 Rows", primaryLabel: "Data Scope", primarySubtext: "Spreadsheet rows count",
      secMetric: "7 Columns", secLabel: "Data Dimensions", secSubtext: "Total indicators mapped",
      thirdMetric: "Grade A", thirdLabel: "Quality Index", thirdSubtext: "No spelling discrepancies",
      fourthMetric: "84%", fourthLabel: "Formulas Match", fourthSubtext: "Calculation accuracy",
      summary: "🎓 **Student Summary**: This dataset ledger charts sales records. It reflects that our software subscriptions generated 14.3% higher growth, which matches a successful Q2 semester report!",
      chartLabels: ["Class A","Class B","Class C","Class D","Class E","Class F","Class G"],
      indicators: {
        grades:    { value:"98%", title:"Data Reliability", desc:"Accuracy level",            total:"Checked cells count",   flagged:"98% Clean", color:"#10b981", bars:[50,60,45,75,82,90,65,80,85,82,70,75,80,82,90,85] },
        anomalies: { value:"2%",  title:"Formulas Errors",  desc:"Invalid calculations",       total:"Calculations check",    flagged:"2 Spikes",  color:"#f59e0b", bars:[30,40,50,42,60,65,58,62,68,64,55,60,65,68,60,50] },
        growth:    { value:"84%", title:"Growth Index",     desc:"Year-over-year progression", total:"Success rate",           flagged:"Optimal",   color:"#3b82f6", bars:[40,30,35,45,55,60,50,58,62,59,45,50,55,62,50,40] },
      },
      activeDeals: [
        { id:1, client:"Lena Harper (Grade Ledger)",    email:"lena.harper@influxmedia.co", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", task:"Project: Summer Collab with Glossi...",      dueDate:"May 21", revenue:"$125", status:"In progress" },
        { id:2, client:"Sophie Kim (Attendance Ledger)",email:"sophie.kim@creatorhive.com", avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", task:"Project: Back-to-School with Notio...",       dueDate:"May 11", revenue:"$320", status:"Pending" },
        { id:3, client:"Noah Bennett (Grades)",         email:"noah.b@bennettstudio.com",   avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", task:"Project: YouTube Integration for Sq...",    dueDate:"May 19", revenue:"$450", status:"Completed" },
      ],
    };
  } else if (persona === "shopkeeper") {
    return {
      isTabular: true,
      primaryMetric: "$2.84M", primaryLabel: "Total Sales", primarySubtext: "+18% Vs last month",
      secMetric: "148 Tabs", secLabel: "Deals Won", secSubtext: "Cleared customer tabs",
      thirdMetric: "72%", thirdLabel: "Conversion Rate", thirdSubtext: "Visitors to buyers ratio",
      fourthMetric: "42 Low", fourthLabel: "Low Inventory Alert", fourthSubtext: "Reorder stock soon",
      summary: "🏪 **Shopkeeper Summary**: This monthly sales log sheet lists transaction registers. It shows total revenue reached $2.84M (+18% Vs last month). In ledger tab terms, we successfully closed 148 customer balance tabs with a sales conversion rate of 72%!",
      chartLabels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      indicators: {
        storeTraffic: { value:"82% busy", title:"Store Traffic",      desc:"Daily walk-in levels",        total:"14.2K Footfalls", flagged:"Optimal",       color:"#10b981", bars:[50,60,45,75,82,90,65,80,85,82,70,75,80,82,90,85] },
        creditTabs:   { value:"23 Tabs",  title:"Invoices Pending",   desc:"Unpaid customer credit tabs", total:"23 require call",  flagged:"Pending",       color:"#f59e0b", bars:[30,40,50,42,60,65,58,62,68,64,55,60,65,68,60,50] },
        payments:     { value:"62.34%",   title:"Payments Cleared",   desc:"Card and cash ratios",        total:"Card payments led", flagged:"Stable balance",color:"#3b82f6", bars:[40,30,35,45,55,60,50,58,62,59,45,50,55,62,50,40] },
      },
      activeDeals: [
        { id:1, client:"Lena Harper (Client Tab)",   email:"lena.harper@influxmedia.co", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", task:"Order: Summer Collab with Glossi...",   dueDate:"May 21", revenue:"$125", status:"In progress" },
        { id:2, client:"Sophie Kim (Wholesale tab)", email:"sophie.kim@creatorhive.com", avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", task:"Order: Back-to-School with Notio...",  dueDate:"May 11", revenue:"$320", status:"Pending" },
        { id:3, client:"Noah Bennett (Supplier tab)",email:"noah.b@bennettstudio.com",   avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", task:"Order: YouTube Integration for Sq...", dueDate:"May 19", revenue:"$450", status:"Completed" },
      ],
    };
  } else if (persona === "business") {
    return {
      isTabular: true,
      primaryMetric: "$2.84M", primaryLabel: "Total Sales", primarySubtext: "+18% Vs last month",
      secMetric: "$8.2M", secLabel: "Pipeline Value", secSubtext: "426 active opportunities",
      thirdMetric: "148", thirdLabel: "Deals Won", thirdSubtext: "72% conversion rate",
      fourthMetric: "96%", fourthLabel: "Accuracy Rate", fourthSubtext: "14K predictions parsed",
      summary: "💼 **Business Summary**: The transaction dataset lists sales activities. Q2 revenue totals $2.84M, showing positive product adoption. Active pipeline values stand at $8.2M with a win rate of 72%, proving our model predictions are 96% accurate.",
      chartLabels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      indicators: {
        pipelineHealth: { value:"82%",    title:"Pipeline Health", desc:"124 Active Deals",      total:"14.2K Total Deals", flagged:"22 Flagged",     color:"#10b981", bars:[50,60,45,75,82,90,65,80,85,82,70,75,80,82,90,85] },
        dealsAtRisk:    { value:"68.34%", title:"Deals At Risk",   desc:"23 Deals Need Review",  total:"14.2K Total Deals", flagged:"23 At Risk",     color:"#f59e0b", bars:[30,40,50,42,60,65,58,62,68,64,55,60,65,68,60,50] },
        billingStatus:  { value:"62.34%", title:"Billing Status",  desc:"4 Pending Invoices",    total:"$14.2K Collected",  flagged:"4 Pending",     color:"#3b82f6", bars:[40,30,35,45,55,60,50,58,62,59,45,50,55,62,50,40] },
      },
      activeDeals: [
        { id:1, client:"Lena Harper", email:"lena.harper@influxmedia.co", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", task:"Summer Collab with Glossi...",      dueDate:"May 21", revenue:"$125", status:"In progress" },
        { id:2, client:"Sophie Kim",  email:"sophie.kim@creatorhive.com", avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", task:"Back-to-School with Notio...",       dueDate:"May 11", revenue:"$320", status:"Pending" },
        { id:3, client:"Noah Bennett",email:"noah.b@bennettstudio.com",   avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", task:"YouTube Integration for Sq...",     dueDate:"May 19", revenue:"$450", status:"Completed" },
      ],
    };
  } else {
    return {
      isTabular: true,
      primaryMetric: "$2.84M", primaryLabel: "Total Sales", primarySubtext: "+18% Vs last month",
      secMetric: "148 Items", secLabel: "Deals Closed", secSubtext: "Customer transactions closed",
      thirdMetric: "72%", thirdLabel: "Success Rate", thirdSubtext: "Buyer conversion ratio",
      fourthMetric: "Clear", fourthLabel: "Audit Report", fourthSubtext: "No balance discrepancies",
      summary: "👤 **General Summary**: This sales ledger maps software payments. It details how the company made $2.84M (+18% Vs last month) across 148 customer bills with a conversion success rate of 72%!",
      chartLabels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      indicators: {
        traffic: { value:"82%",       title:"Store Activity", desc:"Daily transaction metrics",           total:"14.2K Footfalls",           flagged:"Optimal",       color:"#10b981", bars:[50,60,45,75,82,90,65,80,85,82,70,75,80,82,90,85] },
        unpaid:  { value:"23 Pending",title:"Unpaid Bills",   desc:"Unsettled customer credit accounts", total:"23 open files",              flagged:"Pending",       color:"#f59e0b", bars:[30,40,50,42,60,65,58,62,68,64,55,60,65,68,60,50] },
        cleared: { value:"62.34%",    title:"Cleared Funds",  desc:"General payment speed",              total:"Card and cash accounts active",flagged:"Stable balance",color:"#3b82f6", bars:[40,30,35,45,55,60,50,58,62,59,45,50,55,62,50,40] },
      },
      activeDeals: [
        { id:1, client:"Lena Harper", email:"lena.harper@influxmedia.co", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80", task:"Summer Collab with Glossi...",  dueDate:"May 21", revenue:"$125", status:"In progress" },
        { id:2, client:"Sophie Kim",  email:"sophie.kim@creatorhive.com", avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80", task:"Back-to-School with Notio...", dueDate:"May 11", revenue:"$320", status:"Pending" },
        { id:3, client:"Noah Bennett",email:"noah.b@bennettstudio.com",   avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80", task:"YouTube Integration for Sq...",dueDate:"May 19", revenue:"$450", status:"Completed" },
      ],
    };
  }
};

// ─── Controller ───────────────────────────────────────────────────────────────

export const getStats = async (req, res) => {
  const { fileId, persona } = req.query;
  const activePersona = (persona || "general").toLowerCase();

  if (fileId && !fileId.startsWith("default-")) {
    try {
      const doc = await Document.findOne({ id: fileId });
      if (!doc) return res.status(404).json({ error: "Document not found" });

      if (doc.stats && doc.stats.has(activePersona)) {
        return res.json(doc.stats.get(activePersona));
      }

      const textSample = doc.extractedText.slice(0, 15000);

      const systemInstruction = `You are a professional data analyst. Analyze the provided text content from an uploaded file and generate a JSON response summarizing the key findings.
The analysis must match the requested persona:
- general: Simple, everyday English, no technical jargon.
- student: Focused on study terms, grades, chapters, summaries, and educational value.
- shopkeeper: Focused on store management, sales, stock, inventory, invoices, and customer transactions.
- business: Focused on revenue, pipeline value, conversion rate, opportunities, enterprise deals, and business metrics.

You must return EXACTLY a JSON object with the following structure (do NOT wrap it in markdown block, just output raw JSON text):
{
  "isTabular": boolean,
  "primaryMetric": "string", "primaryLabel": "string", "primarySubtext": "string",
  "secMetric": "string",     "secLabel": "string",     "secSubtext": "string",
  "thirdMetric": "string",   "thirdLabel": "string",   "thirdSubtext": "string",
  "fourthMetric": "string",  "fourthLabel": "string",  "fourthSubtext": "string",
  "summary": "2-3 sentence explanation. Use **bold** for key metrics. Tone must fit the persona.",
  "chartLabels": ["7 x-axis category strings"],
  "indicators": {
    "ind1": { "value":"string","title":"string","desc":"string","total":"string","flagged":"string","color":"string","bars":[16 integers] },
    "ind2": { "value":"string","title":"string","desc":"string","total":"string","flagged":"string","color":"string","bars":[16 integers] },
    "ind3": { "value":"string","title":"string","desc":"string","total":"string","flagged":"string","color":"string","bars":[16 integers] }
  },
  "activeDeals": [
    { "id":1,"client":"string","email":"string","avatar":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80","task":"string","dueDate":"string","revenue":"string","status":"In progress" },
    { "id":2,"client":"string","email":"string","avatar":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80","task":"string","dueDate":"string","revenue":"string","status":"Pending" },
    { "id":3,"client":"string","email":"string","avatar":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80","task":"string","dueDate":"string","revenue":"string","status":"Completed" }
  ]
}`;

      const prompt = `Here is the document content to analyze:\n\n${textSample}\n\nPlease generate the analysis JSON matching the persona "${activePersona}":`;
      const responseText  = await callGeminiRaw(prompt, systemInstruction, true);
      const parsedStats   = JSON.parse(responseText);

      if (!doc.stats) doc.stats = new Map();
      doc.stats.set(activePersona, parsedStats);
      doc.markModified("stats");
      await doc.save();

      return res.json(parsedStats);
    } catch (err) {
      console.error("Gemini stats generation failed, falling back to mock:", err);
    }
  }

  const isPdf = fileId === "default-2" || (fileId && fileId.toLowerCase().includes(".pdf"));
  res.json(isPdf ? getMockPdfStats(activePersona) : getMockCsvStats(activePersona));
};
