import re

with open('gas_project/Index.html', 'r') as f:
    content = f.read()

# Make double sure escapeHtml handles null/undefined/numbers robustly
new_escape = """function escapeHtml(unsafe) {
        if (unsafe === null || unsafe === undefined) return "";
        return String(unsafe)
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
      }"""

content = re.sub(r'function escapeHtml\(unsafe\) \{.*?\n      \}', new_escape, content, flags=re.DOTALL)

with open('gas_project/Index.html', 'w') as f:
    f.write(content)
