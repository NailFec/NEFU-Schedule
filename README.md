# NEFU-Schedule

We do have a school website for us to check our courses schedule, but it has some issues. For instance, there does not exist a time period for each courses, the design is not clean and easy to understand all the information, most importantly, its accessing speed is quite slow. Also, I want my schedule can be synced to my Google Calendar.

So this project allows students at NEFU to have a clearer view and more functional courses schedule website. The advantages are:

- Access the schedule much faster
- Have a cleaner and better information view
- Subscribe in Google Calendar, Apple Calendar, or Outlook via `/feed.ics`
- [TODO,IMPORTANT] Sync from the school's website in real time

## Updating the timetable

1. Replace `data/schedule.xls` (or `data/schedule.xlsx`) with the Excel file exported by the school.
2. Refresh the site. Each request reads the file from disk.
3. Calendar apps subscribed to `https://your-domain/feed.ics` pick up the new events on their next refresh (Google Calendar can take several hours).

Week 1 Monday is `2026-08-31` (`Asia/Shanghai`). Change that in `lib/schedule/calendar-config.ts` when the term changes.

## License

This project is licensed under the **GNU General Public License v3.0** (GPLv3).

See the [LICENSE](LICENSE) file for the full text.

```
Copyright (C) 2026 NailFec

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
```

## Development

Built with Next.js, React, shadcn/ui with Base UI, and Tailwind CSS.

### Adding Components

To add new shadcn/ui components, run:

```bash
# npx shadcn@latest add button       # wrong
pnpm dlx shadcn@latest add button    # correct
```

This will place the ui components in the `components` directory.

> [!IMPORTANT]
> Always use `pnpm` (not npm, yarn, or bun) for this project.

To use a component:

```tsx
import { Button } from "@/components/ui/button";
```

### Development

Run the development server:

```bash
pnpm run dev
```

### Clearing Cache

It is fu*king crazy about Next.js when you change an image, but the website still renders the original image. Run this command to fix it:

```bash
rm -rf .next
```

### AI Usage Policy

AI tools are allowed to suggest or generate code in this repository. However, all code and designs must be reviewed by a human.

> [!IMPORTANT]
> Best practices when using AI:
> - Always let the AI read [`AGENTS.md`](AGENTS.md) first
> - Use the shadcn skill and shadcn MCP tools

_Cursor_ works especially well with our setup, including the shadcn skill and MCP tools.

### Contributing

This project does not accept pull requests currently. If you have any suggestions or feedback, please open an Issue, discuss it on the Discussions page, or contact [me](https://nailfec.com) directly.
