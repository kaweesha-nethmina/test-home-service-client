Backend integration notes

Environment
- Frontend reads backend base URL from `process.env.NEXT_PUBLIC_API_URL`. If you used Vite-style env var `VITE_API_URL`, the client will also fall back to that.
- Example .env.local for Next.js (create in project root):

  NEXT_PUBLIC_API_URL=http://localhost:5000

Usage
- The API client is in `lib/api.ts`. It prefixes requests with `${NEXT_PUBLIC_API_URL}/api` and automatically attaches the JWT saved under `hs_token` in localStorage.
- Use the service wrappers in `services/`:
  - `services/authService.ts` : signup, login, profile, updateProfile, logout
  - `services/serviceService.ts` : createService, getAllServices, getService, updateService, deleteService
  - `services/categoryService.ts` : createCategory, getCategories, updateCategory, deleteCategory

Auth contract
- On successful login/signup the backend returns `{ token, user }`. The client saves the token to localStorage as `hs_token` and user as `hs_user`.
- Protected requests must include header `Authorization: Bearer <token>`; the client attaches it automatically.

Example

```ts
import authService from '@/services/authService'

await authService.login({ email: 'a@b.com', password: 'pass' })
const profile = await authService.profile()
```

Notes
- Ensure `NEXT_PUBLIC_API_URL` points at your backend origin without trailing slash.
- For uploads POST to `${NEXT_PUBLIC_API_URL}/api/providers/upload/image` using multipart/form-data and field `image`.

Running the backend (path provided by you)
- The backend is at:

  F:\SLIIT\3rd Year\2nd sem\DS\Home service\home-service-backend\home-service-backend

- Typical steps (PowerShell):

```powershell
cd 'F:\SLIIT\3rd Year\2nd sem\DS\Home service\home-service-backend\home-service-backend'
# install backend deps (if not installed)
npm install
# create .env file with your database settings e.g. .env.local or .env
# Example .env (adjust values):
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/homeservice
# JWT_SECRET=your_jwt_secret
# NODE_ENV=development

npm run dev
# or for production
npm run start
```

- After the backend is running, set the frontend env and start the frontend:

```powershell
cd 'F:\SLIIT\3rd Year\2nd sem\DS\Home service\home-service-backend\home-service-client'
# create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```

If you want me to:
- Add service wrappers for bookings/payments/support/providers (I already added the pattern for services/categories/auth).
- Replace any remaining local mock-usage in UI components with the real API services.
- Add an optional small integration test that calls the backend (requires backend running locally).

Tell me which of the above you want next and I will implement it.