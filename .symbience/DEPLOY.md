# DEPLOY Protocol

**Deployment checklist for Patterning.ai on Railway**

---

## Deployment Flow

### Frontend (patterning-web-v2)
- **Repo:** https://github.com/mbonchek/patterning-web-v2
- **Platform:** Railway
- **Auto-deploy:** Yes (on push to master)
- **Build time:** 3-4 minutes
- **URL:** https://patterning-web-v2-production.up.railway.app

### Backend (patterning-api-v2)
- **Repo:** https://github.com/mbonchek/patterning-api-v2
- **Platform:** Railway
- **Auto-deploy:** Yes (on push to master)
- **Build time:** 2-3 minutes

---

## Standard Deployment Process

### 1. Commit Changes
```bash
cd /home/ubuntu/patterning-web-v2  # or patterning-api-v2
git add -A
git commit -m "descriptive message"
git push origin master
```

### 2. Verify Push
- Check that push succeeded
- Note the commit hash

### 3. Wait for Deployment
- **Frontend:** 3-4 minutes
- **Backend:** 2-3 minutes
- Railway auto-deploys on push to master

### 4. Inform User
**Message template:**
```
Deployed! Wait 3-4 minutes for Railway to build and deploy, then hard refresh:
- Mac: Cmd+Shift+R
- Windows/Linux: Ctrl+F5
```

### 5. Verify Deployment (if needed)
- Check Railway dashboard
- Check deployment logs
- Verify build succeeded

---

## Batched Deployments

**User preference:** Batch related changes together rather than deploying after every small fix.

**When to batch:**
- Multiple small related fixes
- Iterative debugging
- Experimental changes

**When to deploy immediately:**
- Critical bug fixes
- User explicitly requests it
- End of work session

---

## Hard Refresh Required

**Always remind the user to hard refresh after deployment:**
- Vite builds are cached aggressively
- Browser may serve stale JavaScript
- Hard refresh bypasses cache

**Keyboard shortcuts:**
- Mac: `Cmd+Shift+R`
- Windows/Linux: `Ctrl+F5`

---

## Deployment Verification

### Frontend
1. Check that new code is running (look for expected changes)
2. Check browser console for errors
3. Check Network tab for 404s or failed requests

### Backend
1. Check API endpoints respond correctly
2. Check Railway logs for startup errors
3. Verify database connections

---

## Common Issues

### Build Failures
- Check TypeScript errors
- Check missing dependencies
- Check Railway build logs

### Runtime Errors
- Check environment variables
- Check API keys and secrets
- Check database connection strings

### Cache Issues
- User needs to hard refresh
- May need to clear browser cache completely
- Check Service Workers aren't caching aggressively

---

**Last updated:** 2026-01-08
