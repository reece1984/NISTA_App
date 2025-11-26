import json
import requests

# Load current workflow
with open('nista_workflow_current.json', 'r', encoding='utf-8') as f:
    workflow = json.load(f)

# Find and update Parse Node Code
for node in workflow['nodes']:
    if node['name'] == 'Parse Node Code':
        print(f"Found node: {node['name']}")
        print(f"Current code length: {len(node['parameters']['jsCode'])}")

        # Update the code
        new_code = """let outputString = $input.item.json.aiOutput;

// Remove markdown code blocks if present
outputString = outputString.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();

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
};"""

        node['parameters']['jsCode'] = new_code
        print(f"Updated code length: {len(new_code)}")
        print("OK Node updated")
        break

# Save updated workflow to a new file
with open('nista_workflow_updated.json', 'w', encoding='utf-8') as f:
    json.dump(workflow, f, indent=2)

print("\nOK Workflow saved to nista_workflow_updated.json")
print("\nTo apply the update to N8N, run:")
print('curl -X PUT "https://n8n-reeceai-u56804.vm.elestio.app/api/v1/workflows/TpApXEx47k8SEzln" \\')
print('  -H "X-N8N-API-KEY: YOUR_KEY" \\')
print('  -H "Content-Type: application/json" \\')
print('  --data @nista_workflow_updated.json')
