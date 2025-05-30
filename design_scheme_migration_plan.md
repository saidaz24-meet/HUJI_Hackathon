# Design Scheme Migration Plan: public/previous_page.tsx to app/page.tsx

This plan outlines the steps to apply the design scheme (visual styling, layout, and components) from `public/previous_page.tsx` to `app/page.tsx`, effectively transforming the landing page into a dashboard page.

## Objective

To replace the existing content and styling of `app/page.tsx` with the layout, components, and visual styling of `public/previous_page.tsx`.

## Plan Steps

1.  **Remove existing landing page content**: Remove the current Hero, Process, Features sections, and the Data Input Dialog demo from `app/page.tsx`.
2.  **Copy Header**: Copy the header component and its associated logic (model selection, theme toggle, settings dropdown) from `public/previous_page.tsx` into `app/page.tsx`.
3.  **Copy Main Content Structure**: Copy the main content area, including the task creation section and the recent tasks section, from `public/previous_page.tsx` into `app/page.tsx`.
4.  **Copy Sign Out Dialog**: Copy the sign-out confirmation dialog component from `public/previous_page.tsx` into `app/page.tsx`.
5.  **Migrate State, Hooks, and Handlers**: Copy all necessary state variables, refs, effect hooks, and event handler functions related to task management, attachments, voice recording, and UI interactions from `public/previous_page.tsx` into the `ShamanLanding` component (which will likely be renamed or replaced) in `app/page.tsx`.
6.  **Migrate Imports**: Add all required imports from `public/previous_page.tsx` (components, icons, services, types) that are not already present in `app/page.tsx`.
7.  **Apply Styling**: The styling from `public/previous_page.tsx` (primarily Tailwind CSS classes) will be applied as part of copying the JSX structure. Ensure the root container and main sections use the background gradient and other visual styles from the source file.
8.  **Clean Up**: Remove any unused imports, state, or functions from the original `app/page.tsx` that are no longer needed after the content replacement.

## Proposed Structure of Updated app/page.tsx

```mermaid
graph TD
    A[app/page.tsx] --> B(Root Div)
    B --> C(Header)
    B --> D(Main Content)
    D --> E(Task Creation Area)
    D --> F(Recent Tasks Section)
    B --> G(Sign Out Dialog)
    C --> C1(Logo/Title)
    C --> C2(Model Selection)
    C --> C3(Theme Toggle)
    C --> C4(Settings Dropdown)
    E --> E1(Recording UI - Conditional)
    E --> E2(Processing Audio UI - Conditional)
    E --> E3(Main Task Input Area)
    E3 --> E3a(Input Field)
    E3 --> E3b(Word Count)
    E3 --> E3c(Attachment Button)
    E3 --> E3d(Send Button)
    E --> E4(Voice Recording Button)
    E --> E5(Attachments Display - Conditional)
    E --> E6(Input Hint)
    E --> E7(Drag Overlay - Conditional)
    D --> D1(Task Overview Display)
    F --> F1(Section Title)
    F --> F2(View All Button)
    F --> F3(Task List Skeleton - Conditional)
    F --> F4(No Tasks Message - Conditional)
    F --> F5(Task List - Conditional)
    F5 --> F5a(Task Card - Repeats)
    G --> G1(Dialog Content)