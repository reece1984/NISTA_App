# N8N Workflow Fixes for "NISTA_App" - Generate Action Plan

## Node to Update: "Parse Node Code"

### Current Code (ISSUE: Doesn't handle markdown):
```javascript
let outputString = $input.item.json.aiOutput;
let actions = JSON.parse(outputString);

return {
  json: {
    actions: actions,
    assessment_run_id: $input.item.json.assessmentRunId,
    project_id: $input.item.json.projectId,
    user_id: $input.item.json.userId,
    action_count: actions.length
  }
};
```

### FIXED Code (Handles markdown, better error handling):
```javascript
let outputString = $input.item.json.aiOutput;

// Remove markdown code blocks if present
outputString = outputString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

// Try to parse JSON
let actions;
try {
  actions = JSON.parse(outputString);
} catch (error) {
  console.error('Failed to parse AI output as JSON:', error);
  console.error('Raw output:', outputString);
  throw new Error(`AI returned invalid JSON: ${error.message}`);
}

// Validate it's an array
if (!Array.isArray(actions)) {
  throw new Error('AI response must be an array of actions');
}

// Validate each action has required fields
actions.forEach((action, index) => {
  if (!action.title || !action.description) {
    throw new Error(`Action at index ${index} missing required fields (title, description)`);
  }
});

return {
  json: {
    actions: actions,
    assessment_run_id: $input.item.json.assessmentRunId,
    project_id: $input.item.json.projectId,
    user_id: $input.item.json.userId,
    action_count: actions.length
  }
};
```

## Verification Summary for "Generate Action Plan" Workflow

### ✓ VERIFIED (Working Correctly):
1. **RED/AMBER Filter** - Correctly filters for red and amber assessments using snake_case
2. **Format Data for AI** - Creates structured JSON with all required fields using snake_case
3. **AI Agent Configuration** - Has proper system message emphasizing JSON-only output
4. **Create Draft Record** - Inserts into correct table with snake_case fields
5. **Respond to Webhook** - Returns proper response with draft_id and proposed_actions

### ⚠ NEEDS FIX:
1. **Parse Node Code** - Must handle markdown code blocks that AI might add

### Workflow Flow (COMPLETE):
```
Switch (generate_action_plan)
  -> Get Assessment Run
  -> Get Project Details
  -> Get All Assessments
  -> Get all assessments for this run (Filter RED/AMBER)
  -> Get many rows (Get criteria)
  -> Format Data for AI
  -> Generate Action Plan (AI Agent with GPT-4)
  -> Break Data Chain
  -> Parse Node Code ⚠ (NEEDS UPDATE)
  -> Create Draft Record
  -> Respond to Webhook2
```

## Manual Fix Required:

1. Open N8N workflow editor: https://n8n-reeceai-u56804.vm.elestio.app/workflow/TpApXEx47k8SEzln
2. Find node "Parse Node Code"
3. Replace JavaScript code with the FIXED code above
4. Save workflow
5. Test with webhook

OR use N8N API to update programmatically (see below)

---

## Status of Other Workflows:

### "Refine Action Plan" (identifier: refine_action_plan)
- **Status**: Switch routing configured but NO NODES CONNECTED
- **Action**: MUST BE BUILT FROM SCRATCH

### "Compare Assessments" (identifier: compare_assessments)
- **Status**: Switch routing configured but NO NODES CONNECTED
- **Action**: MUST BE BUILT FROM SCRATCH

---

## Next Steps:
1. Fix "Parse Node Code" in Generate Action Plan workflow
2. Test Generate Action Plan workflow
3. Build Refine Action Plan workflow
4. Build Compare Assessments workflow (if time)
