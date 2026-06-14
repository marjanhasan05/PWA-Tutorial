# PWA Tutorial

This repository is a small collection of Progressive Web App learning projects.
It is meant for learning purposes, and anyone can use it, study it, or build on
top of it.

The goal is to make this repository self-guided, so someone can come here and
keep learning step by step without needing extra help.

## Projects

| Folder | Level | Purpose | Notes |
| --- | --- | --- | --- |
| [`pwa-app`](./pwa-app/README.md) | Basic | A small app for learning core PWA concepts | Manifest, service worker, install prompt, offline UI |
| [`starter-template`](./starter-template/README.md) | Starter | A fresh project template with the main packages already installed | React, TypeScript, Tailwind CSS, Redux Toolkit, RTK Query, routing, form handling, PWA support |
| [`Todo-UI`](./Todo-UI/README.md) | Production grade | A more complete task management app with real app structure | Auth, task CRUD, protected routes, offline queue, sync, conflicts, install/update prompts, push notifications |

## Recommended Learning Order

If someone wants to learn this repository in the intended order, follow this
sequence:

1. [`Todo-UI/PWA_LEARNING_PLAN_PLAYBOOK.md`](./Todo-UI/PWA_LEARNING_PLAN_PLAYBOOK.md)
   for roadmap planning, practice direction, and common anti-patterns to avoid
2. [`Todo-UI/PWA_THEORY_FUNDAMENTALS_PLAYBOOK.md`](./Todo-UI/PWA_THEORY_FUNDAMENTALS_PLAYBOOK.md)
   for PWA concepts, theory, and core understanding
3. [`Todo-UI/BEGINNER_BUILD_GUIDE.md`](./Todo-UI/BEGINNER_BUILD_GUIDE.md)
   for architecture and a guided overview of how the app is built
4. [`Todo-UI/BEGINNER_COPY_PASTE_PLAYBOOK.md`](./Todo-UI/BEGINNER_COPY_PASTE_PLAYBOOK.md)
   for a more practical step-by-step implementation walkthrough

If anyone needs to learn about a very basic app, read
[`pwa-app/README.md`](./pwa-app/README.md).

If anyone needs the starter template, read
[`starter-template/README.md`](./starter-template/README.md).

## Todo-UI Learning Path

`Todo-UI` is the main deep-dive project in this repository. It already includes
playbooks and guides, so you can study it in a structured way.

Read these files in this order:

1. [`Todo-UI/PWA_LEARNING_PLAN_PLAYBOOK.md`](./Todo-UI/PWA_LEARNING_PLAN_PLAYBOOK.md)
   for roadmap planning, practice direction, and common anti-patterns to avoid
2. [`Todo-UI/PWA_THEORY_FUNDAMENTALS_PLAYBOOK.md`](./Todo-UI/PWA_THEORY_FUNDAMENTALS_PLAYBOOK.md)
   for PWA concepts, theory, and core understanding
3. [`Todo-UI/BEGINNER_BUILD_GUIDE.md`](./Todo-UI/BEGINNER_BUILD_GUIDE.md)
   for architecture and a guided overview of how the app is built
4. [`Todo-UI/BEGINNER_COPY_PASTE_PLAYBOOK.md`](./Todo-UI/BEGINNER_COPY_PASTE_PLAYBOOK.md)
   for a more practical step-by-step implementation walkthrough

## Live Links

Only `Todo-UI` currently has live links documented in its README.

- Live app: `https://task-manager-pwa-app.netlify.app/login`
- Live API: `https://to-do-backend-jq65.onrender.com/`
- Backend repository: `https://github.com/marjanhasan05/to-do-backend`

### Demo Credentials

- Email: `string@gmail.com`
- Password: `string`

There is also a sign up option in the app if someone wants to create a new
account instead of using the demo credentials.

The project is deployed on free server infrastructure, so some users may face
slow loading or temporary delays. If that happens, wait a bit and try again.

## Project Notes

### `pwa-app`

- Basic React + TypeScript + Vite PWA example
- Good for learning installability, caching, and offline behavior
- Folder README: [`pwa-app/README.md`](./pwa-app/README.md)

### `starter-template`

- Fresh starter template with the main frontend packages already installed
- Useful when you want to begin a new React app without repeating the same setup
- Folder README: [`starter-template/README.md`](./starter-template/README.md)

### `Todo-UI`

- Production-grade learning project
- Includes real app flows like authentication, task management, offline-first
  behavior, sync, and notifications
- Includes multiple playbooks and guides for deeper self-study
- Folder README: [`Todo-UI/README.md`](./Todo-UI/README.md)

## Getting Started

Each folder is a separate project.

```bash
cd pwa-app
npm install
npm run dev
```

Do the same inside `starter-template` or `Todo-UI` if you want to run those
projects instead.

## Who Can Use This

Anyone can use this repository for learning, practice, reference, or as a base
for their own experiments.

## Contributing And Feedback

Contributions, suggestions, and feedback are welcome. If you want to improve
something, fix an issue, or share an idea, feel free to open a pull request or
send feedback.

## Credits

Author:

- Marjan Hasan Moon
- GitHub: `https://github.com/marjanhasan05`
- LinkedIn: `https://www.linkedin.com/in/marjanhasan/`

Huge shout out to the backend developer:

- Arifur Rahman
- LinkedIn: `https://www.linkedin.com/in/arifur-rahman223`
- GitHub: `https://github.com/arif1101`

Backend used for this app:

- `https://github.com/marjanhasan05/to-do-backend`
