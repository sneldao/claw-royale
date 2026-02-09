# CLAW ROYALE SECURITY GUIDELINES

## 🚨 NEVER COMMIT PRIVATE KEYS

### Approved Patterns for Secrets

```javascript
// ❌ NEVER DO THIS:
const privateKey = "0x47f116e48169410ba156fa89041174ec8176982be34b8b21f627c160af4bc6b3";

// ✅ DO THIS:
const privateKey = process.env.AGENT_PRIVATE_KEY;
```

```bash
# Store in .env (gitignored):
AGENT_PRIVATE_KEY=0x...
BANKR_API_KEY=bk_...
```

### Gitignore Patterns

Add these to `.gitignore`:
```
secrets/
keys/
*.pem
*.key
*.crt
credentials.*
config.local.*
.env*
!.env.example
```

### Pre-commit Hook (Optional)

Install `husky` and add a pre-commit check:

```bash
npm install -D husky @commitlint/cli
npx husky install
```

Add to `.husky/pre-commit`:
```bash
#!/bin/bash
# Check for private keys in staged files
if git diff --cached --name-only | xargs grep -l "0x[a-fA-F0-9]{64}" 2>/dev/null; then
  echo "🚨 ERROR: Private key pattern detected in staged files!"
  echo "Please use environment variables instead."
  exit 1
fi
```

### GitHub Secret Scanning

Enable GitHub's secret scanning:
1. Repo Settings → Security → Secret scanning
2. Enable "Push protection"
3. Review alerts at https://github.com/CLAW_REPO/settings/security_analysis

### If You Accidentally Commit a Key

```bash
# 1. Rotate the key immediately (transfer funds if compromised)
# 2. Remove from git history:
git filter-repo --path-glob '*.js' --replace '' --invert-paths

# 3. Force push (warn collaborators first!)
git push --force origin main
```

### Environment File Template

Create `.env.example` (SAFE to commit):
```bash
# Copy this to .env and fill in your values
AGENT_PRIVATE_KEY=
BANKR_API_KEY=
ELEVENLABS_API_KEY=
SOLANA_RPC_URL=
BASE_RPC_URL=
```

## Summary

| Do | Don't |
|---|---|
| Use `process.env.VAR` | Hardcode keys in source |
| Store in `.env` | Commit `.env` files |
| Add secrets/ to .gitignore | Commit private key files |
| Use .env.example template | Share keys in chat |
