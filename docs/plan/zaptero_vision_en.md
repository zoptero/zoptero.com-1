# Zaptero: Dashboard & Public Profile Vision

## 1. Architectural Vision
The system is built on **role-driven dynamics**. The user is at the center of the system, but the interface (Dashboard and Public Profile) transforms entirely based on `accountType` (B2B or B2C).

* **Dashboard:** Work environment. B2C focuses on personal branding and services; B2B focuses on company identity and team management.
* **Public Profile:** Representative environment. Uses "Bento Grid" aesthetics to structure information in a visually engaging way.

## 2. Dynamic Tab Logic
Instead of writing massive `if/else` blocks in JSX, we use a configuration object model.
> **Best Practice:** Centralized configuration that defines tab visibility, icons, and access rights in one place.

## 3. Design Guidelines (Public Profile)
### Bento Grid Structure
Information is divided into logical blocks: Bio, Stats, Links, Portfolio. Each block is an independent "card."
* **UI:** Bento Grid aesthetics with rounded corners and clear borders.
* **UX:** URL Branding priority: `zaptero.com/username`. Clean, short, and professional.

## 4. Technical Implementation
* **Data Layer:** Zod schemas that validate B2B-specific fields (VAT, Reg. No.) only if the type is B2B.
* **Components:** Separated `B2BProfileView` and `B2CProfileView` to prevent code clutter.
* **Navigation:** URL query parameters (`?tab=settings`) to ensure state persistence after page reload.
