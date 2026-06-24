---
id: A
title: "Authentication, Single Sign-On, and User Roles"
order: 1
---

### What we currently understand

- The static site has no CMS logins; ~150 editors maintain pages in Dreamweaver.
- In Drupal, every editor needs an account and a role.
- You will need to determine whether to use a state-provided Single-Sign-On (SSO) authentication system or standard Drupal logins.
- Staff only, no public logins.

### Questions for you

**A1. What sign-on system do staff already use for other applications? Do you plan to use this same system for Drupal authentication?**

- **Recommendation:** With \~150 editors we recommend implementing SSO if it is viable. Many of our smaller state clients use standard Drupal authentication, which is also a valid option. (Your public pages suggest you're on Microsoft 365, which would point to Microsoft Entra ID for SSO.)
- *Why we ask:* This will help us recommend the appropriate Drupal integration modules and gather the details you'll need for implementation.

**A2. Can your current SSO system pass any details at login (e.g. office/district and role)?**

- *Why we ask:* If yes, we can recommend assigning roles and permissions automatically from those. If no, we'd recommend keeping that mapping in Drupal.

**A3. How do editors work today, and what editor types and roles do you need going forward?**

- **Recommendation:** A small set of clear roles (e.g. Editor, Content Manager/Reviewer, and Site Manager) rather than one per office or title. If you think you need additional roles, explain below.
- *Why we ask:* This shapes the role model we'll recommend. (How those roles review and access content is covered in section B.)

**A4. Is multi-factor sign-in required?**

- *Why we ask:* Usually set at the sign-on system, not the site. We just need to note it for our recommendations. (Yes / no / MNIT decides later.)
