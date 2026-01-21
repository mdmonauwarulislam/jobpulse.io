# Redirect Loop Debug Guide

## How to Report the Issue

When experiencing the redirect loop, please provide the following information:

### 1. Browser Console Logs
Open your browser's Developer Tools (F12) and check the Console tab for any errors or warnings.

### 2. Network Tab
Check the Network tab to see if there are multiple rapid redirects happening.

### 3. User State Information
Add this code temporarily to see the user state:

```javascript
// In browser console
console.log('User State:', {
  isVerified: user?.isVerified,
  isProfileComplete: user?.isProfileComplete,
  userType: userType,
  currentPath: window.location.pathname
});
```

### 4. Common Scenarios

**Scenario A: Unverified User**
- User logs in as employer
- `isVerified = false`
- Should stay on `/employer/complete-profile`
- Should NOT redirect to dashboard

**Scenario B: Verified but Profile Incomplete**
- User is verified (`isVerified = true`)
- But `isProfileComplete = false`
- Should stay on `/employer/complete-profile`
- Should NOT redirect to dashboard

**Scenario C: Verified and Profile Complete**
- User is verified (`isVerified = true`)
- Profile is complete (`isProfileComplete = true`)
- Should redirect from `/employer/complete-profile` to `/employer/dashboard`
- Should stay on dashboard

### 5. Current Behavior
Please describe:
- What page you start on
- What page you end up on
- How many times it redirects
- What user state values you see in console

### 6. Steps to Reproduce
1. Login as employer (verified or not)
2. Navigate to `/employer/dashboard` or `/employer/complete-profile`
3. Observe redirect behavior

## Files Involved in Redirects

1. `frontend/contexts/AuthContext.jsx` - Global redirect logic
2. `frontend/utils/withAuth.jsx` - Route protection HOC
3. `frontend/pages/employer/complete-profile.jsx` - Complete profile page
4. `frontend/pages/employer/dashboard.jsx` - Dashboard (uses withAuth)

## Recent Fixes Applied

1. ✅ Added redirect guards using `useRef`
2. ✅ Check current path before redirecting
3. ✅ Separated redirect logic between AuthContext and withAuth
4. ✅ AuthContext now skips redirects for protected routes (handled by withAuth)

## If Still Having Issues

1. Clear browser cache and cookies
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if user state is being updated correctly after login
4. Verify API responses match expected format
