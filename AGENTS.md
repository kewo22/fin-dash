<!-- 
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices. -->

<!-- ## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection -->













# AI Agent Guidelines: Angular Real-Time Dashboard Project

## Project Context

- Core Stack: Angular (latest stable version, v20+ preferred).
- Architecture: Standalone Components only.
- State Management: Angular Signals.
- Styling: Tailwind CSS (latest stable version).
- Charts: AG Charts Community (free version).
- Icons: HugeIcons (free version).
- Data Tables: AG Grid (free version).
- Real-Time Data Provider: Finnhub API.
- Finnhub SDK: finnhub npm package.
- Application Type: Real-time analytics/dashboard platform with KPI cards, charts, tables, widgets, filters, notifications, and live updates.

---

# Agent Persona & Behavior

- You are a senior Angular engineer following official Angular style guide best practices.
- Always prefer the newest stable Angular APIs over legacy patterns.
- Prioritize maintainability, scalability, accessibility, and performance.
- Optimize for real-time dashboard workloads.
- Optimize for minimal DOM updates and 60 FPS rendering.
- Keep components lean and move business logic into Services and Stores.

---

# Angular Version Rules

- Always target the latest stable Angular version supported by the project.
- Prefer Angular APIs introduced in Angular 17+.
- Avoid deprecated Angular APIs.
- Avoid legacy Angular patterns unless modifying existing code.

---

# Component Architecture

## Standalone Components Only

Always use:

```ts
@Component({
  standalone: true
})
```

Never create new NgModules.

---

## Dependency Injection

Always use:

```ts
private api = inject(ApiService);
```

Never use constructor injection unless modifying existing legacy code.

---

## Inputs / Outputs

Prefer signal-based APIs:

```ts
user = input.required<User>();

filterChanged = output<string>();
```

Avoid:

```ts
@Input()
@Output()
```

unless working with existing code.

---

## Two-Way Binding

Use Angular's model API:

```ts
search = model('');
```

instead of manually managing Input + Output pairs.

---

## Queries

Use signal-based queries:

```ts
chart = viewChild.required(ChartComponent);
```

```ts
content = contentChild.required(SomeDirective);
```

Avoid legacy decorators where possible.

---

# Angular Reactivity Rules

## Signal First Architecture

Signals are the default reactive primitive.

Use:

```ts
signal()
computed()
effect()
linkedSignal()
resource()
```

Do not use:

```ts
BehaviorSubject
ReplaySubject
Subject
```

unless integrating with external RxJS APIs.

---

## Derived State

Never store derived values in state.

Always use:

```ts
computed()
```

Example:

```ts
totalRevenue = computed(() =>
  this.orders().reduce((sum, order) => sum + order.amount, 0)
);
```

---

## Effects

Use effects only for side effects.

Examples:

- Local storage sync
- Analytics
- API triggers
- WebSocket integration

Never use effects to derive state.

---

# Signal Forms (Required)

## Use Angular Signal Forms

Prefer Angular Signal Forms over Reactive Forms whenever possible.

Use:

```ts
form()
field()
validate()
submit()
```

Follow the latest Angular Signal Forms APIs and patterns.

Avoid creating new Reactive Forms unless:

- Third-party library requires it
- Existing feature already uses Reactive Forms

For new development:

```ts
UserForm
DashboardFilterForm
ProfileForm
SettingsForm
```

must be Signal Forms.

---

# Template Rules

## Control Flow

Always use:

```html
@if ()
@for ()
@switch ()
```

Never use:

```html
*ngIf
*ngFor
*ngSwitch
```

---

## Tracking

Every loop must include tracking:

```html
@for (item of items(); track item.id) {

}
```

Never omit tracking.

---

## Deferred Loading

Use Angular defer blocks for heavy widgets.

Example:

```html
@defer {
  <app-revenue-chart />
}
```

Use for:

- Charts
- Large tables
- Analytics widgets
- Reports

---

# Change Detection & Performance

## Zoneless Angular

When project configuration supports it:

```ts
provideZonelessChangeDetection()
```

must be preferred.

---

## Rendering Performance

- Optimize for 60 FPS rendering.
- Avoid unnecessary signal updates.
- Avoid excessive computed recalculations.
- Minimize DOM updates.
- Use track expressions everywhere.

Never manually trigger:

```ts
ChangeDetectorRef.detectChanges()
```

unless absolutely necessary.

---

# Real-Time Dashboard Architecture

## Feature Structure

```text
dashboard/
├── pages/
├── widgets/
├── services/
├── stores/
├── models/
├── charts/
├── tables/
└── shared/
```

---

## Widget Design

Widgets should be presentational.

Examples:

```text
revenue-card.component
profit-card.component
sales-chart.component
stock-chart.component
activity-feed.component
```

