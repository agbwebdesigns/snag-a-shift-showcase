# Snag-a-Shift Showcase

Snag-a-Shift is a full-stack marketplace concept for restaurant shift staffing. Restaurants can post single shifts, workers can apply for available shifts, and approved workers can be paid through a marketplace-style payment flow.

This repository is a public showcase version of the project. The production codebase is private. Proprietary business logic, credentials, deployment configuration, and sensitive implementation details have been removed.

## Project Goals

- Help restaurants fill short-term labor gaps
- Give workers access to flexible shift opportunities
- Support a marketplace workflow with job and location-based dashboards
- Build a scalable foundation for payment processing and platform fees

## My Role

I designed and built the application as the technical founder, including:

- Full-stack architecture
- React frontend
- Node/Express API
- MongoDB/Mongoose data modeling
- Role-specific route protection
- Stripe Connect payment architecture
- Admin dashboard concepts
- Validation and logging patterns
- Analytics data

## Tech Stack

- React
- Node.js
- Express
- MongoDB
- Mongoose
- Stripe Connect
- JWT authentication

## Key Features

- Restaurant account flow
- Worker account flow
- Job posting
- Job applications
- Job application selection
- Clock-in/clock-out lifecycle
- Payment architecture
- Admin dashboard
- Marketplace commission model
- User Analytics Data

## Architecture
<img width="2049" height="1660" alt="system_architecture" src="https://github.com/user-attachments/assets/60ec2ba1-7d84-4ad4-99bb-b385eb157436" />
<img width="3252" height="2350" alt="deployment_architecture" src="https://github.com/user-attachments/assets/fa331bd2-33b7-4b32-ac8b-cb7142788490" />
<img width="4097" height="4699" alt="security_validation" src="https://github.com/user-attachments/assets/5c9880d7-80b4-4032-bd44-dc126d5e1bc9" />
<img width="2336" height="4536" alt="app_onboarding" src="https://github.com/user-attachments/assets/b20122ed-1003-48bb-ad46-d026ad16389d" />
<img width="3797" height="5985" alt="user_flow" src="https://github.com/user-attachments/assets/68c6316c-a105-4bbe-b1c8-6ce7ae4f4526" />

## Selected Code Samples

This repo includes selected sanitized code samples that demonstrate my implementation style without exposing the full production codebase.

## Demo Video

[Watch the Snag-a-Shift workflow demo](https://www.youtube.com/watch?v=WvX3RVFR3uM)

## What I Learned

Snag-a-Shift was my first full-stack application, and building it taught me how the different layers of a real web app work together. It pushed me beyond building isolated frontend or backend features and helped me understand how to design, connect, secure, debug, and organize a complete application.

### Connecting the Frontend and Backend

One of the biggest things I learned was how to connect a React frontend to an Express/Node backend through API endpoints. I learned how frontend components use `fetch` calls to send and receive data, how backend routes handle those requests, and how the two sides of the application depend on a consistent API structure.

This helped me understand full-stack development as a connected system rather than separate pieces of code.

### Securing Backend Endpoints

I learned how important it is to protect backend routes instead of relying only on the frontend. I used authentication middleware, JWT bearer tokens, and account-specific route protection to make sure users could only access the endpoints meant for them.

I also learned how CORS affects communication between the frontend and backend, especially when the frontend and backend are running from different origins during development or deployment.

### Organizing a Full-Stack Codebase

As the project grew, I learned why file structure matters. Instead of keeping everything in large monolithic files, I separated the code into reusable modules, routes, controllers, middleware, models, and utility files.

This made the project easier to manage, debug, and expand as new features were added.

### Debugging Across the Stack

Building Snag-a-Shift taught me how to debug problems across the entire application stack. I used a combination of frontend console logs, backend logs, browser DevTools, the Network tab, and React Developer Tools to trace problems from the UI to the API and database layer.

This was especially helpful when debugging authentication, failed requests, state updates, and payment-related flows.

### Protecting Secrets and Configuration

I learned how to protect API keys, security keys, database connection strings, JWT secrets, Stripe keys, and private endpoints by moving sensitive values into environment variables.

This helped me understand the difference between code that can safely be committed to a repository and configuration that needs to stay private.

### Designing User Flows

I learned that while many user actions can be described as CRUD operations, real applications are built around user flows. A user does not simply “create,” “read,” “update,” or “delete” something in isolation. They move through a logical sequence of steps.

For Snag-a-Shift, that meant thinking through flows like:

- an employer creating a shift
- a worker applying to that shift
- the employer reviewing applications
- the employer approving a worker
- the worker completing the shift
- the payment process starting after completion

Thinking in terms of flows helped me design the app around how users actually move through the product.

### Integrating Stripe Connect

I learned how to integrate Stripe into a marketplace app using customer accounts, connected accounts, and webhook-driven payment processing.

This was one of the most complex parts of the project because payments do not happen entirely in one request. Stripe events, webhook handlers, database updates, customer records, connected accounts, and payment status changes all have to work together.

Building this helped me understand how marketplace payment systems need clear state tracking, secure webhook handling, and reliable backend logic.

### Building a Real Product Requires Tradeoffs

Snag-a-Shift also taught me that building a real MVP requires tradeoffs. Some features need to be built deeply and carefully, especially authentication, shift workflows, and payments. Other ideas need to be simplified or deferred so the project can keep moving forward.

That helped me understand the difference between building a feature and building a product.

## Production Status

The full production repository remains private.