Widgets should:

- Receive Inputs
- Emit Outputs
- Never call APIs directly

---

## Container Components

Container pages handle:

- API calls
- Store interaction
- Routing
- Feature orchestration

---

# State Management

## Feature Stores

Create Signal Stores for feature state.

Example:

```text
dashboard.store.ts
```

Responsibilities:

- Dashboard metrics
- Filters
- Selected entities
- WebSocket updates
- Widget state

---

## Store Rules

Components should not own business state.

Business state belongs in stores.

---

# API Architecture

## Service Layer

Never call HttpClient directly from components.

Always use:

```text
dashboard-api.service.ts
user-api.service.ts
analytics-api.service.ts
```

---

## Strong Typing

Never use:

```ts
any
```

Always create DTOs.

Examples:

```ts
RevenueDto
SalesMetricDto
StockQuoteDto
CompanyProfileDto
```

---

# Finnhub Integration

## Data Source

Primary market data provider:

https://finnhub.io/docs/api/introduction

SDK:

https://www.npmjs.com/package/finnhub

---

## WebSocket Rules

All WebSocket logic must be isolated inside services.

Example:

```text
finnhub-realtime.service.ts
```

Never create WebSockets inside components.

Never write:

```ts
new WebSocket(...)
```

inside components.

---

## Update Frequency

For high-frequency streams:

- Batch updates
- Throttle updates
- Debounce filter changes

Example:

```ts
auditTime(500)
```

before updating UI state.

---

# AG Charts Community (Required)

## Chart Library

Use only:

AG Charts Community (free version)

---

## Chart Components

Examples:

```text
line-chart.component
bar-chart.component
stock-chart.component
revenue-chart.component
```

---

## Chart Rules

Charts must:

- Receive data through Inputs
- Never call APIs
- Never own business state
- Be reusable

Use computed signals to transform datasets.

Avoid recalculating chart data repeatedly.

---

# Tables

## Large Datasets

Use:

```ts
CdkVirtualScrollViewport
```

for datasets larger than 100 rows.

Examples:

- Transactions
- Orders
- Activity logs
- Notifications

---

## Table Rules

Support:

- Sorting
- Filtering
- Pagination
- Virtualization

without excessive re-rendering.

---

# Routing

## Lazy Loading

All major sections must be lazy loaded.

Use:

```ts
loadComponent()
```

Examples:

```text
/dashboard
/reports
/analytics
/stocks
/settings
/users
```

---

# Styling

## Tailwind CSS

Use latest Tailwind CSS version.

Prefer utility classes.

Avoid custom CSS whenever possible.

---

## Design System

Create reusable design tokens:

```css
--color-primary
--color-success
--color-danger
--color-warning
--color-surface
```

Avoid hardcoded colors.

---

## Responsive Design

Dashboard must support:

- Desktop
- Tablet
- Mobile

Mobile-first approach preferred.

---

# Icons

## Icon Library

Use only:

HugeIcons (free version)

https://hugeicons.com/

Do not introduce additional icon libraries without approval.

---

# Accessibility

Every interactive element must support:

```html
aria-label
aria-describedby
```

where appropriate.

---

Tables must use:

```html
scope="col"
scope="row"
```

---

Dashboard widgets must be keyboard accessible.

---

# Error Handling

Every API request must support:

- Loading state
- Error state
- Empty state

Never leave blank widgets.

Example:

```html
@if (error()) {
  <app-error-state />
}
```

---

# Testing

## Unit Testing

Framework:

- Jasmine + Karma

or

- Jest (if configured)

---

## Required Validation

Before completing any task:

```bash
npm run lint
npm run test
npm run build
```

or equivalent Angular commands.

---

# Code Quality Rules

Always enable:

```json
{
  "strict": true
}
```

---

Prefer:

```ts
readonly
```

for immutable properties.

---

Prefer:

```ts
const
```

over `let`.

---

Use:

```ts
unknown
```

instead of:

```ts
any
```

when the type is not known.

---

# Angular APIs To Prefer

Use whenever applicable:

```ts
signal()
computed()
effect()
linkedSignal()
resource()

input()
output()
model()

viewChild()
contentChild()

inject()

DestroyRef
takeUntilDestroyed()

@if
@for
@switch
@defer
```

Avoid older Angular patterns unless maintaining legacy code.

---

# Completion Checklist

Before marking any task complete:

- Uses Standalone Components
- Uses Signals for state
- Uses Signal Forms
- Uses latest Angular APIs
- Uses AG Charts Community
- Uses HugeIcons
- Uses Finnhub SDK
- Uses Tailwind CSS
- Includes loading/error states
- Includes accessibility attributes
- Includes tracking in every @for loop
- Passes linting
- Passes tests
- Passes production build
- Optimized for real-time dashboard performance